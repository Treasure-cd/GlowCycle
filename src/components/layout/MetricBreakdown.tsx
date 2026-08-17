import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import type { ScanInterpretation, DeviationLabel, MetricInterpretation } from "../../lib/skinRulesEngine";

const METRIC_LABELS: Record<MetricInterpretation["metric"], string> = {
  acne: "Acne",
  oiliness: "Oiliness",
  moisture: "Moisture",
  redness: "Redness",
  texture: "Texture",
};

const PHASE_LABELS: Record<ScanInterpretation["cyclePhase"], string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

const CLIMATE_LABELS: Record<ScanInterpretation["climate"], string> = {
  "hot-humid": "Hot & humid",
  "cold-dry": "Cold & dry",
  temperate: "Temperate",
};

type Tone = "up" | "down" | "down-strong" | "flat";

function deviationCopy(deviation: DeviationLabel): { label: string; tone: Tone } {
  switch (deviation) {
    case "notably-below":
      return { label: "Notably below typical", tone: "down-strong" };
    case "below":
      return { label: "Below typical for now", tone: "down" };
    case "above":
      return { label: "Better than typical", tone: "up" };
    case "notably-above":
      return { label: "Notably better than typical", tone: "up" };
    default:
      return { label: "Typical right now", tone: "flat" };
  }
}

function DeviationIcon({ tone }: { tone: Tone }) {
  if (tone === "up") return <TrendUp size={14} weight="bold" className="text-primary" />;
  if (tone === "down-strong") return <TrendDown size={14} weight="bold" className="text-danger" />;
  if (tone === "down") return <TrendDown size={14} weight="bold" className="text-foreground/70" />;
  return <Minus size={14} weight="bold" className="text-foreground/40" />;
}

export default function MetricBreakdown({ interpretation }: { interpretation: ScanInterpretation }) {
  const { cyclePhase, climate, metrics, skinAgeDelta, overallScore } = interpretation;

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">Latest reading</p>
          <p className="mt-1 font-mono text-sm text-primary">
            {PHASE_LABELS[cyclePhase]} · {CLIMATE_LABELS[climate]}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold text-foreground">{Math.round(overallScore)}</p>
          <p className="text-xs text-foreground/50">Overall</p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-border">
        {metrics.map((m) => {
          const { label, tone } = deviationCopy(m.deviation);
          return (
            <div key={m.metric} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-foreground">{METRIC_LABELS[m.metric]}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <DeviationIcon tone={tone} />
                  <span className={`text-xs ${tone === "down-strong" ? "text-danger" : "text-foreground/60"}`}>
                    {label}
                  </span>
                </div>
              </div>
              <span className="font-mono text-lg text-foreground">{m.score}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-primary-muted px-4 py-3">
        <span className="text-sm text-foreground/70">Predicted skin age</span>
        <span className="font-mono text-sm font-medium text-primary">
          {skinAgeDelta === 0
            ? "Matches your age"
            : skinAgeDelta < 0
            ? `${Math.abs(Math.round(skinAgeDelta))} yrs younger`
            : `${Math.round(skinAgeDelta)} yrs older`}
        </span>
      </div>
    </div>
  );
}