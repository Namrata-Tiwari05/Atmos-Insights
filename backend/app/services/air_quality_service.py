import time
import requests
from fastapi import HTTPException, status
from app.config.settings import settings
from app.core.logging import get_logger

logger = get_logger("air_quality_service")

def get_live_pollutants(lat: float = settings.LATITUDE, lon: float = settings.LONGITUDE) -> dict:
    """
    Fetches live pollutant concentrations from OpenWeatherMap Air Pollution API
    for the specified coordinates and normalizes the response.
    """
    api_key = settings.OPENWEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"
    
    logger.info(f"Initiating OpenWeatherMap Air Pollution request for Coordinates: ({lat}, {lon})")
    start_time = time.time()
    
    try:
        response = requests.get(url, timeout=10)
        response_time = time.time() - start_time
        logger.info(f"API Response received in {response_time:.2f} seconds. Status Code: {response.status_code}")
        
        if response.status_code == 401:
            logger.error("Unauthorized: Invalid OpenWeatherMap API Key.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid air quality service API key."
            )
        elif response.status_code == 429:
            logger.error("Rate Limit Exceeded on OpenWeatherMap.")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Air quality service rate limit exceeded."
            )
        elif response.status_code != 200:
            logger.error(f"External API Error: Status {response.status_code}. Response: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Air quality service provider returned an error."
            )
            
        data = response.json()
        
        # Check if list is empty
        if not data.get("list"):
            logger.error("Air Pollution API returned an empty list.")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Provider returned empty pollutant dataset."
            )
            
        raw_pollutants = data["list"][0]
        components = raw_pollutants["components"]
        
        # Normalize response schema
        normalized = {
            "pm2_5": float(components["pm2_5"]),
            "pm10": float(components["pm10"]),
            "NO2": float(components["no2"]),
            "SO2": float(components["so2"]),
            "CO": float(components["co"]),
            "O3": float(components["o3"]),
            "provider_aqi": int(raw_pollutants["main"]["aqi"]),
            "timestamp": int(raw_pollutants.get("dt", time.time()))
        }
        
        logger.info("Air quality data successfully retrieved and normalized.")
        return normalized
        
    except requests.exceptions.Timeout:
        logger.error("OpenWeatherMap Air Pollution request timed out.")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Request to air quality service provider timed out."
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Network Connection Failure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Air quality service provider is currently unreachable."
        )
