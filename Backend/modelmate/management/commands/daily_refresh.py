from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Daily job: sync the model catalog, then recompute task rankings. Point cron / Task Scheduler here.'

    def handle(self, *args, **options):
        sync_error = None
        try:
            call_command('sync_catalog', stdout=self.stdout)
        except CommandError as exc:
            # Rankings don't depend on the feed, so still refresh them.
            sync_error = exc
            self.stderr.write(str(exc))
        call_command('update_rankings', stdout=self.stdout)
        if sync_error:
            raise CommandError('Catalog sync failed; rankings were still updated.')
