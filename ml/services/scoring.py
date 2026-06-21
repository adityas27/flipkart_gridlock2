def compute_risk_score(
    severity_score,
    hotspot_score,
    junction_score,
    closure_score,
    traffic_score
):

    return round((0.25 * severity_score +
        0.25 * hotspot_score +
        0.20 * junction_score +
        0.10 * closure_score +
        0.20 * traffic_score),2)


def get_risk_category(score):

    if score < 25:
        return "LOW"

    if score < 50:
        return "MEDIUM"

    if score < 75:
        return "HIGH"

    return "CRITICAL"