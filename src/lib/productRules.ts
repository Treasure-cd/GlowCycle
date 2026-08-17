import type { ScanInterpretation, CyclePhase, ClimateBucket, MetricInterpretation } from "./skinRulesEngine";

export interface RoutineRecommendation {
  coreIngredients: string[];
  avoidIngredients: string[];
  cleanserType: string;
  moisturizerType: string;
  sunscreenType: string;
  routineTweaks: string[];
}

export function generateProductRecommendations(interpretation: ScanInterpretation): RoutineRecommendation {
  const { cyclePhase, climate, metrics, skinAgeDelta } = interpretation;

  const isProblematic = (metricName: string) => {
    const m = metrics.find(m => m.metric === metricName);
    return m?.deviation === "below" || m?.deviation === "notably-below";
  };

  const isDry = isProblematic("moisture");
  const isOily = isProblematic("oiliness");
  const isSensitive = isProblematic("redness");
  const isOlder = skinAgeDelta > 5 || isProblematic("texture");
  const isCombo = isDry && isOily; 

  const recs: RoutineRecommendation = {
    coreIngredients: [],
    avoidIngredients: [],
    cleanserType: "Gentle balanced cleanser", // Default
    moisturizerType: "Lightweight lotion",    // Default
    sunscreenType: "Standard SPF 30+",        // Default
    routineTweaks: []
  };

  if (isCombo) {
    recs.coreIngredients.push("Niacinamide (2-5%)", "Glycerin", "Mild BHA (T-zone only)");
    recs.routineTweaks.push("Zone your routine: BHA/Niacinamide on your T-zone, richer barrier creams on your cheeks.");
  } else if (isDry) {
    recs.coreIngredients.push("Glycerin", "Hyaluronic Acid", "Ceramides", "Panthenol", "Squalane");
    recs.routineTweaks.push("Use a cream or oil-based cleanser. If extremely dry, apply a thin layer of petrolatum at night.");
  } else if (isOily) {
    recs.coreIngredients.push("Salicylic Acid (0.5-2%)", "Niacinamide (2-5%)", "Zinc PCA");
    recs.routineTweaks.push("Cleanse twice daily. Use only oil-free, gel-texture hydrators.");
  }

  if (isSensitive) {
    recs.coreIngredients.push("Centella Asiatica", "Allantoin", "Colloidal Oatmeal", "Azelaic Acid (10-15%)");
    recs.routineTweaks.push("Keep actives minimal. Introduce only one new ingredient at a time and wait 2-4 weeks.");
  }

  if (isOlder) {
    recs.coreIngredients.push("Retinoids (Adapalene/Tretinoin)", "Vitamin C", "Peptides", "Gentle AHAs (Lactic/Mandelic)");
    recs.routineTweaks.push("Start retinoids slowly (2-3 nights/week) and always pair with a moisturizer.");
  }


  if (climate === "hot-humid") {
    recs.cleanserType = isOily ? "Foaming or Gel cleanser (with Salicylic Acid)" : "Light gel cleanser";
    recs.moisturizerType = "Lightweight, oil-free gel or lotion";
    recs.sunscreenType = "Matte, non-comedogenic SPF 30+";
    if (isOily) recs.routineTweaks.push("Keep benzoyl peroxide 2.5% handy for sweat-induced spot treatments.");
  } else if (climate === "cold-dry") {
    recs.cleanserType = "Cream or oil-based, non-foaming cleanser";
    recs.moisturizerType = "Richer cream with ceramides and cholesterol";
    recs.sunscreenType = "Hydrating SPF 30+";
    recs.avoidIngredients.push("Frequent strong acids");
  }


  switch (cyclePhase) {
    case "menstrual":
      recs.avoidIngredients.push("Strong acids", "High-strength retinoids");
      recs.routineTweaks.push("Skin barrier is weaker right now. Prioritize calming and barrier support. Skip harsh actives if you feel stingy.");
      break;
    
    case "follicular":
      recs.routineTweaks.push("Skin is resilient and glowing. This is the best window to introduce or step up actives like Vitamin C or AHAs.");
      break;

    case "ovulation":
      recs.routineTweaks.push("Skin is usually at its peak. Maintain your consistent routine.");
      break;

    case "luteal":
      recs.coreIngredients.push("Gentle BHA", "Benzoyl Peroxide 2.5% (Spot Treatment)");
      recs.routineTweaks.push("Oil production is spiking. Keep gentle BHA/Niacinamide active for congestion. If skin gets reactive right before your period, reduce acid frequency.");
      break;
  }

  recs.coreIngredients = recs.coreIngredients.filter(
  (core) => !recs.avoidIngredients.some((avoid) =>
    core.toLowerCase().includes(avoid.toLowerCase().split(" ")[0])
  )
);

  recs.coreIngredients = [...new Set(recs.coreIngredients)];
  recs.avoidIngredients = [...new Set(recs.avoidIngredients)];
  
  return recs;
}