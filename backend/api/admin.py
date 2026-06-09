from django.contrib import admin
from api.models import Scan, ScanSignal, ThreatApiResult, Feedback

@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ['id', 'threat_level', 'risk_score', 'domain', 'scanned_at']
    list_filter = ['threat_level', 'confidence']
    search_fields = ['input_value', 'domain']

@admin.register(ScanSignal)
class ScanSignalAdmin(admin.ModelAdmin):
    list_display = ['id', 'scan', 'signal_name', 'severity', 'points']
    search_fields = ['signal_name', 'scan__input_value']

@admin.register(ThreatApiResult)
class ThreatApiResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'scan', 'provider', 'status', 'checked_at']
    list_filter = ['provider', 'status']
    search_fields = ['scan__input_value']

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'scan', 'user_rating', 'created_at']
    list_filter = ['user_rating']
    search_fields = ['scan__input_value', 'comment']

