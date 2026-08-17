import { CaretDownIcon } from "@phosphor-icons/react";
import type { OnboardingData } from "../../routes/Onboarding";

interface Props {
  data: OnboardingData;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  onNext: () => void;
}

export default function AboutYouStep({ data, setField, onNext }: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

  const canProceed = data.fullName.trim().length > 0 && data.birthYear > 0;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground">A bit about you</h2>

      <div className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Full name"
          value={data.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          autoComplete="name"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-0"
        />

        <div className="relative">
          <select
            value={data.birthYear || ""}
            onChange={(e) => setField("birthYear", Number(e.target.value))}
            className="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-3.5 text-base text-foreground focus:border-primary focus:outline-none focus:ring-0"
          >
            <option value="" disabled>Birth year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <CaretDownIcon
            size={16}
            weight="bold"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40"
          />
        </div>
      </div>

      <button
        disabled={!canProceed}
        onClick={onNext}
        className="mt-8 w-full rounded-xl bg-primary py-3.5 font-medium text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        Next
      </button>
    </div>
  );
}