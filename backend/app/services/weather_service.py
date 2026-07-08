import time
import requests
from fastapi import HTTPException, status
from app.config.settings import settings
from app.core.logging import get_logger

logger = get_logger("weather_service")

def get_live_weather(lat: float = settings.LATITUDE, lon: float = settings.LONGITUDE) -> dict:
    """
    Fetches current weather data from OpenWeatherMap for the specified coordinates
    and normalizes the response schema for downstream ML and frontend layers.
    """
    api_key = settings.OPENWEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    
    logger.info(f"Initiating OpenWeatherMap request for Coordinates: ({lat}, {lon})")
    start_time = time.time()
    
    try:
        response = requests.get(url, timeout=10)
        response_time = time.time() - start_time
        logger.info(f"API Response received in {response_time:.2f} seconds. Status Code: {response.status_code}")
        
        if response.status_code == 401:
            logger.error("Unauthorized: Invalid OpenWeatherMap API Key.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid weather service API key."
            )
        elif response.status_code == 429:
            logger.error("Rate Limit Exceeded on OpenWeatherMap.")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Weather service rate limit exceeded."
            )
        elif response.status_code != 200:
            logger.error(f"External API Error: Status {response.status_code}. Response: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Weather service provider returned an error."
            )
            
        data = response.json()
        
        # Parse rainfall (if rain key is present, default to 0.0)
        rain_data = data.get("rain", {})
        rainfall = rain_data.get("1h", 0.0) or rain_data.get("3h", 0.0) or 0.0
        
        # Normalize response schema
        normalized = {
            "temperature": float(data["main"]["temp"]),
            "humidity": int(data["main"]["humidity"]),
            "pressure": int(data["main"]["pressure"]),
            "wind_speed": float(data["wind"]["speed"]),
            "wind_direction": int(data["wind"].get("deg", 0)),
            "cloud_cover": int(data["clouds"]["all"]),
            "rainfall": float(rainfall),
            "visibility": int(data.get("visibility", 10000)),
            "latitude": float(data["coord"]["lat"]),
            "longitude": float(data["coord"]["lon"]),
            "timestamp": int(data.get("dt", time.time()))
        }
        
        logger.info("Weather data successfully retrieved and normalized.")
        return normalized
        
    except requests.exceptions.Timeout:
        logger.error("OpenWeatherMap request timed out.")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Request to weather service provider timed out."
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Network Connection Failure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Weather service provider is currently unreachable."
        )
