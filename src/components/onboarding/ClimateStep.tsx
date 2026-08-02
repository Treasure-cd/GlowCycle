import type { OnboardingData } from "../../routes/Onboarding";

interface Props {
  data: OnboardingData;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  onFinish: () => void;
  onBack: () => void;
  submitting: boolean;
}

const CLIMATE_OPTIONS = [
  { value: "tropical", label: "Tropical / Humid" },
  { value: "dry", label: "Dry / Arid" },
  { value: "temperate", label: "Temperate" },
];

export default function ClimateStep({ data, setField, onFinish, onBack, submitting }: Props) {
  return (
    <div className="onboarding-step">
      <h2>What's your climate like?</h2>

      <div className="climate-cards">
        {CLIMATE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={data.climate === opt.value ? "climate-card selected" : "climate-card"}
            onClick={() => setField("climate", opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="step-actions">
        <button onClick={onBack}>Back</button>
        <button disabled={!data.climate || submitting} onClick={onFinish}>
          {submitting ? "Saving..." : "Finish"}
        </button>
      </div>
    </div>
  );
}