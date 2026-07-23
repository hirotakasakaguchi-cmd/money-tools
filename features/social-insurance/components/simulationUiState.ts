import { executeSimulation } from "@/features/social-insurance/v2/executeSimulation";
import { parseSimulationForm } from "@/features/social-insurance/v2/formStateAdapter";
import type { FormState } from "@/features/social-insurance/v2/formTypes";
import type { SimulationExecutionResult } from "@/features/social-insurance/v2/simulationExecutionTypes";
import type { AgeGroup } from "@/features/social-insurance/types";
import { calculateR8AnnualSalaryYen } from "@/features/social-insurance/r8/scenarioAdapter";
import { executeR8SimulationInternal } from "@/features/social-insurance/r8/v2/executeR8SimulationInternal";
import type {
  R8InternalSimulationSuccess,
  R8InternalSimulationUnsupported,
} from "@/features/social-insurance/r8/v2/r8SimulationTypes";
import type {
  FormFieldPath,
  FormValidationErrorCode,
} from "@/features/social-insurance/v2/formTypes";

export const initialFormState: FormState = {
  goal: "compareAnnualTakeHome",
  ageGroup: "under40",
  current: {
    workplace: {
      hourlyWage: "1000",
      weeklyHours: "20",
      insuranceStatus: "dependent",
    },
    spouseAllowance: {
      status: "notReceived",
      monthlyAmount: "10000",
    },
  },
  proposed: {
    workplace: {
      hourlyWage: "1000",
      weeklyHours: "30",
      insuranceStatus: "insured",
    },
    spouseAllowance: {
      status: "notReceived",
      monthlyAmount: "",
    },
  },
};

export type SimulationCalculationYear = "r7" | "r8";

export type SimulationUiFieldPath =
  | FormFieldPath
  | "age"
  | "current.monthlyRemuneration"
  | "proposed.monthlyRemuneration";

export type SimulationUiFieldError = {
  readonly code: FormValidationErrorCode;
  readonly fieldPath: SimulationUiFieldPath;
  readonly message: string;
};

export type SimulationUiExecution =
  | Extract<SimulationExecutionResult, { status: "success" }>
  | {
      readonly status: "r8Success";
      readonly execution: R8InternalSimulationSuccess;
    }
  | {
      readonly status: "r8Unsupported";
      readonly execution: R8InternalSimulationUnsupported;
    }
  | {
      readonly status: "invalid";
      readonly fieldErrors: readonly SimulationUiFieldError[];
    };

export type SimulationUiState = {
  readonly form: FormState;
  readonly calculationYear: SimulationCalculationYear;
  readonly age: string;
  readonly currentMonthlyRemuneration: string;
  readonly proposedMonthlyRemuneration: string;
  readonly execution: SimulationUiExecution | null;
};

export const initialSimulationUiState: SimulationUiState = {
  form: initialFormState,
  calculationYear: "r7",
  age: "39",
  currentMonthlyRemuneration: "",
  proposedMonthlyRemuneration: "",
  execution: null,
};

export function updateSimulationForm(
  state: SimulationUiState,
  update: (form: FormState) => FormState,
): SimulationUiState {
  return {
    ...state,
    form: update(state.form),
    execution: null,
  };
}

export function updateSimulationCalculationYear(
  state: SimulationUiState,
  calculationYear: SimulationCalculationYear,
): SimulationUiState {
  return {
    ...state,
    calculationYear,
    execution: null,
  };
}

export function updateSimulationAge(
  state: SimulationUiState,
  age: string,
): SimulationUiState {
  return {
    ...state,
    age,
    execution: null,
  };
}

export function updateSimulationMonthlyRemuneration(
  state: SimulationUiState,
  scenario: "current" | "proposed",
  monthlyRemuneration: string,
): SimulationUiState {
  return {
    ...state,
    [scenario === "current"
      ? "currentMonthlyRemuneration"
      : "proposedMonthlyRemuneration"]: monthlyRemuneration,
    execution: null,
  };
}

