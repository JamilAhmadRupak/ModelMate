"""
Freshness-aware task rankings.

AI models improve every few weeks, so a ranking built on all-time votes goes stale.
Here every comparison vote loses half its weight every HALF_LIFE_DAYS, and the
leaderboard is a Bradley-Terry fit on those decayed votes. A model without enough
recent evidence is marked provisional ("new challenger") instead of being ranked.
"""
import math
from collections import defaultdict

from django.db import transaction
from django.utils import timezone

HALF_LIFE_DAYS = 30
RECENT_WINDOW_DAYS = 30
MIN_EFFECTIVE_VOTES = 10.0
# Virtual games against an average opponent; keeps a model with 3 lucky wins off the top.
PRIOR_GAMES = 2.0

_ANCHOR = object()


def vote_weight(age_days, half_life=HALF_LIFE_DAYS):
    return 0.5 ** (max(age_days, 0.0) / half_life)


def bradley_terry(matches, prior_games=PRIOR_GAMES, max_iter=500, tol=1e-9):
    """
    Fit Bradley-Terry strengths from weighted (winner, loser, weight) matches.

    Uses the MM algorithm (Hunter, 2004). Every player also plays `prior_games`
    virtual games (half won, half lost) against a fixed-strength anchor, which
    regularises small samples and pins the scale. Returns {player: strength},
    where 1.0 means "average".
    """
    wins = defaultdict(float)
    games = defaultdict(lambda: defaultdict(float))
    for winner, loser, weight in matches:
        if weight <= 0 or winner == loser:
            continue
        wins[winner] += weight
        games[winner][loser] += weight
        games[loser][winner] += weight

    players = list(games)
    for p in players:
        wins[p] += prior_games / 2
        games[p][_ANCHOR] += prior_games

    strength = {p: 1.0 for p in players}
    strength[_ANCHOR] = 1.0
    for _ in range(max_iter):
        delta = 0.0
        updated = {}
        for p in players:
            denom = sum(n / (strength[p] + strength[q]) for q, n in games[p].items())
            updated[p] = wins[p] / denom
            delta = max(delta, abs(updated[p] - strength[p]) / strength[p])
        strength.update(updated)
        if delta < tol:
            break

    strength.pop(_ANCHOR)
    return strength


def to_score(strength):
    """Elo-like display scale: 1000 is average, +400 means 10x stronger."""
    return 1000 + 400 * math.log10(strength)


def compute_task_ranking(task, now=None):
    """Return ranking rows (dicts) for a task, ranked models first, then provisional ones."""
    from .models import Comparison

    now = now or timezone.now()
    votes = (
        Comparison.objects
        .filter(task=task, vote__in=['a', 'b', 'tie'], voted_at__lte=now)
        .values_list('model_a_id', 'model_b_id', 'vote', 'voted_at')
    )

    matches = []
    effective = defaultdict(float)
    weighted_wins = defaultdict(float)
    recent = defaultdict(int)
    for a, b, vote, voted_at in votes:
        age_days = (now - voted_at).total_seconds() / 86400
        w = vote_weight(age_days)
        if vote == 'a':
            matches.append((a, b, w))
            weighted_wins[a] += w
        elif vote == 'b':
            matches.append((b, a, w))
            weighted_wins[b] += w
        else:
            matches += [(a, b, w / 2), (b, a, w / 2)]
            weighted_wins[a] += w / 2
            weighted_wins[b] += w / 2
        for m in (a, b):
            effective[m] += w
            if age_days <= RECENT_WINDOW_DAYS:
                recent[m] += 1

    strengths = bradley_terry(matches)
    rows = [
        {
            'model_id': m,
            'score': round(to_score(s), 1),
            'effective_votes': round(effective[m], 2),
            'recent_votes': recent[m],
            'win_rate': round(weighted_wins[m] / effective[m], 3) if effective[m] else 0.0,
            'is_provisional': effective[m] < MIN_EFFECTIVE_VOTES,
        }
        for m, s in strengths.items()
    ]
    rows.sort(key=lambda r: (r['is_provisional'], -r['score']))
    rank = 0
    for r in rows:
        if r['is_provisional']:
            r['rank'] = None
        else:
            rank += 1
            r['rank'] = rank
    return rows


def snapshot_task_rankings(task, now=None):
    """
    Save today's ranking for a task and report a change of leader.

    Returns (rows, change) where change is None or
    {'task', 'previous_leader_id', 'new_leader_id'}.
    """
    from .models import TaskRanking

    now = now or timezone.now()
    today = timezone.localdate(now)
    rows = compute_task_ranking(task, now=now)

    previous = (
        TaskRanking.objects.filter(task=task, date__lt=today, rank=1)
        .order_by('-date').values_list('model_id', flat=True).first()
    )
    with transaction.atomic():
        TaskRanking.objects.filter(task=task, date=today).delete()
        TaskRanking.objects.bulk_create(
            TaskRanking(task=task, date=today, **r) for r in rows
        )

    leader = next((r['model_id'] for r in rows if r['rank'] == 1), None)
    change = None
    if leader and leader != previous:
        change = {'task': task, 'previous_leader_id': previous, 'new_leader_id': leader}
    return rows, change
