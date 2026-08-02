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
    <div className="onboarding-step">
      <h2>A bit about you</h2>

      <input
        type="text"
        placeholder="Full name"
        value={data.fullName}
        onChange={(e) => setField("fullName", e.target.value)}
      />

      <select
        value={data.birthYear || ""}
        onChange={(e) => setField("birthYear", Number(e.target.value))}
      >
        <option value="" disabled>Birth year</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <button disabled={!canProceed} onClick={onNext}>
        Next
      </button>
    </div>
  );
}