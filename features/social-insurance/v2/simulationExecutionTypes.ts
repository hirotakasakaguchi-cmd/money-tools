import type { FormValidationError } from "@/features/social-insurance/v2/formTypes";
import type { SummaryConclusion } from "@/features/social-insurance/v2/conclusionTypes";
import type { SimulationResult } from "@/features/social-insurance/v2/resultTypes";
import type { SimulationInput } from "@/features/social-insurance/v2/types";
import type { ValidationWarning } from "@/features/social-insurance/v2/warningTypes";

export type SimulationExecutionSuccess = {
  readonly status: "success";
  readonly input: SimulationInput;
  readonly result: SimulationResult;
  readonly warnings: readonly ValidationWarning[];
  readonly conclusion: SummaryConclusion;
};

export type SimulationExecutionFailure = {
  readonly status: "invalid";
  readonly fieldErrors: readonly FormValidationError[];
};

export type SimulationExecutionResult =
  | SimulationExecutionSuccess
  | SimulationExecutionFailure;
