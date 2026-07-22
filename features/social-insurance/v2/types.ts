import type {
  AgeGroup,
  InsuranceStatus,
} from "@/features/social-insurance/types";

export type ConsultationGoal =
  | "compareAnnualTakeHome"
  | "checkTakeHomeMaintenance"
  | "compareDependentAndInsured";

export type ScenarioKey = "current" | "proposed";

export type SimulationInput = {
  goal: ConsultationGoal;
  ageGroup: AgeGroup;
  current: Scenario;
  proposed: Scenario;
};

export type Scenario = {
  key: ScenarioKey;
  workplaces: readonly [Workplace];
  spouseAllowance: SpouseAllowance;
};

export type Workplace = {
  id: string;
  hourlyWageYen: number;
  weeklyHours: number;
  insuranceStatus: InsuranceStatus;
};

export type SpouseAllowanceStatus =
  | "received"
  | "notReceived"
  | "unknown";

export type SpouseAllowance =
  | {
      status: "received";
      monthlyAmountYen: number;
    }
  | {
      status: "notReceived";
      monthlyAmountYen: 0;
    }
  | {
      status: "unknown";
      monthlyAmountYen?: number;
    };
