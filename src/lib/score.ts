// Shared colour scale for 0–10 scores so every page grades the same way.
export type ScoreTone = "good" | "fair" | "poor";

export const scoreTone = (score: number | null | undefined): ScoreTone => {
  if (score == null) return "poor";
  if (score >= 8) return "good";
  if (score >= 5) return "fair";
  return "poor";
};

export const toneText: Record<ScoreTone, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  fair: "text-amber-600 dark:text-amber-400",
  poor: "text-red-600 dark:text-red-400",
};

export const toneBadge: Record<ScoreTone, string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  fair: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  poor: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
};

export const toneLabel: Record<ScoreTone, string> = {
  good: "Strong",
  fair: "Solid",
  poor: "Needs work",
};
