import { ArrowRight, Play, Wind, CloudFog, Atom, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  currentAQI?: any;
}

export function Hero({ currentAQI }: HeroProps) {
  return (
    <section id="home" className="relative overflow-hidden font-sans pt-12 pb-16">
      <div className="mesh-bg absolute inset-0 -z-10" />
      
      {/* Top Header Block: Heading left, Description & CTAs right (inspired by premium SaaS layout) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-end pb-12">
        <div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/40 bg-card/45 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 backdrop-blur">
            <span className="text-brand opacity-90">🌍</span>
            Real-Time Air Quality Monitoring • ML Forecasting
          </div>
          <h1 
            className="mt-6 text-foreground tracking-tight text-left"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(2.5rem, 5.8vw, 4.25rem)",
              lineHeight: "0.92",
              letterSpacing: "-0.04em",
              fontWeight: 900,
              textTransform: "uppercase"
            }}
          >
            Real-Time Air Quality <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Monitoring & Forecasting.</span>
          </h1>
        </div>
        
        <div className="flex flex-col lg:items-start gap-5">
          <p className="max-w-[50ch] text-[16px] lg:text-[17px] leading-[1.65] text-muted-foreground font-normal text-left">
            Monitor live air quality conditions and explore predictive trends on a clean, unified dashboard.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-brand to-brand-teal text-white hover:opacity-95 font-semibold px-6 py-5">
              <a href="#current">
                Explore Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-border/70 bg-card/70 backdrop-blur font-semibold px-6 py-5">
              <a href="#hourly">
                <Play className="mr-1.5 h-4 w-4" /> View Forecasts
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Middle Block: Full Width Showpiece Card (Kanpur Station Visual Window) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <HeroVisual currentAQI={currentAQI} />
      </div>

      {/* Bottom Block: Horizontal Stats Row (TRUSTmed inspired dark panels layout) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatBarItem label="Live Air Monitoring" desc="Continuous telemetry stream" />
        <StatBarItem label="6 Key Pollutants" desc="CPCB standard criteria tracking" />
        <StatBarItem label="24-Hour & 7-Day Forecasts" desc="Predictive sequence calculations" />
      </div>
    </section>
  );
}

function StatBarItem({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/60 bg-muted/20 px-6 py-4.5 transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-1.5 hover:bg-muted/40 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
        <span className="text-sm font-bold text-foreground">{label}</span>
      </div>
      <span className="mt-1 text-[11px] text-muted-foreground">{desc}</span>
    </div>
  );
}

function HeroVisual({ currentAQI }: HeroProps) {
  const pm25 = currentAQI?.pollutants?.pm2_5 != null ? Math.round(currentAQI.pollutants.pm2_5) : 24;
  const no2 = currentAQI?.pollutants?.NO2 != null ? Math.round(currentAQI.pollutants.NO2) : 18;
  const aqi = currentAQI?.current_aqi != null ? Math.round(currentAQI.current_aqi) : 62;

  return (
    <div className="relative mx-auto w-full max-w-5xl group">
      <div className="glass-card relative overflow-hidden rounded-[2.5rem] p-6 bg-card border border-border/60 shadow-2xl transition-all duration-700 ease-out hover:border-emerald-500/20 hover:shadow-[0_20px_50px_rgba(16,185,129,0.06)]">
        {/* skyline */}
        <div className="relative h-80 overflow-hidden rounded-3xl bg-gradient-to-b from-brand-sky/25 via-card to-brand/10 dark:from-brand-sky/15 dark:via-card dark:to-brand/15">
          <div className="absolute inset-x-0 top-5 flex items-center justify-between px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            <span>Kanpur Monitoring Station</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Online
            </span>
          </div>
          <SmartCitySVG />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <MiniStat icon={<CloudFog className="h-4 w-4" />} label="PM2.5" value={String(pm25)} unit="µg" tone="text-brand" />
          <MiniStat icon={<Atom className="h-4 w-4" />} label="NO₂" value={String(no2)} unit="ppb" tone="text-brand-teal" />
          <MiniStat icon={<Gauge className="h-4 w-4" />} label="AQI" value={String(aqi)} unit="idx" tone="text-brand-sky" />
        </div>
      </div>
      <div className="absolute -right-3 -top-3 hidden rotate-2 rounded-2xl border border-border/60 bg-card/90 px-4 py-2.5 text-xs shadow-xl backdrop-blur sm:block transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:-translate-y-1">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-brand" />
          <span className="font-bold">🟢 Live Station</span>
          <span className="text-emerald-500 font-semibold animate-pulse">Online</span>
        </div>
      </div>
      <div className="absolute -bottom-3 -left-3 hidden -rotate-2 rounded-2xl border border-border/60 bg-card/90 px-4 py-2.5 text-xs shadow-xl backdrop-blur sm:block transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-105 group-hover:border-cyan-500/30 group-hover:translate-y-1">
        <div className="font-bold text-foreground">Forecast Engine</div>
        <div className="text-muted-foreground mt-0.5">24-Hour + 7-Day Predictions</div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, unit, tone }: { icon: React.ReactNode; label: string; value: string; unit: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3.5 backdrop-blur transition-all duration-500 ease-out hover:scale-[1.04] hover:-translate-y-1 hover:bg-muted/30 hover:border-brand-teal/40 hover:shadow-md cursor-pointer">
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${tone} transition-colors duration-300`}>
        {icon} {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-foreground tracking-tight">{value}</span>
        <span className="text-[10px] text-muted-foreground font-semibold ml-0.5">{unit}</span>
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