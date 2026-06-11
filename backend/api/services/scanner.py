import re
import urllib.parse
import requests
import tldextract
from api.services.ip_utils import is_safe_url_host, is_valid_ip, is_safe_ip, resolve_hostname

def validate_and_normalize_url(input_value: str) -> str:
    """
    Validates and normalizes input URL/IP/domain.
    Throws ValueError for invalid inputs (file://, ftp://, local paths, empty, malformed).
    """
    if not input_value:
        raise ValueError("URL input cannot be empty.")
    
    target = input_value.strip()
    
    # Reject local Windows paths and file:// or ftp:// protocols
    lower_target = target.lower()
    if lower_target.startswith("file://") or lower_target.startswith("ftp://"):
        raise ValueError("Unsupported protocol. Only http:// and https:// URLs are allowed.")
        
    # Check for local file paths
    # Windows drive paths like D:\ or C:/, or UNC paths like \\server, or relative/absolute UNIX paths like /etc
    if re.match(r'^[a-zA-Z]:[\\/]', target) or target.startswith('\\\\') or (target.startswith('/') and not target.startswith('//')):
        raise ValueError("Local paths or file references are not allowed.")
        
    # Check for invalid schemes
    if ":" in target:
        scheme_part = target.split(":")[0].lower()
        # If it looks like a scheme but is not http or https
        if scheme_part.isalpha() and scheme_part not in ("http", "https"):
            raise ValueError(f"Unsupported scheme: {scheme_part}://. Only http:// and https:// are allowed.")

    # Add default scheme if missing
    normalized_url = target
    if not (lower_target.startswith("http://") or lower_target.startswith("https://")):
        if target.startswith("//"):
            normalized_url = "http:" + target
        else:
            normalized_url = "http://" + target

    # Parse URL
    try:
        parsed = urllib.parse.urlparse(normalized_url)
    except Exception as e:
        raise ValueError(f"Malformed URL: {str(e)}")

    scheme = parsed.scheme.lower()
    if scheme not in ('http', 'https'):
        raise ValueError(f"Unsupported scheme: {scheme}://. Only http:// and https:// are allowed.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Invalid URL: missing host or domain name.")

    hostname = hostname.lower().strip()
    # Reconstruct netloc
    netloc = hostname
    if parsed.port:
        netloc = f"{hostname}:{parsed.port}"

    # Normalize path: remove trailing slash if path is "/" or empty
    path = parsed.path or ""
    if path == "/":
        path = ""
    if path and not path.startswith("/"):
        path = "/" + path

    query = parsed.query
    params = parsed.params
    fragment = parsed.fragment

    normalized = urllib.parse.urlunparse((
        scheme,
        netloc,
        path,
        params,
        query,
        fragment
    ))
    return normalized

