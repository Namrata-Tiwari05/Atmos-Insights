from fastapi import APIRouter, Depends, HTTPException, status
from app.core.logging import get_logger

# Initialize router and logger
router = APIRouter(prefix="/demo", tags=["Demo"])
logger = get_logger("demo_router")

# 1. Dependency injection demonstration
# A simple function that parses a query string or checks authentication states
def get_user_agent_checker(user_agent: str = "Unknown"):
    """
    Demo dependency: Returns parsed client metadata information
    """
    logger.info(f"Dependency Injection active for User-Agent: {user_agent}")
    return {"client_agent": user_agent}

# 2. Main demo route returning architecture readiness
@router.get("/")
def get_architecture_status():
    logger.info("Demo route triggered successfully.")
    return {
        "message": "Backend architecture ready"
    }

# 3. Dependency Injection Route
# FastAPI's Depends() injects the return value of get_user_agent_checker dynamically
@router.get("/test-dep")
def test_dependency(client_info: dict = Depends(get_user_agent_checker)):
    return {
        "status": "success",
        "injected_data": client_info
    }

# 4. Error Handling Demonstration Route
@router.get("/test-error")
def trigger_error(trigger: bool = False):
    """
    Intentionally triggers an HTTP exception for learning status codes
    """
    if trigger:
        logger.warning("Intentional error triggered by query parameter.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This is a test Bad Request (400) exception for learning."
        )
    return {
        "status": "success",
        "message": "Pass query parameter ?trigger=true to trigger the HTTPException."
    }
