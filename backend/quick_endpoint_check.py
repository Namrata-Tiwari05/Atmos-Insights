import sys
import os
import json

# Add parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from fastapi.testclient import TestClient
from app.main import app

print("=========================================================")
print("      MOCK HTTP CLIENT ENDPOINT CHECKS (LESSON 6)        ")
print("=========================================================")

client = TestClient(app)

# 1. Health check
print("\nTesting GET /health:")
res = client.get("/health")
print(f"Status Code: {res.status_code}")
print(json.dumps(res.json(), indent=2))

# 2. Current AQI
print("\nTesting GET /api/current-aqi/:")
res = client.get("/api/current-aqi/")
print(f"Status Code: {res.status_code}")
if res.status_code == 200:
    print(json.dumps(res.json(), indent=2))
else:
    print(f"FAILED: {res.text}")

# 3. 24-Hour Forecast
print("\nTesting GET /api/forecast/24-hour:")
res = client.get("/api/forecast/24-hour")
print(f"Status Code: {res.status_code}")
if res.status_code == 200:
    data = res.json()
    print(f"Forecast Length: {len(data['forecast'])} hours")
    print("First 3 steps:")
    print(json.dumps(data["forecast"][:3], indent=2))
else:
    print(f"FAILED: {res.text}")

# 4. 7-Day Forecast
print("\nTesting GET /api/forecast/7-day:")
res = client.get("/api/forecast/7-day")
print(f"Status Code: {res.status_code}")
if res.status_code == 200:
    data = res.json()
    print(f"Forecast Length: {len(data['forecast'])} days")
    print("Daily steps:")
    print(json.dumps(data["forecast"], indent=2))
else:
    print(f"FAILED: {res.text}")
