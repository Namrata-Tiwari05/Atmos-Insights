from fastapi import APIRouter, status
from app.services.air_quality_service import get_live_pollutants
from app.core.logging import get_logger

router = APIRouter(prefix="/pollution-test", tags=["Air Quality Integration"])
logger = get_logger("air_quality_router")

@router.get("/", status_code=status.HTTP_200_OK)
def test_live_pollutants():
    """
    Test Endpoint: Fetches and returns live criteria pollutant concentrations locked to Kanpur coordinates
    """
    logger.info("Test route /pollution-test triggered. Fetching Kanpur pollution data.")
    return get_live_pollutants()
