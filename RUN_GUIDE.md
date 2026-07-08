# Atmos Insight — Execution & Setup Guide

This guide provides step-by-step instructions to run the **Atmos Insight** application (backend, frontend, and ML pipeline validation).

---

## Prerequisites
Ensure you have the following installed:
* **Python 3.10 or 3.11**
* **Node.js** (v18 or higher) & **npm**

---

## 1. Setup API Keys & Environment

Atmos Insight requires an **OpenWeatherMap API Key** to fetch live current weather and criteria pollutant concentrations locked to Kanpur coordinates.

1. Create a `.env` file inside the `backend/` folder:
   ```bash
   # Create a file at backend/.env
   ```
2. Add your OpenWeather API key to the file:
   ```env
   OPENWEATHER_API_KEY=your_actual_openweather_api_key_here
   ENVIRONMENT=development
   ```

---

## 2. Start the Backend Server (FastAPI)

1. Open a new terminal in the **root project directory** (`Air-Quality-AQI-Forecasting`).
2. Activate the Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux:**
     ```bash
     source .venv/bin/activate
     ```
3. Navigate into the `backend/` folder:
   ```bash
   cd backend
   ```
4. Install backend dependencies (if not already completed):
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --port 8000 --host 127.0.0.1
   ```
6. **Verify:** Open your browser and navigate to **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** to access the live Swagger API interactive documentation.

---

## 3. Start the Frontend Client (React + Vite)

1. Open a **second terminal** in the **root project directory** (`Air-Quality-AQI-Forecasting`).
2. Navigate to the frontend workspace folder:
   ```bash
   cd frontend/aura-air-insights
   ```
3. Install frontend Node modules:
   ```bash
   npm install
   ```
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
5. **Verify:** Open your browser and go to **[http://localhost:5173](http://localhost:5173)** to view the Atmos Insight real-time dashboard.

---

## 4. Troubleshooting & Heartbeats
* **Connection Error Card:** If the React UI shows "Backend Connection Offline", verify that the FastAPI server is running on port `8000` and is not blocked by active firewalls.
* **CORS Settings:** Allowed origins are pre-configured to whitelist Vite client ports `5173`, `5174`, and `5175`.
