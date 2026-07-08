import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from app.services.weather_service import get_live_weather
from app.services.air_quality_service import get_live_pollutants
from app.services.prediction_service import predict_current_aqi
from app.core.logging import get_logger

logger = get_logger("current_aqi_router")

router = APIRouter(prefix="/current-aqi", tags=["Inference Engine"])

@router.get("/", status_code=status.HTTP_200_OK)
def get_current_aqi_endpoint():
    """
    Fetches live weather and pollutants for Kanpur, runs the Current AQI model (Random Forest),
    and returns a normalized JSON object containing predicted AQI, category, and health advisories.
    """
    logger.info("Incoming GET request to /api/current-aqi")
    start_time = time.time()
    
    try:
        # 1. Fetch live API data
        weather_data = get_live_weather()
        pollution_data = get_live_pollutants()
        
        # 2. Run prediction service (applies CO unit conversion and seasonal mapping)
        prediction = predict_current_aqi(pollution_data)
        
        # 3. Format response matching React schema requirements
        response = {
            "timestamp": datetime.now().isoformat(),
            "location": "Kanpur",
            "current_aqi": prediction["predicted_aqi"],
            "category": prediction["category"],
            "dominant_pollutant": prediction["dominant_pollutant"],
            "health_advisory": prediction["health_advisory"],
            "model_used": prediction["model_used"],
            "weather": weather_data,
            "pollutants": pollution_data,
            "latency_ms": round((time.time() - start_time) * 1000.0, 2)
        }
        
        logger.info(f"Successfully processed GET /current-aqi in {response['latency_ms']:.2f} ms.")
        return response
        
    except HTTPException as he:
        raise he
    except ValueError as ve:
        logger.error(f"Value/Feature validation failure: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Preprocessing Validation Failed: {str(ve)}"
        )
    except Exception as e:
        logger.error(f"Internal processing failure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inference execution encountered an unexpected server error."
        )
