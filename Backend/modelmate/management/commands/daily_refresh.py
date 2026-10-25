from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Daily job: sync the catalog, recompute rankings, then fill missing arena answers. Point cron / Task Scheduler here.'

    def handle(self, *args, **options):
        sync_error = None
        try:
            call_command('sync_catalog', stdout=self.stdout)
        except CommandError as exc:
            # Rankings don't depend on the feed, so still refresh them.
            sync_error = exc
            self.stderr.write(str(exc))
        call_command('update_rankings', stdout=self.stdout)
        if settings.OPENROUTER_API_KEY:
            # Test arena models (including newly added ones) on every task prompt.
            call_command('warm_arena', stdout=self.stdout)
        if sync_error:
            raise CommandError('Catalog sync failed; rankings were still updated.')
