
import urllib.request
import json
import urllib.error

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
    jsondata = json.dumps(payload)
    jsondataasbytes = jsondata.encode('utf-8')
    req.add_header('Content-Length', len(jsondataasbytes))
    
    response = urllib.request.urlopen(req, jsondataasbytes)
    data = json.load(response)
    
    print("Status Code:", response.getcode())
    print("Response Keys:", list(data.keys()))
    if "planets" in data:
        print("Planets found:", list(data["planets"].keys()))
        print("Mercury Data:", data["planets"].get("Mercury"))
    else:
        print("WARNING: 'planets' key missing in response!")
        
    if "moonPosition" in data:
        print("Moon Position:", data["moonPosition"])
    else:
        print("WARNING: 'moonPosition' key missing!")

except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
    print("Response:", e.read().decode())
except Exception as e:
    print("Error:", e)
