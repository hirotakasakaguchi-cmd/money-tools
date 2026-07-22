import { describe, expect, it } from "vitest";

import {
  getSimulationFocusTarget,
  getSimulationScrollOptions,
} from "@/features/social-insurance/components/simulationFocus";
import {
  formatOptionalSignedYen,
  formatOptionalYen,
} from "@/features/social-insurance/components/simulationResultFormatters";
import {
  initialSimulationUiState,
  submitSimulation,
  updateSimulationForm,
} from "@/features/social-insurance/components/simulationUiState";
import { createSimulationWarningDisplayItems } from "@/features/social-insurance/components/simulationWarningPresentation";
import type { FormState } from "@/features/social-insurance/v2/formTypes";
import type { ConsultationGoal } from "@/features/social-insurance/v2/types";

function updateForm(
  state: typeof initialSimulationUiState,
  update: (form: FormState) => FormState,
) {
  return updateSimulationForm(state, update);
}

describe("social insurance Phase 1 integration", () => {
  it("starts with a valid form and no execution to display or focus", () => {
    expect(initialSimulationUiState.form.goal).toBe(
      "compareAnnualTakeHome",
    );
    expect(initialSimulationUiState.form.current.workplace.hourlyWage).toBe(
      "1000",
    );
    expect(initialSimulationUiState.form.proposed.workplace.weeklyHours).toBe(
      "30",
    );
    expect(initialSimulationUiState.execution).toBeNull();
    expect(getSimulationFocusTarget(initialSimulationUiState.execution)).toBeNull();
  });

  it("runs the complete success flow and retains legacy detail values", () => {
    const submitted = submitSimulation(initialSimulationUiState);

    expect(submitted.execution?.status).toBe("success");
    if (submitted.execution?.status !== "success") return;

    const { result, conclusion, warnings, input } = submitted.execution;
    const legacy = result.legacyCalculation;

    expect(input.current.workplaces).toHaveLength(1);
    expect(input.proposed.workplaces).toHaveLength(1);
    expect(typeof result.personalTakeHomeDifferenceYen).toBe("number");
    expect(result.spouseAllowanceDifferenceYen).toSatisfy(
      (value: number | null) => value === null || typeof value === "number",
    );
    expect(result.householdDifferenceYen).toSatisfy(
      (value: number | null) => value === null || typeof value === "number",
    );
    expect(conclusion.goal).toBe(input.goal);
    expect(conclusion.headline).not.toBe("");
    expect(conclusion.detail).not.toBe("");
    expect(warnings).toEqual(expect.any(Array));

    expect(legacy.current.standardMonthlyRemuneration).toEqual(
      expect.objectContaining({
        healthInsurance: expect.any(Number),
        employeePension: expect.any(Number),
      }),
    );
    expect(legacy.future.standardMonthlyRemuneration).toEqual(
      expect.objectContaining({
        healthInsurance: expect.any(Number),
        employeePension: expect.any(Number),
      }),
    );
    expect(legacy.increasedAnnualHours).toEqual(expect.any(Number));
    expect(
      legacy.cashReturnPerIncreasedHour === null ||
        typeof legacy.cashReturnPerIncreasedHour === "number",
    ).toBe(true);
    expect(legacy.pensionAnnualIncreaseDifference).toEqual(expect.any(Number));
    expect(legacy.pensionTotalReturnToAge90).toEqual(expect.any(Number));
    expect(legacy.comments).toEqual(expect.any(Array));
    expect(getSimulationFocusTarget(submitted.execution)).toEqual({
      type: "result",
    });
  });

  it("short-circuits invalid input and targets the first field error", () => {
    const edited = updateForm(initialSimulationUiState, (form) => ({
      ...form,
      goal: "",
      current: {
        ...form.current,
        workplace: {
          ...form.current.workplace,
          hourlyWage: "",
        },
      },
    }));
    const submitted = submitSimulation(edited);

    expect(submitted.execution).toEqual({
      status: "invalid",
      fieldErrors: expect.any(Array),
    });
    if (submitted.execution?.status !== "invalid") return;

    expect(submitted.execution.fieldErrors[0]?.fieldPath).toBe("goal");
    expect("result" in submitted.execution).toBe(false);
    expect("warnings" in submitted.execution).toBe(false);
    expect("conclusion" in submitted.execution).toBe(false);
    expect(getSimulationFocusTarget(submitted.execution)).toEqual({
      type: "field",
      fieldPath: "goal",
    });
  });

  it("keeps unknown allowance distinct from zero through result, UI text, warning, and conclusion", () => {
    const edited = updateForm(initialSimulationUiState, (form) => ({
      ...form,
      goal: "compareDependentAndInsured",
      proposed: {
        ...form.proposed,
        spouseAllowance: {
          status: "unknown",
          monthlyAmount: "5000",
        },
      },
    }));
    const submitted = submitSimulation(edited);

    expect(submitted.execution?.status).toBe("success");
    if (submitted.execution?.status !== "success") return;

    expect(typeof submitted.execution.result.personalTakeHomeDifferenceYen).toBe(
      "number",
    );
    expect(
      submitted.execution.result.proposed.spouseAllowanceAnnualYen,
    ).toBeNull();
    expect(submitted.execution.result.proposed.householdCashFlowYen).toBeNull();
    expect(submitted.execution.result.spouseAllowanceDifferenceYen).toBeNull();
    expect(submitted.execution.result.householdDifferenceYen).toBeNull();
    expect(formatOptionalYen(null)).toBe("未確認");
    expect(formatOptionalSignedYen(null)).toBe("未確認");
    expect(formatOptionalYen(0)).toBe("0円");
    expect(submitted.execution.conclusion.tone).toBe("neutral");
    expect(submitted.execution.conclusion.headline).toContain("確定できません");
    expect(
      submitted.execution.warnings.some(
        ({ code, scope }) =>
          code === "spouseAllowanceUnknown" && scope === "proposed",
      ),
    ).toBe(true);
    expect(getSimulationFocusTarget(submitted.execution)).toEqual({
      type: "result",
    });
  });

  it("keeps all four confirmation rules non-blocking and presentation order stable", () => {
    const edited = updateForm(initialSimulationUiState, (form) => ({
      ...form,
      current: {
        workplace: {
          hourlyWage: "1000",
          weeklyHours: "40",
          insuranceStatus: "dependent",
        },
        spouseAllowance: { status: "unknown", monthlyAmount: "" },
      },
      proposed: {
        workplace: {
          hourlyWage: "1400",
          weeklyHours: "19",
          insuranceStatus: "insured",
        },
        spouseAllowance: { status: "unknown", monthlyAmount: "5000" },
      },
    }));
    const submitted = submitSimulation(edited);

    expect(submitted.execution?.status).toBe("success");
    if (submitted.execution?.status !== "success") return;

    expect(
      submitted.execution.warnings.map(({ code, scope }) => ({ code, scope })),
    ).toEqual([
      { code: "dependentLongHours", scope: "current" },
      { code: "dependentAnnualIncomeOver1300000", scope: "current" },
      { code: "spouseAllowanceUnknown", scope: "current" },
      { code: "insuredUnder20Hours", scope: "proposed" },
      { code: "spouseAllowanceUnknown", scope: "proposed" },
    ]);
    expect(
      submitted.execution.warnings.every(
        ({ message, recommendedAction }) =>
          message.length > 0 && recommendedAction.length > 0,
      ),
    ).toBe(true);

    const displayItems = createSimulationWarningDisplayItems(
      submitted.execution.warnings,
    );
    expect(displayItems.map(({ warning }) => warning)).toEqual(
      submitted.execution.warnings,
    );
    expect(typeof submitted.execution.result.personalTakeHomeDifferenceYen).toBe(
      "number",
    );
  });

  it.each([
    "compareAnnualTakeHome",
    "checkTakeHomeMaintenance",
    "compareDependentAndInsured",
  ] satisfies ConsultationGoal[])(
    "connects the selected goal to a complete conclusion without UI recalculation: %s",
    (goal) => {
      const edited = updateForm(initialSimulationUiState, (form) => ({
        ...form,
        goal,
      }));
      const submitted = submitSimulation(edited);

      expect(submitted.execution?.status).toBe("success");
      if (submitted.execution?.status !== "success") return;

      expect(submitted.execution.conclusion).toEqual(
        expect.objectContaining({
          goal,
          tone: expect.stringMatching(/^(positive|neutral|caution)$/),
          headline: expect.any(String),
          detail: expect.any(String),
        }),
      );
    },
  );

  it("clears stale executions on edit and creates a new execution for every resubmit path", () => {
    const firstSuccess = submitSimulation(initialSimulationUiState);
    const editedToInvalid = updateForm(firstSuccess, (form) => ({
      ...form,
      goal: "",
    }));
    const firstInvalid = submitSimulation(editedToInvalid);
    const secondInvalid = submitSimulation(firstInvalid);
    const editedToValid = updateForm(secondInvalid, (form) => ({
      ...form,
      goal: "compareAnnualTakeHome",
    }));
    const secondSuccess = submitSimulation(editedToValid);
    const thirdSuccess = submitSimulation(secondSuccess);

    expect(editedToInvalid.execution).toBeNull();
    expect(editedToValid.execution).toBeNull();
    expect(firstInvalid.execution?.status).toBe("invalid");
    expect(secondInvalid.execution?.status).toBe("invalid");
    expect(secondInvalid.execution).not.toBe(firstInvalid.execution);
    expect(secondSuccess.execution?.status).toBe("success");
    expect(thirdSuccess.execution?.status).toBe("success");
    expect(thirdSuccess.execution).not.toBe(secondSuccess.execution);
    expect(getSimulationFocusTarget(secondInvalid.execution)).toEqual({
      type: "field",
      fieldPath: "goal",
    });
    expect(getSimulationFocusTarget(thirdSuccess.execution)).toEqual({
      type: "result",
    });
  });

  it("uses motion-aware scroll behavior without changing the focus target", () => {
    expect(getSimulationScrollOptions(false)).toEqual({
      behavior: "smooth",
      block: "start",
    });
    expect(getSimulationScrollOptions(true)).toEqual({
      behavior: "auto",
      block: "start",
    });
  });
});
