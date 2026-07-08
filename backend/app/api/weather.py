from fastapi import APIRouter, status
from app.services.weather_service import get_live_weather
from app.core.logging import get_logger

router = APIRouter(prefix="/weather-test", tags=["Weather Integration"])
logger = get_logger("weather_router")

@router.get("/", status_code=status.HTTP_200_OK)
def test_live_weather():
    """
    Test Endpoint: Fetches and returns live weather variables locked to Kanpur coordinates
    """
    logger.info("Test route /weather-test triggered. Fetching Kanpur weather data.")
    return get_live_weather()
