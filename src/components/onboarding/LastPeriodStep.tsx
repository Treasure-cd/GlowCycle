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
    <div className="onboarding-step">
      <h2>When did your last period start?</h2>
      <p className="step-subtext">This helps us tailor your skin recommendations to your cycle phase.</p>

      <input
        type="date"
        value={data.lastPeriodStart}
        max={new Date().toISOString().split("T")[0]}
        onChange={(e) => setField("lastPeriodStart", e.target.value)}
      />

      <div className="step-actions">
        <button onClick={onBack}>Back</button>
        <button disabled={!canProceed} onClick={onNext}>Next</button>
      </div>
    </div>
  );
}