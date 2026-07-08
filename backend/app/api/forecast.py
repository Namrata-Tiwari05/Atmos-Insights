import time
import joblib
import os
import pandas as pd
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status
from app.services.weather_service import get_live_weather
from app.services.air_quality_service import get_live_pollutants
from app.services.prediction_service import predict_current_aqi, get_aqi_category_and_advisory
from app.services.forecast_service import forecast_next_24_hours
from app.ml.model_loader import model_loader
from app.core.logging import get_logger

logger = get_logger("forecast_router")

router = APIRouter(prefix="/forecast", tags=["Inference Engine"])

@router.get("/24-hour", status_code=status.HTTP_200_OK)
def get_24_hour_forecast():
    """
    Fetches live weather and pollutants, runs the current model, and recursively forecasts
    AQI for the next 24 hours using the XGBoost model.
    """
    logger.info("Incoming GET request to /api/forecast/24-hour")
    start_time = time.time()
    
    try:
        # 1. Fetch live API data
        weather_data = get_live_weather()
        pollution_data = get_live_pollutants()
        
        # 2. Get current AQI baseline
        current_pred = predict_current_aqi(pollution_data)
        current_aqi = current_pred["predicted_aqi"]
        
        # 3. Compute 24-hour forecast
        forecast_data = forecast_next_24_hours(current_aqi, weather_data)
        
        # 4. Add CPCB Categories to each hourly predicted step
        augmented_forecast = []
        for step in forecast_data["forecast"]:
            step_aqi = step["predicted_aqi"]
            category, _ = get_aqi_category_and_advisory(step_aqi)
            augmented_forecast.append({
                "hour": step["hour"],
                "predicted_aqi": step_aqi,
                "category": category
            })
            
        response = {
            "generated_at": datetime.now().isoformat(),
            "location": "Kanpur",
            "current_aqi": current_aqi,
            "forecast": augmented_forecast,
            "latency_ms": round((time.time() - start_time) * 1000.0, 2)
        }
        
        logger.info(f"Successfully processed GET /forecast/24-hour in {response['latency_ms']:.2f} ms.")
        return response
        
    except Exception as e:
        logger.error(f"Failed to generate 24-hour forecast: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecasting engine encountered an unexpected error: {str(e)}"
        )

@router.get("/7-day", status_code=status.HTTP_200_OK)
def get_7_day_forecast():
    """
    Exposes the 7-day daily forecasting model (Notebook 06) using daily pollutant values.
    """
    logger.info("Incoming GET request to /api/forecast/7-day")
    start_time = time.time()
    
    # Locate daily model paths
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    daily_model_path = os.path.join(project_root, "models", "daily", "model.pkl")
    daily_scaler_path = os.path.join(project_root, "models", "daily", "scaler.pkl")
    
    if not os.path.exists(daily_model_path):
        # Fallback to local
        daily_model_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "../../models/daily/model.pkl")
        daily_scaler_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "../../models/daily/scaler.pkl")
        
    try:
        # Load daily model & scaler from cached singleton loader
        d_model = model_loader.get_daily_model()
        d_scaler = model_loader.get_daily_scaler()
        
        # Fetch current pollution baseline
        pollution_data = get_live_pollutants()
        
        # Scale CO from ug/m3 to mg/m3
        co_mg = pollution_data["CO"] / 1000.0 if "CO" in pollution_data else pollution_data.get("co", 0.0)
        
        now = datetime.now()
        
        daily_forecast = []
        # Build 7-day projections recursively or independently by updating seasonal/temporal features
        for d in range(1, 8):
            target_date = now + timedelta(days=d)
            month = target_date.month
            day_of_week = target_date.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            
            features_dict = {
                "pm2.5": pollution_data.get("pm2_5", 0.0),
                "pm10": pollution_data.get("pm10", 0.0),
                "O3": pollution_data.get("O3", 0.0),
                "NO2": pollution_data.get("NO2", 0.0),
                "SO2": pollution_data.get("SO2", 0.0),
                "co": co_mg,
                "Month": month,
                "DayOfWeek": day_of_week,
                "IsWeekend": is_weekend,
                "season_Autumn": 0,
                "season_Monsoon": 1 if month in [6, 7, 8, 9] else 0,
                "season_Spring": 0,
                "season_Summer": 1 if month in [3, 4, 5] else 0,
                "season_Winter": 1 if month in [10, 11, 12, 1, 2] else 0
            }
            
            # Align features order
            df_in = pd.DataFrame([features_dict])[model_loader.get_current_features()]
            # Scale
            df_in[['pm2.5', 'co', 'O3', 'NO2', 'SO2']] = d_scaler.transform(df_in[['pm2.5', 'co', 'O3', 'NO2', 'SO2']])
            
            pred_val = d_model.predict(df_in)[0]
            category, _ = get_aqi_category_and_advisory(pred_val)
            
            daily_forecast.append({
                "day": d,
                "date": target_date.strftime("%Y-%m-%d"),
                "predicted_aqi": round(float(pred_val), 2),
                "category": category
            })
            
        response = {
            "generated_at": datetime.now().isoformat(),
            "location": "Kanpur",
            "forecast": daily_forecast,
            "latency_ms": round((time.time() - start_time) * 1000.0, 2)
        }
        
        logger.info(f"Successfully processed GET /forecast/7-day in {response['latency_ms']:.2f} ms.")
        return response
        
    except Exception as e:
        logger.error(f"Failed to generate 7-day forecast: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Daily forecasting engine encountered an unexpected error: {str(e)}"
        )
