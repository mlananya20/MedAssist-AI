"""
Module 9: Nearby Hospital Finder.
Uses OpenStreetMap's free Nominatim (geocoding) and Overpass (POI search) APIs —
no API key required, good fit for a student project.
"""
import math
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# A required, polite header for OpenStreetMap's free tier — they block requests without one.
HEADERS = {"User-Agent": "MedAssistAI-StudentProject/1.0"}

EMERGENCY_NUMBERS = {
    "us": "911", "ca": "911", "in": "112 (or 108 for ambulance)",
    "gb": "999", "au": "000", "de": "112", "fr": "112",
    "jp": "119", "cn": "120", "br": "192", "za": "10177",
}
DEFAULT_EMERGENCY_NOTE = "112 is the emergency number in most countries — verify your local number."


def geocode_address(address):
    """Turns a free-text address/city into coordinates using Nominatim."""
    params = {"q": address, "format": "json", "limit": 1, "addressdetails": 1}
    resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    results = resp.json()
    if not results:
        return None

    top = results[0]
    country_code = top.get("address", {}).get("country_code", "")
    return {
        "lat": float(top["lat"]),
        "lon": float(top["lon"]),
        "display_name": top["display_name"],
        "country_code": country_code,
    }


def _haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_nearby_medical(lat, lon, radius_m=6000, limit=10):
    """Queries Overpass for hospitals and clinics within radius_m of (lat, lon)."""
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:{radius_m},{lat},{lon});
      way["amenity"="hospital"](around:{radius_m},{lat},{lon});
      node["amenity"="clinic"](around:{radius_m},{lat},{lon});
      way["amenity"="clinic"](around:{radius_m},{lat},{lon});
    );
    out center;
    """
    resp = requests.post(OVERPASS_URL, data={"data": query}, headers=HEADERS, timeout=25)
    resp.raise_for_status()
    elements = resp.json().get("elements", [])

    results = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue  # skip unnamed nodes — usually noise

        el_lat = el.get("lat") or el.get("center", {}).get("lat")
        el_lon = el.get("lon") or el.get("center", {}).get("lon")
        if el_lat is None or el_lon is None:
            continue

        distance_km = round(_haversine_km(lat, lon, el_lat, el_lon), 1)
        results.append({
            "name": name,
            "type": tags.get("amenity", "medical"),
            "lat": el_lat,
            "lon": el_lon,
            "distance_km": distance_km,
            "address": tags.get("addr:street", ""),
        })

    results.sort(key=lambda r: r["distance_km"])
    return results[:limit]


def get_emergency_number(country_code):
    return EMERGENCY_NUMBERS.get((country_code or "").lower(), DEFAULT_EMERGENCY_NOTE)
