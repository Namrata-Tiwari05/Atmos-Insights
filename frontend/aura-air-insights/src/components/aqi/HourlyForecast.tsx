import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";
import { SectionHeader } from "./PredictionModule";
import { getAqiInfo } from "./aqi-utils";

interface HourlyForecastProps {
  forecastData?: any;
  loading?: boolean;
}

export function HourlyForecast({ forecastData, loading }: HourlyForecastProps) {
  
  if (loading || !forecastData?.forecast) {
    return (
      <section id="hourly" className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Module 02"
          title="24 Hour AQI Forecast"
          desc="Hourly AQI predictions for the next day. Hover the chart to inspect any hour."
        />
        <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-16 rounded-2xl bg-muted/20" />
            <div className="h-16 rounded-2xl bg-muted/20" />
            <div className="h-16 rounded-2xl bg-muted/20" />
          </div>
          <div className="mt-5 h-64 rounded-2xl bg-muted/10 w-full" />
        </div>
      </section>
    );
  }

  // Resolve chart data from live API 24h forecast response
  const data = forecastData.forecast.map((f: any) => ({
    time: `${String(f.hour).padStart(2, "0")}:00`,
    aqi: f.predicted_aqi,
  }));

  const high = Math.max(...data.map((d: any) => d.aqi));
  const low = Math.min(...data.map((d: any) => d.aqi));
  const avg = Math.round(data.reduce((s: number, d: any) => s + d.aqi, 0) / data.length);

  return (
    <section id="hourly" className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="Module 02"
        title="24 Hour AQI Forecast"
        desc="Live 24-hour predictions powered by XGBoost model."
      />
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Highest AQI" value={high} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Lowest AQI" value={low} icon={<TrendingDown className="h-4 w-4" />} />
          <StatCard label="Average AQI" value={avg} icon={<Activity className="h-4 w-4" />} />
        </div>
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeOpacity={0.8} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} interval={2} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ stroke: "var(--chart-1)", strokeOpacity: 0.5, strokeWidth: 2 }}
                content={<ChartTooltip />}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="var(--chart-1)"
                strokeWidth={3}
                fill="url(#hourGrad)"
                activeDot={{ r: 6, strokeWidth: 3, stroke: "var(--card)", fill: "var(--chart-1)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const info = getAqiInfo(value);
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground">{value}</span>
          <span className="text-[11px] font-semibold" style={{ color: info.hex }}>
            {info.category}
          </span>
        </div>
      </div>
      <span
        className="grid h-10 w-10 place-items-center rounded-xl text-white"
        style={{ backgroundColor: info.hex }}
      >
        {icon}
      </span>
    </div>
  );
}