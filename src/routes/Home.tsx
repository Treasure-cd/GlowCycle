import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getScanHistory } from "../services/firestore";
import { getCycleDayAtDate } from "../utils";
import type { ScanRecord } from "../services/firestore";
import { interpretScan, getCyclePhase } from "../lib/skinRulesEngine";
import type { ScanInterpretation } from "../lib/skinRulesEngine";
import ScanTrendChart from "../components/layout/SkinTrendChart";
import MetricBreakdown from "../components/layout/MetricBreakdown";
import { generateProductRecommendations } from "../lib/productRules";
import type { RoutineRecommendation } from "../lib/productRules";
import RoutineCard from "../components/layout/RoutineCard";
import ScanHistoryList from "../components/layout/ScanHIstoryList";

export default function Home() {
  const { user, userData } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [scansLoading, setScansLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);


  useEffect(() => {
    if (!user) return;
    getScanHistory(user.uid)
      .then(setScans)
      .catch((err) => {
        console.error(err);
        setLoadError("Couldn't load your scan history. Try refreshing.");
      })
      .finally(() => setScansLoading(false));
  }, [user]);

  const latestScan = scans.length > 0 ? scans[scans.length - 1] : null;

  const interpretation: ScanInterpretation | null =
    latestScan && userData
      ? interpretScan(latestScan.results, {
          birthYear: userData.birthYear,
          cycleDay: latestScan.cycleDay,
          weather: latestScan.weather,
        })
      : null;

  const recommendation: RoutineRecommendation | null = interpretation
  ? generateProductRecommendations(interpretation)
  : null;

  const todayCycleDay = userData ? getCycleDayAtDate(userData.lastPeriodStart, new Date()) : null;
  const todayPhase = todayCycleDay !== null ? getCyclePhase(todayCycleDay) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-bold text-foreground">
            {userData?.fullName ? `Hey, ${userData.fullName.split(" ")[0]}` : "Hey"}
          </p>
          {todayCycleDay !== null && todayPhase && (
            <p className="mt-1 font-mono text-sm text-foreground/50">
              Day {todayCycleDay} · {todayPhase.charAt(0).toUpperCase() + todayPhase.slice(1)}
            </p>
          )}
        </div>
        <Link
          to="/skinscan"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary-hover"
        >
          New scan
        </Link>
      </div>

      {loadError && (
        <p className="mt-6 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{loadError}</p>
      )}

      <div className="mt-8">
        {scansLoading ? (
          <div className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-foreground/50">
            Loading your scans…
          </div>
        ) : (
          <ScanTrendChart scans={scans} />
        )}
      </div>

      {interpretation && (
        <div className="mt-6">
          <MetricBreakdown interpretation={interpretation} />
        </div>
      )}

      {recommendation && (
      <div className="mt-6">
        <RoutineCard recommendation={recommendation} />
      </div>
    )}

    {!scansLoading && userData && (
  <div className="mt-6">
    <ScanHistoryList scans={scans} birthYear={userData.birthYear} />
  </div>
)}

      {/* Routine card + history table go here next */}
    </div>
  );
}