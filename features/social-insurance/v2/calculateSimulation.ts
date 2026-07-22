import { calculateSocialInsurance } from "@/features/social-insurance/calculateSocialInsurance";
import {
  calculateKnownDifference,
  calculateScenarioCashFlow,
} from "@/features/social-insurance/v2/calculateHouseholdCashFlow";
import { toLegacyPersonalTakeHomeInput } from "@/features/social-insurance/v2/legacyInputAdapter";
import type { SimulationResult } from "@/features/social-insurance/v2/resultTypes";
import type { SimulationInput } from "@/features/social-insurance/v2/types";

export function calculateV2Simulation(
  input: SimulationInput,
): SimulationResult {
  const legacyCalculation = calculateSocialInsurance(
    toLegacyPersonalTakeHomeInput(input),
  );
  const current = calculateScenarioCashFlow(
    legacyCalculation.current.takeHomePay,
    input.current.spouseAllowance,
  );
  const proposed = calculateScenarioCashFlow(
    legacyCalculation.future.takeHomePay,
    input.proposed.spouseAllowance,
  );

  return {
    current,
    proposed,
    personalTakeHomeDifferenceYen:
      proposed.personalTakeHomeYen - current.personalTakeHomeYen,
    spouseAllowanceDifferenceYen: calculateKnownDifference(
      current.spouseAllowanceAnnualYen,
      proposed.spouseAllowanceAnnualYen,
    ),
    householdDifferenceYen: calculateKnownDifference(
      current.householdCashFlowYen,
      proposed.householdCashFlowYen,
    ),
    legacyCalculation,
  };
}
