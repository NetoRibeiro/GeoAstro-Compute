from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

def test_geo(query):
    geolocator = Nominatim(user_agent="geoastro_test_debug")
    try:
        location = geolocator.geocode(query, timeout=10)
        if location:
            print(f"SUCCESS: {query} -> {location.latitude}, {location.longitude}")
        else:
            print(f"FAILURE: {query} -> None")
    except Exception as e:
        print(f"ERROR: {query} -> {e}")

print("Testing Geocoding...")
test_geo("El Masnou, Spain")
test_geo("Catalonia, Spain")
test_geo("Osasco, Brazil")
test_geo("Sao Paulo, Brazil")
