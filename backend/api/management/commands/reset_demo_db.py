from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.management import call_command
from api.models import Scan, ScanSignal, ThreatApiResult, Feedback
from api.seed_demo_data import seed

class Command(BaseCommand):
    help = 'Safely resets and reseeds the database for the ThreatLens AI hackathon demo.'

    def handle(self, *args, **options):
        if not settings.DEBUG:
            self.stdout.write(self.style.ERROR('Database reset is only permitted when DEBUG=True in settings.'))
            return

        self.stdout.write(self.style.WARNING('WARNING: This will delete all existing scans, signals, feedbacks, and API results!'))
        
        # In Django management command, we can proceed with reset
        self.stdout.write('Clearing old database records...')
        Feedback.objects.all().delete()
        ThreatApiResult.objects.all().delete()
        ScanSignal.objects.all().delete()
        Scan.objects.all().delete()
        
        self.stdout.write('Running migrations to ensure consistent database schema...')
        call_command('migrate', interactive=False)
        
        self.stdout.write('Seeding database using the centralized scanner engine...')
        seed()
        
        self.stdout.write(self.style.SUCCESS('Successfully reset database and seeded clean demo data!'))
