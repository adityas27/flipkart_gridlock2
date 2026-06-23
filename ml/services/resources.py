import json
import re


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
    4. Return ONLY valid JSON without markdown formatting.
    5. Resource counts must be integers.
    6. If resources are insufficient, report resource_gap.
    7. Generate a diversion_strategy including:
       - barricade_placements: Where to place barricades.
       - emergency_corridors: Instructions for ambulances.
       - transit_rerouting: Instructions for public transit.
    8. Keep reasoning concise.

    EVENT:
    {json.dumps(event_details, indent=2)}

    PREDICTION:
    {json.dumps(prediction_details, indent=2)}

    AVAILABLE RESOURCES:
    {json.dumps(resource_dict, indent=2)}

    Return ONLY a valid JSON object with this structure (no markdown, no code blocks):

    {{
        "allocation_priority": "LOW|MEDIUM|HIGH|CRITICAL",
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

    "diversion_strategy": {{
        "barricade_placements": [""],
        "emergency_corridors": [""],
        "transit_rerouting": [""]
    }},
        "reasoning": ["reason 1", "reason 2"]
    }}
    """


def extract_json_from_response(text: str) -> str:
    """
    Extract JSON from response text, handling markdown code blocks.
    Tries multiple patterns to find valid JSON.
    """
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Pattern 1: JSON in markdown code blocks (```json ... ``` or ``` ... ```)
    json_block_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
    match = re.search(json_block_pattern, text, re.DOTALL)
    if match:
        return match.group(1)
    
    # Pattern 2: Find first { to last } (raw JSON)
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        return text[start_idx:end_idx + 1]
    
    # Pattern 3: Return as-is (might be pure JSON)
    return text


def recommend_resources_llm(
    genai_client,
    event_details: dict,
    prediction_details: dict,
    resource_dict: dict
):
    """
    Use LLM to recommend resource allocation based on event and prediction details.
    Handles markdown formatting and extracts clean JSON from response.
    """
    prompt = build_resource_allocation_prompt(
        event_details=event_details,
        prediction_details=prediction_details,
        resource_dict=resource_dict
    )

    try:
        # Call Gemini API
        response = genai_client.models.generate_content(
            model="gemma-4-26b-a4b-it",
            contents=prompt
        )
        # Get response text
        response_text = response.text.strip()
        # Extract JSON from response (handles markdown)
        json_text = extract_json_from_response(response_text)
        # Parse JSON
        result = json.loads(json_text)
        # Validate structure
        if not all(key in result for key in ["allocation_priority", "recommended_resources", "resource_gap", "reasoning"]):
            raise ValueError("Response missing required keys")
        return result

    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        if 'response_text' in locals():
            print(f"Raw response (first 500 chars): {response_text[:500]}")
        
        return {
            "allocation_priority": prediction_details.get("risk_category", "MEDIUM"),
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
                f"Failed to parse LLM JSON response: {str(e)}"
            ]
        }
    
    except Exception as e:
        print(f"LLM Error: {e}")
        
        return {
            "allocation_priority": prediction_details.get("risk_category", "MEDIUM"),
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
            
            "diversion_strategy": {
                "barricade_placements": [],
                "emergency_corridors": [],
                "transit_rerouting": []
            },

            "reasoning": [
                f"Failed to get LLM response: {str(e)}"
            ]
        }
