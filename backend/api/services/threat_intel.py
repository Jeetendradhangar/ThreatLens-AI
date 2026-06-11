import os
import requests
import base64
from api.services.ip_utils import is_valid_ip, is_safe_ip, resolve_hostname

def check_threat_apis(url: str, domain: str, ip_address: str = None) -> list:
    results = []

    # 1. VirusTotal Check
    vt_key = os.environ.get("VIRUSTOTAL_API_KEY", "")
    if vt_key:
        try:
            url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
            resp = requests.get(
                f"https://www.virustotal.com/api/v3/urls/{url_id}",
                headers={"x-apikey": vt_key},
                timeout=3 # Short timeout to prevent hanging scans
            )
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                malicious = stats.get("malicious", 0)
                status = "malicious" if malicious > 0 else "clean"
                results.append({
                    "provider": "VirusTotal",
                    "status": status,
                    "raw_summary": f"Malicious engines: {malicious}, Stats: {stats}"
                })
            else:
                results.append({
                    "provider": "VirusTotal",
                    "status": "error",
                    "raw_summary": f"API returned status {resp.status_code}"
                })
        except Exception as e:
            results.append({
                "provider": "VirusTotal",
                "status": "error",
                "raw_summary": str(e)
            })
    else:
        results.append({
            "provider": "VirusTotal",
            "status": "skipped",
            "raw_summary": "Skipped: API key not configured."
        })

    # 2. AbuseIPDB Check (Priority 3)
    abuse_key = os.environ.get("ABUSEIPDB_API_KEY", "")
    if abuse_key:
        # Resolve target IP safely
        target_ip = ip_address
        if not target_ip or not is_valid_ip(target_ip):
            target_ip = resolve_hostname(domain)

        # Check if the IP is valid and safe (public)
        if target_ip and is_valid_ip(target_ip) and is_safe_ip(target_ip):
            try:
                resp = requests.get(
                    "https://api.abuseipdb.com/api/v2/check",
                    headers={"Key": abuse_key, "Accept": "application/json"},
                    params={"ipAddress": target_ip, "maxAgeInDays": 90},
                    timeout=3 # Short timeout
                )
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    score = data.get("abuseConfidenceScore", 0)
                    status = "malicious" if score > 50 else "clean"
                    results.append({
                        "provider": "AbuseIPDB",
                        "status": status,
                        "raw_summary": f"Abuse confidence score: {score}%"
                    })
                else:
                    results.append({
                        "provider": "AbuseIPDB",
                        "status": "error",
                        "raw_summary": f"API returned status {resp.status_code}"
                    })
            except Exception as e:
                results.append({
                    "provider": "AbuseIPDB",
                    "status": "error",
                    "raw_summary": str(e)
                })
        else:
            # Skip checking private/internal/unresolved IPs
            results.append({
                "provider": "AbuseIPDB",
                "status": "skipped",
                "raw_summary": f"IP address check skipped. Local/private/internal IP ({target_ip or 'None'}) cannot be audited."
            })
    else:
        results.append({
            "provider": "AbuseIPDB",
            "status": "skipped",
            "raw_summary": "Skipped: API key not configured."
        })

    # 3. Google Safe Browsing Check
    gsb_key = os.environ.get("GOOGLE_SAFE_BROWSING_KEY", "")
    if gsb_key:
        try:
            payload = {
                "client": {"clientId": "threatlens-ai", "clientVersion": "1.0.0"},
                "threatInfo": {
                    "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [{"url": url}]
                }
            }
            resp = requests.post(
                f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={gsb_key}",
                json=payload,
                timeout=3 # Short timeout
            )
            if resp.status_code == 200:
                matches = resp.json().get("matches", [])
                status = "malicious" if matches else "clean"
                raw_summary = f"Threat matches: {len(matches)}" if matches else "No threats detected by Google Safe Browsing."
                results.append({
                    "provider": "Google Safe Browsing",
                    "status": status,
                    "raw_summary": raw_summary
                })
            else:
                results.append({
                    "provider": "Google Safe Browsing",
                    "status": "error",
                    "raw_summary": f"API returned status {resp.status_code}"
                })
        except Exception as e:
            results.append({
                "provider": "Google Safe Browsing",
                "status": "error",
                "raw_summary": str(e)
            })
    else:
        results.append({
            "provider": "Google Safe Browsing",
            "status": "skipped",
            "raw_summary": "Skipped: API key not configured."
        })

    return results
