import time
from datetime import datetime
from app.ml.current_aqi_model import predict_current_aqi as ml_predict_current_aqi
from app.core.logging import get_logger

logger = get_logger("prediction_service")

def get_aqi_category_and_advisory(aqi: float) -> tuple:
    if aqi <= 50:
        return "Good", "Minimal impact on health."
    elif aqi <= 100:
        return "Satisfactory", "Minor breathing discomfort to sensitive individuals."
    elif aqi <= 200:
        return "Moderate", "Breathing discomfort to people with asthma, lungs and heart diseases."
    elif aqi <= 300:
        return "Poor", "Breathing discomfort to most people on prolonged exposure."
    elif aqi <= 400:
        return "Very Poor", "Respiratory illness on prolonged exposure."
    else:
        return "Severe", "Affects healthy people and seriously impacts those with existing diseases."

def predict_current_aqi(pollutants_dict: dict) -> dict:
    """
    Receives raw live pollutants from OpenWeatherMap, converts units (CO from ug/m3 to mg/m3),
    aligns features, and performs Current AQI prediction using the Random Forest model.
    """
    logger.info("Current AQI prediction request received.")
    start_time = time.time()
    
    # 1. Feature Engineering: Map raw pollutants and convert CO unit
    # OpenWeatherMap CO is in ug/m3; training CO is in mg/m3 (divide by 1000)
    co_mg = pollutants_dict["CO"] / 1000.0 if "CO" in pollutants_dict else pollutants_dict.get("co", 0.0)
    
    now = datetime.now()
    month = now.month
    day_of_week = now.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    
    # Season mapping matching Nehru Nagar bounds
    season_monsoon = 1 if month in [6, 7, 8, 9] else 0
    season_summer = 1 if month in [3, 4, 5] else 0
    season_winter = 1 if month in [10, 11, 12, 1, 2] else 0
    season_autumn = 0  # Default fallback
    season_spring = 0  # Default fallback
    
    features_dict = {
        "pm2.5": pollutants_dict.get("pm2_5", pollutants_dict.get("pm2.5", 0.0)),
        "pm10": pollutants_dict.get("pm10", 0.0),
        "O3": pollutants_dict.get("O3", 0.0),
        "NO2": pollutants_dict.get("NO2", 0.0),
        "SO2": pollutants_dict.get("SO2", 0.0),
        "co": co_mg,
        "Month": month,
        "DayOfWeek": day_of_week,
        "IsWeekend": is_weekend,
        "season_Autumn": season_autumn,
        "season_Monsoon": season_monsoon,
        "season_Spring": season_spring,
        "season_Summer": season_summer,
        "season_Winter": season_winter
    }
    
    # Determine dominant pollutant (highest concentration relative to mean)
    # Simple heuristic for logging/advisory purposes
    pollutants_subset = {
        "PM2.5": features_dict["pm2.5"],
        "PM10": features_dict["pm10"],
        "O3": features_dict["O3"],
        "NO2": features_dict["NO2"],
        "SO2": features_dict["SO2"],
        "CO": features_dict["co"]
    }
    dominant_pollutant = max(pollutants_subset, key=pollutants_subset.get)
    
    # 2. Model Prediction
    try:
        model_output = ml_predict_current_aqi(features_dict)
    except Exception as e:
        logger.error(f"Failed to execute model prediction: {str(e)}")
        raise RuntimeError(f"Prediction wrapper execution failed: {str(e)}")
        
    predicted_aqi = model_output["predicted_aqi"]
    category, advisory = get_aqi_category_and_advisory(predicted_aqi)
    
    prediction_time_ms = (time.time() - start_time) * 1000.0
    logger.info(f"Current AQI prediction completed successfully in {prediction_time_ms:.2f} ms.")
    
    return {
        "predicted_aqi": predicted_aqi,
        "category": category,
        "dominant_pollutant": dominant_pollutant,
        "health_advisory": advisory,
        "model_used": model_output["model_name"],
        "prediction_time_ms": round(prediction_time_ms, 2)
    }
