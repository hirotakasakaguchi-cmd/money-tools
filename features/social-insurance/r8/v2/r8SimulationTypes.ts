import type { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import type { R8AnnualNetIncomeResult } from "@/features/social-insurance/r8/annualNetIncomeTypes";
import type {
  R8EnrollmentStatus,
  R8ScenarioUnsupportedReason,
} from "@/features/social-insurance/r8/scenarioAdapter";
import type { SummaryConclusion } from "@/features/social-insurance/v2/conclusionTypes";
import type { ConsultationGoal } from "@/features/social-insurance/v2/types";
import type { ValidationWarning } from "@/features/social-insurance/v2/warningTypes";

export type R8InternalSpouseAllowance =
  | {
      readonly status: "received";
      readonly monthlyAmountYen: number;
    }
  | {
      readonly status: "notReceived";
      readonly monthlyAmountYen: 0;
    }
  | {
      readonly status: "unknown";
      readonly monthlyAmountYen?: number;
    };

export type R8InternalSimulationScenarioInput = {
  readonly hourlyWageYen: number;
  readonly weeklyHours: number;
  readonly monthlyRemunerationYen: number;
  readonly enrollmentStatus: R8EnrollmentStatus;
  readonly spouseAllowance: R8InternalSpouseAllowance;
};

export type R8InternalSimulationInput = {
  readonly goal: ConsultationGoal;
  readonly age: number;
  readonly current: R8InternalSimulationScenarioInput;
  readonly proposed: R8InternalSimulationScenarioInput;
};

export type R8InternalSimulationSuccess = {
  readonly supported: true;
  readonly policy: "r8";
  readonly current: R8AnnualNetIncomeResult;
  readonly proposed: R8AnnualNetIncomeResult;
  readonly personalTakeHomeDifferenceYen: number;
  readonly spouseAllowanceDifferenceYen: number | null;
  readonly householdDifferenceYen: number | null;
  readonly warnings: readonly ValidationWarning[];
  readonly conclusion: SummaryConclusion;
  readonly calculationMode: typeof R8_POLICY.calculationMode;
};

export type R8InternalSimulationUnsupported = {
  readonly supported: false;
  readonly policy: "r8";
  readonly unsupportedReason: R8ScenarioUnsupportedReason;
};

export type R8InternalSimulationResult =
  | R8InternalSimulationSuccess
  | R8InternalSimulationUnsupported;
