import { MONTHS_PER_YEAR } from "@/features/social-insurance/constants";
import type { ScenarioCashFlowResult } from "@/features/social-insurance/v2/resultTypes";
import type { SpouseAllowance } from "@/features/social-insurance/v2/types";

export function calculateSpouseAllowanceAnnual(
  spouseAllowance: SpouseAllowance,
): number | null {
  if (spouseAllowance.status === "unknown") {
    return null;
  }

  if (spouseAllowance.status === "notReceived") {
    return 0;
  }

  return spouseAllowance.monthlyAmountYen * MONTHS_PER_YEAR;
}

export function calculateScenarioCashFlow(
  personalTakeHomeYen: number,
  spouseAllowance: SpouseAllowance,
): ScenarioCashFlowResult {
  const spouseAllowanceAnnualYen =
    calculateSpouseAllowanceAnnual(spouseAllowance);

  return {
    personalTakeHomeYen,
    spouseAllowanceAnnualYen,
    householdCashFlowYen:
      spouseAllowanceAnnualYen === null
        ? null
        : personalTakeHomeYen + spouseAllowanceAnnualYen,
  };
}

export function calculateKnownDifference(
  currentYen: number | null,
  proposedYen: number | null,
): number | null {
  if (currentYen === null || proposedYen === null) {
    return null;
  }

  return proposedYen - currentYen;
}
