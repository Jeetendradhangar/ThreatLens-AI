def calculate_risk(signals: list) -> dict:
    total_points = sum(s["points"] for s in signals)
    risk_score = min(total_points, 100)

    # Priority 7 threat level mappings
    if risk_score <= 30:
        threat_level = "Safe"
    elif risk_score < 70:
        threat_level = "Suspicious"
    else:
        threat_level = "Dangerous"

    # Confidence mappings based on actual threat signals (points > 0)
    threat_signals_count = len([s for s in signals if s.get("points", 0) > 0])
    if threat_signals_count >= 3:
        confidence = "High"
    elif threat_signals_count >= 1:
        confidence = "Medium"
    else:
        confidence = "Low"

    summaries = {
        "Safe": "No significant risk indicators were found for this URL.",
        "Suspicious": "Some risk patterns were detected. This URL requires manual verification before use.",
        "Dangerous": "Multiple strong threat indicators found. This URL is highly likely to be malicious."
    }
    recommendations = {
        "Safe": "No major red flags detected. Still avoid sharing sensitive personal data unless you fully trust this website.",
        "Suspicious": "Do not enter personal information, passwords, or payment details. Manually verify the source and sender before proceeding.",
        "Dangerous": "Do not open, click, or interact with this URL. Block it and report it to your email provider or IT team if possible."
    }

    return {
        "risk_score": risk_score,
        "threat_level": threat_level,
        "confidence": confidence,
        "summary": summaries[threat_level],
        "recommendation": recommendations[threat_level]
    }

