import { useMemo } from "react";
import type { ScanRecord } from "../../services/firestore";
import { interpretScan, type CyclePhase } from "../../lib/skinRulesEngine";

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ScanHistoryList({ scans, birthYear }: { scans: ScanRecord[]; birthYear: number }) {
  const rows = useMemo(() => {
    return [...scans]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((scan) => {
        const interpretation = interpretScan(scan.results, {
          birthYear,
          cycleDay: scan.cycleDay,
          weather: scan.weather,
        });
        const concerningCount = interpretation.metrics.filter(
          (m) => m.deviation === "below" || m.deviation === "notably-below"
        ).length;
        return { scan, interpretation, concerningCount };
      });
  }, [scans, birthYear]);

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-foreground/50">
        No scans yet — your history will show up here.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 md:p-8">
      <p className="font-display text-xl font-bold text-foreground">Scan history</p>
      <p className="mt-1 text-sm text-foreground/60">
        {rows.length} scan{rows.length === 1 ? "" : "s"} logged
      </p>

      <div className="mt-4">
        {rows.map(({ scan, interpretation, concerningCount }) => (
          <div
            key={scan.id}
            className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{formatDate(scan.createdAt)}</p>
              <p className="mt-0.5 font-mono text-xs text-foreground/50">
                {PHASE_LABELS[interpretation.cyclePhase]}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span className="font-mono text-sm text-foreground">
                {Math.round(interpretation.overallScore)}
              </span>
              <span className={`text-xs ${concerningCount > 0 ? "text-danger" : "text-foreground/40"}`}>
                {concerningCount > 0 ? `${concerningCount} flagged` : "All typical"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}