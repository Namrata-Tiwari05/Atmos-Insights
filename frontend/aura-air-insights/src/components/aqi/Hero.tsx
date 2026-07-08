import { ArrowRight, Play, Wind, CloudFog, Atom, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  currentAQI?: any;
}

export function Hero({ currentAQI }: HeroProps) {
  return (
    <section id="home" className="relative overflow-hidden font-sans">
      <div className="mesh-bg absolute inset-0 -z-10" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-24">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/40 bg-card/45 px-4 py-1.5 text-xs font-medium text-muted-foreground/80 backdrop-blur">
            <span className="text-brand opacity-90">🌍</span>
            Real-Time Air Quality Monitoring • ML Forecasting
          </div>
          <h1 
            className="mt-6 text-foreground tracking-tight"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(2.25rem, 5.5vw, 4rem)",
              lineHeight: "0.95",
              letterSpacing: "-0.04em",
              fontWeight: 800,
            }}
          >
            Real-Time Air Quality <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Monitoring & Forecasting</span>.
          </h1>
          <p className="mt-6 max-w-[62ch] text-[16px] lg:text-[18px] leading-[1.7] text-muted-foreground font-normal">
            Monitor live air quality conditions and explore predictive trends on a clean, unified dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 font-semibold text-sm">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-brand to-brand-teal text-white hover:opacity-95 font-semibold">
              <a href="#current">
                Explore Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-border/70 bg-card/70 backdrop-blur font-semibold">
              <a href="#hourly">
                <Play className="mr-1 h-4 w-4" /> View Forecasts
              </a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-xs text-muted-foreground font-medium">
            <div><span className="mr-1 font-bold text-foreground">✓</span> Live Air Monitoring</div>
            <div><span className="mr-1 font-bold text-foreground">✓</span> 6 Key Pollutants</div>
            <div><span className="mr-1 font-bold text-foreground">✓</span> 24-Hour & 7-Day Forecasts</div>
          </div>
        </div>

        <HeroVisual currentAQI={currentAQI} />
      </div>
    </section>
  );
}

function HeroVisual({ currentAQI }: HeroProps) {
  const pm25 = currentAQI?.pollutants?.pm2_5 != null ? Math.round(currentAQI.pollutants.pm2_5) : 24;
  const no2 = currentAQI?.pollutants?.NO2 != null ? Math.round(currentAQI.pollutants.NO2) : 18;
  const aqi = currentAQI?.current_aqi != null ? Math.round(currentAQI.current_aqi) : 62;

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="glass-card relative overflow-hidden rounded-[2rem] p-6 bg-card border border-border/60 shadow-lg">
        {/* skyline */}
        <div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-b from-brand-sky/25 via-card to-brand/10 dark:from-brand-sky/15 dark:via-card dark:to-brand/15">
          <div className="absolute inset-x-0 top-4 flex items-center justify-between px-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span>Kanpur Monitoring Station</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Online
            </span>
          </div>
          <SmartCitySVG />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat icon={<CloudFog className="h-4 w-4" />} label="PM2.5" value={String(pm25)} unit="µg" tone="text-brand" />
          <MiniStat icon={<Atom className="h-4 w-4" />} label="NO₂" value={String(no2)} unit="ppb" tone="text-brand-teal" />
          <MiniStat icon={<Gauge className="h-4 w-4" />} label="AQI" value={String(aqi)} unit="idx" tone="text-brand-sky" />
        </div>
      </div>
      <div className="absolute -right-4 -top-4 hidden rotate-3 rounded-2xl border border-border/60 bg-card/80 px-3 py-2 text-xs shadow-lg backdrop-blur sm:block">
        <div className="flex items-center gap-2">
          <Wind className="h-3.5 w-3.5 text-brand" />
          <span className="font-semibold">🟢 Live Station</span>
          <span className="text-emerald-500">Online</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 hidden -rotate-2 rounded-2xl border border-border/60 bg-card/80 px-3 py-2 text-xs shadow-lg backdrop-blur sm:block">
        <div className="font-semibold text-foreground">Forecast Engine</div>
        <div className="text-muted-foreground">24-Hour + 7-Day Predictions</div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, unit, tone }: { icon: React.ReactNode; label: string; value: string; unit: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 px-3 py-2.5 backdrop-blur">
      <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${tone}`}>
        {icon} {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-bold text-foreground">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function SmartCitySVG() {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-x-0 bottom-0 h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="b1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="b2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* sun */}
      <circle cx="320" cy="55" r="26" fill="#fde68a" opacity="0.9" />
      <circle cx="320" cy="55" r="40" fill="#fde68a" opacity="0.25" />
      {/* clouds */}
      <g fill="currentColor" className="text-white/85 dark:text-white/25">
        <ellipse cx="80" cy="45" rx="34" ry="10" />
        <ellipse cx="110" cy="52" rx="22" ry="8" />
        <ellipse cx="250" cy="30" rx="26" ry="8" />
      </g>
      {/* buildings */}
      <g>
        <rect x="30" y="110" width="42" height="110" rx="4" fill="url(#b2)" />
        <rect x="82" y="80" width="52" height="140" rx="4" fill="url(#b1)" />
        <rect x="144" y="120" width="36" height="100" rx="4" fill="url(#b2)" />
        <rect x="190" y="95" width="60" height="125" rx="4" fill="url(#b1)" />
        <rect x="260" y="130" width="34" height="90" rx="4" fill="url(#b2)" />
        <rect x="302" y="100" width="48" height="120" rx="4" fill="url(#b1)" />
        <rect x="358" y="140" width="30" height="80" rx="4" fill="url(#b2)" />
      </g>
      {/* windows */}
      <g fill="currentColor" className="text-white/55 dark:text-white/70">
        {Array.from({ length: 10 }).map((_, r) =>
          Array.from({ length: 3 }).map((_, c) => (
            <rect key={`${r}-${c}`} x={90 + c * 14} y={92 + r * 12} width="6" height="6" rx="1" />
          )),
        )}
        {Array.from({ length: 9 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <rect key={`w-${r}-${c}`} x={198 + c * 13} y={108 + r * 12} width="6" height="6" rx="1" />
          )),
        )}
      </g>
      {/* monitoring tower */}
      <g>
        <rect x="220" y="60" width="4" height="60" fill="currentColor" className="text-slate-900 dark:text-slate-200" />
        <circle cx="222" cy="58" r="6" fill="#10b981" />
        <circle cx="222" cy="58" r="12" fill="#10b981" opacity="0.25" />
      </g>
      {/* trees */}
      <g>
        <circle cx="15" cy="200" r="14" fill="#34d399" />
        <circle cx="395" cy="205" r="10" fill="#34d399" />
      </g>
      {/* ground */}
      <rect x="0" y="215" width="400" height="5" fill="currentColor" className="text-border" />
    </svg>
  );
}