import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Cloud, CloudRain, CloudSun, Sun, CloudFog } from "lucide-react";
import { SectionHeader } from "./PredictionModule";
import { getAqiInfo } from "./aqi-utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper to resolve meaningful weather icon based on predicted AQI category
function getCategoryIcon(categoryName: string) {
  switch (categoryName) {
    case "Good":
      return Sun;
    case "Satisfactory":
      return CloudSun;
    case "Moderate":
      return Cloud;
    case "Poor":
      return CloudFog;
    case "Very Poor":
    case "Severe":
      return CloudRain;
    default:
      return CloudSun;
  }
}

interface WeeklyForecastProps {
  forecastData?: any;
  loading?: boolean;
}

export function WeeklyForecast({ forecastData, loading }: WeeklyForecastProps) {
  
  if (loading || !forecastData?.forecast) {
    return (
      <section id="weekly" className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Module 03"
          title="7 Day AQI Forecast"
          desc="A week-ahead outlook powered by our daily Random Forest model."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-40 rounded-3xl border border-border/60 bg-muted/10 animate-pulse flex flex-col justify-between p-4">
              <div className="flex justify-between items-center">
                <span className="h-3 w-8 rounded bg-muted/40" />
                <span className="h-5 w-5 rounded-full bg-muted/40" />
              </div>
              <span className="h-8 w-12 rounded bg-muted/40 mt-3" />
              <span className="h-4 w-16 rounded-full bg-muted/40 mt-1" />
              <div className="h-10 w-full bg-muted/20 rounded mt-3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Resolve weekly forecast data from 7-day model response
  const week = forecastData.forecast.map((f: any) => {
    const dayLabel = f.date
      ? new Date(f.date).toLocaleDateString("en-US", { weekday: "short" })
      : `Day ${f.day}`;
    const aqi = f.predicted_aqi;
    const trend = Array.from({ length: 8 }, (_, j) => ({
      v: aqi + Math.round(Math.sin(j + f.day) * 5),
    }));
    return {
      day: dayLabel,
      aqi: Math.abs(Math.round(aqi)),
      Icon: getCategoryIcon(f.category || "Good"),
      trend,
    };
  });

  return (
    <section id="weekly" className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="Module 03"
        title="7 Day AQI Forecast"
        desc="Live week-ahead outlook powered by the daily Random Forest model."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {week.map((item: { day: string; aqi: number; Icon: any; trend: any[] }) => {
          const { day, aqi, Icon, trend } = item;
          const info = getAqiInfo(aqi);
          return (
            <div
              key={day}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {day}
                </span>
                <Icon className="h-5 w-5 text-brand-teal animate-pulse-subtle" strokeWidth={2.2} />
              </div>
              <div className="mt-3 text-3xl font-black text-foreground">{aqi}</div>
              <div
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: info.hex }}
              >
                {info.category}
              </div>
              <div className="mt-3 h-10">
                <ResponsiveContainer width="100%" height={40}>
                  <LineChart data={trend}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={info.hex}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}