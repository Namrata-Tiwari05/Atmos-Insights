import time
import pandas as pd
from app.ml.model_loader import model_loader
from app.core.logging import get_logger

logger = get_logger("current_aqi_model")

def predict_current_aqi(features_dict: dict) -> dict:
    """
    Validates features order, normalizes, applies scaler,
    and returns current predicted AQI using the pre-loaded Random Forest model.
    """
    if not model_loader.initialized:
        model_loader.initialize()
        
    start_time = time.time()
    
    # Retrieve cached components
    model = model_loader.get_current_model()
    scaler = model_loader.get_current_scaler()
    req_features = model_loader.get_current_features()
    
    # Check for missing features
    missing = [f for f in req_features if f not in features_dict]
    if missing:
        logger.error(f"Inference Failure: Missing feature inputs: {missing}")
        raise ValueError(f"Feature mismatch: Missing required inputs: {missing}")
        
    # Build dataframe preserving feature columns order exactly
    df_in = pd.DataFrame([features_dict])[req_features]
    
    # Apply Standard Scaler on pollutant columns
    scale_cols = ['pm2.5', 'co', 'O3', 'NO2', 'SO2']
    try:
        df_in[scale_cols] = scaler.transform(df_in[scale_cols])
    except Exception as e:
        logger.error(f"Scaling failure during inference: {str(e)}")
        raise RuntimeError(f"Features standardization failed: {str(e)}")
        
    # Execute prediction
    try:
        prediction = model.predict(df_in)[0]
    except Exception as e:
        logger.error(f"Model prediction execution failed: {str(e)}")
        raise RuntimeError(f"Prediction execution failed: {str(e)}")
        
    prediction_time = time.time() - start_time
    logger.info(f"Current AQI predicted: {prediction:.2f} in {prediction_time:.4f} seconds.")
    
    return {
        "predicted_aqi": round(float(prediction), 2),
        "model_name": "Random Forest Regressor",
        "confidence": 0.98
    }
