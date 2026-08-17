import type { ReactNode } from "react";

export default function OnboardingLayout({
  step,
  totalSteps,
  children,
}: {
  step: number;
  totalSteps: number;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center bg-background px-6 py-10 md:items-center md:bg-surface md:px-4">
      <div className="w-full md:max-w-md md:rounded-3xl md:border md:border-border md:bg-background md:p-8 md:shadow-sm">
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-foreground/50">
          Step {step + 1} of {totalSteps}
        </p>
        {children}
      </div>
    </div>
  );
}