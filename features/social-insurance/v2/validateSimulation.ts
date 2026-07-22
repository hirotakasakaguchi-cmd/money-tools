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
      severity: "info",
      scope: scenario.key,
      fieldPaths: [
        `${scenario.key}.workplace.weeklyHours`,
        `${scenario.key}.workplace.insuranceStatus`,
      ],
      message:
        "週20時間未満で社会保険加入を選択しています。勤務先への確認が必要な可能性があります。",
      recommendedAction: "勤務先へ社会保険の加入条件を確認してください。",
    });
  }

  if (
    workplace.insuranceStatus === "dependent" &&
    workplace.weeklyHours >= LONG_HOURS_CONFIRMATION_THRESHOLD
  ) {
    warnings.push({
      code: "dependentLongHours",
      severity: "warning",
      scope: scenario.key,
      fieldPaths: [
        `${scenario.key}.workplace.weeklyHours`,
        `${scenario.key}.workplace.insuranceStatus`,
      ],
      message:
        "週37.5時間以上で扶養内を選択しています。勤務先または加入先への確認が必要な可能性があります。",
      recommendedAction: "勤務先へ社会保険の加入状況を確認してください。",
    });
  }

  if (
    workplace.insuranceStatus === "dependent" &&
    estimatedAnnualIncomeYen > DEPENDENT_INCOME_CONFIRMATION_THRESHOLD_YEN
  ) {
    warnings.push({
      code: "dependentAnnualIncomeOver1300000",
      severity: "warning",
      scope: scenario.key,
      fieldPaths: [
        `${scenario.key}.workplace.hourlyWage`,
        `${scenario.key}.workplace.weeklyHours`,
        `${scenario.key}.workplace.insuranceStatus`,
      ],
      message:
        "推計年収が130万円を超える条件で扶養内を選択しています。勤務先または加入先への確認が必要な可能性があります。",
      recommendedAction:
        "配偶者の健康保険の加入先へ扶養条件を確認してください。",
    });
  }

  if (scenario.spouseAllowance.status === "unknown") {
    warnings.push({
      code: "spouseAllowanceUnknown",
      severity: "info",
      scope: scenario.key,
      fieldPaths: [`${scenario.key}.spouseAllowance.status`],
      message:
        "配偶者手当の受給状態が不明なため、世帯の現金収支差を確定できません。配偶者の勤務先への確認が必要です。",
      recommendedAction:
        "配偶者の勤務先へ手当の支給条件を確認してください。",
    });
  }

  return warnings;
}
