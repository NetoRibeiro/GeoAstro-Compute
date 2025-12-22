from skyfield.api import load, wgs84
from skyfield import almanac
from datetime import datetime, timedelta
import pytz
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from skyfield.api import Angle
import math

import os

# Robust path handling for Cloud Run
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
eph_path = os.path.join(base_dir, 'de421.bsp')

if not os.path.exists(eph_path):
    # Fallback to backend directory if not in root
    eph_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'de421.bsp')

print(f"Loading ephemeris from: {eph_path}")
if not os.path.exists(eph_path):
    print(f"WARNING: Ephemeris file not found at {eph_path}. Skyfield will attempt to download to /tmp or CWD.")

# Load Ephemeris
# Load Ephemeris
try:
    if os.path.exists(eph_path):
        eph = load(eph_path)
    else:
        # Try default download logic (might work if /tmp is used by Skyfield by default? No)
        print("Ephemeris path not found, trying default load...")
        eph = load('de421.bsp')
except Exception as e:
    print(f"Error loading ephemeris: {e}")
    try:
        # Last ditch effort: simple load which might trigger download
        eph = load('de421.bsp')
    except Exception as e2:
         print(f"CRITICAL: Could not load ephemeris: {e2}")
         raise RuntimeError(f"Ephemeris load failed: {e} -> {e2}")

sun = eph['sun']
moon = eph['moon']
earth = eph['earth']

def get_lat_lon(city, country, state=None):
    try:
        geolocator = Nominatim(user_agent="geoastro_compute_backend_v2")
        
        # Attempt 1: City, Country
        for attempt in range(2):
            try:
                location = geolocator.geocode(f"{city}, {country}", timeout=10)
                if location:
                    return location.latitude, location.longitude
            except (GeocoderTimedOut, Exception) as e:
                print(f"Geocoding error (City, Country) attempt {attempt+1}: {e}")

        # Attempt 2: State, Country (Fallback)
        if state:
            print(f"Falling back to State: {state}, {country}")
            for attempt in range(2):
                try:
                    location = geolocator.geocode(f"{state}, {country}", timeout=10)
                    if location:
                        return location.latitude, location.longitude
                except (GeocoderTimedOut, Exception) as e:
                    print(f"Geocoding error (State, Country) attempt {attempt+1}: {e}")
                
        # If all fails, return a default for debugging instead of crashing
        print(f"Could not resolve location for {city}, {country}. Using fallback (London).")
        return 51.5074, -0.1278
        
    except Exception as e:
        print(f"Critical geocoding failure: {e}")
        return 51.5074, -0.1278

