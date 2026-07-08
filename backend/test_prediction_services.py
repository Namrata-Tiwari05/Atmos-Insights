import os
import sys
import json
import time

# Add parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.ml.model_loader import model_loader
from app.services.weather_service import get_live_weather
from app.services.air_quality_service import get_live_pollutants
from app.services.prediction_service import predict_current_aqi
from app.services.forecast_service import forecast_next_24_hours

print("=========================================================")
print("     TESTING LESSON 5: ML PREDICTION SERVICES            ")
print("=========================================================")

# 1. Initialize Loader
model_loader.initialize()

# 2. Fetch live data
print("\n[Step 1] Fetching live data for Kanpur...")
live_weather = get_live_weather()
live_pollutants = get_live_pollutants()

print("Live Weather:")
print(json.dumps(live_weather, indent=2))
print("Live Pollutants:")
print(json.dumps(live_pollutants, indent=2))

# 3. Test Current AQI Service
print("\n[Step 2] Testing predict_current_aqi() service...")
current_aqi_res = predict_current_aqi(live_pollutants)
print("Current AQI Output:")
print(json.dumps(current_aqi_res, indent=2))

# 4. Test 24-Hour Forecasting Service
print("\n[Step 3] Testing forecast_next_24_hours() service...")
current_aqi_val = current_aqi_res["predicted_aqi"]
forecast_res = forecast_next_24_hours(current_aqi_val, live_weather)
print("24-Hour Forecast Output:")
print(json.dumps(forecast_res, indent=2))

print("\nSUCCESS: All prediction services executed successfully!")
