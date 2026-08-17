import type { OnboardingData } from "../../routes/Onboarding";

interface Props {
  data: OnboardingData;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function LastPeriodStep({ data, setField, onNext, onBack }: Props) {
  const canProceed = data.lastPeriodStart.length > 0;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground">
        When did your last period start?
      </h2>
      <p className="mt-2 text-sm text-foreground/60">
        This helps us tailor your skin recommendations to your cycle phase.
      </p>

      <input
        type="date"
        value={data.lastPeriodStart}
        max={new Date().toISOString().split("T")[0]}
        onChange={(e) => setField("lastPeriodStart", e.target.value)}
        className="mt-6 w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base text-foreground [color-scheme:light] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:[color-scheme:dark]"
      />

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="rounded-xl px-4 py-3.5 text-sm font-medium text-foreground/60 hover:text-foreground"
        >
          Back
        </button>
        <button
          disabled={!canProceed}
          onClick={onNext}
          className="flex-1 rounded-xl bg-primary py-3.5 font-medium text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
}