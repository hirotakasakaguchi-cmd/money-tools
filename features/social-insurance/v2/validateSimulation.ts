import { WORK_WEEKS_PER_YEAR } from "@/features/social-insurance/constants";
import type {
  Scenario,
  SimulationInput,
} from "@/features/social-insurance/v2/types";
import type { ValidationWarning } from "@/features/social-insurance/v2/warningTypes";

const INSURED_HOURS_CONFIRMATION_THRESHOLD = 20;
const LONG_HOURS_CONFIRMATION_THRESHOLD = 37.5;
const DEPENDENT_INCOME_CONFIRMATION_THRESHOLD_YEN = 1_300_000;

export function validateSimulation(
  input: SimulationInput,
): ValidationWarning[] {
  return [input.current, input.proposed].flatMap(validateScenario);
}

function validateScenario(scenario: Scenario): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const workplace = scenario.workplaces[0];
  const estimatedAnnualIncomeYen =
    workplace.hourlyWageYen *
    workplace.weeklyHours *
    WORK_WEEKS_PER_YEAR;

  if (
    workplace.insuranceStatus === "insured" &&
    workplace.weeklyHours < INSURED_HOURS_CONFIRMATION_THRESHOLD
  ) {
    warnings.push({
      code: "insuredUnder20Hours",
      severity: "warning",
      scenarioKey: scenario.key,
      message:
        "週20時間未満で社会保険加入を選択しています。勤務先への確認が必要な可能性があります。",
    });
  }

  if (
    workplace.insuranceStatus === "dependent" &&
    workplace.weeklyHours >= LONG_HOURS_CONFIRMATION_THRESHOLD
  ) {
    warnings.push({
      code: "dependentLongHours",
      severity: "warning",
      scenarioKey: scenario.key,
      message:
        "週37.5時間以上で扶養内を選択しています。勤務先または加入先への確認が必要な可能性があります。",
    });
  }

  if (
    workplace.insuranceStatus === "dependent" &&
    estimatedAnnualIncomeYen > DEPENDENT_INCOME_CONFIRMATION_THRESHOLD_YEN
  ) {
    warnings.push({
      code: "dependentAnnualIncomeOver1300000",
      severity: "warning",
      scenarioKey: scenario.key,
      message:
        "推計年収が130万円を超える条件で扶養内を選択しています。勤務先または加入先への確認が必要な可能性があります。",
    });
  }

  if (scenario.spouseAllowance.status === "unknown") {
    warnings.push({
      code: "spouseAllowanceUnknown",
      severity: "info",
      scenarioKey: scenario.key,
      message:
        "配偶者手当の受給状態が不明です。勤務先への確認が必要な可能性があります。",
    });
  }

  return warnings;
}
