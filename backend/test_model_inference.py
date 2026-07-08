import sys
import os

# Add parent directory to sys.path to resolve 'app' imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.ml.model_loader import model_loader
from app.ml.current_aqi_model import predict_current_aqi
from app.ml.forecast_model import forecast_next_hour

# 1. Initialize loader
print("--- Loading Models ---")
model_loader.initialize()

# 2. Test current AQI model with dummy inputs
print("\n--- Testing Current AQI Model ---")
dummy_current = {
    "pm2.5": 85.0,
    "pm10": 120.0,
    "O3": 45.0,
    "NO2": 32.0,
    "SO2": 12.0,
    "co": 1.2,
    "Month": 7,
    "DayOfWeek": 1,
    "IsWeekend": 0,
    "season_Autumn": 0,
    "season_Monsoon": 1,
    "season_Spring": 0,
    "season_Summer": 0,
    "season_Winter": 0
}

try:
    current_res = predict_current_aqi(dummy_current)
    print("Success! Current AQI Output:", current_res)
except Exception as e:
    print("Error during Current AQI Test:", str(e))

# 3. Test Hourly Forecasting model with dummy inputs
print("\n--- Testing Hourly Forecasting Model ---")
# Get features required by hourly model
req_hourly_features = model_loader.get_hourly_features()
print(f"Hourly Model Required Features: {req_hourly_features}")

# Construct dummy dict with 0.0 values for all required features
dummy_hourly = {f: 0.0 for f in req_hourly_features}
# Put some sensible test values
if "AQI" in dummy_hourly:
    dummy_hourly["AQI"] = 150.0

try:
    forecast_res = forecast_next_hour(dummy_hourly)
    print("Success! Next Hour Forecast Output:", forecast_res)
except Exception as e:
    print("Error during Hourly Forecast Test:", str(e))
