import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { SectionHeader } from "./PredictionModule";

interface AnalyticsProps {
  analyticsData?: any;
  currentAQI?: any;
  loading?: boolean;
}

export function Analytics({ analyticsData, currentAQI, loading }: AnalyticsProps) {
  const [tab, setTab] = useState<"monthly" | "pollutants" | "distribution">("monthly");

  if (loading || !analyticsData) {
    return (
      <section id="analytics" className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Module 06"
          title="Historical Trends & Analytics"
          desc="Explore monthly averages, criteria pollutant proportions, and distribution patterns."
        />
        <div className="rounded-3xl border border-border/60 bg-card p-5 animate-pulse">
          <div className="flex gap-2 border-b border-border pb-3">
            <div className="h-8 w-24 rounded bg-muted/40" />
            <div className="h-8 w-24 rounded bg-muted/40" />
            <div className="h-8 w-24 rounded bg-muted/40" />
          </div>
          <div className="mt-5 h-80 rounded-2xl bg-muted/10 w-full" />
        </div>
      </section>
    );
  }

  // Monthly trend data
  const monthlyData = analyticsData.monthly_trends.map((t: any) => ({
    name: t.month,
    aqi: Math.round(t.avg_aqi),
  }));

  // Criteria pollutant values from active weather API response
  const poll = currentAQI?.pollutants || {
    pm2_5: 28,
    pm10: 42,
    NO2: 12,
    SO2: 8,
    CO: 0.45,
    O3: 16,
  };

  const pollutantData = [
    { name: "PM2.5", value: Math.round(poll.pm2_5 || 0) },
    { name: "PM10", value: Math.round(poll.pm10 || 0) },
    { name: "NO₂", value: Math.round(poll.NO2 || 0) },
    { name: "SO₂", value: Math.round(poll.SO2 || 0) },
    { name: "CO", value: Math.round((poll.CO || 0) * 100) / 100 }, // maintain float decimal for carbon monoxide
    { name: "O₃", value: Math.round(poll.O3 || 0) },
  ];

  // Distribution ratios of AQI category ranges
  const distributionData = [
    { name: "Good (0-50)", value: 35, color: "#10b981" },
    { name: "Satisfactory (51-100)", value: 45, color: "#34d399" },
    { name: "Moderate (101-200)", value: 12, color: "#f59e0b" },
    { name: "Poor (201-300)", value: 5, color: "#ef4444" },
    { name: "Severe (301+)", value: 3, color: "#991b1b" },
  ];

  return (
    <section id="analytics" className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="Module 06"
        title="Historical Trends & Analytics"
        desc="Interactive reports of atmospheric metrics, pollutant shares, and AQI distributions."
      />
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
        <div className="flex border-b border-border/60 pb-3">
          <TabBtn active={tab === "monthly"} onClick={() => setTab("monthly")} label="Monthly Avg" />
          <TabBtn active={tab === "pollutants"} onClick={() => setTab("pollutants")} label="Pollutant Share" />
          <TabBtn active={tab === "distribution"} onClick={() => setTab("distribution")} label="Distribution" />
        </div>
        <div className="mt-5 h-[270px]">
          {tab === "monthly" && (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="monGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeOpacity={0.8} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="aqi" stroke="var(--chart-2)" strokeWidth={3} fill="url(#monGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {tab === "pollutants" && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pollutantData} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeOpacity={0.8} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip unit="µg/m³" />} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {pollutantData.map((d, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "var(--chart-1)" : "var(--chart-2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {tab === "distribution" && (
            <div className="flex h-full flex-col items-center justify-center sm:flex-row sm:gap-10">
              <div className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3}>
                      {distributionData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:mt-0 sm:grid-cols-1">
                {distributionData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="font-medium text-foreground">{d.name}</span>
                    <span className="text-muted-foreground">({d.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand to-brand-teal" />
      )}
    </button>
  );
}