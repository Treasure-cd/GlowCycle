import { useEffect, useMemo, useState } from "react";
import { auth } from "../../services/firebase";
import { getJournalEntries, getScanHistory } from "../../services/firestore";
import type { JournalEntry, ScanRecord } from "../../services/firestore";

// BUG FIX: Timezone-safe local date keys
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey(): string {
  return toDateKey(new Date());
}

// Parses "YYYY-MM-DD" as a local date, not UTC midnight
function formatEntryDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JournalHistory() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    Promise.all([getJournalEntries(uid), getScanHistory(uid)])
      .then(([entryList, scanList]) => {
        setEntries(entryList.filter((e) => e.date !== todayKey()));
        setScans(scanList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scannedDateKeys = useMemo(() => new Set(scans.map((s) => toDateKey(s.createdAt))), [scans]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-foreground/50">
        Loading past entries…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground/50">
        No past entries yet.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 md:p-8">
      <p className="font-display text-xl font-bold text-foreground">Past entries</p>

      <div className="mt-4">
        {entries.map((entry) => (
          <div key={entry.date} className="border-b border-border py-4 last:border-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">{formatEntryDate(entry.date)}</p>
              {scannedDateKeys.has(entry.date) && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}