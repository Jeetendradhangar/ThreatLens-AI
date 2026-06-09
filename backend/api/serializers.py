from rest_framework import serializers
from api.models import Scan, ScanSignal, ThreatApiResult, Feedback

class ScanSignalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanSignal
        fields = ['id', 'signal_name', 'severity', 'points', 'explanation']


class ThreatApiResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreatApiResult
        fields = ['id', 'provider', 'status', 'raw_summary', 'checked_at']


class ScanSerializer(serializers.ModelSerializer):
    signals = ScanSignalSerializer(many=True, read_only=True)
    api_results = ThreatApiResultSerializer(many=True, read_only=True)

    class Meta:
        model = Scan
        fields = [
            'id', 'input_value', 'normalized_url', 'domain', 'ip_address',
            'risk_score', 'threat_level', 'confidence', 'summary',
            'recommendation', 'scanned_at', 'signals', 'api_results'
        ]


class ScanListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scan
        fields = ['id', 'input_value', 'risk_score', 'threat_level', 'confidence', 'scanned_at']


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'scan', 'user_rating', 'comment', 'created_at']
