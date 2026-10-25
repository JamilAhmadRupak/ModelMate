"""
Blind comparison arena.

A comparison: pick a prompt (one of the task's fixed test prompts, or the user's own),
pick two arena models, get both answers, store an unvoted Comparison with the sides
shuffled, and reveal which model wrote which only after the vote.

Cost: answers to fixed test prompts are generated once and reused for every voter, so
most comparisons are free. New API spend is capped per day (ARENA_DAILY_BUDGET_USD);
when the budget is used up or no key is set, fixed-prompt comparisons fall back to
answers already stored.

Freshness: models not yet ranked on a task (new releases) are paired against ranked
models CHALLENGER_SHARE of the time, so they collect votes quickly.
"""
import logging
import random
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal

import requests
from django.conf import settings
from django.db import IntegrityError, transaction
from django.db.models import Count, Sum
from django.utils import timezone

from .catalog import SOURCE_PREFIX
from .models import AIModel, Comparison, Generation, TaskPrompt, TaskRanking

logger = logging.getLogger(__name__)

CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions'
CHALLENGER_SHARE = 0.5


class ArenaError(Exception):
    """A failure the user should see, with the HTTP status to return."""

    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


class OutOfBudget(ArenaError):
    def __init__(self, message):
        super().__init__(message, status=503)


# ------------------------------
# Limits
# ------------------------------

def spent_today():
    total = Generation.objects.filter(created_at__date=timezone.localdate()).aggregate(s=Sum('cost_usd'))['s']
    return total or Decimal('0')


def budget_left():
    return Decimal(str(settings.ARENA_DAILY_BUDGET_USD)) - spent_today()


def limits_for(user):
    today = Comparison.objects.filter(voter=user, created_at__date=timezone.localdate())
    return {
        'comparisons_left': max(0, settings.ARENA_DAILY_COMPARISONS_PER_USER - today.count()),
        'custom_prompts_left': max(
            0, settings.ARENA_DAILY_CUSTOM_PROMPTS_PER_USER - today.filter(task_prompt__isnull=True).count()
        ),
        'custom_prompts_available': bool(settings.OPENROUTER_API_KEY) and budget_left() > 0,
    }


# ------------------------------
# Pairing
# ------------------------------

def arena_pool():
    return list(AIModel.objects.filter(in_arena=True, is_active=True, external_id__startswith=SOURCE_PREFIX))


def pick_pair(task, pool, rng=random):
    if len(pool) < 2:
        raise ArenaError('Comparisons are not set up for this task yet.', 503)
    latest = TaskRanking.objects.filter(task=task).order_by('-date').values_list('date', flat=True).first()
    ranked_ids = set(
        TaskRanking.objects.filter(task=task, date=latest, is_provisional=False).values_list('model_id', flat=True)
    ) if latest else set()
    ranked = [m for m in pool if m.id in ranked_ids]
    challengers = [m for m in pool if m.id not in ranked_ids]

    if ranked and challengers and rng.random() < CHALLENGER_SHARE:
        pair = [rng.choice(challengers), rng.choice(ranked)]
    else:
        pair = rng.sample(pool, 2)
    rng.shuffle(pair)
    return pair


def pick_cached_pair(task, pool, rng=random):
    """A fixed prompt with stored answers from at least two pool models. No API spend."""
    pool_ids = [m.id for m in pool]
    prompt_ids = list(
        Generation.objects.filter(task_prompt__task=task, task_prompt__is_active=True, model_id__in=pool_ids)
        .values('task_prompt').annotate(n=Count('id')).filter(n__gte=2).values_list('task_prompt', flat=True)
    )
    if not prompt_ids:
        return None
    task_prompt_id = rng.choice(prompt_ids)
    generations = list(Generation.objects.filter(task_prompt_id=task_prompt_id, model_id__in=pool_ids).select_related('model', 'task_prompt'))
    return rng.sample(generations, 2)


# ------------------------------
# Generation
# ------------------------------

def estimate_cost(model, input_tokens, output_tokens):
    input_price = model.input_price_per_mtok or Decimal('0')
    output_price = model.output_price_per_mtok or Decimal('0')
    return (input_tokens * input_price + output_tokens * output_price) / Decimal(1_000_000)


def call_openrouter(model, prompt):
    """Return (text, input_tokens, output_tokens). Raises on HTTP errors or an empty answer."""
    response = requests.post(
        CHAT_URL,
        timeout=120,
        headers={'Authorization': f'Bearer {settings.OPENROUTER_API_KEY}', 'X-Title': 'ModelMate'},
        json={
            'model': model.external_id.removeprefix(SOURCE_PREFIX),
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': settings.ARENA_MAX_OUTPUT_TOKENS,
        },
    )
    response.raise_for_status()
    data = response.json()
    text = (data['choices'][0]['message'].get('content') or '').strip()
    if not text:
        raise ValueError(f'{model.external_id} returned an empty answer')
    usage = data.get('usage') or {}
    return text, usage.get('prompt_tokens', 0), usage.get('completion_tokens', 0)


