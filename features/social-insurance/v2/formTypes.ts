import type {
  AgeGroup,
  InsuranceStatus,
} from "@/features/social-insurance/types";
import type {
  ConsultationGoal,
  ScenarioKey,
  SpouseAllowanceStatus,
} from "@/features/social-insurance/v2/types";

export type FormState = {
  goal: ConsultationGoal | "";
  ageGroup: AgeGroup | "";
  current: ScenarioFormState;
  proposed: ScenarioFormState;
};

export type ScenarioFormState = {
  workplace: WorkplaceFormState;
  spouseAllowance: SpouseAllowanceFormState;
};

export type WorkplaceFormState = {
  hourlyWage: string;
  weeklyHours: string;
  insuranceStatus: InsuranceStatus | "";
};

export type SpouseAllowanceFormState = {
  status: SpouseAllowanceStatus | "";
  monthlyAmount: string;
};

export type FormFieldPath =
  | "goal"
  | "ageGroup"
  | `${ScenarioKey}.workplace.hourlyWage`
  | `${ScenarioKey}.workplace.weeklyHours`
  | `${ScenarioKey}.workplace.insuranceStatus`
  | `${ScenarioKey}.spouseAllowance.status`
  | `${ScenarioKey}.spouseAllowance.monthlyAmount`;

export type FormValidationErrorCode =
  | "required"
  | "invalidNumber"
  | "mustBePositive"
  | "mustBeNonNegative";

export type FormValidationError = {
  code: FormValidationErrorCode;
  fieldPath: FormFieldPath;
  message: string;
};
