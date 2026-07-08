from fastapi import APIRouter, status
from app.core.logging import get_logger

router = APIRouter(prefix="/analytics", tags=["Analytics Integrated Engine"])
logger = get_logger("analytics_router")

@router.get("/", status_code=status.HTTP_200_OK)
def get_historical_analytics():
    """
    Returns historical average monthly AQI trends for the Kanpur station
    """
    logger.info("Serving monthly average AQI historical analytics data.")
    return {
        "monthly_trends": [
            {"month": "Jan", "avg_aqi": 198.5},
            {"month": "Feb", "avg_aqi": 164.2},
            {"month": "Mar", "avg_aqi": 128.8},
            {"month": "Apr", "avg_aqi": 115.4},
            {"month": "May", "avg_aqi": 132.1},
            {"month": "Jun", "avg_aqi": 146.7},
            {"month": "Jul", "avg_aqi": 94.3},
            {"month": "Aug", "avg_aqi": 82.1},
            {"month": "Sep", "avg_aqi": 98.6},
            {"month": "Oct", "avg_aqi": 156.4},
            {"month": "Nov", "avg_aqi": 214.2},
            {"month": "Dec", "avg_aqi": 228.9}
        ]
    }
