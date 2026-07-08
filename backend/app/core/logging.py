import logging
import sys

# Define logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

def get_logger(name: str) -> logging.Logger:
    """
    Creates and returns a preconfigured logger instance.
    Directs output to standard stdout for cloud log aggregates to capture.
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Check if handlers already exist to avoid duplicate logs in reload environments
    if not logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        logger.addHandler(console_handler)
        
    return logger

# Export a default logger for core module imports
logger = get_logger("app_main")
