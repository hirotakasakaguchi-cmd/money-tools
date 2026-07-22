import { executeSimulation } from "@/features/social-insurance/v2/executeSimulation";
import type { FormState } from "@/features/social-insurance/v2/formTypes";
import type { SimulationExecutionResult } from "@/features/social-insurance/v2/simulationExecutionTypes";

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

export type SimulationUiState = {
  readonly form: FormState;
  readonly execution: SimulationExecutionResult | null;
};

export const initialSimulationUiState: SimulationUiState = {
  form: initialFormState,
  execution: null,
};

export function updateSimulationForm(
  state: SimulationUiState,
  update: (form: FormState) => FormState,
): SimulationUiState {
  return {
    form: update(state.form),
    execution: null,
  };
}

export function submitSimulation(
  state: SimulationUiState,
): SimulationUiState {
  return {
    form: state.form,
    execution: executeSimulation(state.form),
  };
}
