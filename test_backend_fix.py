import urllib.request
import json
import sys

def post_json(url, data):
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

def test_backend():
    url = "http://localhost:8000/analyze"
    payload = {
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "date": "1990-05-15",
        "time": "14:30:00",
        "temperature": "20",
        "useHistoricalTemperature": False
    }
    
    print(f"Testing {url}...")
    code, response = post_json(url, payload)
    print(f"Status: {code}")
    
    if code == 200:
        print("Success! Response keys:", response.keys())
        return True
    else:
        print("Error:", response)
        return False

def test_solar_return():
    url = "http://localhost:8000/solar-return"
    payload = {
        "birth_date": "1990-05-15",
        "birth_time": "14:30:00",
        "target_year": 2025,
        "city": "New York",
        "country": "USA",
        "state": "NY"
    }
    print(f"\nTesting {url}...")
    code, response = post_json(url, payload)
    print(f"Status: {code}")
    
    if code == 200:
        print("Success!", response)
        return True
    else:
        print("Error:", response)
        return False

if __name__ == "__main__":
    if test_backend() and test_solar_return():
        print("\nAll backend tests passed!")
    else:
        print("\nBackend tests failed.")
        sys.exit(1)