def calculate_astronomy(city, country, date_str, time_str, state=None):
    lat, lon = get_lat_lon(city, country, state)
    
    dt_str = f"{date_str} {time_str}"
    try:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        
    ts = load.timescale()
    t = ts.from_datetime(dt.replace(tzinfo=pytz.utc))
    
    observer = earth + wgs84.latlon(lat, lon)
    
    # Sun Position
    astrometric = observer.at(t).observe(sun)
    app = astrometric.apparent()
    alt, az, distance = app.altaz()
    ha, dec, dist = app.hadec()
    
    # True Solar Time
    solar_time_hours = (ha.hours + 12) % 24
    
    def decimal_hours_to_hms(hours):
        h = int(hours)
        m = int((hours - h) * 60)
        s = int(((hours - h) * 60 - m) * 60)
        return f"{h:02d}:{m:02d}:{s:02d}"
        
    true_solar_time_str = decimal_hours_to_hms(solar_time_hours)
    
    # Civil Offset
    input_hours = dt.hour + dt.minute / 60 + dt.second / 3600
    diff_hours = solar_time_hours - input_hours
    if diff_hours > 12: diff_hours -= 24
    if diff_hours < -12: diff_hours += 24
    diff_minutes = diff_hours * 60
    civil_diff_str = f"{diff_minutes:+.1f} mins"

    # Zodiac Sign (Longitude)
    _, lon_ecl, _ = app.ecliptic_latlon()
    longitude = lon_ecl.degrees
    
    zodiac_signs = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    zodiac_index = int(longitude / 30)
    zodiac_sign = zodiac_signs[zodiac_index % 12]
    
    # Moon Phase
    phase_angle = almanac.moon_phase(eph, t)
    phase_deg = phase_angle.degrees
    
    phase_name = "New Moon"
    if 0 <= phase_deg < 45: phase_name = "New Moon"
    elif 45 <= phase_deg < 90: phase_name = "Waxing Crescent"
    elif 90 <= phase_deg < 135: phase_name = "First Quarter"
    elif 135 <= phase_deg < 180: phase_name = "Waxing Gibbous"
    elif 180 <= phase_deg < 225: phase_name = "Full Moon"
    elif 225 <= phase_deg < 270: phase_name = "Waning Gibbous"
    elif 270 <= phase_deg < 315: phase_name = "Last Quarter"
    else: phase_name = "Waning Crescent"

    # Planets
    planets = {
        'Mercury': eph['mercury'],
        'Venus': eph['venus'],
        'Mars': eph['mars'],
        'Jupiter': eph['jupiter_barycenter'],
        'Saturn': eph['saturn_barycenter'],
        'Uranus': eph['uranus_barycenter'],
        'Neptune': eph['neptune_barycenter'],
        'Pluto': eph['pluto_barycenter']
    }
    
    planetary_positions = {}
    
    for name, body in planets.items():
        astrometric = observer.at(t).observe(body)
        _, lon, _ = astrometric.apparent().ecliptic_latlon()
        planet_lon = lon.degrees
        
        z_index = int(planet_lon / 30)
        z_sign = zodiac_signs[z_index % 12]
        
        planetary_positions[name] = {
            "longitude": planet_lon,
            "zodiacSign": z_sign,
            "degree": planet_lon % 30
        }

    # Generate Cosmic Fact
    # Simple deterministic fact generation based on positions
    fact = f"The Sun is in {zodiac_sign} and the Moon is in its {phase_name} phase."
    if zodiac_sign == "Leo":
        fact += " A time for bold expression."
    elif zodiac_sign == "Cancer":
        fact += " Emotions may run deep."
    elif zodiac_sign == "Scorpio":
        fact += " Intensity is in the air."
    elif phase_name == "Full Moon":
        fact += " Illumination and culmination."
    elif phase_name == "New Moon":
        fact += " A time for new beginnings."

    return {
        "coordinates": {"latitude": lat, "longitude": lon},
        "trueSolarTime": true_solar_time_str,
        "civilTimeDifference": civil_diff_str,
        "sunPosition": {
            "azimuth": az.degrees,
            "altitude": alt.degrees,
            "constellation": zodiac_sign, 
            "longitude": longitude
        },
        "zodiacSign": zodiac_sign,
        "moonPosition": {
            "phase": phase_name,
            "constellation": "Unknown" 
        },
        "planets": planetary_positions,
        "cosmicFact": fact,
        "equationOfTime": "N/A",
        "temperature": ""
    }

def calculate_solar_return(birth_date_str, birth_time_str, target_year, city, country, state=None):
    lat, lon = get_lat_lon(city, country, state)
    
    dt_str = f"{birth_date_str} {birth_time_str}"
    try:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
    
    ts = load.timescale()
    t_birth = ts.from_datetime(dt.replace(tzinfo=pytz.utc))
    
    observer = earth + wgs84.latlon(lat, lon)
    birth_sun = observer.at(t_birth).observe(sun).apparent()
    _, birth_lon_ecl, _ = birth_sun.ecliptic_latlon()
    target_lon = birth_lon_ecl.degrees
    
    # Search window: Birthday in target year +/- 2 days
    birth_dt = dt
    start_search_dt = datetime(target_year, birth_dt.month, birth_dt.day) - timedelta(days=2)
    end_search_dt = datetime(target_year, birth_dt.month, birth_dt.day) + timedelta(days=2)
    
    t1 = ts.from_datetime(start_search_dt.replace(tzinfo=pytz.utc))
    t2 = ts.from_datetime(end_search_dt.replace(tzinfo=pytz.utc))
    
    def sun_longitude_difference(t):
        s = earth.at(t).observe(sun).apparent()
        _, l, _ = s.ecliptic_latlon()
        current_lon = l.degrees
        diff = current_lon - target_lon
        if diff > 180: diff -= 360
        if diff < -180: diff += 360
        return diff

    # Bisection Search
    y1 = sun_longitude_difference(t1)
    y2 = sun_longitude_difference(t2)
    
    if y1 * y2 > 0:
        return None # Should not happen
        
    low = t1.tt
    high = t2.tt
    
    t_final = t1
    
    for _ in range(20):
        mid = (low + high) / 2
        t_mid = ts.tt_jd(mid)
        y_mid = sun_longitude_difference(t_mid)
        if y_mid == 0: 
            t_final = t_mid
            break
        if y1 * y_mid < 0:
            high = mid
            y2 = y_mid
        else:
            low = mid
            y1 = y_mid
        t_final = t_mid
            
    return t_final.utc_iso()

