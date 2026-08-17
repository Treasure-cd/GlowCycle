import { useEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { auth } from "../../services/firebase";
import { getJournalEntry, saveJournalEntry } from "../../services/firestore";

// BUG FIX: Timezone-safe local date key
function todayKey(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TodayJournalEntry() {
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    getJournalEntry(auth.currentUser.uid, todayKey())
      .then((entry) => {
        if (entry) {
          setText(entry.text);
          setSavedText(entry.text);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const isDirty = text !== savedText;

  async function handleSave() {
    if (!auth.currentUser || !isDirty) return;
    setSaving(true);
    try {
      await saveJournalEntry(auth.currentUser.uid, todayKey(), text);
      setSavedText(text);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 md:p-8">
      <p className="font-display text-xl font-bold text-foreground">Today</p>
      <p className="mt-1 text-sm text-foreground/60">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={loading ? "Loading…" : "How's your skin, your mood, anything worth remembering about today?"}
        disabled={loading}
        // Made slightly taller for a better desktop writing experience
        rows={7} 
        className="mt-5 w-full resize-none rounded-xl border border-border bg-background px-4 py-3.5 text-base text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:rows-8"
      />

      <div className="mt-4 flex items-center justify-end gap-3">
        {justSaved && (
          <span className="flex items-center gap-1.5 text-xs text-foreground/50">
            <CheckCircle size={16} weight="fill" className="text-primary" />
            Saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}