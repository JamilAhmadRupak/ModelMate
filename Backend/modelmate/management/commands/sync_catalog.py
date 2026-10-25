import json

from django.core.management.base import BaseCommand, CommandError

from modelmate.catalog import fetch_openrouter_models, sync_openrouter


class Command(BaseCommand):
    help = "Sync models, prices and availability from OpenRouter's public model list. Run daily."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Report what would change without saving')
        parser.add_argument('--file', help='Read the model list from a saved JSON response instead of the network')

    def handle(self, *args, **options):
        if options['file']:
            with open(options['file'], encoding='utf-8') as f:
                entries = json.load(f)['data']
        else:
            try:
                entries = fetch_openrouter_models()
            except Exception as exc:
                raise CommandError(f'Could not fetch the OpenRouter model list: {exc}')

        result = sync_openrouter(entries, dry_run=options['dry_run'])

        for model in result.created[:20]:
            self.stdout.write(f'  new: {model.creator} / {model.name}')
        if len(result.created) > 20:
            self.stdout.write(f'  ... and {len(result.created) - 20} more')
        for change in result.price_changes:
            self.stdout.write(
                f'  price: {change.model}  in {change.old_input_price_per_mtok} -> {change.new_input_price_per_mtok}, '
                f'out {change.old_output_price_per_mtok} -> {change.new_output_price_per_mtok} (USD / 1M tokens)'
            )
        for model in result.deactivated:
            self.stdout.write(f'  retired: {model}')
        for warning in result.warnings:
            self.stdout.write(self.style.WARNING(warning))

        prefix = '[dry run] ' if options['dry_run'] else ''
        self.stdout.write(self.style.SUCCESS(
            f'{prefix}{len(result.created)} new, {result.updated} updated, {len(result.price_changes)} price changes, '
            f'{len(result.deactivated)} retired, {result.skipped} aliases/routers skipped.'
        ))