def extract_url_signals(input_value: str) -> dict:
    """
    Main URL signal extraction function.
    Validates and normalizes URL, resolves host safely, and flags threat indicators.
    """
    # Let ValueError propagate to the caller for validation errors
    normalized_url = validate_and_normalize_url(input_value)
    
    parsed = urllib.parse.urlparse(normalized_url)
    hostname = parsed.hostname or ""
    
    # Extract domain name
    result = tldextract.extract(normalized_url)
    domain = result.registered_domain
    if not domain:
        domain = result.domain if result.domain else None
    
    # If hostname is a raw IP, domain is None
    is_raw_ip_input = is_valid_ip(hostname)
    if is_raw_ip_input:
        domain = None

    # DNS Resolution and safety checks (SSRF check)
    is_safe, resolved_ip = is_safe_url_host(hostname)
    ip_address = resolved_ip if resolved_ip else None
    
    signals = []

    # Check for reserved demo/testing domain (.test)
    is_demo_test = False
    if hostname.endswith('.test') or (domain and domain.endswith('.test')):
        is_demo_test = True
        signals.append({
            "signal_name": "Reserved demo/testing domain",
            "severity": "low",
            "points": 0,
            "explanation": "This is a reserved demo/testing domain used for controlled testing."
        })

    # Rule 1: No HTTPS (+15)
    if not normalized_url.startswith("https://"):
        signals.append({
            "signal_name": "No HTTPS",
            "severity": "medium",
            "points": 15,
            "explanation": "This link does not use secure HTTPS encryption. Your connection and data could be intercepted by attackers."
        })

    # Rule 2: URL shortener (+20)
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

    # Rule 3: Raw public IP URL (+15)
    if is_raw_ip_input:
        signals.append({
            "signal_name": "Raw IP address used",
            "severity": "medium",
            "points": 15,
            "explanation": f"This URL uses a raw IP address ({hostname}) instead of a domain name. Legitimate services almost never do this."
        })

    # Rule 4: Suspicious keyword density (+5 per keyword, cap +25)
    keyword_list = [
        "login", "verify", "reward", "free", "claim", "update", "kyc", "account",
        "secure", "banking", "confirm", "suspend", "alert", "urgent", "winner",
        "prize", "lucky", "ebill", "invoice", "password", "signin", "credential",
        "wallet", "otp"
    ]
    url_lower = normalized_url.lower()
    found_keywords = [w for w in keyword_list if w in url_lower]
    if found_keywords:
        kw_points = min(len(found_keywords) * 5, 25)
        signals.append({
            "signal_name": "Suspicious keywords detected",
            "severity": "high",
            "points": kw_points,
            "explanation": f"URL contains phishing-related words: {', '.join(found_keywords)}. These words are frequently used in phishing and scam links."
        })

    # Rule 5: Phishing phrase combinations (+20)
    phishing_pairs = [
        ("kyc", "update"),
        ("login", "verify"),
        ("account", "verify"),
        ("account", "update"),
        ("security", "update"),
        ("free", "reward"),
        ("password", "reset")
    ]
    matched_pairs = []
    for w1, w2 in phishing_pairs:
        if w1 in url_lower and w2 in url_lower:
            matched_pairs.append(f"{w1}+{w2}")

    if matched_pairs:
        signals.append({
            "signal_name": "Phishing phrase combinations detected",
            "severity": "high",
            "points": 20,
            "explanation": f"URL contains high-risk phrase combinations: {', '.join(matched_pairs)}. These word pairs are strongly associated with social engineering."
        })

    # Rule 6: Payment/brand impersonation terms (+15)
    brand_terms = ["paytm", "bank", "wallet", "upi", "card", "netbanking"]
    found_brands = [b for b in brand_terms if b in url_lower]
    if found_brands:
        signals.append({
            "signal_name": "Brand impersonation terms detected",
            "severity": "high",
            "points": 15,
            "explanation": f"URL contains payment/brand impersonation terms: {', '.join(found_brands)}."
        })

    # Rule 7: Multiple hyphens in domain (+10)
    if domain and domain.count("-") >= 2:
        signals.append({
            "signal_name": "Multiple hyphens in domain",
            "severity": "medium",
            "points": 10,
            "explanation": f"The domain name contains {domain.count('-')} hyphens. Attackers frequently use multiple hyphens to masquerade as authentic brands."
        })

    # Rule 8: Suspicious path keywords (+10)
    path_lower = parsed.path.lower()
    path_keywords = ["verify", "account", "login", "reset", "kyc", "update"]
    found_path_kws = [w for w in path_keywords if w in path_lower]
    if found_path_kws:
        signals.append({
            "signal_name": "Suspicious path keywords detected",
            "severity": "medium",
            "points": 10,
            "explanation": f"The URL path contains suspicious directories: {', '.join(found_path_kws)}."
        })

    # Rule 9: Very long URL/domain (+10)
    # Check if normalized url > 100 or domain length > 30
    if len(normalized_url) > 100 or (domain and len(domain) > 30) or (hostname and len(hostname) > 30):
        signals.append({
            "signal_name": "Unusually long URL or domain name",
            "severity": "low",
            "points": 10,
            "explanation": f"The URL ({len(normalized_url)} chars) or domain exceeds standard length guidelines."
        })

    # Rule 10: Punycode domain (+20)
    if "xn--" in hostname:
        signals.append({
            "signal_name": "Punycode/homoglyph domain detected",
            "severity": "high",
            "points": 20,
            "explanation": "This URL contains encoded characters (punycode) that can visually mimic trusted websites."
        })

    # SSRF & Private/Internal Target check
    if not is_safe:
        signals.append({
            "signal_name": "Internal/private address blocked",
            "severity": "high",
            "points": 20,
            "explanation": "This URL points to an internal, private, or loopback network address. Outgoing requests are blocked."
        })
    else:
        # Check for unresolved domain name (only for public domains)
        if not resolved_ip and not is_demo_test and not is_raw_ip_input:
            signals.append({
                "signal_name": "Unresolved domain name",
                "severity": "medium",
                "points": 10,
                "explanation": "This domain name does not resolve to any active IP address."
            })
        
        # Rule 11: Excessive redirects (+20) (Only for safe public hosts that resolve)
        elif resolved_ip:
            try:
                response = requests.head(
                    normalized_url,
                    allow_redirects=True,
                    timeout=3, # Short timeout to prevent hanging scans
                    headers={"User-Agent": "ThreatLens-Scanner/1.0"}
                )
                redirect_count = len(response.history)
                if redirect_count > 2:
                    signals.append({
                        "signal_name": "Multiple redirects detected",
                        "severity": "high",
                        "points": 20,
                        "explanation": f"This URL redirects {redirect_count} times before reaching its destination."
                    })
            except Exception:
                pass

    return {
        "normalized_url": normalized_url,
        "domain": domain,
        "ip_address": ip_address,
        "signals": signals
    }
