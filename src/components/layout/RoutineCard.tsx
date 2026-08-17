import { Check, X, Lightbulb } from "@phosphor-icons/react";
import type { RoutineRecommendation } from "../../lib/productRules";

export default function RoutineCard({ recommendation }: { recommendation: RoutineRecommendation }) {
  const { coreIngredients, avoidIngredients, cleanserType, moisturizerType, sunscreenType, routineTweaks } =
    recommendation;

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 md:p-8">
      <p className="font-display text-xl font-bold text-foreground">Your routine right now</p>
      <p className="mt-1 text-sm text-foreground/60">Based on today's context.</p>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground/60">Try</p>
          {coreIngredients.length > 0 ? (
            <ul className="space-y-2">
              {coreIngredients.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <Check size={14} weight="bold" className="mt-0.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-foreground/40">Nothing specific today.</p>
          )}
        </div>
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground/60">Skip</p>
          {avoidIngredients.length > 0 ? (
            <ul className="space-y-2">
              {avoidIngredients.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/60">
                  <X size={14} weight="bold" className="mt-0.5 shrink-0 text-foreground/40" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-foreground/40">Nothing to avoid today.</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl bg-background p-4 sm:grid-cols-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/40">Cleanser</p>
          <p className="mt-0.5 text-sm text-foreground">{cleanserType}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/40">Moisturizer</p>
          <p className="mt-0.5 text-sm text-foreground">{moisturizerType}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/40">SPF</p>
          <p className="mt-0.5 text-sm text-foreground">{sunscreenType}</p>
        </div>
      </div>

      {routineTweaks.length > 0 && (
        <div className="mt-6 space-y-3">
          {routineTweaks.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Lightbulb size={16} weight="bold" className="mt-0.5 shrink-0 text-primary" />
              <p className="text-sm text-foreground/70">{tip}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-foreground/40">General skincare guidance, not medical advice.</p>
    </div>
  );
}