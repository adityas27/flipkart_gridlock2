import json

def build_resource_allocation_prompt(
event_details: dict,
prediction_details: dict,
resource_dict: dict
):
    return f"""
    You are a Traffic Command Center Resource Allocation Assistant.

    Your task is to recommend deployment of traffic management resources.

    RULES:

    1. ONLY allocate from available resources.
    2. NEVER allocate more than available.
    3. Consider:

    * Event Cause
    * Event Type
    * Severity Score
    * Risk Score
    * Risk Category
    * Road Closure Requirement
    4. Return ONLY valid JSON.
    5. Resource counts must be integers.
    6. If resources are insufficient, report resource_gap.
    7. Keep reasoning concise.

    EVENT:

    {json.dumps(event_details, indent=2)}

    PREDICTION:

    {json.dumps(prediction_details, indent=2)}

    AVAILABLE RESOURCES:

    {json.dumps(resource_dict, indent=2)}

    Return exactly:

    {{
    "allocation_priority": "LOW|MEDIUM|HIGH|CRITICAL",

    ```
    "recommended_resources": {{
        "officers": 0,
        "marshals": 0,
        "barricades": 0,
        "tow_vehicles": 0,
        "ambulances": 0
    }},

    "resource_gap": {{
        "officers": 0,
        "marshals": 0,
        "barricades": 0,
        "tow_vehicles": 0,
        "ambulances": 0
    }},

    "reasoning": [
        ""
    ]
    ```

    }}
    """

def recommend_resources_llm(
genai_client,
event_details: dict,
prediction_details: dict,
resource_dict: dict
):
    prompt = build_resource_allocation_prompt(
    event_details=event_details,
    prediction_details=prediction_details,
    resource_dict=resource_dict
    )

    try:
        response = genai_client.models.generate_content(
            model="gemma-4-26b-a4b-it",
            contents=prompt
        )
        return json.loads(response.text)

    except Exception as e:
        print(f"LLM Error: {e}")
        return {
            "allocation_priority": prediction_details.get(
                "risk_category",
                "MEDIUM"
            ),

            "recommended_resources": {
                "officers": 0,
                "marshals": 0,
                "barricades": 0,
                "tow_vehicles": 0,
                "ambulances": 0
            },

            "resource_gap": {
                "officers": 0,
                "marshals": 0,
                "barricades": 0,
                "tow_vehicles": 0,
                "ambulances": 0
            },

            "reasoning": [
                f"Failed to get LLM response: {str(e)}"
            ]
        }

