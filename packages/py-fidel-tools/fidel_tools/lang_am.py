import json
import pkgutil

def get_amharic_pack() -> dict:
    """
    Loads and returns the Amharic language pack configuration dict.
    """
    data = pkgutil.get_data("fidel_tools", "lang_am/am.json")
    if data is None:
        raise FileNotFoundError("Amharic language pack (am.json) not found in package resources.")
    return json.loads(data.decode("utf-8"))
