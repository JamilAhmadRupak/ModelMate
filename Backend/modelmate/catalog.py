"""
Catalog sync: keep models, prices and availability current from OpenRouter's public model feed.

The feed needs no API key. Each entry becomes (or updates) one AIModel row with
external_id 'openrouter:<vendor/model>'. ':free' variants are folded into their base
model as `has_free_tier`; aliases ('~vendor/x-latest') and routers are skipped.
Hand-entered models with the same name and creator are linked rather than duplicated.
"""
import datetime
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation

import requests
from django.db import transaction
from django.utils import timezone

from .models import AIModel, ModelCategory, PriceChange

OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models'
SOURCE_PREFIX = 'openrouter:'
# If the feed suddenly lists far fewer models than we have active, assume an API
# problem rather than a mass retirement, and don't deactivate anything.
MIN_FEED_RATIO = 0.5


@dataclass
class SyncResult:
    created: list = field(default_factory=list)
    price_changes: list = field(default_factory=list)
    deactivated: list = field(default_factory=list)
    updated: int = 0
    skipped: int = 0
    warnings: list = field(default_factory=list)


def fetch_openrouter_models(timeout=30):
    response = requests.get(OPENROUTER_MODELS_URL, timeout=timeout, headers={'User-Agent': 'ModelMate catalog sync'})
    response.raise_for_status()
    return response.json()['data']


def _per_million(per_token):
    """OpenRouter prices are USD per token as strings; '-1' means variable (routers)."""
    try:
        value = Decimal(str(per_token))
    except (InvalidOperation, TypeError):
        return None
    if value < 0:
        return None
    return (value * 1_000_000).quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP)


def _is_listing(entry):
    model_id = entry.get('id', '')
    return not (
        model_id.startswith('~')
        or model_id.startswith('openrouter/')
        or entry.get('alias_target')
        or (entry.get('pricing') or {}).get('prompt') == '-1'
    )


def _split_name(entry):
    """'MoonshotAI: Kimi K3.1 Pro' -> ('Kimi K3.1 Pro', 'MoonshotAI')."""
    name = (entry.get('name') or entry['id']).removesuffix(' (free)')
    if ': ' in name:
        creator, name = name.split(': ', 1)
    else:
        creator = entry['id'].split('/')[0]
    return name.strip()[:255], creator.strip()[:255]


def _category_for(entry, categories):
    outputs = (entry.get('architecture') or {}).get('output_modalities') or ['text']
    if 'image' in outputs:
        return categories.get('Generative AI')
    if 'audio' in outputs:
        return categories.get('Speech')
    return categories.get('Natural Language Processing')


def _merge_free_variants(entries):
    """Fold 'vendor/model:free' into 'vendor/model'. Returns {base_id: {'entry', 'free'}}."""
    merged = {}
    for entry in entries:
        if not _is_listing(entry):
            continue
        base_id = entry['id'].removesuffix(':free')
        is_free_variant = base_id != entry['id']
        info = merged.setdefault(base_id, {'entry': entry, 'free': False})
        if is_free_variant:
            info['free'] = True
        else:
            info['entry'] = entry
    return merged


def sync_openrouter(entries, now=None, dry_run=False):
    now = now or timezone.now()
    today = timezone.localdate(now).isoformat()
    listings = _merge_free_variants(entries)
    categories = {c.name: c for c in ModelCategory.objects.all()}
    existing = {m.external_id: m for m in AIModel.objects.filter(external_id__startswith=SOURCE_PREFIX)}
    result = SyncResult(skipped=sum(not _is_listing(e) for e in entries))

    with transaction.atomic():
        for base_id, info in listings.items():
            entry = info['entry']
            pricing = entry.get('pricing') or {}
            input_price = _per_million(pricing.get('prompt'))
            output_price = _per_million(pricing.get('completion'))
            expires = entry.get('expiration_date')
            values = {
                'context_length': entry.get('context_length'),
                'input_price_per_mtok': input_price,
                'output_price_per_mtok': output_price,
                'has_free_tier': info['free'] or (input_price == 0 and output_price == 0),
                'is_active': not (expires and expires < today),
            }

            external_id = SOURCE_PREFIX + base_id
            model = existing.get(external_id)
            if model is None:
                model = _new_or_linked_model(base_id, entry, categories, now)
                if model.pk is None:
                    result.created.append(model)
                else:
                    result.updated += 1
                model.external_id = external_id
                for key, value in values.items():
                    setattr(model, key, value)
                model.save()
                continue

            old_prices = (model.input_price_per_mtok, model.output_price_per_mtok)
            if old_prices != (input_price, output_price) and old_prices != (None, None):
                result.price_changes.append(PriceChange.objects.create(
                    model=model, changed_at=now,
                    old_input_price_per_mtok=old_prices[0], old_output_price_per_mtok=old_prices[1],
                    new_input_price_per_mtok=input_price, new_output_price_per_mtok=output_price,
                ))
            changed = [key for key, value in values.items() if getattr(model, key) != value]
            if changed:
                for key in changed:
                    setattr(model, key, values[key])
                model.save(update_fields=changed)
                result.updated += 1

        _deactivate_missing(existing, listings, result)

        if dry_run:
            transaction.set_rollback(True)
    return result


def _new_or_linked_model(base_id, entry, categories, now):
    name, creator = _split_name(entry)
    linked = AIModel.objects.filter(name__iexact=name, creator__iexact=creator, external_id__isnull=True).first()
    if linked:
        return linked
    if AIModel.objects.filter(name=name, creator=creator).exists():
        name = base_id[:255]
    released = (
        datetime.datetime.fromtimestamp(entry['created'], tz=datetime.timezone.utc)
        if entry.get('created') else now
    )
    return AIModel(
        name=name,
        creator=creator,
        kind='model',
        description=entry.get('description') or '',
        url=f'https://openrouter.ai/{base_id}',
        release_date=released.date(),
        first_seen_at=released,
        category=_category_for(entry, categories),
    )


def _deactivate_missing(existing, listings, result):
    active = [m for m in existing.values() if m.is_active]
    if active and len(listings) < len(active) * MIN_FEED_RATIO:
        result.warnings.append(
            f'Feed lists {len(listings)} models but {len(active)} are active; skipped deactivation.'
        )
        return
    for model in active:
        if model.external_id.removeprefix(SOURCE_PREFIX) not in listings:
            model.is_active = False
            model.save(update_fields=['is_active'])
            result.deactivated.append(model)
