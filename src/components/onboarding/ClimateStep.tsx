import { CloudRain, Sun, Leaf, Check } from "@phosphor-icons/react";
import type { OnboardingData } from "../../routes/Onboarding";

interface Props {
  data: OnboardingData;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  onFinish: () => void;
  onBack: () => void;
  submitting: boolean;
}

const CLIMATE_OPTIONS = [
  { value: "tropical", label: "Tropical / Humid", icon: CloudRain },
  { value: "dry", label: "Dry / Arid", icon: Sun },
  { value: "temperate", label: "Temperate", icon: Leaf },
];

export default function ClimateStep({ data, setField, onFinish, onBack, submitting }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground">
        What's your climate like?
      </h2>

      <div className="mt-6 flex flex-col gap-3">
        {CLIMATE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = data.climate === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField("climate", opt.value)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary text-background"
                  : "border-border bg-surface text-foreground hover:border-primary/40"
              }`}
            >
              <Icon size={20} weight="bold" className="shrink-0" />
              <span className="flex-1 font-medium">{opt.label}</span>
              {selected && <Check size={18} weight="bold" className="shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="rounded-xl px-4 py-3.5 text-sm font-medium text-foreground/60 hover:text-foreground disabled:opacity-40"
        >
          Back
        </button>
        <button
          disabled={!data.climate || submitting}
          onClick={onFinish}
          className="flex-1 rounded-xl bg-primary py-3.5 font-medium text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Finish"}
        </button>
      </div>
    </div>
  );
}