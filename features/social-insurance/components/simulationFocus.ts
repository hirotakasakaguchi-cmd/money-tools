import type {
  SimulationUiExecution,
  SimulationUiFieldPath,
} from "@/features/social-insurance/components/simulationUiState";

export type SimulationFocusTarget =
  | { readonly type: "result" }
  | { readonly type: "field"; readonly fieldPath: SimulationUiFieldPath }
  | null;

export function getSimulationFocusTarget(
  execution: SimulationUiExecution | null,
): SimulationFocusTarget {
  if (execution === null) {
    return null;
  }

  if (
    execution.status === "success" ||
    execution.status === "r8Success" ||
    execution.status === "r8Unsupported"
  ) {
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
