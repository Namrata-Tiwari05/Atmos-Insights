import time
import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from app.config.settings import settings
from app.ml.model_loader import model_loader
from app.ml.forecast_model import forecast_next_hour as ml_forecast_next_hour
from app.services.prediction_service import predict_current_aqi
from app.core.logging import get_logger

logger = get_logger("forecast_service")

class HistoryManager:
    """
    Manages the historical hourly AQI values, providing helpers to compute lag,
    diff, and rolling features in real-time.
    """
    def __init__(self):
        self.aqi_history = []

    def initialize_history(self, current_aqi: float):
        """
        Initializes the past 24 hours of AQI values using live pollution history
        if available, falling back to a flat array of current AQI if the API fails.
        """
        logger.info("Initializing historical AQI series...")
        lat = settings.LATITUDE
        lon = settings.LONGITUDE
        api_key = settings.OPENWEATHER_API_KEY
        
        end_ts = int(time.time())
        start_ts = end_ts - 24 * 3600
        
        history_url = f"http://api.openweathermap.org/data/2.5/air_pollution/history?lat={lat}&lon={lon}&start={start_ts}&end={end_ts}&appid={api_key}"
        
        try:
            res = requests.get(history_url, timeout=5)
            if res.status_code == 200:
                list_data = res.json().get("list", [])
                if len(list_data) >= 24:
                    logger.info(f"Retrieved {len(list_data)} historical readings from API.")
                    # Process pollutants for each historical step and predict its AQI
                    temp_history = []
                    for item in list_data[-24:]:
                        comps = item["components"]
                        pollutants = {
                            "PM2.5": comps.get("pm2_5", 0.0),
                            "PM10": comps.get("pm10", 0.0),
                            "O3": comps.get("o3", 0.0),
                            "NO2": comps.get("no2", 0.0),
                            "SO2": comps.get("so2", 0.0),
                            "CO": comps.get("co", 0.0)
                        }
                        res_aqi = predict_current_aqi(pollutants)["predicted_aqi"]
                        temp_history.append(res_aqi)
                    self.aqi_history = temp_history
                    logger.info("SUCCESS: History initialized from live OpenWeather history records.")
                    return
        except Exception as e:
            logger.warn(f"Failed to fetch live API history: {str(e)}. Using fallback initialization.")
            
        # Fallback initialization
        logger.info("Initializing fallback historical series with current AQI.")
        self.aqi_history = [current_aqi] * 24

    def update_history(self, next_aqi: float):
        """
        Appends the newly predicted AQI and shifts out the oldest.
        """
        self.aqi_history.append(next_aqi)
        if len(self.aqi_history) > 24:
            self.aqi_history.pop(0)

    def get_features(self) -> dict:
        """
        Calculates all lag, diff, and rolling stats from the current 24-hour history.
        """
        history = self.aqi_history
        series = pd.Series(history)
        
        # Helper dictionary
        features = {}
        
        # Lags
        features["aqi_lag_1"] = history[-1]
        features["aqi_lag_2"] = history[-2]
        features["aqi_lag_24"] = history[0]
        
        # Diff and Pct Change
        features["aqi_diff"] = history[-1] - history[-2]
        features["aqi_pct_change"] = (history[-1] - history[-2]) / (history[-2] + 1e-5)
        
        # Rolling windows: 3, 6, 12, 24
        for w in [3, 6, 12, 24]:
            win = series.iloc[-w:]
            features[f"aqi_roll_mean_{w}"] = win.mean()
            features[f"aqi_roll_std_{w}"] = win.std() if len(win) > 1 else 0.0
            features[f"aqi_roll_min_{w}"] = win.min()
            features[f"aqi_roll_max_{w}"] = win.max()
            
        # Standardize NaNs to 0.0
        for k in features:
            if pd.isna(features[k]):
                features[k] = 0.0
                
        return features

# Global instance of history manager
history_manager = HistoryManager()

