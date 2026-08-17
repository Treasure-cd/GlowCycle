import type { SkinScores } from "../services/youcam"
import type { WeatherData } from "../services/weather"


export type AgeBracket = "teens-early20s" | "mid20s-30s" | "late30s-40s" | "40s-50s";
export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";
export type ClimateBucket = "hot-humid" | "cold-dry" | "temperate";

export function getAgeBracket(birthYear: number): AgeBracket {
  const age = new Date().getFullYear() - birthYear;
  if (age < 23) return "teens-early20s";
  if (age < 38) return "mid20s-30s";
  if (age < 45) return "late30s-40s";
  return "40s-50s";
}

export function getCyclePhase(cycleDay: number, cycleLength = 28): CyclePhase {
  const day = ((cycleDay - 1) % cycleLength) + 1;
  if (day <= 5) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulation";
  return "luteal";
}

export function getClimateBucket(weather: WeatherData | null): ClimateBucket {
  if (!weather) return "temperate";
  if (weather.temp >= 27 || weather.humidity >= 65) return "hot-humid";
  if (weather.temp <= 10 || weather.humidity <= 30) return "cold-dry";
  return "temperate";
}

type Range = { min: number; max: number };
type MetricKey = "acne" | "oiliness" | "moisture" | "redness" | "texture";


const AGE_BASELINES: Record<AgeBracket, Record<MetricKey, Range>> = {
  "teens-early20s": { acne: { min: 55, max: 80 }, oiliness: { min: 55, max: 80 }, moisture: { min: 65, max: 90 }, redness: { min: 70, max: 95 }, texture: { min: 70, max: 95 } },
  "mid20s-30s":      { acne: { min: 65, max: 90 }, oiliness: { min: 60, max: 85 }, moisture: { min: 70, max: 95 }, redness: { min: 75, max: 95 }, texture: { min: 75, max: 95 } },
  "late30s-40s":     { acne: { min: 70, max: 92 }, oiliness: { min: 65, max: 88 }, moisture: { min: 60, max: 85 }, redness: { min: 65, max: 90 }, texture: { min: 65, max: 90 } },
  "40s-50s":         { acne: { min: 75, max: 95 }, oiliness: { min: 65, max: 90 }, moisture: { min: 50, max: 75 }, redness: { min: 55, max: 85 }, texture: { min: 55, max: 85 } },
};


const CYCLE_MODIFIERS: Record<CyclePhase, Record<MetricKey, number>> = {
  menstrual:  { acne: 0,  oiliness: 0,   moisture: -8, redness: -5, texture: -3 },
  follicular: { acne: 5,  oiliness: 5,   moisture: 5,  redness: 5,  texture: 5  },
  ovulation:  { acne: 3,  oiliness: 0,   moisture: 5,  redness: 3,  texture: 5  },
  luteal:     { acne: -10, oiliness: -12, moisture: -5, redness: -5, texture: -3 },
};

const CLIMATE_MODIFIERS: Record<ClimateBucket, Record<MetricKey, number>> = {
  "hot-humid": { acne: -5, oiliness: -10, moisture: 5,  redness: -3, texture: 0  },
  "cold-dry":  { acne: 0,  oiliness: 5,   moisture: -10, redness: -5, texture: -5 },
  temperate:   { acne: 0,  oiliness: 0,   moisture: 0,  redness: 0,  texture: 0  },
};

function getExpectedRange(ageBracket: AgeBracket, phase: CyclePhase, climate: ClimateBucket, metric: MetricKey): Range {
  const base = AGE_BASELINES[ageBracket][metric];
  const shift = CYCLE_MODIFIERS[phase][metric] + CLIMATE_MODIFIERS[climate][metric];
  return {
    min: Math.max(0, base.min + shift),
    max: Math.min(100, base.max + shift),
  };
}


export type DeviationLabel = "notably-below" | "below" | "typical" | "above" | "notably-above";

export interface MetricInterpretation {
  metric: MetricKey;
  score: number;
  expectedRange: Range;
  deviation: DeviationLabel;
}

function classifyDeviation(score: number, range: Range): DeviationLabel {
  if (score < range.min - 10) return "notably-below";
  if (score < range.min) return "below";
  if (score > range.max + 10) return "notably-above";
  if (score > range.max) return "above";
  return "typical";
}


export interface ScanContext {
  birthYear: number;
  cycleDay: number;
  weather: WeatherData | null;
}

export interface ScanInterpretation {
  ageBracket: AgeBracket;
  cyclePhase: CyclePhase;
  climate: ClimateBucket;
  metrics: MetricInterpretation[];
  skinAgeDelta: number;
  overallScore: number;
}

