from django.core.management.base import BaseCommand, CommandError

from modelmate.arena import ArenaError, arena_pool, budget_left, warm_up


class Command(BaseCommand):
    help = 'Generate missing answers for every arena model on every test prompt, within the daily budget.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Only count what is missing')

    def handle(self, *args, **options):
        self.stdout.write(f'{len(arena_pool())} models in the arena; ${budget_left():.4f} of today\'s budget left.')
        try:
            generated, missing, out_of_budget = warm_up(dry_run=options['dry_run'])
        except ArenaError as exc:
            raise CommandError(str(exc))
        self.stdout.write(self.style.SUCCESS(f'{missing} answers missing, {generated} generated.'))
        if out_of_budget:
            self.stdout.write(self.style.WARNING('Stopped: daily budget used up. The rest will be generated tomorrow.'))
