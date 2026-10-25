import random
from decimal import Decimal
from unittest import mock

from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from . import arena
from .models import AIModel, Comparison, Generation, Task, TaskPrompt, TaskRanking, User


class FakeResponse:
    def __init__(self, payload, status=200):
        self.payload, self.status_code = payload, status

    def raise_for_status(self):
        if self.status_code >= 400:
            raise arena.requests.HTTPError(f'{self.status_code}')

    def json(self):
        return self.payload


def fake_openrouter(fail_for=()):
    calls = []

    def post(url, json, **kwargs):
        calls.append(json['model'])
        if json['model'] in fail_for:
            return FakeResponse({}, status=500)
        return FakeResponse({
            'choices': [{'message': {'content': f"answer from {json['model']}"}}],
            'usage': {'prompt_tokens': 100, 'completion_tokens': 400},
        })

    return post, calls


@override_settings(OPENROUTER_API_KEY='test-key', ARENA_DAILY_BUDGET_USD=1.0)
class ArenaTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='voter', password='pw-12345-x')
        self.other = User.objects.create_user(username='other', password='pw-12345-x')
        self.task = Task.objects.create(name='Summarize Bangla text', slug='summarize-bangla-text', language='bn')
        self.prompt = TaskPrompt.objects.create(task=self.task, prompt='সারাংশ করো')
        self.models = [
            AIModel.objects.create(
                name=f'Model {c}', creator='Lab', external_id=f'openrouter:lab/{c}', in_arena=True,
                input_price_per_mtok=Decimal('1'), output_price_per_mtok=Decimal('2'),
            )
            for c in 'xy'
        ]
        AIModel.objects.create(name='Not in arena', creator='Lab', external_id='openrouter:lab/z')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def start(self, **body):
        return self.client.post(reverse('task-arena', args=[self.task.slug]), body, format='json')

    def test_comparison_is_blind_then_revealed_after_vote(self):
        post, calls = fake_openrouter()
        with mock.patch.object(arena.requests, 'post', side_effect=post):
            res = self.start()
        self.assertEqual(res.status_code, 201)
        self.assertEqual(sorted(calls), ['lab/x', 'lab/y'])
        self.assertNotIn('model_a', res.data)
        self.assertEqual(res.data['prompt'], 'সারাংশ করো')
        self.assertTrue(res.data['output_a'].startswith('answer from'))

        vote = self.client.post(reverse('comparison-vote', args=[res.data['id']]), {'vote': 'a'}, format='json')
        self.assertEqual(vote.status_code, 200)
        self.assertEqual(res.data['output_a'], f"answer from {vote.data['model_a']['name'].replace('Model ', 'lab/')}")

        again = self.client.post(reverse('comparison-vote', args=[res.data['id']]), {'vote': 'b'}, format='json')
        self.assertEqual(again.status_code, 409)

    def test_answers_to_test_prompts_are_reused(self):
        post, calls = fake_openrouter()
        with mock.patch.object(arena.requests, 'post', side_effect=post):
            self.start()
            self.start()
        self.assertEqual(len(calls), 2)
        self.assertEqual(Generation.objects.count(), 2)
        # 100 tokens in at $1/M + 400 out at $2/M = $0.0009 per answer
        self.assertEqual(arena.spent_today(), Decimal('0.0018'))

    def test_cannot_vote_on_someone_elses_comparison(self):
        post, _ = fake_openrouter()
        with mock.patch.object(arena.requests, 'post', side_effect=post):
            comparison_id = self.start().data['id']
        self.client.force_authenticate(self.other)
        res = self.client.post(reverse('comparison-vote', args=[comparison_id]), {'vote': 'a'}, format='json')
        self.assertEqual(res.status_code, 404)

    def test_login_required(self):
        res = APIClient().post(reverse('task-arena', args=[self.task.slug]), {}, format='json')
        self.assertEqual(res.status_code, 401)

    @override_settings(ARENA_DAILY_COMPARISONS_PER_USER=1)
    def test_daily_limit_per_user(self):
        post, _ = fake_openrouter()
        with mock.patch.object(arena.requests, 'post', side_effect=post):
            self.assertEqual(self.start().status_code, 201)
            res = self.start()
        self.assertEqual(res.status_code, 429)

    @override_settings(ARENA_DAILY_CUSTOM_PROMPTS_PER_USER=1)
    def test_custom_prompts_always_generate_and_are_limited(self):
        post, calls = fake_openrouter()
        with mock.patch.object(arena.requests, 'post', side_effect=post):
            res = self.start(prompt='Write a haiku about rain')
            self.assertTrue(res.data['is_custom_prompt'])
            self.assertEqual(self.start(prompt='Another one').status_code, 429)
        self.assertEqual(len(calls), 2)
        self.assertEqual(res.data['limits']['custom_prompts_left'], 0)

    def test_falls_back_to_stored_answers_when_budget_is_used_up(self):
        post, _ = fake_openrouter()
        with mock.patch.object(arena.requests, 'post', side_effect=post):
            self.start()
        with override_settings(ARENA_DAILY_BUDGET_USD=0.001), \
                mock.patch.object(arena.requests, 'post', side_effect=AssertionError('should not call API')):
            self.assertEqual(self.start().status_code, 201)
            self.assertEqual(self.start(prompt='custom').status_code, 503)

    @override_settings(OPENROUTER_API_KEY='')
    def test_without_key_and_without_stored_answers(self):
        res = self.start()
        self.assertEqual(res.status_code, 503)
        self.assertIn('not switched on', res.data['detail'])

    def test_one_model_failing_keeps_the_other_answer(self):
        post, _ = fake_openrouter(fail_for={'lab/y'})
        with mock.patch.object(arena.requests, 'post', side_effect=post):
            res = self.start()
        self.assertEqual(res.status_code, 502)
        self.assertEqual(list(Generation.objects.values_list('model__name', flat=True)), ['Model x'])
        self.assertFalse(Comparison.objects.exists())

    def test_new_models_are_paired_against_ranked_ones(self):
        newcomer = AIModel.objects.create(name='Newcomer', creator='Lab', external_id='openrouter:lab/new', in_arena=True)
        for m in self.models:
            TaskRanking.objects.create(task=self.task, model=m, date=timezone.localdate(), rank=1, score=1000,
                                       effective_votes=20, recent_votes=20, win_rate=0.5)
        rng = random.Random(0)
        rng.random = lambda: 0.0  # always take the challenger branch
        pair = arena.pick_pair(self.task, arena.arena_pool(), rng)
        self.assertIn(newcomer, pair)
        self.assertEqual(len({m.id for m in pair} & {m.id for m in self.models}), 1)

    def test_warm_up_fills_missing_answers_within_budget(self):
        TaskPrompt.objects.create(task=self.task, prompt='second prompt')
        post, calls = fake_openrouter()
        with mock.patch.object(arena.requests, 'post', side_effect=post):
            self.assertEqual(arena.warm_up(), (4, 4, False))
            self.assertEqual(arena.warm_up(), (0, 0, False))
        with override_settings(ARENA_DAILY_BUDGET_USD=0.002), mock.patch.object(arena.requests, 'post', side_effect=post):
            TaskPrompt.objects.create(task=self.task, prompt='third prompt')
            generated, missing, out_of_budget = arena.warm_up()
        self.assertEqual((missing, out_of_budget), (2, True))
        self.assertEqual(generated, 0)
