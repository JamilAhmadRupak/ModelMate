from django.core.management.base import BaseCommand

from modelmate.models import AIModel, Task
from modelmate.ranking import snapshot_task_rankings


class Command(BaseCommand):
    help = "Recompute today's time-decayed ranking for every task. Run daily (cron / scheduler)."

    def add_arguments(self, parser):
        parser.add_argument('--task', help='Only this task slug')

    def handle(self, *args, **options):
        tasks = Task.objects.all()
        if options['task']:
            tasks = tasks.filter(slug=options['task'])

        names = dict(AIModel.objects.values_list('id', 'name'))
        changes = 0
        for task in tasks:
            rows, change = snapshot_task_rankings(task)
            ranked = sum(1 for r in rows if r['rank'])
            self.stdout.write(f"{task.slug}: {ranked} ranked, {len(rows) - ranked} provisional")
            if change:
                changes += 1
                before = names.get(change['previous_leader_id'], 'none')
                after = names.get(change['new_leader_id'])
                self.stdout.write(self.style.WARNING(f"  new #1: {after} (was {before})"))
        self.stdout.write(self.style.SUCCESS(f"Done. {changes} task(s) changed leader."))
