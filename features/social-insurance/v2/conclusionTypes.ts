import type { ConsultationGoal } from "@/features/social-insurance/v2/types";

export type SimulationGoal = ConsultationGoal;

export type SummaryConclusionTone = "positive" | "neutral" | "caution";

export type SummaryConclusion = {
  goal: SimulationGoal;
  tone: SummaryConclusionTone;
  headline: string;
  detail: string;
};
