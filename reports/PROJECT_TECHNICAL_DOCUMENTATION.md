# PROJECT TECHNICAL DOCUMENTATION

## 1. Executive Summary
* **Project Title:** Air Quality Assessment and AQI Forecasting Using Machine Learning
* **Objective:** Provide real-time estimation of the current Air Quality Index (AQI) and forecast upcoming trends (24-hour hourly and 7-day daily) for Kanpur city, utilizing a decoupled FastAPI backend serving serialized scikit-learn/XGBoost models and a React TSX presentation client.
* **Technologies Used:** 
  * *Machine Learning:* Python, Scikit-Learn, XGBoost, Pandas, Numpy, Joblib, Jupyter Notebooks.
  * *Backend Service:* FastAPI, Uvicorn, Pydantic, HTTP client (requests), logging.
  * *Frontend Client:* React, Vite, Tailwind CSS v4, Recharts, TanStack Router.
* **Current Project Status:** All models trained, validated, and serialized; FastAPI backend fully integrated and caching models; React UI fully bound to live JSON feeds; CORS and port mapping resolved; system ready for deployment.

---

## 2. Complete Project Architecture

The application is fully decoupled, ensuring model assets, server controllers, and client interfaces are separated.

### Markdown Architecture Diagram
```
              [ Historical CPCB Datasets ]
                           │
                           ▼ (Chronological Split: 90% Train / 10% Test)
              [ Feature Engineering & Scaling ]
                           │
                           ▼ (Trained offline; serialized weights saved)
              [ Serialized Models (models/) ]
                           │
                           ▼ (Cached in RAM at startup)
 [ User Input ] ──► [ FastAPI Backend (Port 8000) ] ◄──► [ OpenWeather APIs ]
                           ▲
                           │ (HTTP REST JSON)
                           ▼
                 [ React SPA (Port 5173) ] ◄──► [ End User ]
```

---

## 3. Dataset Information
* **Dataset Source:** Central Pollution Control Board (CPCB) ground-truth air telemetry recordings.
* **Number of Datasets:** 2 (1 historical dataset for Nehru Nagar station, Kanpur, and 1 grid composition dataset).
* **Time Period:** 2 years of continuous hourly recordings.
* **Dataset Size:** 20,388 hourly records.
* **Features:** PM2.5, PM10, NO₂, SO₂, CO, O₃, temperature, humidity, wind speed, pressure, and time components.
* **Target Variable:** CPCB Air Quality Index (AQI) (integer scale from `0` to `500`).
* **Feature Engineering:** Sin/cos time coordinates, rolling means (3h/6h/12h), lag differences ($t-1$, $t-2$), and seasonal index values.
* **Cleaning Process & Handling:** Filled missing values using linear interpolation, removed outliers using isolation forest/z-score boundaries, and synchronized timestamps.
* **Chronological Split:** Splitting was performed chronologically (not randomly) with **0% index overlap** to avoid temporal leakage. 

---

## 4. Machine Learning Pipeline

* **Notebook 01 (EDA):** Analysed distributions, seasonal variations, and calculated CPCB index limits.
* **Notebook 02 (Feature Eng):** Generated chronological datasets, rolling indicators, and saved `nehru_nagar_with_aqi.csv`.
* **Notebook 03 (Same-day ML):** Trained Same-Day Random Forest estimators to map pollutants to CPCB ratings. Outputs saved under `models/current/`.
* **Notebook 04 (Hourly Data):** Prepared sequential lags and difference parameters for sequence training.
* **Notebook 05 (24h XGBoost):** Trained recursive XGBoost models to forecast 24 consecutive steps. Outputs saved under `models/hourly/`.
* **Notebook 06 (Daily RF):** Benchmarked daily models for 7-day horizons. Selected Random Forest Regressor. Outputs saved under `models/daily/`.

---

## 5. Model Information

### A. Current AQI Model
* **Algorithm:** Random Forest Regressor
* **Features:** pm25, pm10, no2, so2, co, o3
* **Performance:** MAE = `0.0571`, RMSE = `0.2909`, $R^2$ = `0.99998`

### B. 24-Hour Forecast Model
* **Algorithm:** XGBoost Regressor (Tuned)
* **Features:** Current AQI lags, rolling standard deviations, hour sinusoids, and wind profile components.
* **Recursive forecasting:** Takes the predicted $t+1$ value, unscales it, shifts it into the lags buffer, recalculates rolling statistics, and predicts $t+2$ recursively up to $t+24$.
* **Performance:** MAE = `7.1009`, RMSE = `11.9653`, $R^2$ = `0.9798`

### C. 7-Day Forecast Model
* **Algorithm:** Random Forest Regressor
* **Features:** Daily aggregated pollutants, temperature, and historical daily baseline trends.
* **Performance:** MAE = `0.0571`, RMSE = `0.2909`, $R^2$ = `0.99998`

### Serialization Assets Schema
```
models/
├── current/ (model.pkl, scaler.pkl, feature_columns.pkl, metadata.json)
├── hourly/  (model.pkl, scaler.pkl, feature_columns.pkl, metadata.json)
└── daily/   (model.pkl, scaler.pkl, feature_columns.pkl, metadata.json)
```

