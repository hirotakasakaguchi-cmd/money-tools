import { calculateV2Simulation } from "@/features/social-insurance/v2/calculateSimulation";
import { createSummaryConclusion } from "@/features/social-insurance/v2/createSummaryConclusion";
import type { FormState } from "@/features/social-insurance/v2/formTypes";
import { parseSimulationForm } from "@/features/social-insurance/v2/formStateAdapter";
import type { SimulationExecutionResult } from "@/features/social-insurance/v2/simulationExecutionTypes";
import { validateSimulation } from "@/features/social-insurance/v2/validateSimulation";

export function executeSimulation(
  formState: FormState,
): SimulationExecutionResult {
  const parsed = parseSimulationForm(formState);

  if (!parsed.ok) {
    return {
      status: "invalid",
      fieldErrors: parsed.errors,
    };
  }

  const input = parsed.value;
  const result = calculateV2Simulation(input);
  const warnings = validateSimulation(input);
  const conclusion = createSummaryConclusion(input.goal, result);

  return {
    status: "success",
    input,
    result,
    warnings,
    conclusion,
  };
}
