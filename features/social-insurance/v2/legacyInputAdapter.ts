import type { SocialInsuranceInput } from "@/features/social-insurance/types";
import type { SimulationInput } from "@/features/social-insurance/v2/types";

/**
 * Converts a v2 simulation into the legacy engine input for personal take-home.
 * Spouse allowance is deliberately excluded and remains a separate v2 concern.
 */
export function toLegacyPersonalTakeHomeInput(
  input: SimulationInput,
): SocialInsuranceInput {
  const currentWorkplace = input.current.workplaces[0];
  const proposedWorkplace = input.proposed.workplaces[0];

  return {
    ageGroup: input.ageGroup,
    current: {
      hourlyWage: currentWorkplace.hourlyWageYen,
      weeklyHours: currentWorkplace.weeklyHours,
      insuranceStatus: currentWorkplace.insuranceStatus,
      hasSpouseAllowance: false,
      spouseAllowanceMonthly: 0,
    },
    future: {
      hourlyWage: proposedWorkplace.hourlyWageYen,
      weeklyHours: proposedWorkplace.weeklyHours,
      insuranceStatus: proposedWorkplace.insuranceStatus,
    },
  };
}
