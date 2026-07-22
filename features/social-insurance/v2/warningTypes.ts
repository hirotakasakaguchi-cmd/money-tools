import type { ScenarioKey } from "@/features/social-insurance/v2/types";

export type WarningCode =
  | "insuredUnder20Hours"
  | "dependentLongHours"
  | "dependentAnnualIncomeOver1300000"
  | "spouseAllowanceUnknown";

export type WarningSeverity = "warning" | "info";

export type ValidationWarning = {
  code: WarningCode;
  severity: WarningSeverity;
  scenarioKey: ScenarioKey;
  message: string;
};
