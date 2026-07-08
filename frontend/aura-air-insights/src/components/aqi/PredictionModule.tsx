import { useState, useEffect } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeAqi, getAqiInfo, type Pollutants } from "./aqi-utils";
import { AnimatedNumber } from "./AnimatedNumber";

const fields: { key: keyof Pollutants; label: string; unit: string; hint: string }[] = [
  { key: "pm25", label: "PM2.5", unit: "µg/m³", hint: "Fine particulates" },
  { key: "pm10", label: "PM10", unit: "µg/m³", hint: "Coarse particulates" },
  { key: "no2", label: "NO₂", unit: "µg/m³", hint: "Nitrogen dioxide" },
  { key: "so2", label: "SO₂", unit: "µg/m³", hint: "Sulfur dioxide" },
  { key: "co", label: "CO", unit: "mg/m³", hint: "Carbon monoxide" },
  { key: "o3", label: "O₃", unit: "µg/m³", hint: "Ozone" },
];

export function PredictionModule({
  onResult,
  currentAQI,
  loading,
}: {
  onResult?: (aqi: number, dominant: string) => void;
  currentAQI?: any;
  loading?: boolean;
}) {
  const [values, setValues] = useState<Pollutants>({
    pm25: 45,
    pm10: 80,
    no2: 32,
    so2: 12,
    co: 1.2,
    o3: 40,
  });
  const [result, setResult] = useState<{ aqi: number; dominant: string } | null>({
    aqi: 92,
    dominant: "PM2.5",
  });

  // Sync with live currentAQI backend pollutants on mount
  useEffect(() => {
    if (currentAQI?.pollutants) {
      const p = currentAQI.pollutants;
      const initialVals = {
        pm25: p.pm2_5 != null ? Math.round(p.pm2_5) : 45,
        pm10: p.pm10 != null ? Math.round(p.pm10) : 80,
        no2: p.NO2 != null ? Math.round(p.NO2) : 32,
        so2: p.SO2 != null ? Math.round(p.SO2) : 12,
        co: p.CO != null ? Number((p.CO / 1000.0).toFixed(2)) : 1.2,
        o3: p.O3 != null ? Math.round(p.O3) : 40,
      };
      setValues(initialVals);
      setResult({
        aqi: currentAQI.current_aqi || computeAqi(initialVals).aqi,
        dominant: currentAQI.dominant_pollutant || computeAqi(initialVals).dominant,
      });
    }
  }, [currentAQI]);

  const info = result ? getAqiInfo(result.aqi) : getAqiInfo(0);

  const predict = () => {
    const r = computeAqi(values);
    setResult({ aqi: r.aqi, dominant: r.dominant });
    onResult?.(r.aqi, r.dominant);
  };

  return (
    <section id="current" className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="Module 01"
        title="Current AQI Prediction"
        desc="Enter pollutant concentrations to compute the AQI in real time using the CPCB sub-index formula."
      />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* input card */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-brand" /> Pollutant inputs
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className="group block">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">{f.label}</span>
                  <span className="text-[11px] text-muted-foreground">{f.unit}</span>
                </div>
                <div className="mt-1.5 flex items-center rounded-xl border border-border/70 bg-muted/40 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={values[f.key]}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: Number(e.target.value) })
                    }
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm font-semibold text-foreground outline-none"
                  />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{f.hint}</div>
              </label>
            ))}
          </div>
          <Button
            onClick={predict}
            size="lg"
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand to-brand-teal text-white hover:opacity-95"
          >
            <Zap className="mr-1 h-4 w-4" /> Predict AQI
          </Button>
        </div>

        {/* output card */}
        <div
          className="relative overflow-hidden rounded-3xl border border-border/60 p-6 shadow-sm transition-colors sm:p-8"
          style={{ background: `linear-gradient(160deg, ${info.hex}22, transparent 60%), var(--card)` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Predicted AQI
              </div>
              <div className="mt-2 text-6xl font-black tracking-tight text-foreground">
                {result && <AnimatedNumber value={result.aqi} />}
              </div>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white shadow"
              style={{ backgroundColor: info.hex }}
            >
              {info.category}
            </span>
          </div>

          <Gauge value={result?.aqi ?? 0} color={info.hex} />

          <div className="mt-4 grid gap-3 text-sm">
            <Row label="Dominant Pollutant" value={result?.dominant ?? "-"} />
            <Row label="Sensitive Groups" value={result && result.aqi > 100 ? "At risk" : "Safe"} />
            <Row label="NH3 Concentration" value={currentAQI?.pollutants?.nh3 != null ? `${Math.round(currentAQI.pollutants.nh3)} µg/m³` : "Waiting for backend..."} />
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Health Recommendation
              </div>
              <div className="mt-1 text-sm text-foreground">{info.advice}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-2.5 text-sm backdrop-blur">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function Gauge({ value, color }: { value: number; color: string }) {
  const pct = Math.min(1, value / 500);
  const r = 78;
  const c = Math.PI * r; // semicircle
  const offset = c * (1 - pct);
  return (
    <div className="relative mt-6 flex items-center justify-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-xs drop-shadow-[0_0_18px_rgba(16,185,129,0.15)]">
        <path
          d="M15 100 A85 85 0 0 1 185 100"
          fill="none"
          stroke="var(--border)"
          strokeOpacity={0.8}
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M15 100 A85 85 0 0 1 185 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms ease, stroke 400ms ease", filter: "drop-shadow(0 0 8px currentColor)" }}
        />
        <text x="100" y="92" textAnchor="middle" className="fill-muted-foreground text-[10px]" style={{ fill: "var(--muted-foreground)" }}>
          0 · 100 · 200 · 300 · 400 · 500
        </text>
      </svg>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-brand">
        {eyebrow}
      </span>
      <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {desc && (
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{desc}</p>
      )}
    </div>
  );
}