import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/aqi/Navbar";
import { Hero } from "@/components/aqi/Hero";
import { Overview } from "@/components/aqi/Overview";
import { PredictionModule } from "@/components/aqi/PredictionModule";
import { HourlyForecast } from "@/components/aqi/HourlyForecast";
import { WeeklyForecast } from "@/components/aqi/WeeklyForecast";
import { Analytics } from "@/components/aqi/Analytics";
import { HealthAdvisory } from "@/components/aqi/HealthAdvisory";
import { Workflow } from "@/components/aqi/Workflow";
import { About } from "@/components/aqi/About";
import { Footer } from "@/components/aqi/Footer";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

const API_BASE = import.meta.env.VITE_API_URL;

function Index() {
  const [current, setCurrent] = useState<{ aqi: number; dominant: string } | null>(null);
  const [currentAQI, setCurrentAQI] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any>(null);
  const [dailyForecast, setDailyForecast] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  const loadData = async () => {
    try {
      // Fetch all endpoints in parallel
      const [resCurrent, resHourly, resDaily, resAnalytics] = await Promise.all([
        fetch(`${API_BASE}/api/current-aqi/`).then((r) => {
          if (!r.ok) throw new Error("Current AQI failed");
          return r.json();
        }),
        fetch(`${API_BASE}/api/forecast/24-hour`).then((r) => {
          if (!r.ok) throw new Error("Hourly Forecast failed");
          return r.json();
        }),
        fetch(`${API_BASE}/api/forecast/7-day`).then((r) => {
          if (!r.ok) throw new Error("7-day Forecast failed");
          return r.json();
        }),
        fetch(`${API_BASE}/api/analytics/`).then((r) => {
          if (!r.ok) throw new Error("Analytics failed");
          return r.json();
        }),
      ]);

      setCurrentAQI(resCurrent);
      setHourlyForecast(resHourly);
      setDailyForecast(resDaily);
      setAnalyticsData(resAnalytics);
      
      setHasConnectedOnce(true);
      setIsBackendOffline(false);
      setInitialLoading(false);
      setFailureCount(0); // reset failures

      if (resCurrent?.current_aqi) {
        setCurrent({
          aqi: resCurrent.current_aqi,
          dominant: resCurrent.dominant_pollutant || "PM2.5",
        });
      }
    } catch (err) {
      console.warn("Backend connection heartbeat warning:", err);
      const nextFailCount = failureCount + 1;
      setFailureCount(nextFailCount);
      
      // Strict offline policy: trigger error screen immediately if connection fails
      setIsBackendOffline(true);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Heartbeat refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in font-sans flex flex-col">
      <Navbar />

      {isBackendOffline ? (
        <div className="mx-auto max-w-4xl px-4 py-20 text-center flex-1 flex flex-col justify-center">
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 md:p-12 backdrop-blur shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Backend Connection Offline
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Failed to connect to the live FastAPI backend server at <code className="rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground">{API_BASE}</code>.
              Please ensure your backend server is active and accessible.
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={() => { setInitialLoading(true); setIsBackendOffline(false); loadData(); }} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
                <RefreshCw className="h-4 w-4" /> Retry Connection
              </Button>
            </div>
          </div>
        </div>
      ) : initialLoading ? (
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">Connecting to live FastAPI backend and validating ML models...</p>
        </div>
      ) : (
        <main className="space-y-20 pb-20 sm:space-y-24 flex-1">
          <Hero currentAQI={currentAQI} />
          {current && (
            <Overview 
              aqi={current.aqi} 
              dominant={current.dominant} 
              currentAQI={currentAQI}
              loading={initialLoading && !currentAQI} 
            />
          )}
          <PredictionModule 
            currentAQI={currentAQI}
            loading={initialLoading && !currentAQI}
            onResult={(aqi, dominant) => setCurrent({ aqi, dominant })} 
          />
          <HourlyForecast 
            forecastData={hourlyForecast}
            loading={initialLoading && !hourlyForecast}
          />
          <WeeklyForecast 
            forecastData={dailyForecast}
            loading={initialLoading && !dailyForecast}
          />
          <Analytics 
            analyticsData={analyticsData}
            currentAQI={currentAQI}
            loading={initialLoading && !analyticsData}
          />
          {current && <HealthAdvisory aqi={current.aqi} />}
          <Workflow />
          <About />
        </main>
      )}
      <Footer />
    </div>
  );
}
