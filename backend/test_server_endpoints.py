import subprocess
import time
import requests
import sys

print("=========================================================")
print("     TESTING LESSON 6: FASTAPI ENDPOINTS & STARTUP       ")
print("=========================================================")

# 1. Start the server as a background subprocess
server_process = subprocess.Popen(
    [".venv/Scripts/python", "-m", "uvicorn", "app.main:app", "--port", "8000", "--host", "127.0.0.1"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

print("Starting Uvicorn server...")
# Wait for startup
time.sleep(5)

# Verify health check
try:
    res = requests.get("http://127.0.0.1:8000/health")
    print(f"Health Check: Status={res.status_code}, Body={res.json()}")
except Exception as e:
    print(f"FAILED to contact health check: {e}")
    server_process.terminate()
    sys.exit(1)

# Verify Current AQI
try:
    res = requests.get("http://127.0.0.1:8000/api/current-aqi/")
    print(f"GET /api/current-aqi: Status={res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"  Predicted AQI       : {data['current_aqi']}")
        print(f"  Category            : {data['category']}")
        print(f"  Dominant Pollutant  : {data['dominant_pollutant']}")
        print(f"  Dominant Weather Temp: {data['weather']['temperature']} C")
except Exception as e:
    print(f"FAILED /api/current-aqi: {e}")

# Verify 24-Hour Forecast
try:
    res = requests.get("http://127.0.0.1:8000/api/forecast/24-hour")
    print(f"GET /api/forecast/24-hour: Status={res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"  Forecast Length     : {len(data['forecast'])} hours")
        print(f"  First hour AQI      : {data['forecast'][0]['predicted_aqi']} ({data['forecast'][0]['category']})")
except Exception as e:
    print(f"FAILED /api/forecast/24-hour: {e}")

# Verify 7-Day Forecast
try:
    res = requests.get("http://127.0.0.1:8000/api/forecast/7-day")
    print(f"GET /api/forecast/7-day: Status={res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"  Daily Forecast Length: {len(data['forecast'])} days")
        print(f"  Day 1 Date & AQI     : {data['forecast'][0]['date']} -> {data['forecast'][0]['predicted_aqi']}")
except Exception as e:
    print(f"FAILED /api/forecast/7-day: {e}")

# Terminate process
server_process.terminate()
print("\nUvicorn server shut down.")
print("=========================================================")
