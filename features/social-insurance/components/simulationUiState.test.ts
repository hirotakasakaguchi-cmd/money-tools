import { describe, expect, it } from "vitest";

import {
  initialSimulationUiState,
  submitSimulation,
  updateSimulationForm,
} from "@/features/social-insurance/components/simulationUiState";

describe("simulationUiState", () => {
  it("starts without a displayed execution result", () => {
    expect(initialSimulationUiState.execution).toBeNull();
  });

  it("stores a successful submit result", () => {
    const state = submitSimulation(initialSimulationUiState);

    expect(state.execution?.status).toBe("success");
  });

  it("stores an invalid submit result", () => {
    const invalidState = updateSimulationForm(
      initialSimulationUiState,
      (form) => ({ ...form, goal: "" }),
    );
    const submitted = submitSimulation(invalidState);

    expect(submitted.execution?.status).toBe("invalid");
  });

  it("clears the previous result when form input changes", () => {
    const submitted = submitSimulation(initialSimulationUiState);
    const updated = updateSimulationForm(submitted, (form) => ({
      ...form,
      current: {
        ...form.current,
        workplace: {
          ...form.current.workplace,
          weeklyHours: "25",
        },
      },
    }));

    expect(submitted.execution).not.toBeNull();
    expect(updated.execution).toBeNull();
    expect(updated.form.current.workplace.weeklyHours).toBe("25");
  });
});
