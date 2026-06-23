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
    Extract JSON from response text, handling markdown code blocks and extra content.
    Tries multiple patterns to find valid JSON.
    """
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Pattern 1: JSON in markdown code blocks (```json ... ``` or ``` ... ```)
    json_block_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
    match = re.search(json_block_pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    
    # Pattern 2: Find complete JSON object (balanced braces)
    brace_count = 0
    start_idx = -1
    end_idx = -1
    
    for i, char in enumerate(text):
        if char == '{':
            if brace_count == 0:
                start_idx = i
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0 and start_idx != -1:
                end_idx = i
                break
    
    if start_idx != -1 and end_idx != -1:
        return text[start_idx:end_idx + 1]
    
    # Pattern 3: Return as-is (might be pure JSON)
    return text


def clean_json_string(json_str: str) -> str:
    """
    Clean JSON string by removing common issues.
    """
    # Remove any trailing commas before closing braces/brackets
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
    
    # Remove any text before first {
    start = json_str.find('{')
    if start > 0:
        json_str = json_str[start:]
    
    # Remove any text after last }
    end = json_str.rfind('}')
    if end != -1 and end < len(json_str) - 1:
        json_str = json_str[:end + 1]
    
    return json_str.strip()


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
            model="gemma-2-9b-it",
            contents=prompt
        )
        
        # Get response text
        response_text = response.text.strip()
        
        # Extract JSON from response (handles markdown and extra content)
        json_text = extract_json_from_response(response_text)
        
        # Clean the JSON string
        json_text = clean_json_string(json_text)
        
        # Parse JSON
        result = json.loads(json_text)
        
        # Validate structure and provide defaults for missing keys
        default_response = {
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
            "reasoning": []
        }
        
        # Merge with defaults to ensure all keys exist
        for key in default_response:
            if key not in result:
                result[key] = default_response[key]
            elif key in ["recommended_resources", "resource_gap"]:
                # Ensure all resource types exist
                for resource_type in default_response[key]:
                    if resource_type not in result[key]:
                        result[key][resource_type] = 0
        
        # Ensure reasoning is a list
        if not isinstance(result.get("reasoning"), list):
            result["reasoning"] = [str(result.get("reasoning", ""))]
        
        return result

    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        if 'response_text' in locals():
            print(f"Raw response (first 500 chars): {response_text[:500]}")
        if 'json_text' in locals():
            print(f"Extracted JSON (first 500 chars): {json_text[:500]}")
        
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
