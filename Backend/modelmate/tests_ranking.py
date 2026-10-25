import datetime

from django.test import SimpleTestCase, TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from .models import AIModel, Comparison, Review, Task, TaskRanking, User
from .ranking import bradley_terry, compute_task_ranking, snapshot_task_rankings, vote_weight
from .serializers import ReviewSerializer


class BradleyTerryTests(SimpleTestCase):
    def test_consistent_winner_is_stronger(self):
        s = bradley_terry([('a', 'b', 1.0)] * 8 + [('b', 'a', 1.0)] * 2)
        self.assertGreater(s['a'], s['b'])

    def test_even_record_is_equal(self):
        s = bradley_terry([('a', 'b', 1.0), ('b', 'a', 1.0)] * 5)
        self.assertAlmostEqual(s['a'], s['b'], places=6)

    def test_undefeated_model_has_finite_strength(self):
        s = bradley_terry([('a', 'b', 1.0)] * 5)
        self.assertLess(s['a'], 100)

    def test_vote_weight_halves_each_half_life(self):
        self.assertAlmostEqual(vote_weight(0), 1.0)
        self.assertAlmostEqual(vote_weight(30), 0.5)
        self.assertAlmostEqual(vote_weight(60), 0.25)


class TaskRankingTests(TestCase):
    def setUp(self):
        self.now = timezone.now()
        self.user = User.objects.create_user(username='voter', password='pw-12345-x')
        self.task = Task.objects.create(name='Summarize Bangla text', slug='summarize-bangla-text', language='bn')
        self.old = AIModel.objects.create(name='Old Leader', creator='LabA')
        self.new = AIModel.objects.create(name='New Release', creator='LabB')
        self.third = AIModel.objects.create(name='Third', creator='LabC')

    def vote(self, winner, loser, days_ago, n=1, vote='a'):
        for _ in range(n):
            Comparison.objects.create(
                task=self.task, prompt='p', model_a=winner, model_b=loser,
                output_a='x', output_b='y', vote=vote, voter=self.user,
                voted_at=self.now - datetime.timedelta(days=days_ago),
            )

    def test_recent_votes_outweigh_old_ones(self):
        # Last quarter the old model won 30-0; this week the new one won 15-0.
        self.vote(self.old, self.new, days_ago=90, n=30)
        self.vote(self.new, self.old, days_ago=3, n=15)
        rows = compute_task_ranking(self.task, now=self.now)
        leader = next(r for r in rows if r['rank'] == 1)
        self.assertEqual(leader['model_id'], self.new.id)

    def test_model_with_few_votes_is_provisional(self):
        self.vote(self.old, self.new, days_ago=1, n=12)
        self.vote(self.third, self.old, days_ago=1, n=3)
        rows = {r['model_id']: r for r in compute_task_ranking(self.task, now=self.now)}
        self.assertTrue(rows[self.third.id]['is_provisional'])
        self.assertIsNone(rows[self.third.id]['rank'])
        self.assertEqual(rows[self.third.id]['recent_votes'], 3)
        self.assertFalse(rows[self.old.id]['is_provisional'])

    def test_ties_and_both_bad(self):
        self.vote(self.old, self.new, days_ago=1, n=12, vote='tie')
        self.vote(self.old, self.new, days_ago=1, n=5, vote='both_bad')
        rows = {r['model_id']: r for r in compute_task_ranking(self.task, now=self.now)}
        self.assertAlmostEqual(rows[self.old.id]['score'], rows[self.new.id]['score'])
        self.assertAlmostEqual(rows[self.old.id]['win_rate'], 0.5, places=2)

    def test_snapshot_reports_leader_change(self):
        self.vote(self.old, self.new, days_ago=10, n=15)
        _, change = snapshot_task_rankings(self.task, now=self.now - datetime.timedelta(days=1))
        self.assertEqual(change['new_leader_id'], self.old.id)

        self.vote(self.new, self.old, days_ago=0, n=40)
        _, change = snapshot_task_rankings(self.task, now=self.now)
        self.assertEqual(change['previous_leader_id'], self.old.id)
        self.assertEqual(change['new_leader_id'], self.new.id)

        # Re-running the same day replaces the snapshot rather than duplicating it.
        snapshot_task_rankings(self.task, now=self.now)
        self.assertEqual(TaskRanking.objects.filter(task=self.task, date=timezone.localdate(self.now)).count(), 2)

    def test_task_api_returns_ranking_and_history(self):
        self.vote(self.old, self.new, days_ago=1, n=15)
        self.vote(self.third, self.old, days_ago=1, n=2)
        snapshot_task_rankings(self.task, now=self.now)

        client = APIClient()
        data = client.get(reverse('task-detail', args=[self.task.slug])).data
        self.assertEqual([r['model']['name'] for r in data['ranking']], ['Old Leader', 'New Release'])
        self.assertEqual([r['model']['name'] for r in data['new_challengers']], ['Third'])

        history = client.get(reverse('task-history', args=[self.task.slug])).data
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0]['rank'], 1)

        listing = client.get(reverse('task-list'), {'language': 'bn'}).data
        self.assertEqual(listing['count'], 1)


class TaskReviewTests(TestCase):
    def test_same_model_can_be_reviewed_for_different_tasks(self):
        user = User.objects.create_user(username='rev', password='pw-12345-x')
        model = AIModel.objects.create(name='M', creator='C')
        t1 = Task.objects.create(name='T1', slug='t1')
        t2 = Task.objects.create(name='T2', slug='t2')
        body = {'model_id': model.id, 'accuracy': 4, 'speed': 4, 'cost_efficiency': 4,
                'ease_of_use': 4, 'reliability': 4, 'title': 't', 'description': 'd',
                'prompt': 'my prompt', 'output': 'its answer'}
        context = {'request': type('Request', (), {'user': user})()}

        for task in (t1, t2):
            s = ReviewSerializer(data={**body, 'task_id': task.id}, context=context)
            self.assertTrue(s.is_valid(), s.errors)
            s.save()
        self.assertEqual(Review.objects.filter(user=user, model=model).count(), 2)

        dup = ReviewSerializer(data={**body, 'task_id': t1.id}, context=context)
        self.assertFalse(dup.is_valid())
