import datetime
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from .catalog import sync_openrouter
from .models import AIModel, ModelCategory, PriceChange


def entry(model_id, name, prompt='0.000002', completion='0.00001', **extra):
    return {
        'id': model_id,
        'name': name,
        'created': 1792778188,
        'description': f'{name} description',
        'context_length': 128000,
        'architecture': {'output_modalities': ['text']},
        'pricing': {'prompt': prompt, 'completion': completion},
        **extra,
    }


FEED = [
    entry('acme/rocket-2', 'Acme: Rocket 2'),
    entry('acme/rocket-2:free', 'Acme: Rocket 2 (free)', prompt='0', completion='0'),
    entry('tiny/pebble:free', 'Tiny: Pebble (free)', prompt='0', completion='0'),
    entry('pix/painter', 'Pix: Painter', architecture={'output_modalities': ['image', 'text']}),
    entry('~acme/rocket-latest', 'Acme: Rocket Latest', alias_target={'slug': 'acme/rocket-2'}),
    entry('openrouter/auto', 'Auto Router', prompt='-1', completion='-1'),
]


class CatalogSyncTests(TestCase):
    def setUp(self):
        ModelCategory.objects.create(name='Natural Language Processing', slug='nlp')
        ModelCategory.objects.create(name='Generative AI', slug='generative-ai')

    def test_first_sync_creates_models_and_skips_aliases_and_routers(self):
        result = sync_openrouter(FEED)
        self.assertEqual(len(result.created), 3)
        self.assertEqual(result.skipped, 2)

        rocket = AIModel.objects.get(external_id='openrouter:acme/rocket-2')
        self.assertEqual((rocket.name, rocket.creator), ('Rocket 2', 'Acme'))
        self.assertEqual(rocket.input_price_per_mtok, Decimal('2'))
        self.assertEqual(rocket.output_price_per_mtok, Decimal('10'))
        self.assertTrue(rocket.has_free_tier)  # folded in from the ':free' variant
        self.assertEqual(rocket.category.name, 'Natural Language Processing')
        self.assertEqual(rocket.first_seen_at.year, 2026)

        pebble = AIModel.objects.get(external_id='openrouter:tiny/pebble')
        self.assertTrue(pebble.has_free_tier)
        self.assertEqual(pebble.input_price_per_mtok, Decimal('0'))

        self.assertEqual(AIModel.objects.get(name='Painter').category.name, 'Generative AI')

    def test_resync_is_idempotent(self):
        sync_openrouter(FEED)
        result = sync_openrouter(FEED)
        self.assertEqual((len(result.created), result.updated, len(result.price_changes)), (0, 0, 0))
        self.assertEqual(AIModel.objects.count(), 3)

    def test_price_change_is_recorded(self):
        sync_openrouter(FEED)
        cheaper = [entry('acme/rocket-2', 'Acme: Rocket 2', prompt='0.000001')] + FEED[1:]
        result = sync_openrouter(cheaper)
        self.assertEqual(len(result.price_changes), 1)
        change = PriceChange.objects.get()
        self.assertEqual((change.old_input_price_per_mtok, change.new_input_price_per_mtok), (Decimal('2'), Decimal('1')))
        self.assertEqual(AIModel.objects.get(name='Rocket 2').input_price_per_mtok, Decimal('1'))

    def test_missing_model_is_retired_and_can_return(self):
        sync_openrouter(FEED)
        without_painter = [e for e in FEED if e['id'] != 'pix/painter']
        result = sync_openrouter(without_painter)
        self.assertEqual([m.name for m in result.deactivated], ['Painter'])
        self.assertFalse(AIModel.objects.get(name='Painter').is_active)

        sync_openrouter(FEED)
        self.assertTrue(AIModel.objects.get(name='Painter').is_active)

    def test_shrunken_feed_does_not_retire_everything(self):
        sync_openrouter(FEED)
        result = sync_openrouter(FEED[:1])
        self.assertEqual(result.deactivated, [])
        self.assertTrue(result.warnings)
        self.assertEqual(AIModel.objects.filter(is_active=True).count(), 3)

    def test_expired_model_is_inactive(self):
        yesterday = (timezone.localdate() - datetime.timedelta(days=1)).isoformat()
        sync_openrouter([entry('old/model', 'Old: Model', expiration_date=yesterday)])
        self.assertFalse(AIModel.objects.get(name='Model').is_active)

    def test_links_hand_entered_model_instead_of_duplicating(self):
        manual = AIModel.objects.create(name='Rocket 2', creator='acme', description='Written by our team')
        sync_openrouter(FEED)
        manual.refresh_from_db()
        self.assertEqual(manual.external_id, 'openrouter:acme/rocket-2')
        self.assertEqual(manual.description, 'Written by our team')
        self.assertEqual(AIModel.objects.filter(name__iexact='rocket 2').count(), 1)

    def test_name_collision_falls_back_to_id(self):
        AIModel.objects.create(name='Rocket 2', creator='Acme', external_id='other:rocket')
        sync_openrouter(FEED)
        self.assertTrue(AIModel.objects.filter(name='acme/rocket-2', external_id='openrouter:acme/rocket-2').exists())

    def test_dry_run_saves_nothing(self):
        result = sync_openrouter(FEED, dry_run=True)
        self.assertEqual(len(result.created), 3)
        self.assertEqual(AIModel.objects.count(), 0)
