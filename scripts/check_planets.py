
import urllib.request
import json

url = "http://localhost:8000/analyze"
payload = {
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "date": "1990-01-01",
    "time": "12:00:00",
    "temperature": "",
    "useHistoricalTemperature": False
}

try:
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json')
    jsondata = json.dumps(payload).encode('utf-8')
    req.add_header('Content-Length', len(jsondata))
    
    response = urllib.request.urlopen(req, jsondata)
    data = json.load(response)
    
    if "planets" in data:
        print("PLANETS_EXIST: YES")
        print("PLANET_KEYS:", list(data["planets"].keys()))
    else:
        print("PLANETS_EXIST: NO")

except Exception as e:
    print("Error:", e)
