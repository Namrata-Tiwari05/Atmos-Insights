# Air Quality Assessment & AQI Forecasting Backend

Welcome to the backend of the AQI Forecasting application.

## Getting Started

1. Set up the virtual environment:
   ```bash
   python -m venv .venv
   ```
2. Activate the virtual environment:
   * Windows:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
3. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
