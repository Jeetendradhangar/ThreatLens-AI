import os
import sys
import django

# Set up settings module and path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'threatlens_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from api.services.scanner import extract_url_signals, validate_and_normalize_url
from api.services.risk_engine import calculate_risk

test_cases = [
    {
        "url": "https://github.com",
        "expected_score_range": (0, 0),
        "expected_level": "Safe"
    },
    {
        "url": "https://hackathon.athenura.in/hackathons",
        "expected_score_range": (0, 10),
        "expected_level": "Safe"
    },
    {
        "url": "http://account-security-update-now.test",
        "expected_score_range": (50, 65),
        "expected_level": "Suspicious"
    },
    {
        "url": "http://paytm-kyc-update-login-free-reward.test/verify/account",
        "expected_score_range": (75, 85),
        "expected_level": "Dangerous"
    },
    {
        "url": "http://free-reward-login-check.test",
        "expected_score_range": (50, 70),
        "expected_level": "Suspicious"
    },
    {
        "url": "http://127.0.0.1/admin",
        "expected_score_range": (50, 50),
        "expected_level": "Suspicious"
    },
    {
        "url": "file:///D:/ThreatLens_AI_Hackathon_Project_Documentation.pdf",
        "expected_score_range": None, # Throws error
        "expected_level": "Error"
    }
]

def run_tests():
    print("=" * 100)
    print(f"{'URL':<65} | {'Expected Level':<15} | {'Actual Score':<12} | {'Actual Level':<12} | {'Status':<8}")
    print("=" * 100)
    
    passed = 0
    failed = 0
    
    for case in test_cases:
        url = case["url"]
        expected_range = case["expected_score_range"]
        expected_level = case["expected_level"]
        
        try:
            scan_data = extract_url_signals(url)
            risk_data = calculate_risk(scan_data["signals"])
            score = risk_data["risk_score"]
            level = risk_data["threat_level"]
            
            # Check score range
            if expected_range:
                min_score, max_score = expected_range
                score_ok = min_score <= score <= max_score
                level_ok = level == expected_level
                status = "PASS" if (score_ok and level_ok) else "FAIL"
            else:
                status = "FAIL (Expected validation error)"
                
        except ValueError as val_err:
            if expected_level == "Error":
                score = "N/A"
                level = "Error"
                status = "PASS"
            else:
                score = "N/A"
                level = "Error"
                status = f"FAIL: {str(val_err)}"
        except Exception as e:
            score = "N/A"
            level = "Exception"
            status = f"FAIL: {str(e)}"
            
        if status.startswith("PASS"):
            passed += 1
        else:
            failed += 1
            
        print(f"{url:<65} | {expected_level:<15} | {str(score):<12} | {level:<12} | {status:<8}")
        
    print("=" * 100)
    print(f"Test Execution Completed. Passed: {passed}, Failed: {failed}")
    print("=" * 100)

if __name__ == "__main__":
    run_tests()
