import { describe, expect, it } from "vitest";
import {
  getSimulationFocusTarget,
  getSimulationScrollOptions,
} from "@/features/social-insurance/components/simulationFocus";
import {
  initialSimulationUiState,
  submitSimulation,
  updateSimulationForm,
} from "@/features/social-insurance/components/simulationUiState";
import type { SimulationExecutionResult } from "@/features/social-insurance/v2/simulationExecutionTypes";

describe("simulationFocus", () => {
  it("does not select a focus target before a simulation is submitted", () => {
    expect(getSimulationFocusTarget(null)).toBeNull();
  });

  it("selects the result region after a successful simulation", () => {
    const execution = { status: "success" } as SimulationExecutionResult;

    expect(getSimulationFocusTarget(execution)).toEqual({ type: "result" });
  });

  it("selects the first field error after an invalid simulation", () => {
    const execution: SimulationExecutionResult = {
      status: "invalid",
      fieldErrors: [
        {
          code: "required",
          fieldPath: "current.workplace.hourlyWage",
          message: "現在の時給を入力してください。",
        },
        {
          code: "required",
          fieldPath: "proposed.workplace.weeklyHours",
          message: "変更後の週労働時間を入力してください。",
        },
      ],
    };

    expect(getSimulationFocusTarget(execution)).toEqual({
      type: "field",
      fieldPath: "current.workplace.hourlyWage",
    });
  });

  it("does not select a field when an invalid result has no errors", () => {
    const execution: SimulationExecutionResult = {
      status: "invalid",
      fieldErrors: [],
    };

    expect(getSimulationFocusTarget(execution)).toBeNull();
  });

  it("uses smooth scrolling under the default motion preference", () => {
    expect(getSimulationScrollOptions(false)).toEqual({
      behavior: "smooth",
      block: "start",
    });
  });

  it("uses automatic scrolling when reduced motion is preferred", () => {
    expect(getSimulationScrollOptions(true)).toEqual({
      behavior: "auto",
      block: "start",
    });
  });

  it("does not select a target when editing clears a submitted result", () => {
    const submitted = submitSimulation(initialSimulationUiState);
    const edited = updateSimulationForm(submitted, (form) => ({
      ...form,
      goal: "checkTakeHomeMaintenance",
    }));

    expect(getSimulationFocusTarget(edited.execution)).toBeNull();
  });

  it("selects a target again for every subsequent submit", () => {
    const firstSuccess = submitSimulation(initialSimulationUiState);
    const secondSuccess = submitSimulation(firstSuccess);
    const invalidForm = updateSimulationForm(secondSuccess, (form) => ({
      ...form,
      goal: "",
    }));
    const firstInvalid = submitSimulation(invalidForm);
    const secondInvalid = submitSimulation(firstInvalid);

    expect(secondSuccess.execution).not.toBe(firstSuccess.execution);
    expect(getSimulationFocusTarget(secondSuccess.execution)).toEqual({
      type: "result",
    });
    expect(secondInvalid.execution).not.toBe(firstInvalid.execution);
    expect(getSimulationFocusTarget(secondInvalid.execution)).toEqual({
      type: "field",
      fieldPath: "goal",
    });
  });
});