def calculate_perfect_alignment(birth_date, birth_time, birth_city, birth_country, birth_state, solar_return_iso):
    # 1. Calculate Birth Sun Position (Alt/Az)
    lat, lon = get_lat_lon(birth_city, birth_country, birth_state)
    
    dt_str = f"{birth_date} {birth_time}"
    try:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        
    ts = load.timescale()
    t_birth = ts.from_datetime(dt.replace(tzinfo=pytz.utc))
    
    observer = earth + wgs84.latlon(lat, lon)
    birth_sun = observer.at(t_birth).observe(sun).apparent()
    alt, az, _ = birth_sun.altaz()
    target_altitude = alt.degrees
    target_azimuth = az.degrees
    
    # Calculate GHA at birth
    # GHA = Greenwich Apparent Sidereal Time - Right Ascension
    # But simpler: LHA = GHA + Lon. We want to match LHA and Lat.
    # So we want: current_LHA = birth_LHA
    # current_GHA + current_Lon = birth_GHA + birth_Lon
    # current_Lon = birth_GHA + birth_Lon - current_GHA
    
    # To get GHA, we can use: GHA = LHA - Lon
    # LHA can be derived from HA (Hour Angle) from hadec()
    ha, _, _ = birth_sun.hadec()
    # ha is the hour angle. 
    # LHA (in degrees) = ha.hours * 15
    birth_lha_deg = ha.hours * 15
    
    # 2. At Solar Return Time
    t_return = ts.from_datetime(datetime.fromisoformat(solar_return_iso.replace('Z', '+00:00')))
    
    # We need the GHA of the Sun at t_return
    # We can calculate it by observing from Lon=0
    observer_greenwich = earth + wgs84.latlon(0, 0)
    sun_return_greenwich = observer_greenwich.at(t_return).observe(sun).apparent()
    ha_return, _, _ = sun_return_greenwich.hadec()
    return_gha_deg = ha_return.hours * 15
    
    # Calculate required Longitude
    # birth_lha = return_gha + required_lon
    # required_lon = birth_lha - return_gha
    required_lon = birth_lha_deg - return_gha_deg
    
    # Normalize to -180 to 180
    while required_lon > 180: required_lon -= 360
    while required_lon < -180: required_lon += 360
    
    best_lat = lat # Latitude stays the same to match Declination effect on Alt/Az (mostly)
    best_lon = required_lon
    
    # Reverse Geocode to find city with improved fallback logic
    geolocator = Nominatim(user_agent="geoastro_compute_v1_backend")
    city = "Unknown"
    country = "Unknown"
    country_code = None
    
    # Try reverse geocoding with retry logic
    for attempt in range(2):
        try:
            # Try to find a location near these coordinates
            # reverse() returns a location object with address details
            location = geolocator.reverse((best_lat, best_lon), language='en', timeout=10, zoom=10)
            
            if location:
                address = location.raw.get('address', {})
                
                # Try multiple address fields in order of preference
                city = (
                    address.get('city') or 
                    address.get('town') or 
                    address.get('village') or 
                    address.get('municipality') or
                    address.get('hamlet') or
                    address.get('county') or
                    address.get('state_district') or
                    address.get('state') or
                    address.get('region') or
                    None
                )
                
                # Get country information
                country = address.get('country') or "Unknown"
                country_code = address.get('country_code')
                
                # If still no city, try to extract from display_name
                if not city and location.raw.get('display_name'):
                    display_name = location.raw.get('display_name')
                    # display_name format is usually: "Place, Region, Country"
                    parts = [p.strip() for p in display_name.split(',')]
                    if len(parts) >= 2:
                        # Use the first meaningful part as city
                        city = parts[0] if parts[0] else None
                
                # If we found a location but no specific city, provide descriptive fallback
                if not city:
                    if address.get('ocean') or address.get('sea'):
                        # Location is in ocean/sea
                        ocean_name = address.get('ocean') or address.get('sea')
                        city = f"Ocean ({ocean_name})" if ocean_name else "Ocean Location"
                    elif country != "Unknown":
                        # We have country but no city - use region/state
                        region = address.get('state') or address.get('region')
                        city = f"{region}, {country}" if region else country
                    else:
                        city = "Remote Location"
                
                break  # Success, exit retry loop
                
        except GeocoderTimedOut:
            print(f"Reverse geocoding timeout (attempt {attempt + 1}/2)")
            if attempt == 1:  # Last attempt failed
                city = "Location Unavailable"
        except Exception as e:
            print(f"Reverse geocoding error (attempt {attempt + 1}/2): {e}")
            if attempt == 1:  # Last attempt failed
                city = "Geocoding Error"
        
    # Fallback for country if unknown (improved ocean and region detection)
    if country == "Unknown":
        # Check if location is in ocean based on coordinates
        if -180 <= best_lon <= -30:  # Western Hemisphere oceans
            if 0 <= best_lat <= 70:
                country = "North Atlantic Ocean"
                city = "Ocean Location" if city == "Unknown" else city
            elif -60 <= best_lat < 0:
                country = "South Atlantic Ocean"
                city = "Ocean Location" if city == "Unknown" else city
            elif best_lon < -100:  # Pacific side
                if best_lat >= 0:
                    country = "North Pacific Ocean"
                    city = "Ocean Location" if city == "Unknown" else city
                else:
                    country = "South Pacific Ocean"
                    city = "Ocean Location" if city == "Unknown" else city
        elif 30 <= best_lon <= 180:  # Eastern Hemisphere oceans
            if best_lat >= 0:
                country = "North Pacific Ocean"
                city = "Ocean Location" if city == "Unknown" else city
            else:
                country = "Indian Ocean"
                city = "Ocean Location" if city == "Unknown" else city
        # Land-based fallbacks
        elif 50 <= best_lat <= 80 and 20 <= best_lon <= 180:
            country = "Russia"
            country_code = "ru"
        elif -10 <= best_lat <= 60 and -10 <= best_lon <= 40:
            country = "Europe/Africa"
        elif 25 <= best_lat <= 50 and -130 <= best_lon <= -65:
            country = "United States"
            country_code = "us"
        else:
            country = f"Coordinates: {best_lat:.2f}°, {best_lon:.2f}°"

    solar_return_dt = t_return.utc_datetime()
    local_time_str = solar_return_dt.strftime("%H:%M:%S")
    local_date_str = solar_return_dt.strftime("%Y-%m-%d")

    reasoning = f"Optimal location where solar geometry at {local_date_str} matches birth alignment. Sun altitude: {target_altitude:.1f}°, azimuth: {target_azimuth:.1f}°."

    return {
        "city": city,
        "country": country,
        "countryCode": country_code,
        "coordinates": {
            "latitude": best_lat,
            "longitude": best_lon
        },
        "reasoning": reasoning,
        "localDateAtReturn": local_date_str,
        "localTimeAtReturn": local_time_str
    }

