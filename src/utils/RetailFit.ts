import type { RoutineRecommendation } from "../lib/productRules";

export interface RetailProduct {
  id: string;
  name: string;
  brand?: string;
  ingredients: string[];
}

export type FitVerdict = "good" | "skip" | "neutral";

export interface ProductFitResult {
  verdict: FitVerdict;
  matchedAvoid: string[];
  matchedCore: string[];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\(.*?\)/g, "").trim();
}

// Keyword/substring matching against free-text ingredient names — same
// fragility as the ingredient strings in productRulesEngine.ts (see the
// retinoid-conflict note from earlier). Fine for a demo; a production
// version would need a shared ingredient taxonomy (ids, not display
// strings) for this to match reliably at scale.
export function evaluateProductFit(
  product: RetailProduct,
  recommendation: RoutineRecommendation
): ProductFitResult {
  const avoidKeywords = recommendation.avoidIngredients.map(normalize);
  const coreKeywords = recommendation.coreIngredients.map(normalize);

  const matchedAvoid = product.ingredients.filter((ing) => {
    const n = normalize(ing);
    return avoidKeywords.some((kw) => kw.length > 0 && (n.includes(kw) || kw.includes(n)));
  });

  const matchedCore = product.ingredients.filter((ing) => {
    const n = normalize(ing);
    return coreKeywords.some((kw) => kw.length > 0 && (n.includes(kw) || kw.includes(n)));
  });

  // A flagged ingredient always wins over a matched core ingredient —
  // avoiding a real irritant outweighs a nice-to-have match.
  let verdict: FitVerdict = "neutral";
  if (matchedAvoid.length > 0) verdict = "skip";
  else if (matchedCore.length > 0) verdict = "good";

  return { verdict, matchedAvoid, matchedCore };
}