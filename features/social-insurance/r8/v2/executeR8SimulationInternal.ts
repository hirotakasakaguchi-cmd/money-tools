import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import { calculateR8AnnualNetIncome } from "@/features/social-insurance/r8/calculateR8AnnualNetIncome";
import {
  calculateR8AnnualSalaryYen,
  createR8ScenarioCalculationContext,
  type R8ScenarioCalculationContext,
} from "@/features/social-insurance/r8/scenarioAdapter";
import type {
  R8InternalSimulationInput,
  R8InternalSimulationResult,
  R8InternalSimulationScenarioInput,
} from "@/features/social-insurance/r8/v2/r8SimulationTypes";
import {
  calculateKnownDifference,
  calculateScenarioCashFlow,
} from "@/features/social-insurance/v2/calculateHouseholdCashFlow";
import { createSummaryConclusion } from "@/features/social-insurance/v2/createSummaryConclusion";
import type {
  Scenario,
  ScenarioKey,
} from "@/features/social-insurance/v2/types";
import { validateSimulation } from "@/features/social-insurance/v2/validateSimulation";

/**
 * Executes the unpublished R8 v2 calculation path.
 *
 * This entry point is intentionally disconnected from executeSimulation(),
 * the public UI, and public routes while the R8 policy remains inactive.
 */
export function executeR8SimulationInternal(
  input: R8InternalSimulationInput,
): R8InternalSimulationResult {
  const currentContext = createScenarioContext(
    input.current,
    input.age,
  );

  if (!currentContext.supported) {
    return {
      supported: false,
      policy: "r8",
      unsupportedReason: currentContext.unsupportedReason,
    };
  }

  const proposedContext = createScenarioContext(
    input.proposed,
    input.age,
  );

  if (!proposedContext.supported) {
    return {
      supported: false,
      policy: "r8",
      unsupportedReason: proposedContext.unsupportedReason,
    };
  }

  const current = calculateR8AnnualNetIncome({
    annualSalaryYen: currentContext.annualSalaryYen,
    employeeContribution: currentContext.employeeContribution,
  });
  const proposed = calculateR8AnnualNetIncome({
    annualSalaryYen: proposedContext.annualSalaryYen,
    employeeContribution: proposedContext.employeeContribution,
  });
  const currentCashFlow = calculateScenarioCashFlow(
    current.annualNetIncomeYen,
    input.current.spouseAllowance,
  );
  const proposedCashFlow = calculateScenarioCashFlow(
    proposed.annualNetIncomeYen,
    input.proposed.spouseAllowance,
  );
  const personalTakeHomeDifferenceYen =
    proposed.annualNetIncomeYen - current.annualNetIncomeYen;
  const spouseAllowanceDifferenceYen = calculateKnownDifference(
    currentCashFlow.spouseAllowanceAnnualYen,
    proposedCashFlow.spouseAllowanceAnnualYen,
  );
  const householdDifferenceYen = calculateKnownDifference(
    currentCashFlow.householdCashFlowYen,
    proposedCashFlow.householdCashFlowYen,
  );
  const warningInput = {
    current: toV2Scenario("current", input.current),
    proposed: toV2Scenario("proposed", input.proposed),
  };
  const warnings = validateSimulation(warningInput);
  const conclusionInput = {
    personalTakeHomeDifferenceYen,
    householdDifferenceYen,
  };
  const conclusion = createSummaryConclusion(input.goal, conclusionInput);

  return {
    supported: true,
    policy: "r8",
    current,
    proposed,
    personalTakeHomeDifferenceYen,
    spouseAllowanceDifferenceYen,
    householdDifferenceYen,
    warnings,
    conclusion,
    calculationMode: R8_POLICY.calculationMode,
  };
}

function createScenarioContext(
  scenario: R8InternalSimulationScenarioInput,
  age: number,
): R8ScenarioCalculationContext {
  const annualSalaryYen = calculateR8AnnualSalaryYen({
    hourlyWageYen: scenario.hourlyWageYen,
    weeklyHours: scenario.weeklyHours,
  });

  return createR8ScenarioCalculationContext({
    annualSalaryYen,
    monthlyRemunerationYen: scenario.monthlyRemunerationYen,
    age,
    enrollmentStatus: scenario.enrollmentStatus,
  });
}

function toV2Scenario(
  key: ScenarioKey,
  scenario: R8InternalSimulationScenarioInput,
): Scenario {
  return {
    key,
    workplaces: [
      {
        id: `r8-${key}`,
        hourlyWageYen: scenario.hourlyWageYen,
        weeklyHours: scenario.weeklyHours,
        insuranceStatus: scenario.enrollmentStatus,
      },
    ],
    spouseAllowance: { ...scenario.spouseAllowance },
  };
}