export function submitSimulation(
  state: SimulationUiState,
): SimulationUiState {
  const ageResult = parseNonNegativeSafeInteger(
    state.age,
    "age",
    "実年齢を整数で入力してください。",
  );

  if (!ageResult.ok) {
    return {
      ...state,
      execution: {
        status: "invalid",
        fieldErrors: [ageResult.error],
      },
    };
  }

  const form = {
    ...state.form,
    ageGroup: toAgeGroup(ageResult.value),
  } satisfies FormState;

  if (state.calculationYear === "r7") {
    const execution = executeSimulation(form);

    return {
      ...state,
      form,
      execution,
    };
  }

  const parsedForm = parseSimulationForm(form);
  const currentMonthlyRemuneration = parseNonNegativeSafeInteger(
    state.currentMonthlyRemuneration,
    "current.monthlyRemuneration",
    "現在の月額報酬を整数円で入力してください。",
  );
  const proposedMonthlyRemuneration = parseNonNegativeSafeInteger(
    state.proposedMonthlyRemuneration,
    "proposed.monthlyRemuneration",
    "変更後の月額報酬を整数円で入力してください。",
  );
  const fieldErrors: SimulationUiFieldError[] = [
    ...(parsedForm.ok ? [] : parsedForm.errors),
    ...(currentMonthlyRemuneration.ok
      ? []
      : [currentMonthlyRemuneration.error]),
    ...(proposedMonthlyRemuneration.ok
      ? []
      : [proposedMonthlyRemuneration.error]),
  ];

  if (
    !parsedForm.ok ||
    !currentMonthlyRemuneration.ok ||
    !proposedMonthlyRemuneration.ok
  ) {
    return {
      ...state,
      form,
      execution: {
        status: "invalid",
        fieldErrors,
      },
    };
  }

  const salaryErrors = [
    validateR8AnnualSalary(
      parsedForm.value.current.workplaces[0].hourlyWageYen,
      parsedForm.value.current.workplaces[0].weeklyHours,
      "current.workplace.hourlyWage",
    ),
    validateR8AnnualSalary(
      parsedForm.value.proposed.workplaces[0].hourlyWageYen,
      parsedForm.value.proposed.workplaces[0].weeklyHours,
      "proposed.workplace.hourlyWage",
    ),
  ].filter((error): error is SimulationUiFieldError => error !== null);

  if (salaryErrors.length > 0) {
    return {
      ...state,
      form,
      execution: {
        status: "invalid",
        fieldErrors: salaryErrors,
      },
    };
  }

  const execution = executeR8SimulationInternal({
    goal: parsedForm.value.goal,
    age: ageResult.value,
    current: {
      hourlyWageYen:
        parsedForm.value.current.workplaces[0].hourlyWageYen,
      weeklyHours: parsedForm.value.current.workplaces[0].weeklyHours,
      monthlyRemunerationYen: currentMonthlyRemuneration.value,
      enrollmentStatus:
        parsedForm.value.current.workplaces[0].insuranceStatus,
      spouseAllowance: parsedForm.value.current.spouseAllowance,
    },
    proposed: {
      hourlyWageYen:
        parsedForm.value.proposed.workplaces[0].hourlyWageYen,
      weeklyHours: parsedForm.value.proposed.workplaces[0].weeklyHours,
      monthlyRemunerationYen: proposedMonthlyRemuneration.value,
      enrollmentStatus:
        parsedForm.value.proposed.workplaces[0].insuranceStatus,
      spouseAllowance: parsedForm.value.proposed.spouseAllowance,
    },
  });

  return {
    ...state,
    form,
    execution: execution.supported
      ? {
          status: "r8Success",
          execution,
        }
      : {
          status: "r8Unsupported",
          execution,
        },
  };
}

function toAgeGroup(age: number): AgeGroup {
  if (age < 40) {
    return "under40";
  }

  if (age < 65) {
    return "age40To64";
  }

  return "age65AndOver";
}

type ParsedInteger =
  | { readonly ok: true; readonly value: number }
  | { readonly ok: false; readonly error: SimulationUiFieldError };

function parseNonNegativeSafeInteger(
  rawValue: string,
  fieldPath: SimulationUiFieldPath,
  invalidMessage: string,
): ParsedInteger {
  if (rawValue.trim() === "") {
    return {
      ok: false,
      error: {
        code: "required",
        fieldPath,
        message: "値を入力してください。",
      },
    };
  }

  const value = Number(rawValue);
  if (!Number.isSafeInteger(value) || value < 0) {
    return {
      ok: false,
      error: {
        code: value < 0 ? "mustBeNonNegative" : "invalidNumber",
        fieldPath,
        message: invalidMessage,
      },
    };
  }

  return { ok: true, value };
}

function validateR8AnnualSalary(
  hourlyWageYen: number,
  weeklyHours: number,
  fieldPath:
    | "current.workplace.hourlyWage"
    | "proposed.workplace.hourlyWage",
): SimulationUiFieldError | null {
  try {
    calculateR8AnnualSalaryYen({ hourlyWageYen, weeklyHours });
    return null;
  } catch (error) {
    if (!(error instanceof RangeError)) {
      throw error;
    }

    return {
      code: "invalidNumber",
      fieldPath,
      message: "計算できる範囲の時給と週労働時間を入力してください。",
    };
  }
}
