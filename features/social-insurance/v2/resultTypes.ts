import type { SocialInsuranceResult } from "@/features/social-insurance/types";

export type ScenarioCashFlowResult = {
  personalTakeHomeYen: number;
  spouseAllowanceAnnualYen: number | null;
  householdCashFlowYen: number | null;
};

export type SimulationResult = {
  current: ScenarioCashFlowResult;
  proposed: ScenarioCashFlowResult;
  personalTakeHomeDifferenceYen: number;
  spouseAllowanceDifferenceYen: number | null;
  householdDifferenceYen: number | null;
  legacyCalculation: SocialInsuranceResult;
};
