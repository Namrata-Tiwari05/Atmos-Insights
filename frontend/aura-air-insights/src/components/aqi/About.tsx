import { Brain, LineChart, Wind } from "lucide-react";
import { SectionHeader } from "./PredictionModule";

const stack = ["React", "Tailwind CSS", "FastAPI", "Python", "Scikit-learn", "XGBoost", "Recharts"];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeader eyebrow="Module 07" title="About the project" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Feature
          icon={<Brain className="h-5 w-5" />}
          title="Machine Learning"
          desc="An XGBoost regressor is trained on multi-year CPCB station data to learn seasonal and pollutant interactions."
        />
        <Feature
          icon={<Wind className="h-5 w-5" />}
          title="Air Quality Index"
          desc="AQI is derived using the CPCB sub-index formula across PM2.5, PM10, NO₂, SO₂, CO and O₃."
        />
        <Feature
          icon={<LineChart className="h-5 w-5" />}
          title="Forecasting"
          desc="Time-series feature engineering delivers hourly and 7-day forecasts with confidence bands."
        />
      </div>

      <div className="mt-6 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-widest text-brand">Built with</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}