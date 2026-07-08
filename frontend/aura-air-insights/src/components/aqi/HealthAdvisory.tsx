import { AlertTriangle, Bike, Dumbbell, HeartPulse, Shield, TreePine } from "lucide-react";
import { getAqiInfo } from "./aqi-utils";
import { SectionHeader } from "./PredictionModule";

export function HealthAdvisory({ aqi = 168 }: { aqi?: number }) {
  const info = getAqiInfo(aqi);
  const items = [
    {
      icon: <HeartPulse className="h-5 w-5" />,
      label: "Health Risk",
      value: aqi <= 100 ? "Low" : aqi <= 200 ? "Moderate" : aqi <= 300 ? "High" : "Severe",
    },
    {
      icon: <TreePine className="h-5 w-5" />,
      label: "Outdoor Activity",
      value: aqi <= 100 ? "Enjoy freely" : aqi <= 200 ? "Limit prolonged" : "Avoid",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Mask",
      value: aqi <= 100 ? "Not needed" : aqi <= 300 ? "Recommended" : "N95 required",
    },
    {
      icon: <Dumbbell className="h-5 w-5" />,
      label: "Exercise",
      value: aqi <= 100 ? "All good" : aqi <= 200 ? "Indoor preferred" : "Avoid vigorous",
    },
    {
      icon: <Bike className="h-5 w-5" />,
      label: "Commuting",
      value: aqi <= 200 ? "Normal" : "Prefer indoor transit",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="Module 05"
        title="Health Advisory"
        desc="Personalised recommendations based on your predicted air quality."
      />
      <div
        className="relative overflow-hidden rounded-3xl border border-border/60 p-6 shadow-sm sm:p-8"
        style={{ background: `linear-gradient(135deg, ${info.hex}14, transparent 55%), var(--card)` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Current Advisory
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-black text-foreground">{aqi}</span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: info.hex }}
              >
                {info.category}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{info.advice}</p>
          </div>
          {aqi > 400 && (
            <div className="flex items-center gap-3 rounded-2xl border border-aqi-severe/30 bg-aqi-severe/10 px-4 py-3 text-aqi-severe">
              <AlertTriangle className="h-5 w-5" />
              <div className="text-sm font-semibold">Emergency alert · Stay indoors</div>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {items.map((it) => (
            <div
              key={it.label}
              className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-white"
                style={{ backgroundColor: info.hex }}
              >
                {it.icon}
              </span>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {it.label}
              </div>
              <div className="mt-0.5 text-sm font-bold text-foreground">{it.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}