import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ScanRecord } from "../../services/firestore";

type MetricOption = "overall" | "acne" | "oiliness" | "moisture" | "redness" | "texture";

const METRIC_LABELS: Record<MetricOption, string> = {
  overall: "Overall",
  acne: "Acne",
  oiliness: "Oiliness",
  moisture: "Moisture",
  redness: "Redness",
  texture: "Texture",
};

const CHART_W = 600;
const CHART_H = 200;

function getMetricValue(scan: ScanRecord, metric: MetricOption): number {
  return metric === "overall" ? scan.results.overall : scan.results[metric];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ScanTrendChart({ scans }: { scans: ScanRecord[] }) {
  const [metric, setMetric] = useState<MetricOption>("overall");

  const sorted = useMemo(
    () => [...scans].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    [scans]
  );

  const isEmpty = sorted.length === 0;
  const isSingle = sorted.length === 1;

  const { path, points, minDate, maxDate } = useMemo(() => {
    if (sorted.length === 0) return { path: "", points: [], minDate: null, maxDate: null };

    const minDate = sorted[0].createdAt;
    const maxDate = sorted[sorted.length - 1].createdAt;

    if (sorted.length === 1) return { path: "", points: [], minDate, maxDate };

    const minTime = minDate.getTime();
    const maxTime = maxDate.getTime();

    const pts = sorted.map((scan) => {
      const x =
        maxTime === minTime
          ? CHART_W / 2
          : ((scan.createdAt.getTime() - minTime) / (maxTime - minTime)) * CHART_W;
      const value = getMetricValue(scan, metric);
      const y = CHART_H - (value / 100) * CHART_H;
      return { x, y, value, date: scan.createdAt };
    });

    const d = `M${pts.map((p) => `${p.x},${p.y}`).join(" L")}`;
    return { path: d, points: pts, minDate, maxDate };
  }, [sorted, metric]);

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(METRIC_LABELS) as MetricOption[]).map((m) => (
          <button
            key={m}
            disabled={isEmpty}
            onClick={() => setMetric(m)}
            className={`rounded-full px-3 py-1.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              metric === m
                ? "bg-primary text-background"
                : "border border-border bg-background text-foreground/60 hover:text-foreground"
            }`}
          >
            {METRIC_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="relative mt-6">
        {isEmpty && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-[200px] text-sm text-foreground/60">
              Nothing here yet — your first scan starts the line.
            </p>
            <Link
              to="/skinscan"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary-hover"
            >
              New scan
            </Link>
          </div>
        )}

        <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`} className={isEmpty ? "opacity-30" : ""}>
          {isEmpty && (
            <line
              x1="0" x2={CHART_W} y1={CHART_H / 2} y2={CHART_H / 2}
              stroke="var(--fg)" strokeOpacity="0.2" strokeDasharray="4 4" strokeWidth="2"
            />
          )}

          {isSingle && minDate && (
            <>
              <line
                x1="0" x2={CHART_W}
                y1={CHART_H - (getMetricValue(sorted[0], metric) / 100) * CHART_H}
                y2={CHART_H - (getMetricValue(sorted[0], metric) / 100) * CHART_H}
                stroke="var(--fg)" strokeOpacity="0.15" strokeDasharray="4 4" strokeWidth="1.5"
              />
              <circle
                cx={CHART_W / 2}
                cy={CHART_H - (getMetricValue(sorted[0], metric) / 100) * CHART_H}
                r="5"
                fill="var(--primary)"
              >
                <title>{`${formatDate(sorted[0].createdAt)}: ${getMetricValue(sorted[0], metric)}`}</title>
              </circle>
            </>
          )}

          {sorted.length >= 2 && (
            <>
              <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--primary)">
                  <title>{`${formatDate(p.date)}: ${p.value}`}</title>
                </circle>
              ))}
            </>
          )}
        </svg>

        {!isEmpty && minDate && maxDate && (
          <div className={`mt-2 flex font-mono text-xs text-foreground/40 ${isSingle ? "justify-center" : "justify-between"}`}>
            <span>{formatDate(minDate)}</span>
            {!isSingle && <span>{formatDate(maxDate)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}