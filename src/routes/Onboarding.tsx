import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { createUserProfile } from "../lib/firestore";
import AboutYouStep from "../components/onboarding/AboutYouStep";
import LastPeriodStep from "../components/onboarding/LastPeriodStep";
import ClimateStep from "../components/onboarding/ClimateStep";

export interface OnboardingData {
  fullName: string;
  birthYear: number;
  lastPeriodStart: string;
  climate: string;
}

const steps = ["aboutYou", "lastPeriod", "climate"] as const;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    birthYear: 0,
    lastPeriodStart: "",
    climate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function setField<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSubmitting(true);
    try {
      await createUserProfile(uid, data);
      navigate("/skin-scan")
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  }

  return (
    <div className="onboarding-page">
      <div className="progress-bar">
        {steps.map((s, i) => (
          <span key={s} className={i <= step ? "dot active" : "dot"} />
        ))}
      </div>

      {step === 0 && (
        <AboutYouStep data={data} setField={setField} onNext={next} />
      )}
      {step === 1 && (
        <LastPeriodStep data={data} setField={setField} onNext={next} onBack={back} />
      )}
      {step === 2 && (
        <ClimateStep
          data={data}
          setField={setField}
          onFinish={finish}
          onBack={back}
          submitting={submitting}
        />
      )}
    </div>
  );
}