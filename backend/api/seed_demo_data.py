import os
import sys
import django

# Set up settings module and path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'threatlens_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from api.models import Scan, ScanSignal, ThreatApiResult, Feedback
from api.services.scanner import extract_url_signals
from api.services.risk_engine import calculate_risk

demo_urls = [
    "https://github.com",
    "https://hackathon.athenura.in/hackathons",
    "http://account-security-update-now.test",
    "http://paytm-kyc-update-login-free-reward.test/verify/account",
    "http://free-reward-login-check.test",
    "http://127.0.0.1/admin"
]

def seed():
    # Flush existing scans and feedback
    Scan.objects.all().delete()
    Feedback.objects.all().delete()
    
    for url in demo_urls:
        try:
            # Call centralized scanner
            scan_data = extract_url_signals(url)
            risk_data = calculate_risk(scan_data["signals"])
            
            # Setup mock threat api results matching the clean/skipped behaviors
            # (Ensures offline/demo stability since no keys are active by default in hackathon presentation)
            is_demo = url.endswith(".test") or ".test/" in url or "127.0.0.1" in url
            
            if is_demo:
                api_results = [
                    {"provider": "VirusTotal", "status": "skipped", "raw_summary": "Skipped: API key not configured."},
                    {"provider": "AbuseIPDB", "status": "skipped", "raw_summary": "IP address check skipped. Local/private/internal IP cannot be audited."},
                    {"provider": "Google Safe Browsing", "status": "skipped", "raw_summary": "Skipped: API key not configured."}
                ]
            else:
                api_results = [
                    {"provider": "VirusTotal", "status": "clean", "raw_summary": "Malicious engines: 0, Stats: {'malicious': 0, 'clean': 90}"},
                    {"provider": "AbuseIPDB", "status": "clean", "raw_summary": "Abuse confidence score: 0%"},
                    {"provider": "Google Safe Browsing", "status": "clean", "raw_summary": "No threats detected by Google Safe Browsing."}
                ]

            scan = Scan.objects.create(
                input_value=url,
                normalized_url=scan_data["normalized_url"],
                domain=scan_data["domain"],
                ip_address=scan_data["ip_address"],
                risk_score=risk_data["risk_score"],
                threat_level=risk_data["threat_level"],
                confidence=risk_data["confidence"],
                summary=risk_data["summary"],
                recommendation=risk_data["recommendation"]
            )
            
            for sig in scan_data["signals"]:
                ScanSignal.objects.create(
                    scan=scan,
                    signal_name=sig["signal_name"],
                    severity=sig["severity"],
                    points=sig["points"],
                    explanation=sig["explanation"]
                )
                
            for api_res in api_results:
                ThreatApiResult.objects.create(
                    scan=scan,
                    provider=api_res["provider"],
                    status=api_res["status"],
                    raw_summary=api_res["raw_summary"]
                )
        except Exception as e:
            print(f"Skipped seeding {url} due to error: {e}")
            
    print(f"Seeded {len(demo_urls)} scans dynamically.")

if __name__ == "__main__":
    seed()
