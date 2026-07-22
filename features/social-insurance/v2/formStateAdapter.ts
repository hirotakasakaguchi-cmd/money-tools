import type {
  AgeGroup,
  InsuranceStatus,
} from "@/features/social-insurance/types";
import type {
  FormFieldPath,
  FormState,
  FormValidationError,
  ScenarioFormState,
} from "@/features/social-insurance/v2/formTypes";
import type {
  ConsultationGoal,
  Scenario,
  ScenarioKey,
  SimulationInput,
  SpouseAllowance,
  SpouseAllowanceStatus,
} from "@/features/social-insurance/v2/types";

export type ParseSimulationFormResult =
  | {
      ok: true;
      value: SimulationInput;
    }
  | {
      ok: false;
      errors: FormValidationError[];
    };

const consultationGoals: readonly ConsultationGoal[] = [
  "compareAnnualTakeHome",
  "checkTakeHomeMaintenance",
  "compareDependentAndInsured",
];

const ageGroups: readonly AgeGroup[] = [
  "under40",
  "age40To64",
  "age65AndOver",
];

const insuranceStatuses: readonly InsuranceStatus[] = [
  "dependent",
  "insured",
];

const spouseAllowanceStatuses: readonly SpouseAllowanceStatus[] = [
  "received",
  "notReceived",
  "unknown",
];

export function parseSimulationForm(
  form: FormState,
): ParseSimulationFormResult {
  const errors: FormValidationError[] = [];
  const goal = parseSelection(
    form.goal,
    consultationGoals,
    "goal",
    "相談目的を選択してください。",
    errors,
  );
  const ageGroup = parseSelection(
    form.ageGroup,
    ageGroups,
    "ageGroup",
    "年齢区分を選択してください。",
    errors,
  );
  const current = parseScenario("current", form.current, errors);
  const proposed = parseScenario("proposed", form.proposed, errors);

  if (!goal || !ageGroup || !current || !proposed || errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      goal,
      ageGroup,
      current,
      proposed,
    },
  };
}

function parseScenario(
  key: ScenarioKey,
  form: ScenarioFormState,
  errors: FormValidationError[],
): Scenario | undefined {
  const hourlyWageYen = parseNumber(
    form.workplace.hourlyWage,
    `${key}.workplace.hourlyWage`,
    "positive",
    errors,
  );
  const weeklyHours = parseNumber(
    form.workplace.weeklyHours,
    `${key}.workplace.weeklyHours`,
    "nonNegative",
    errors,
  );
  const insuranceStatus = parseSelection(
    form.workplace.insuranceStatus,
    insuranceStatuses,
    `${key}.workplace.insuranceStatus`,
    "社会保険の加入状態を選択してください。",
    errors,
  );
  const spouseAllowance = parseSpouseAllowance(key, form, errors);

  if (
    hourlyWageYen === undefined ||
    weeklyHours === undefined ||
    !insuranceStatus ||
    !spouseAllowance
  ) {
    return undefined;
  }

  return {
    key,
    workplaces: [
      {
        id: `${key}-primary`,
        hourlyWageYen,
        weeklyHours,
        insuranceStatus,
      },
    ],
    spouseAllowance,
  };
}

function parseSpouseAllowance(
  key: ScenarioKey,
  form: ScenarioFormState,
  errors: FormValidationError[],
): SpouseAllowance | undefined {
  const status = parseSelection(
    form.spouseAllowance.status,
    spouseAllowanceStatuses,
    `${key}.spouseAllowance.status`,
    "配偶者手当の状態を選択してください。",
    errors,
  );

  if (!status) {
    return undefined;
  }

  if (status === "notReceived") {
    return { status, monthlyAmountYen: 0 };
  }

  const rawAmount = form.spouseAllowance.monthlyAmount;
  if (status === "unknown" && rawAmount.trim() === "") {
    return { status };
  }

  const monthlyAmountYen = parseNumber(
    rawAmount,
    `${key}.spouseAllowance.monthlyAmount`,
    "nonNegative",
    errors,
  );

  if (monthlyAmountYen === undefined) {
    return undefined;
  }

  return { status, monthlyAmountYen };
}

function parseNumber(
  rawValue: string,
  fieldPath: FormFieldPath,
  constraint: "positive" | "nonNegative",
  errors: FormValidationError[],
): number | undefined {
  if (rawValue.trim() === "") {
    errors.push({
      code: "required",
      fieldPath,
      message: "値を入力してください。",
    });
    return undefined;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    errors.push({
      code: "invalidNumber",
      fieldPath,
      message: "有限の数値を入力してください。",
    });
    return undefined;
  }

  if (constraint === "positive" && value <= 0) {
    errors.push({
      code: "mustBePositive",
      fieldPath,
      message: "0より大きい数値を入力してください。",
    });
    return undefined;
  }

  if (constraint === "nonNegative" && value < 0) {
    errors.push({
      code: "mustBeNonNegative",
      fieldPath,
      message: "0以上の数値を入力してください。",
    });
    return undefined;
  }

  return value;
}

function parseSelection<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldPath: FormFieldPath,
  message: string,
  errors: FormValidationError[],
): T | undefined {
  if (!allowedValues.includes(value as T)) {
    errors.push({ code: "required", fieldPath, message });
    return undefined;
  }

  return value as T;
}
