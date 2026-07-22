import type { FormFieldPath } from "@/features/social-insurance/v2/formTypes";
import type { SimulationExecutionResult } from "@/features/social-insurance/v2/simulationExecutionTypes";

export type SimulationFocusTarget =
  | { readonly type: "result" }
  | { readonly type: "field"; readonly fieldPath: FormFieldPath }
  | null;

export function getSimulationFocusTarget(
  execution: SimulationExecutionResult | null,
): SimulationFocusTarget {
  if (execution === null) {
    return null;
  }

  if (execution.status === "success") {
    return { type: "result" };
  }

  const firstError = execution.fieldErrors[0];

  return firstError
    ? { type: "field", fieldPath: firstError.fieldPath }
    : null;
}

export function getSimulationScrollOptions(
  prefersReducedMotion: boolean,
): ScrollIntoViewOptions {
  return {
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  };
}