def _call_safely(model, prompt):
    try:
        return call_openrouter(model, prompt)
    except Exception as exc:  # network, HTTP, malformed or empty response
        logger.warning('Arena generation failed for %s: %s', model.external_id, exc)
        return exc


def _save_generation(model, prompt, task_prompt, text, input_tokens, output_tokens):
    try:
        with transaction.atomic():
            return Generation.objects.create(
                model=model, task_prompt=task_prompt, prompt=prompt, output=text,
                input_tokens=input_tokens, output_tokens=output_tokens,
                cost_usd=estimate_cost(model, input_tokens, output_tokens),
            )
    except IntegrityError:  # another request stored this model's answer first
        return Generation.objects.get(model=model, task_prompt=task_prompt)


def get_answers(models, prompt, task_prompt=None):
    """One Generation per model, reusing stored answers to fixed prompts and generating the rest in parallel."""
    answers = {}
    if task_prompt:
        for g in Generation.objects.filter(task_prompt=task_prompt, model__in=models):
            answers[g.model_id] = g
    missing = [m for m in models if m.id not in answers]

    if missing:
        if not settings.OPENROUTER_API_KEY:
            raise OutOfBudget('Live comparisons are not switched on yet.')
        if budget_left() <= 0:
            raise OutOfBudget("Today's budget for new answers is used up. Try again tomorrow.")
        with ThreadPoolExecutor(max_workers=len(missing)) as executor:
            results = list(executor.map(lambda m: _call_safely(m, prompt), missing))
        failed = False
        for model, result in zip(missing, results):
            if isinstance(result, Exception):
                failed = True
            else:
                answers[model.id] = _save_generation(model, prompt, task_prompt, *result)
        if failed:
            raise ArenaError("One of the AIs didn't answer. Please try again.", 502)
    return [answers[m.id] for m in models]


# ------------------------------
# Comparisons
# ------------------------------

def start_comparison(user, task, custom_prompt=None, rng=random):
    limits = limits_for(user)
    if limits['comparisons_left'] <= 0:
        raise ArenaError("You've reached today's limit. Thank you for voting! Come back tomorrow.", 429)

    custom_prompt = (custom_prompt or '').strip()
    if custom_prompt:
        if len(custom_prompt) > settings.ARENA_MAX_PROMPT_CHARS:
            raise ArenaError(f'Please keep your prompt under {settings.ARENA_MAX_PROMPT_CHARS} characters.')
        if limits['custom_prompts_left'] <= 0:
            raise ArenaError("You've used today's custom prompts. You can still vote on our test prompts.", 429)
        task_prompt, prompt = None, custom_prompt
    else:
        prompts = list(task.prompts.filter(is_active=True))
        if not prompts:
            raise ArenaError('This task has no test prompts yet.', 503)
        task_prompt = rng.choice(prompts)
        prompt = task_prompt.prompt

    pool = arena_pool()
    try:
        model_a, model_b = pick_pair(task, pool, rng)
        answer_a, answer_b = get_answers([model_a, model_b], prompt, task_prompt)
    except OutOfBudget:
        cached = None if custom_prompt else pick_cached_pair(task, pool, rng)
        if not cached:
            raise
        answer_a, answer_b = cached
        model_a, model_b = answer_a.model, answer_b.model
        task_prompt, prompt = answer_a.task_prompt, answer_a.prompt

    return Comparison.objects.create(
        task=task, task_prompt=task_prompt, prompt=prompt,
        model_a=model_a, model_b=model_b,
        output_a=answer_a.output, output_b=answer_b.output,
        voter=user,
    )


def record_vote(comparison, vote):
    if comparison.vote:
        raise ArenaError('You already voted on this comparison.', 409)
    if vote not in dict(Comparison.VOTE_CHOICES):
        raise ArenaError('Vote must be one of: a, b, tie, both_bad.')
    comparison.vote = vote
    comparison.voted_at = timezone.now()
    comparison.save(update_fields=['vote', 'voted_at', 'updated_at'])
    return comparison


def warm_up(dry_run=False):
    """
    Generate missing answers for every (arena model, active test prompt) pair, within today's budget.
    This is how new arena models get tested on every task. Returns (generated, missing, stopped_for_budget).
    """
    pool = arena_pool()
    prompts = list(TaskPrompt.objects.filter(is_active=True))
    have = set(Generation.objects.filter(task_prompt__isnull=False).values_list('model_id', 'task_prompt_id'))
    todo = [(m, p) for p in prompts for m in pool if (m.id, p.id) not in have]
    if dry_run or not todo:
        return 0, len(todo), False
    if not settings.OPENROUTER_API_KEY:
        raise ArenaError('OPENROUTER_API_KEY is not set.', 503)

    generated = 0
    for model, task_prompt in todo:
        if budget_left() <= 0:
            return generated, len(todo), True
        try:
            get_answers([model], task_prompt.prompt, task_prompt)
            generated += 1
        except ArenaError:
            continue
    return generated, len(todo), False