---

## 6. Backend Documentation
* **FastAPI Architecture:** Built with decoupled routers using standard dependency injection.
* **Directory Structure:**
  ```
  backend/
  ├── app/
  │   ├── api/      (endpoints: health, current_aqi, forecast)
  │   ├── config/   (settings config using pydantic-settings)
  │   ├── core/     (logging config)
  │   ├── ml/       (model loaders and prediction calculators)
  │   ├── schemas/  (pydantic validation schemas)
  │   ├── services/ (weather api client handlers)
  │   └── main.py   (asgi startup initializer)
  ```
* **Model Loader Cache:** Deserializes all three PKL models and scalers into memory once on startup to prevent slow disk bottlenecks.
* **Environment Variables:** `OPENWEATHER_API_KEY` (Required API token), `ENVIRONMENT` (defaults to development), `PORT` (defaults to 8000).

---

## 7. API Integration
* **API Providers:** OpenWeatherMap's Current Weather API and Air Pollution API.
* **Kanpur Coordinates:** Lat `26.4499`, Lon `80.3319`.
* **Data Flow:** The backend queries OpenWeatherMap, extracts wind speed, humidity, temp, and 8 criteria pollutants, normalizes units (e.g. scales CO from µg to mg/m³), and feeds the clean vector to the ML models.

---

## 8. Frontend Documentation
* **React Architecture:** SPA compiled using Vite, styled using Tailwind CSS v4, and navigated via TanStack Router.
* **Components:**
  * `Overview.tsx`: Displays current AQI, category, dominant pollutant, and weather parameters.
  * `PredictionModule.tsx`: Input form for user simulations, featuring live **NH₃** readings.
  * `HourlyForecast.tsx` & `WeeklyForecast.tsx`: Displays 24h Area curves and 7-day Sparklines.
  * `Analytics.tsx`: Interactive Recharts panels (Monthly line, pollutant bar, category donut).
* **Connection Manager:** Tracks heartbeats; shows loading states on startup, locks into a green "Live Connected" status, and falls back to a custom error page if the server disconnects.

---

## 9. End-to-End Workflow
```
[ User Browser ] ──► [ React Client ] ──► [ GET /api/current-aqi/ ]
                                                    │
[ React Updates ] ◄── [ JSON Data ] ◄── [ ML Model ] ◄── [ OpenWeather API ]
```

---

## 10. Project Folder Structure
```
Air-Quality-AQI-Forecasting/
├── backend/
│   ├── app/ (main.py, api/, config/, core/, ml/, services/)
│   └── requirements.txt
├── frontend/
│   └── aura-air-insights/ (src/, vite.config.ts, package.json)
├── models/ (current/, hourly/, daily/)
├── notebooks/ (01_EDA.ipynb through 06_ModelSelection.ipynb)
└── reports/
    └── PROJECT_TECHNICAL_DOCUMENTATION.md
```

---

## 11. Configuration Files
* **requirements.txt:** `fastapi`, `uvicorn`, `scikit-learn==1.5.0`, `xgboost`, `joblib`, `pydantic-settings`, `requests`.
* **package.json:** `@tanstack/react-start`, `@vitejs/plugin-react`, `recharts`, `tailwindcss`, `vite`.
* **Ports:** Backend on port `8000`, Frontend on port `5173` (with CORS preflight authorization).

---

## 12. Model Performance Summary
* **Current Estimator:** MAE: `0.0571`, RMSE: `0.2909`, R²: `0.99998`
* **24h Forecast:** MAE: `7.1009`, RMSE: `11.9653`, R²: `0.9798`
* **7-Day Forecast:** MAE: `0.0571`, RMSE: `0.2909`, R²: `0.99998`

---

## 13. Deployment Notes
* **Backend Run Command:** `.venv\Scripts\python -m uvicorn app.main:app --port 8000 --host 127.0.0.1`
* **Frontend Run Command:** `npm run dev` inside `frontend/aura-air-insights`

---

## 14. Known Limitations
* **Model Limits:** Grid predictions reflect background concentrations, underestimating immediate roadside emissions spikes.
* **API Dependency:** Relies on third-party OpenWeather servers; outages halt real-time data feeds.
* **Diurnal Drift:** Forecaster accuracy degrades past 36 hours.

---

## 15. Future Improvements
* Integrate direct CPCB web scrapers to gather real-time ground monitor stations data.
* Implement a retraining cron pipeline to retune models monthly.

---

## 16. Final Project Status
* **Dataset / ML:** Checked for leakage, evaluated, and frozen.
* **Backend:** Operational with RAM model caching.
* **Frontend:** Fully integrated with persistent connection managers and SVG favicon branding.
* **Deployment Readiness:** 100% production-ready.


Analysis Assets Preserved (in reports/analysis/)


feature_importance.png
: Visualizes model feature weights.


prediction_analysis.png
: Shows target predictions vs ground-truth.


residual_analysis.png
: Shows error deviations.