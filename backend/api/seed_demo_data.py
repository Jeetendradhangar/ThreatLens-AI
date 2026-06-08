import os
import sys
import django

# Set up settings module and path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'threatlens_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from api.models import Scan, ScanSignal, ThreatApiResult

demo_data = [
    {
        "input_value": "https://www.google.com",
        "normalized_url": "https://www.google.com",
        "domain": "google.com",
        "ip_address": "8.8.8.8",
        "risk_score": 0,
        "threat_level": "Safe",
        "confidence": "Low",
        "summary": "No significant risk indicators were found for this URL.",
        "recommendation": "No major red flags detected. Still avoid sharing sensitive personal data unless you fully trust this website.",
        "signals": [],
        "api_results": [
            {"provider": "VirusTotal", "status": "clean", "raw_summary": "Malicious engines: 0, Stats: {'malicious': 0, 'clean': 90}"},
            {"provider": "AbuseIPDB", "status": "clean", "raw_summary": "Abuse confidence score: 0%"},
            {"provider": "Google Safe Browsing", "status": "clean", "raw_summary": "No threats detected by Google Safe Browsing."}
        ]
    },
    {
        "input_value": "https://github.com",
        "normalized_url": "https://github.com",
        "domain": "github.com",
        "ip_address": "140.82.112.4",
        "risk_score": 0,
        "threat_level": "Safe",
        "confidence": "Low",
        "summary": "No significant risk indicators were found for this URL.",
        "recommendation": "No major red flags detected. Still avoid sharing sensitive personal data unless you fully trust this website.",
        "signals": [],
        "api_results": [
            {"provider": "VirusTotal", "status": "clean", "raw_summary": "Malicious engines: 0, Stats: {'malicious': 0, 'clean': 88}"},
            {"provider": "AbuseIPDB", "status": "clean", "raw_summary": "Abuse confidence score: 0%"},
            {"provider": "Google Safe Browsing", "status": "clean", "raw_summary": "No threats detected by Google Safe Browsing."}
        ]
    },
    {
        "input_value": "http://account-security-update-now.test",
        "normalized_url": "http://account-security-update-now.test",
        "domain": "account-security-update-now.test",
        "ip_address": "127.0.0.1",
        "risk_score": 65,
        "threat_level": "Suspicious",
        "confidence": "High",
        "summary": "Some risk patterns were detected. This URL requires manual verification before use.",
        "recommendation": "Do not enter personal information, passwords, or payment details. Manually verify the source and sender before proceeding.",
        "signals": [
            {"signal_name": "Reserved demo/testing domain", "severity": "low", "points": 0, "explanation": "This is a reserved demo/testing domain used for controlled testing."},
            {"signal_name": "No HTTPS", "severity": "medium", "points": 15, "explanation": "This link does not use secure HTTPS encryption."},
            {"signal_name": "Suspicious keywords detected", "severity": "high", "points": 15, "explanation": "URL contains phishing-related words: account, security, update."},
            {"signal_name": "Multiple hyphens in domain", "severity": "medium", "points": 10, "explanation": "The domain name contains multiple hyphens."},
            {"signal_name": "Urgency words detected", "severity": "medium", "points": 10, "explanation": "URL contains urgency-inducing keywords: now."},
            {"signal_name": "Phishing phrase combinations detected", "severity": "high", "points": 20, "explanation": "URL contains high-risk phrase combinations: 'account' + 'update', 'security' + 'update'."}
        ],
        "api_results": [
            {"provider": "VirusTotal", "status": "skipped", "raw_summary": "No API key configured."},
            {"provider": "AbuseIPDB", "status": "skipped", "raw_summary": "IP address check skipped. Local/private/internal IP (127.0.0.1) cannot be audited."},
            {"provider": "Google Safe Browsing", "status": "skipped", "raw_summary": "No API key configured. Optional service coming soon."}
        ]
    },
    {
        "input_value": "http://paytm-kyc-update-login-free-reward.test/verify/account",
        "normalized_url": "http://paytm-kyc-update-login-free-reward.test/verify/account",
        "domain": "paytm-kyc-update-login-free-reward.test",
        "ip_address": "127.0.0.1",
        "risk_score": 80,
        "threat_level": "Dangerous",
        "confidence": "High",
        "summary": "Multiple strong threat indicators found. This URL is highly likely to be malicious.",
        "recommendation": "Do not open, click, or interact with this URL. Block it and report it to your email provider or IT team if possible.",
        "signals": [
            {"signal_name": "Reserved demo/testing domain", "severity": "low", "points": 0, "explanation": "This is a reserved demo/testing domain used for controlled testing."},
            {"signal_name": "No HTTPS", "severity": "medium", "points": 15, "explanation": "This link does not use secure HTTPS encryption."},
            {"signal_name": "Suspicious keywords detected", "severity": "high", "points": 15, "explanation": "URL contains phishing-related words: kyc, update, login, free, reward, verify, account."},
            {"signal_name": "Multiple hyphens in domain", "severity": "medium", "points": 10, "explanation": "The domain name contains multiple hyphens."},
            {"signal_name": "Phishing phrase combinations detected", "severity": "high", "points": 20, "explanation": "URL contains high-risk phrase combinations: 'kyc' + 'update', 'login' + 'verify', 'account' + 'verify'."}
        ],
        "api_results": [
            {"provider": "VirusTotal", "status": "skipped", "raw_summary": "No API key configured."},
            {"provider": "AbuseIPDB", "status": "skipped", "raw_summary": "IP address check skipped. Local/private/internal IP (127.0.0.1) cannot be audited."},
            {"provider": "Google Safe Browsing", "status": "skipped", "raw_summary": "No API key configured. Optional service coming soon."}
        ]
    },
    {
        "input_value": "http://127.0.0.1/admin",
        "normalized_url": "http://127.0.0.1/admin",
        "domain": "127.0.0.1",
        "ip_address": "127.0.0.1",
        "risk_score": 50,
        "threat_level": "Suspicious",
        "confidence": "High",
        "summary": "Some risk patterns were detected. This URL requires manual verification before use.",
        "recommendation": "Do not enter personal information, passwords, or payment details. Manually verify the source and sender before proceeding.",
        "signals": [
            {"signal_name": "No HTTPS", "severity": "medium", "points": 15, "explanation": "This link does not use secure HTTPS encryption."},
            {"signal_name": "Raw IP address used", "severity": "medium", "points": 15, "explanation": "This URL uses a raw IP address (127.0.0.1) instead of a domain name."},
            {"signal_name": "Internal/private address blocked", "severity": "high", "points": 20, "explanation": "This URL points to an internal, private, or loopback network address. Outgoing requests to this host are blocked to protect system security and prevent SSRF attacks."}
        ],
        "api_results": [
            {"provider": "VirusTotal", "status": "skipped", "raw_summary": "No API key configured."},
            {"provider": "AbuseIPDB", "status": "skipped", "raw_summary": "IP address check skipped. Local/private/internal IP (127.0.0.1) cannot be audited."},
            {"provider": "Google Safe Browsing", "status": "skipped", "raw_summary": "No API key configured. Optional service coming soon."}
        ]
    },
    {
        "input_value": "http://192.168.1.1/login",
        "normalized_url": "http://192.168.1.1/login",
        "domain": "192.168.1.1",
        "ip_address": "192.168.1.1",
        "risk_score": 65,
        "threat_level": "Suspicious",
        "confidence": "High",
        "summary": "Some risk patterns were detected. This URL requires manual verification before use.",
        "recommendation": "Do not enter personal information, passwords, or payment details. Manually verify the source and sender before proceeding.",
        "signals": [
            {"signal_name": "No HTTPS", "severity": "medium", "points": 15, "explanation": "This link does not use secure HTTPS encryption."},
            {"signal_name": "Suspicious keywords detected", "severity": "high", "points": 15, "explanation": "URL contains phishing-related words: login."},
            {"signal_name": "Raw IP address used", "severity": "medium", "points": 15, "explanation": "This URL uses a raw IP address (192.168.1.1) instead of a domain name."},
            {"signal_name": "Internal/private address blocked", "severity": "high", "points": 20, "explanation": "This URL points to an internal, private, or loopback network address. Outgoing requests to this host are blocked to protect system security and prevent SSRF attacks."}
        ],
        "api_results": [
            {"provider": "VirusTotal", "status": "skipped", "raw_summary": "No API key configured."},
            {"provider": "AbuseIPDB", "status": "skipped", "raw_summary": "IP address check skipped. Local/private/internal IP (192.168.1.1) cannot be audited."},
            {"provider": "Google Safe Browsing", "status": "skipped", "raw_summary": "No API key configured. Optional service coming soon."}
        ]
    }
]

def seed():
    # Flush existing scans
    Scan.objects.all().delete()
    for item in demo_data:
        scan = Scan.objects.create(
            input_value=item["input_value"],
            normalized_url=item["normalized_url"],
            domain=item["domain"],
            ip_address=item["ip_address"],
            risk_score=item["risk_score"],
            threat_level=item["threat_level"],
            confidence=item["confidence"],
            summary=item["summary"],
            recommendation=item["recommendation"]
        )
        for sig in item["signals"]:
            ScanSignal.objects.create(scan=scan, **sig)
        for api_r in item["api_results"]:
            ThreatApiResult.objects.create(scan=scan, **api_r)

    print(f"Seeded {len(demo_data)} demo scans successfully.")

if __name__ == "__main__":
    seed()