export function interpretScan(scores: SkinScores, context: ScanContext): ScanInterpretation {
  const ageBracket = getAgeBracket(context.birthYear);
  const cyclePhase = getCyclePhase(context.cycleDay);
  const climate = getClimateBucket(context.weather);
  const actualAge = new Date().getFullYear() - context.birthYear;

  const metricKeys: MetricKey[] = ["acne", "oiliness", "moisture", "redness", "texture"];
  const metrics = metricKeys.map((metric) => {
    const expectedRange = getExpectedRange(ageBracket, cyclePhase, climate, metric);
    return {
      metric,
      score: scores[metric],
      expectedRange,
      deviation: classifyDeviation(scores[metric], expectedRange),
    };
  });

  return {
    ageBracket,
    cyclePhase,
    climate,
    metrics,
    skinAgeDelta: scores.skinAge - actualAge,
    overallScore: scores.overall,
  };
}

export interface DashboardInsights {
  headline: string;
  context: string;
  observations: string[];
  actionableTips: string[];
}

export function generateDashboardStrings(interpretation: ScanInterpretation): DashboardInsights {
  const { cyclePhase, climate, metrics, skinAgeDelta } = interpretation;
  
  const insights: DashboardInsights = {
    headline: "",
    context: "",
    observations: [],
    actionableTips: []
  };

  const phaseText = {
    menstrual: "your menstrual phase (low estrogen)",
    follicular: "your follicular phase (rising estrogen)",
    ovulation: "ovulation (peak hormones)",
    luteal: "your luteal phase (peak progesterone)"
  }[cyclePhase];

  const climateText = {
    "hot-humid": "hot and humid",
    "cold-dry": "cold and dry",
    "temperate": "mild"
  }[climate];

  insights.context = `You are currently in ${phaseText}, and the weather is ${climateText}.`;

  if (skinAgeDelta < -3) {
    insights.headline = "Your skin is thriving right now.";
  } else if (skinAgeDelta > 5) {
    insights.headline = "Your skin is under a bit of stress today.";
  } else {
    insights.headline = "Your skin is doing exactly what we expect.";
  }


  metrics.forEach((m) => {
    if (m.deviation === "below" || m.deviation === "notably-below") {
      const severity = m.deviation === "notably-below" ? "significantly " : "a bit ";
      
      switch (m.metric) {
        case "acne":
          insights.observations.push(`Acne is ${severity}more active than usual for this time of month.`);
          if (cyclePhase === "luteal") {
            insights.actionableTips.push("Progesterone spikes are clogging pores. Tag in a salicylic acid (BHA) cleanser tonight.");
          } else {
            insights.actionableTips.push("Use a gentle pimple patch and avoid picking.");
          }
          break;
          
        case "moisture":
          insights.observations.push(`Skin hydration is ${severity}lower than your baseline.`);
          if (climate === "cold-dry") {
            insights.actionableTips.push("The dry air is sapping your moisture. Swap your lightweight lotion for a thicker ceramide cream.");
          } else {
            insights.actionableTips.push("Layer a hydrating serum (like Hyaluronic Acid) on damp skin before moisturizing.");
          }
          break;

        case "oiliness":
          insights.observations.push(`Sebum production is running ${severity}higher than expected.`);
          if (climate === "hot-humid") {
            insights.actionableTips.push("The humidity is trapping oil. Skip the heavy creams and stick to a gel-based moisturizer today.");
          } else {
            insights.actionableTips.push("Try a niacinamide serum to help regulate sebum production without stripping your skin.");
          }
          break;

        case "redness":
          insights.observations.push(`We are detecting ${severity}more redness and inflammation today.`);
          insights.actionableTips.push("Your skin barrier might be compromised. Skip active exfoliants today and focus on soothing ingredients like Centella or Aloe.");
          break;

        case "texture":
          insights.observations.push(`Skin texture is looking ${severity}rougher than usual.`);
          insights.actionableTips.push("A gentle chemical exfoliant (AHA/PHA) tonight will help smooth out dead skin cells.");
          break;
      }
    } 
    
    if (m.deviation === "notably-above") {
      insights.observations.push(`Your ${m.metric} score is remarkably better than average right now! Keep doing what you're doing.`);
    }
  });

  if (insights.observations.length === 0) {
    insights.observations.push("All your skin metrics are tracking perfectly within normal ranges.");
    insights.actionableTips.push("Stick to your standard, trusted routine today. No wildcards needed.");
  }

  return insights;
}