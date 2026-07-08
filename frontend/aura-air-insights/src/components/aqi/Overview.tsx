import { Activity, Wind, CloudFog, HeartPulse, Thermometer, Droplets, Gauge } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { getAqiInfo } from "./aqi-utils";

interface OverviewProps {
  aqi?: number;
  dominant?: string;
  currentAQI?: any;
  loading?: boolean;
}

export function Overview({ aqi = 82, dominant = "PM2.5", currentAQI, loading }: OverviewProps) {
  const info = getAqiInfo(aqi);

  // Extract live weather metrics
  const tempK = currentAQI?.weather?.temp;
  const tempC = tempK ? Math.round(tempK - 273.15) : 32;
  const humidity = currentAQI?.weather?.humidity || 60;
  const pressure = currentAQI?.weather?.pressure || 1010;
  const windSpeed = currentAQI?.weather?.wind_speed || 3.6;

  const cards = [
    {
      label: "Current AQI",
      icon: <Activity className="h-5 w-5" />,
      value: aqi,
      // Render weather data with clean inline mini-indicators
      desc: tempK ? (
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 text-emerald-500">
            <Thermometer className="h-3.5 w-3.5" /> {tempC}°C
          </span>
          <span className="inline-flex items-center gap-0.5 text-blue-400">
            <Gauge className="h-3.5 w-3.5" /> {pressure} hPa
          </span>
        </span>
      ) : (
        "Live index across all pollutants"
      ),
      accent: "from-brand/15 to-brand/0",
      tone: "text-brand",
    },
    {
      label: "AQI Category",
      icon: <Wind className="h-5 w-5" />,
      value: info.category,
      desc: "Based on CPCB classification",
      accent: "from-emerald-200/50 to-transparent",
      tone: info.text,
    },
    {
      label: "Dominant Pollutant",
      icon: <CloudFog className="h-5 w-5" />, // Meaningful smog/particle indicator
      value: dominant,
      desc: tempK ? (
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 text-teal-400">
            <Wind className="h-3.5 w-3.5" /> {windSpeed} m/s
          </span>
          <span className="inline-flex items-center gap-0.5 text-sky-400">
            <Droplets className="h-3.5 w-3.5" /> {humidity}%
          </span>
        </span>
      ) : (
        "Primary contributor to AQI"
      ),
      accent: "from-sky-200/50 to-transparent",
      tone: "text-brand-teal",
    },
    {
      label: "Health Status",
      icon: <HeartPulse className="h-5 w-5" />,
      value: aqi <= 100 ? "Safe" : aqi <= 200 ? "Caution" : "Risk",
      desc: info.advice.split(".")[0],
      accent: "from-teal-200/50 to-transparent",
      tone: info.text,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10"
          >
            <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${c.accent} blur-2xl`} />
            <div className="relative flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <span className={`grid h-9 w-9 place-items-center rounded-xl bg-muted ${c.tone}`}>
                {c.icon}
              </span>
            </div>
            <div className="relative mt-4 text-3xl font-black tracking-tight text-foreground">
              {loading ? (
                <span className="h-8 w-16 animate-pulse rounded bg-muted/65 block" />
              ) : typeof c.value === "number" ? (
                <AnimatedNumber value={c.value} />
              ) : (
                c.value
              )}
            </div>
            <div className="relative mt-1 text-xs text-muted-foreground">{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}