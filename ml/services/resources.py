def recommend_resources(risk_score):

    if risk_score < 25:
        return {
            "officers": 1,
            "barricades": 0,
            "tow_vehicles": 0
        }

    if risk_score < 50:
        return {
            "officers": 2,
            "barricades": 2,
            "tow_vehicles": 0
        }

    if risk_score < 75:
        return {
            "officers": 4,
            "barricades": 6,
            "tow_vehicles": 1
        }

    return {
        "officers": 8,
        "barricades": 10,
        "tow_vehicles": 2
    }