def calculate_arroyo_analysis(birth_date, birth_time, city, country, state=None):
    lat, lon = get_lat_lon(city, country, state)
    
    dt_str = f"{birth_date} {birth_time}"
    try:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        
    ts = load.timescale()
    t = ts.from_datetime(dt.replace(tzinfo=pytz.utc))
    
    observer = earth + wgs84.latlon(lat, lon)
    
    # Zodiac Data
    zodiac_signs = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    elements = {
        "Fire": ["Aries", "Leo", "Sagittarius"],
        "Earth": ["Taurus", "Virgo", "Capricorn"],
        "Air": ["Gemini", "Libra", "Aquarius"],
        "Water": ["Cancer", "Scorpio", "Pisces"]
    }
    
    modalities = {
        "Cardinal": ["Aries", "Cancer", "Libra", "Capricorn"],
        "Fixed": ["Taurus", "Leo", "Scorpio", "Aquarius"],
        "Mutable": ["Gemini", "Virgo", "Sagittarius", "Pisces"]
    }
    
    # Calculate Positions
    bodies = {
        'Sun': sun,
        'Moon': moon,
        'Mercury': eph['mercury'],
        'Venus': eph['venus'],
        'Mars': eph['mars'],
        'Jupiter': eph['jupiter_barycenter'],
        'Saturn': eph['saturn_barycenter'],
        'Uranus': eph['uranus_barycenter'],
        'Neptune': eph['neptune_barycenter'],
        'Pluto': eph['pluto_barycenter']
    }
    
    positions = {}
    
    for name, body in bodies.items():
        astrometric = observer.at(t).observe(body)
        _, lon_ecl, _ = astrometric.apparent().ecliptic_latlon()
        lon_deg = lon_ecl.degrees
        z_index = int(lon_deg / 30)
        z_sign = zodiac_signs[z_index % 12]
        positions[name] = {"sign": z_sign, "longitude": lon_deg}

    # Calculate Ascendant (Approximate)
    from skyfield.api import Angle
    import math
    
    # Get GAST from skyfield
    gast_hours = t.gast
    lst_hours = gast_hours + lon / 15.0
    lst_rad = lst_hours * 15.0 * (math.pi / 180.0)
    
    lat_rad = lat * (math.pi / 180.0)
    eps_rad = 23.44 * (math.pi / 180.0) # Approx obliquity
    
    # Formula for Ascendant
    y = -math.cos(lst_rad)
    x = math.sin(lst_rad) * math.cos(eps_rad) + math.tan(lat_rad) * math.sin(eps_rad)
    
    asc_rad = math.atan2(y, x)
    asc_deg = asc_rad * (180.0 / math.pi)
    if asc_deg < 0: asc_deg += 360.0
    
    asc_index = int(asc_deg / 30)
    asc_sign = zodiac_signs[asc_index % 12]
    positions['Ascendant'] = {"sign": asc_sign, "longitude": asc_deg}
    
    # Scoring
    scores = {
        "Fire": 0, "Earth": 0, "Air": 0, "Water": 0,
        "Cardinal": 0, "Fixed": 0, "Mutable": 0
    }
    
    weights = {
        'Sun': 2, 'Moon': 2, 'Ascendant': 2,
        'Mercury': 1, 'Venus': 1, 'Mars': 1,
        'Jupiter': 1, 'Saturn': 1, 'Uranus': 1, 'Neptune': 1, 'Pluto': 1
    }
    
    for name, data in positions.items():
        sign = data['sign']
        weight = weights.get(name, 1)
        
        # Find Element
        for elem, signs in elements.items():
            if sign in signs:
                scores[elem] += weight
                
        # Find Modality
        for mod, signs in modalities.items():
            if sign in signs:
                scores[mod] += weight
                
    # Interpretation
    dominant_element = max(elements.keys(), key=lambda k: scores[k])
    weakest_element = min(elements.keys(), key=lambda k: scores[k])
    
    interpretation = ""
    if dominant_element == "Fire":
        interpretation = "You have a strong emphasis on Fire, suggesting a spirited, intuitive, and enthusiastic approach to life. You likely value freedom and self-expression."
    elif dominant_element == "Earth":
        interpretation = "Your chart is grounded in Earth, indicating a practical, reliable, and sensory-oriented nature. You likely value stability and tangible results."
    elif dominant_element == "Air":
        interpretation = "With a dominance of Air, you are likely intellectually driven, communicative, and social. You value ideas, relationships, and objectivity."
    elif dominant_element == "Water":
        interpretation = "A Water emphasis suggests a deep emotional nature, intuition, and sensitivity. You likely value connection, healing, and the mysteries of life."
        
    if scores[weakest_element] <= 2:
        interpretation += f" However, you may need to consciously cultivate {weakest_element} energy, as it is less naturally available to you."

    return {
        "scores": scores,
        "positions": positions,
        "dominantElement": dominant_element,
        "dominantModality": max(modalities.keys(), key=lambda k: scores[k]),
        "interpretation": interpretation
    }