def forecast_next_24_hours(current_aqi: float, live_weather: dict) -> dict:
    """
    Executes a 24-step recursive forecast using the XGBoost hourly model.
    """
    logger.info("Starting 24-hour recursive forecasting...")
    start_time = time.time()
    
    # Initialize history manager
    history_manager.initialize_history(current_aqi)
    
    forecast_results = []
    current_time = datetime.now()
    
    # Extract baseline weather variables
    temp = live_weather.get("temperature", 25.0)
    humidity = live_weather.get("humidity", 60.0)
    pressure = live_weather.get("pressure", 1010.0)
    wind_speed = live_weather.get("wind_speed", 5.0)
    clouds = live_weather.get("cloud_cover", 50.0)
    rainfall = live_weather.get("rainfall", 0.0)
    visibility = live_weather.get("visibility", 10000.0)
    
    # Pre-calculate baseline values
    dew_point = temp - ((100 - humidity) / 5)
    apparent_temp = temp + 0.33 * (humidity / 100.0) - 0.7 * wind_speed - 4.0
    
    for h in range(1, 25):
        hour_time = current_time + timedelta(hours=h)
        hour_val = hour_time.hour
        month_val = hour_time.month
        
        # Build hourly features dictionary
        payload = {
            "temperature_2m (C)": temp,
            "relative_humidity_2m (%)": humidity,
            "dew_point_2m (C)": dew_point,
            "apparent_temperature (C)": apparent_temp,
            "precipitation (mm)": rainfall,
            "rain (mm)": rainfall,
            "snowfall (cm)": 0.0,
            "snow_depth (m)": 0.0,
            "wind_speed_10m (km/h)": wind_speed,
            "AQI": history_manager.aqi_history[-1],
            "Hour": hour_val,
            "DayOfWeek": hour_time.weekday(),
            "Month": month_val,
            "season_Autumn": 0,
            "season_Monsoon": 1 if month_val in [6, 7, 8, 9] else 0,
            "season_Spring": 0,
            "season_Summer": 1 if month_val in [3, 4, 5] else 0,
            "season_Winter": 1 if month_val in [10, 11, 12, 1, 2] else 0,
            "Hour_sin": np.sin(2 * np.pi * hour_val / 24.0),
            "Hour_cos": np.cos(2 * np.pi * hour_val / 24.0),
            "Month_sin": np.sin(2 * np.pi * month_val / 12.0),
            "Month_cos": np.cos(2 * np.pi * month_val / 12.0)
        }
        
        # Append history statistics
        hist_feats = history_manager.get_features()
        payload.update(hist_feats)
        
        # Rename features if necessary to match feature names in scaler exactly
        # The training feature names for temperature had degree symbol which unpickled as 'C'
        # Let's inspect features order from scaler to align key names
        req_features = model_loader.get_hourly_features()
        renamed_payload = {}
        for feat in req_features:
            # Map parameters by prefix matching to prevent unicode mismatch errors
            if "temperature_2m" in feat:
                renamed_payload[feat] = payload["temperature_2m (C)"]
            elif "relative_humidity_2m" in feat:
                renamed_payload[feat] = payload["relative_humidity_2m (%)"]
            elif "dew_point_2m" in feat:
                renamed_payload[feat] = payload["dew_point_2m (C)"]
            elif "apparent_temperature" in feat:
                renamed_payload[feat] = payload["apparent_temperature (C)"]
            elif "wind_speed_10m" in feat:
                renamed_payload[feat] = payload["wind_speed_10m (km/h)"]
            else:
                renamed_payload[feat] = payload.get(feat, 0.0)
                
        # Predict single step
        next_aqi = ml_forecast_next_hour(renamed_payload)
        
        # Append step results
        forecast_results.append({
            "hour": h,
            "predicted_aqi": round(float(next_aqi), 2)
        })
        
        # Update history with predicted value for next iteration
        history_manager.update_history(next_aqi)
        
    duration = time.time() - start_time
    logger.info(f"Recursive forecast finished successfully in {duration:.4f} seconds.")
    
    return {
        "forecast": forecast_results
    }
