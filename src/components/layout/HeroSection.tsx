import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Oiliness "concern" rises through the luteal phase, dips in the follicular window.
// Hydration follows the opposite shape: dips at menstrual start and again late-luteal.

function getDemoMetrics(day: number) {
  const rad = (d: number) => (d / 28) * Math.PI * 2;
  const oiliness = 50 + 35 * Math.sin(rad(day - 8));
  const hydration = 55 + 30 * Math.sin(rad(day + 6));
  return {
    oiliness: Math.round(Math.min(100, Math.max(0, oiliness))),
    hydration: Math.round(Math.min(100, Math.max(0, hydration))),
  };
}

const PHASE_LABEL = (day: number) => {
  if (day <= 5) return "Menstrual";
  if (day <= 13) return "Follicular";
  if (day <= 16) return "Ovulation";
  return "Luteal";
};

function buildLinePath(getValue: (day: number) => number, width: number, height: number) {
  const steps = 40;
  const points = Array.from({ length: steps }, (_, i) => {
    const day = 1 + (i / (steps - 1)) * 27; 
    const x = (i / (steps - 1)) * width;
    const y = height - (getValue(day) / 100) * height;
    return `${x},${y}`;
  });
  return `M${points.join(" L")}`; 
}

const GRAPH_W = 280;
const GRAPH_H = 90;

export default function HeroSection() {
  const [cycleDay, setCycleDay] = useState(14);
  const metrics = useMemo(() => getDemoMetrics(cycleDay), [cycleDay]);

  const oilinessPath = useMemo(
    () => buildLinePath((d) => getDemoMetrics(d).oiliness, GRAPH_W, GRAPH_H),
    []
  );
  const hydrationPath = useMemo(
    () => buildLinePath((d) => getDemoMetrics(d).hydration, GRAPH_W, GRAPH_H),
    []
  );
  const playheadX = ((cycleDay - 1) / 27) * GRAPH_W;

  const oilOpacity = (metrics.oiliness / 100) * 0.55;
  const drynessOpacity = ((100 - metrics.hydration) / 100) * 0.45;

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        {/* Left: copy */}
        <div>
          <h1 className="animate-slide-up delay-100 font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
            Watch how your skin changes with your period.
        </h1>
          <p className="animate-slide-up delay-200 mt-5 max-w-md text-base leading-relaxed text-foreground">
            GlowCycle reads your skin in context your cycle phase, your
            climate — instead of treating a single score as the whole story.
          </p>
          <div className="mt-8 flex items-center gap-4">
                <Link
                to="/auth"
                className="rounded-full bg-primary px-6 py-3 font-bold text-background transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/40 hover:bg-primary-hover"
                >
                Get started
                </Link>
          </div>
        </div>

        {/* Right: interactive demo */}
        <div className="relative">
        <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 bg-surface/80 p-6 shadow-xl shadow-foreground/5 rounded-full bg-primary/20 blur-[100px]" />
        <div className="rounded-3xl border border-border bg-surface px-6 py-3 md:p-8">
          <div className="flex justify-center">
        <div className="relative mx-auto flex h-[220px] w-[180px] items-center justify-center">
        <div
            className="absolute rounded-full bg-[#3b82f6] blur-3xl transition-all duration-700 ease-out"
            style={{
            width: `${metrics.hydration + 20}%`,
            height: `${metrics.hydration + 20}%`,
            opacity: (metrics.hydration / 100) * 0.3
            }}
        />
        {/* Oiliness foreground glow (warm/primary feel) */}
        <div
            className="absolute rounded-full bg-primary blur-2xl transition-all duration-700 ease-out"
            style={{
            width: `${metrics.oiliness + 40}%`,
            height: `${metrics.oiliness + 40}%`,
            opacity: (metrics.oiliness / 100) * 0.6
            }}
        />
        {/* Central glass element to ground it */}
        <div className="z-10 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-background/30 shadow-2xl backdrop-blur-md">
            <div className="h-16 w-16 rounded-full border border-primary/20" />
        </div>
        </div>
          </div>

          {/* Score chips */}
          <div className="mt-4 flex justify-center gap-3 font-mono text-xs">
            <span className="rounded-full bg-primary-muted px-3 py-1 text-primary">
              Oiliness {metrics.oiliness}
            </span>
            <span className="rounded-full bg-primary-muted px-3 py-1 text-primary">
              Hydration {metrics.hydration}
            </span>
          </div>

          {/* Graph */}
          <div className="mt-6">
            <svg width="100%" viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="overflow-visible">
              <path d={oilinessPath} fill="none" stroke="var(--primary)" strokeWidth="2" />
              <path d={hydrationPath} fill="none" stroke="var(--fg)" strokeOpacity="0.35" strokeWidth="2" />
              <line
                x1={playheadX} x2={playheadX} y1="0" y2={GRAPH_H}
                stroke="var(--fg)" strokeOpacity="0.25" strokeDasharray="3 3"
              />
              <circle cx={playheadX} cy={GRAPH_H - (metrics.oiliness / 100) * GRAPH_H} r="3.5" fill="var(--primary)" />
            </svg>
          </div>

          {/* Slider */}
          <div className="mt-8">
            <div className="mb-3 text-center">
                <span className="inline-block animate-bounce font-sm text-[10px] font-bold uppercase tracking-wide text-primary">
                ↓ Drag to explore ↓
                </span>
            </div>
            <input
              type="range"
              min={1}
              max={28}
              value={cycleDay}
              onChange={(e) => setCycleDay(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-2 flex items-center justify-between font-mono text-xs text-foreground/60">
              <span>Day {cycleDay}</span>
              <span className="text-primary">{PHASE_LABEL(cycleDay)}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}