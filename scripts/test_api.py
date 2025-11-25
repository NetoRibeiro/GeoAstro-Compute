
import urllib.request
import json

url = "http://localhost:8000/analyze"
data = {
    "city": "Berlin",
    "state": "",
    "country": "Germany",
    "date": "2023-10-27",
    "time": "12:00"
}

req = urllib.request.Request(url, 
                             data=json.dumps(data).encode('utf-8'), 
                             headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print("Response JSON:")
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"Error: {e}")
