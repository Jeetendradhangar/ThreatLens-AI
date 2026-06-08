from django.db import models

class Scan(models.Model):
    THREAT_LEVEL_CHOICES = [
        ("Safe", "Safe"),
        ("Suspicious", "Suspicious"),
        ("Dangerous", "Dangerous"),
    ]
    CONFIDENCE_CHOICES = [
        ("High", "High"),
        ("Medium", "Medium"),
        ("Low", "Low"),
    ]

    id = models.BigAutoField(primary_key=True)
    input_value = models.CharField(max_length=2048)
    normalized_url = models.CharField(max_length=2048, blank=True, null=True)
    domain = models.CharField(max_length=512, blank=True, null=True)
    ip_address = models.CharField(max_length=128, blank=True, null=True)
    risk_score = models.IntegerField(default=0)
    threat_level = models.CharField(max_length=20, choices=THREAT_LEVEL_CHOICES)
    confidence = models.CharField(max_length=10, choices=CONFIDENCE_CHOICES, default="Medium")
    summary = models.TextField(blank=True, null=True)
    recommendation = models.TextField(blank=True, null=True)
    scanned_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        ordering = ['-scanned_at']

    def __str__(self):
        return f"{self.threat_level} - {self.input_value[:60]} ({self.risk_score})"


class ScanSignal(models.Model):
    SEVERITY_CHOICES = [
        ("low", "low"),
        ("medium", "medium"),
        ("high", "high"),
        ("critical", "critical"),
    ]

    id = models.BigAutoField(primary_key=True)
    scan = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name='signals')
    signal_name = models.CharField(max_length=128)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    points = models.IntegerField()
    explanation = models.TextField()

    objects = models.Manager()

    def __str__(self):
        return f"{self.signal_name} (+{self.points})"


class ThreatApiResult(models.Model):
    STATUS_CHOICES = [
        ("clean", "clean"),
        ("malicious", "malicious"),
        ("suspicious", "suspicious"),
        ("error", "error"),
        ("skipped", "skipped"),
    ]

    id = models.BigAutoField(primary_key=True)
    scan = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name='api_results')
    provider = models.CharField(max_length=64)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES)
    raw_summary = models.TextField(blank=True, null=True)
    checked_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    def __str__(self):
        return f"{self.provider}: {self.status}"


