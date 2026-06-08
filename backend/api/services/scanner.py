import re
import urllib.parse
import requests
import tldextract
from api.services.ip_utils import is_safe_url_host, is_valid_ip

def extract_url_signals(input_value: str) -> dict:
    # 1. Normalize URL
    normalized_url = input_value.strip()
    if not (normalized_url.startswith("http://") or normalized_url.startswith("https://")):
        normalized_url = "http://" + normalized_url

    # 2. Extract domain
    result = tldextract.extract(normalized_url)
    domain = result.registered_domain
    if not domain:
        domain = result.domain

    # Parse hostname for subdomains and shortener checks
    parsed = urllib.parse.urlparse(normalized_url)
    hostname = parsed.hostname or ""

    # Perform DNS resolution and check safety (Priority 1, 4)
    is_safe, resolved_ip = is_safe_url_host(hostname)
    
    # Store resolved IP in ip_address (Priority 4)
    ip_address = resolved_ip if resolved_ip else None

    signals = []

    # Check for .test demo domain (Priority 5)
    is_demo_test = False
    if hostname.endswith('.test') or domain.endswith('.test'):
        is_demo_test = True
        signals.append({
            "signal_name": "Reserved demo/testing domain",
            "severity": "low",
            "points": 0,
            "explanation": "This is a reserved demo/testing domain used for controlled testing."
        })

    # CHECK 1 — NO_HTTPS
    if not normalized_url.startswith("https://"):
        signals.append({
            "signal_name": "No HTTPS",
            "severity": "medium",
            "points": 15,
            "explanation": "This link does not use secure HTTPS encryption. Your connection and data could be intercepted by attackers."
        })

    # CHECK 2 — SUSPICIOUS_KEYWORDS
    keyword_list = [
        "login", "verify", "reward", "free", "claim", "update", "kyc", "account",
        "secure", "banking", "confirm", "suspend", "alert", "urgent", "winner",
        "prize", "lucky", "ebill", "invoice", "password", "signin", "credential",
        "wallet", "otp"
    ]
    url_lower = normalized_url.lower()
    found_words = [w for w in keyword_list if w in url_lower]
    if found_words:
        signals.append({
            "signal_name": "Suspicious keywords detected",
            "severity": "high",
            "points": 15,
            "explanation": f"URL contains phishing-related words: {', '.join(found_words)}. These words are frequently used in phishing and scam links."
        })

    # CHECK 3 — URL_SHORTENER
    shortener_list = [
        "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "short.io", "is.gd",
        "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc", "bl.ink",
        "snip.ly", "shorte.st", "adf.ly", "linktr.ee", "rb.gy"
    ]
    if any(s in hostname for s in shortener_list):
        signals.append({
            "signal_name": "URL shortener detected",
            "severity": "high",
            "points": 20,
            "explanation": "Shortened URLs hide the real destination. The final website behind this link may be dangerous or malicious."
        })

    # CHECK 4 — RAW_IP
    # If the user input itself is a raw IP
    is_raw_ip_input = is_valid_ip(hostname)
    if is_raw_ip_input:
        signals.append({
            "signal_name": "Raw IP address used",
            "severity": "medium",
            "points": 15,
            "explanation": f"This URL uses a raw IP address ({hostname}) instead of a domain name. Legitimate services almost never do this. It is a common attacker hosting tactic."
        })

    # CHECK 5 — VERY_LONG_URL
    if len(normalized_url) > 100:
        signals.append({
            "signal_name": "Unusually long URL",
            "severity": "low",
            "points": 10,
            "explanation": f"This URL is {len(normalized_url)} characters long. Very long URLs can be used to hide malicious parameters or fake a legitimate URL path."
        })

    # CHECK 6 — EXCESSIVE_SUBDOMAINS
    hostname_parts = hostname.split(".")
    hostname_parts = [part for part in hostname_parts if part]
    if len(hostname_parts) > 4:
        signals.append({
            "signal_name": "Excessive subdomains",
            "severity": "low",
            "points": 10,
            "explanation": f"This URL has {len(hostname_parts)} domain parts. Attackers use many subdomains to visually imitate trusted brands like bank.account.verify.evil.com."
        })

    # CHECK 7 — PUNYCODE
    if "xn--" in normalized_url.lower():
        signals.append({
            "signal_name": "Punycode/homoglyph domain detected",
            "severity": "high",
            "points": 20,
            "explanation": "This URL contains encoded characters (punycode) that can visually mimic trusted websites. For example, 'äpple.com' looks like 'apple.com' but is a different site."
        })

    # NEW CHECKS (Priority 5)
    # Check A: Very long domain name (registered domain length > 30)
    if domain and len(domain) > 30:
        signals.append({
            "signal_name": "Very long domain name",
            "severity": "low",
            "points": 10,
            "explanation": f"The domain name is unusually long ({len(domain)} characters). Attackers use long domains to mimic subdomains and bypass security scanning."
        })

    # Check B: Multiple hyphens in domain
    if domain and domain.count("-") >= 2:
        signals.append({
            "signal_name": "Multiple hyphens in domain",
            "severity": "medium",
            "points": 10,
            "explanation": f"The domain name contains {domain.count('-')} hyphens. Attackers frequently use multiple hyphens to masquerade as authentic brands."
        })

    # Check C: Urgency words
    urgency_words = ["now", "urgent", "immediately", "limited", "alert"]
    found_urgency = [w for w in urgency_words if w in url_lower]
    if found_urgency:
        signals.append({
            "signal_name": "Urgency words detected",
            "severity": "medium",
            "points": 10,
            "explanation": f"URL contains urgency-inducing keywords: {', '.join(found_urgency)}. Phishing links often pressure victims to act immediately."
        })

    # Check D: Phishing phrase combinations (2 or more related phishing terms appear together)
    phishing_pairs = [
        ("account", "update"),
        ("account", "verify"),
        ("security", "update"),
        ("login", "verify"),
        ("password", "reset"),
        ("kyc", "update")
    ]
    matched_pairs = []
    for w1, w2 in phishing_pairs:
        if w1 in url_lower and w2 in url_lower:
            matched_pairs.append(f"'{w1}' + '{w2}'")

    if matched_pairs:
        signals.append({
            "signal_name": "Phishing phrase combinations detected",
            "severity": "high",
            "points": 20,
            "explanation": f"URL contains high-risk phrase combinations: {', '.join(matched_pairs)}. These word pairs are strongly associated with social engineering."
        })

    # SSRF BLOCK & CHECK 8 — TOO_MANY_REDIRECTS (Priority 1)
    if not is_safe:
        # Host points to a blocked private/internal address
        signals.append({
            "signal_name": "Internal/private address blocked",
            "severity": "high",
            "points": 20,
            "explanation": "This URL points to an internal, private, or loopback network address. Outgoing requests to this host are blocked to protect system security and prevent SSRF attacks."
        })
    else:
        # Host is public and safe to execute HTTP request
        try:
            response = requests.head(
                normalized_url,
                allow_redirects=True,
                timeout=5,
                headers={"User-Agent": "ThreatLens-Scanner/1.0"}
            )
            redirect_count = len(response.history)
            if redirect_count > 2:
                signals.append({
                    "signal_name": "Multiple redirects detected",
                    "severity": "high",
                    "points": 20,
                    "explanation": f"This URL redirects {redirect_count} times before reaching its destination. Redirect chains are used to hide the final malicious website from scanners."
                })
        except Exception:
            # Silently skip if redirect check encounters any network error
            pass

    return {
        "normalized_url": normalized_url,
        "domain": domain,
        "ip_address": ip_address,
        "signals": signals
    }

