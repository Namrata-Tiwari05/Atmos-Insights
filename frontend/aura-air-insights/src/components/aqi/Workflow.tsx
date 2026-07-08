import { Brain, CalendarRange, Clock, HeartPulse, Keyboard, Sigma } from "lucide-react";
import { SectionHeader } from "./PredictionModule";

const steps = [
  { icon: <Keyboard className="h-5 w-5" />, title: "Input", desc: "User enters pollutant values" },
  { icon: <Sigma className="h-5 w-5" />, title: "CPCB Formula", desc: "Current AQI calculated" },
  { icon: <Brain className="h-5 w-5" />, title: "ML Model", desc: "XGBoost forecasting engine" },
  { icon: <Clock className="h-5 w-5" />, title: "24h Prediction", desc: "Hourly outlook generated" },
  { icon: <CalendarRange className="h-5 w-5" />, title: "7-Day Forecast", desc: "Weekly trajectory" },
  { icon: <HeartPulse className="h-5 w-5" />, title: "Advisory", desc: "Personalised recommendation" },
];

export function Workflow() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="Module 06"
        title="How it works"
        desc="From raw pollutant readings to a personalised health recommendation in six steps."
      />
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:left-0 md:right-0 md:top-9 md:h-px md:w-full md:bg-gradient-to-r md:from-transparent md:via-border md:to-transparent" />
          <ol className="relative grid gap-6 md:grid-cols-6">
            {steps.map((s, i) => (
              <li key={s.title} className="relative pl-16 md:pl-0">
                <div className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-2xl border border-border/60 bg-card text-brand shadow-sm md:relative md:mx-auto">
                  {s.icon}
                </div>
                <div className="mt-0 md:mt-4 md:text-center">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-brand">
                    Step {i + 1}
                  </div>
                  <div className="mt-1 text-sm font-bold text-foreground">{s.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}