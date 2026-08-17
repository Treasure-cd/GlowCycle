import { useEffect, useMemo, useState } from "react";
import { CaretLeft, CaretRight, Drop, Sparkle, ArrowRight, Info } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../services/firebase";
import { getScanHistory, updateLastPeriodStart } from "../services/firestore";
import type { ScanRecord } from "../services/firestore";
import { getCyclePhase } from "../lib/skinRulesEngine";
import { getCycleDayAtDate } from "../utils";
import type { CyclePhase } from "../lib/skinRulesEngine";

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

// Insights dictionary for the active phase
const PHASE_INSIGHTS: Record<CyclePhase, { facts: string; nextPhase: string; prediction: string }> = {
  menstrual: {
    facts: "Your estrogen and progesterone levels are at their lowest. Because your skin is producing less oil, it can easily become dry, dull, and extra sensitive right now.",
    nextPhase: "Follicular Phase",
    prediction: "As estrogen begins to rise, your skin's hydration levels will bounce back. Expect a plumper, clearer complexion soon.",
  },
  follicular: {
    facts: "Estrogen levels are rising, boosting collagen production and hydration. Your skin should be feeling plump, resilient, and naturally glowing.",
    nextPhase: "Ovulation Phase",
    prediction: "You'll hit peak estrogen levels, giving you your best natural glow, though some might notice a slight increase in oil as testosterone wakes up.",
  },
  ovulation: {
    facts: "Estrogen is at its peak! You likely have a radiant glow and high hydration. However, testosterone is also rising, which can start triggering more sebum (oil) production.",
    nextPhase: "Luteal Phase",
    prediction: "Progesterone will take over, which can trap excess oil in your pores. Focus on gentle exfoliation to prevent upcoming breakouts.",
  },
  luteal: {
    facts: "Progesterone is high, which stimulates your sebaceous glands to produce more oil. Your pores can swell, trapping bacteria, making this the most common time for breakouts and inflammation.",
    nextPhase: "Menstrual Phase",
    prediction: "Hormones will sharply drop. The oiliness will subside, but your skin might feel a bit dry or sensitive as your period begins.",
  },
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// BUG FIX: toISOString() uses UTC and can cause off-by-one day bugs depending on timezones. 
// This manually gets the local YYYY-MM-DD.
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

function getDayPhaseInfo(
  date: Date,
  lastPeriodStart: string | undefined
): { cycleDay: number; phase: CyclePhase } | null {
  if (!lastPeriodStart) return null;
  const start = new Date(lastPeriodStart);
  if (date < start) return null;
  const cycleDay = getCycleDayAtDate(lastPeriodStart, date);
  return { cycleDay, phase: getCyclePhase(cycleDay) };
}

export default function Cycle() {
  const { userData } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [confirming, setConfirming] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    getScanHistory(auth.currentUser.uid).then(setScans).catch(console.error);
  }, []);

  const scannedDateKeys = useMemo(
    () => new Set(scans.map((s) => toDateKey(s.createdAt))),
    [scans]
  );

  const today = new Date();
  const todayInfo = getDayPhaseInfo(today, userData?.lastPeriodStart);

  const gridDays = useMemo(() => {
    const firstOfMonth = visibleMonth;
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();

    const cells: { date: Date; inMonth: boolean }[] = [];

    for (let i = 0; i < startWeekday; i++) {
      const d = new Date(firstOfMonth);
      d.setDate(d.getDate() - (startWeekday - i));
      cells.push({ date: d, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ date: new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), day), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      cells.push({ date: d, inMonth: false });
    }
    return cells;
  }, [visibleMonth]);

  async function handleConfirmPeriod() {
    if (!auth.currentUser) return;
    setUpdating(true);
    try {
      await updateLastPeriodStart(auth.currentUser.uid, toDateKey(new Date()));
      setConfirming(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  return (
    // Desktop layout wrapper: expands max-width and adds grid
    <div className="mx-auto max-w-md px-6 py-10 md:max-w-4xl md:py-16">
      
      {/* Header section spanning full width */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Your cycle</h2>
        {todayInfo ? (
          <p className="mt-2 text-sm text-foreground/60 md:text-base">
            Day {todayInfo.cycleDay} · {PHASE_LABELS[todayInfo.phase]}
          </p>
        ) : (
          <p className="mt-2 text-sm text-foreground/60 md:text-base">
            Log your period to get skin insights.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start md:gap-16">
        
        {/* LEFT COLUMN: Calendar & Actions */}
        <div className="flex w-full flex-col">
            <div>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={todayInfo?.phase === "menstrual"}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-surface"
              >
                <Drop size={18} weight="duotone" className={todayInfo?.phase === "menstrual" ? "text-foreground/50" : "text-primary"} />
                {todayInfo?.phase === "menstrual" ? "Currently on your period" : "My period started today"}
              </button>
            ) : (
              <div className="rounded-xl border border-primary/40 bg-primary-muted p-4">
                <p className="text-sm text-foreground">This resets today as day 1 of a new cycle. Sure?</p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={updating}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/60 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPeriod}
                    disabled={updating}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-background hover:bg-primary-hover disabled:opacity-60"
                  >
                    {updating ? "Saving…" : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="rounded-full p-2 text-foreground/50 transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Previous month"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <p className="font-mono text-sm font-medium text-foreground">
              {visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            <button
              onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="rounded-full p-2 text-foreground/50 transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Next month"
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center font-mono text-xs text-foreground/40">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {gridDays.map(({ date, inMonth }, i) => {
              const dayInfo = getDayPhaseInfo(date, userData?.lastPeriodStart);
              const isMenstrual = dayInfo?.phase === "menstrual";
              const isOvulation = dayInfo?.phase === "ovulation";
              const isToday = isSameDay(date, today);
              const isScanned = scannedDateKeys.has(toDateKey(date));

              return (
                <div
                  key={i}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                    !inMonth ? "text-foreground/20" : "text-foreground"
                  } ${isMenstrual ? "bg-primary text-background" : ""} ${
                    isOvulation && !isMenstrual ? "ring-2 ring-inset ring-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <span className={isToday ? "font-bold" : ""}>{date.getDate()}</span>
                  {isToday && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-current opacity-70" />}
                  {isScanned && (
                    <span
                      className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${
                        isMenstrual ? "bg-background" : "bg-primary"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-foreground/50">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Period
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full ring-2 ring-inset ring-primary/50" /> Ovulation
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Scan logged
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Phase Insights */}
        <div className="flex w-full flex-col gap-4">
          {todayInfo ? (
            <>
              {/* Current Phase Facts */}
              <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkle size={22} weight="duotone" />
                  <h3 className="font-display text-lg font-bold">You're in your {PHASE_LABELS[todayInfo.phase]} phase</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                  {PHASE_INSIGHTS[todayInfo.phase].facts}
                </p>
              </div>

              {/* Next Phase Prediction */}
              <div className="rounded-2xl border border-border bg-background p-5 md:p-6">
                <div className="flex items-center gap-2 text-foreground/70">
                  <ArrowRight size={20} weight="regular" />
                  <h4 className="font-medium">Coming up: {PHASE_INSIGHTS[todayInfo.phase].nextPhase}</h4>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  {PHASE_INSIGHTS[todayInfo.phase].prediction}
                </p>
              </div>
            </>
          ) : (
            /* Empty State if they haven't logged a period yet */
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-foreground/50">
              <Info size={32} weight="duotone" className="mb-3 text-primary/60" />
              <p className="text-sm">Log your period on the calendar to see how your hormones are affecting your skin right now.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}