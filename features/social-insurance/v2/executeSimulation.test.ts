import { describe, expect, it } from "vitest";

import { calculateV2Simulation } from "@/features/social-insurance/v2/calculateSimulation";
import { createSummaryConclusion } from "@/features/social-insurance/v2/createSummaryConclusion";
import { executeSimulation } from "@/features/social-insurance/v2/executeSimulation";
import type { FormState } from "@/features/social-insurance/v2/formTypes";
import { parseSimulationForm } from "@/features/social-insurance/v2/formStateAdapter";
import type { ConsultationGoal } from "@/features/social-insurance/v2/types";
import { validateSimulation } from "@/features/social-insurance/v2/validateSimulation";

function createValidForm(goal: ConsultationGoal = "compareAnnualTakeHome"): FormState {
  return {
    goal,
    ageGroup: "age40To64",
    current: {
      workplace: {
        hourlyWage: "1100",
        weeklyHours: "18",
        insuranceStatus: "dependent",
      },
      spouseAllowance: {
        status: "received",
        monthlyAmount: "10000",
      },
    },
    proposed: {
      workplace: {
        hourlyWage: "1350",
        weeklyHours: "30",
        insuranceStatus: "insured",
      },
      spouseAllowance: {
        status: "notReceived",
        monthlyAmount: "99999",
      },
    },
  };
}

describe("executeSimulation", () => {
  it("returns the normalized input, calculation, warnings, and conclusion on success", () => {
    const form = createValidForm();
    const parsed = parseSimulationForm(form);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const expectedResult = calculateV2Simulation(parsed.value);
    const expectedWarnings = validateSimulation(parsed.value);
    const expectedConclusion = createSummaryConclusion(
      parsed.value.goal,
      expectedResult,
    );
    const execution = executeSimulation(form);

    expect(execution.status).toBe("success");
    if (execution.status !== "success") return;
    expect(execution.input).toEqual(parsed.value);
    expect(execution.input.current.workplaces[0].hourlyWageYen).toBe(1100);
    expect(execution.input.proposed.spouseAllowance).toEqual({
      status: "notReceived",
      monthlyAmountYen: 0,
    });
    expect(execution.result).toEqual(expectedResult);
    expect(execution.warnings).toEqual(expectedWarnings);
    expect(execution.conclusion).toEqual(expectedConclusion);
    expect(execution.conclusion.goal).toBe(form.goal);
  });

  it("preserves warning order and calculation output when multiple warnings exist", () => {
    const form = createValidForm();
    form.current.workplace.hourlyWage = "1000";
    form.current.workplace.weeklyHours = "40";
    form.current.spouseAllowance = { status: "unknown", monthlyAmount: "" };
    form.proposed.workplace.weeklyHours = "19";
    form.proposed.spouseAllowance = { status: "unknown", monthlyAmount: "5000" };

    const execution = executeSimulation(form);

    expect(execution.status).toBe("success");
    if (execution.status !== "success") return;
    expect(execution.warnings.map(({ code, scope }) => ({ code, scope }))).toEqual([
      { code: "dependentLongHours", scope: "current" },
      { code: "dependentAnnualIncomeOver1300000", scope: "current" },
      { code: "spouseAllowanceUnknown", scope: "current" },
      { code: "insuredUnder20Hours", scope: "proposed" },
      { code: "spouseAllowanceUnknown", scope: "proposed" },
    ]);
    expect(typeof execution.result.personalTakeHomeDifferenceYen).toBe(
      "number",
    );
    expect(execution.result.legacyCalculation).toBeDefined();
  });

  it("succeeds with unknown spouse allowance while preserving null household difference", () => {
    const form = createValidForm("compareDependentAndInsured");
    form.proposed.spouseAllowance = {
      status: "unknown",
      monthlyAmount: "5000",
    };

    const execution = executeSimulation(form);

    expect(execution.status).toBe("success");
    if (execution.status !== "success") return;
    expect(
      execution.warnings.some(
        (warning) =>
          warning.code === "spouseAllowanceUnknown" &&
          warning.scope === "proposed",
      ),
    ).toBe(true);
    expect(execution.result.householdDifferenceYen).toBeNull();
    expect(execution.conclusion.tone).toBe("neutral");
    expect(execution.conclusion.headline).toContain("確定できません");
  });

  it("returns only existing field errors when parsing fails", () => {
    const form = createValidForm();
    form.goal = "";
    form.current.workplace.hourlyWage = "invalid";

    const execution = executeSimulation(form);

    expect(execution).toEqual({
      status: "invalid",
      fieldErrors: expect.arrayContaining([
        expect.objectContaining({ fieldPath: "goal" }),
        expect.objectContaining({
          fieldPath: "current.workplace.hourlyWage",
        }),
      ]),
    });
    expect("result" in execution).toBe(false);
    expect("warnings" in execution).toBe(false);
    expect("conclusion" in execution).toBe(false);
  });

  it.each([
    "compareAnnualTakeHome",
    "checkTakeHomeMaintenance",
    "compareDependentAndInsured",
  ] satisfies ConsultationGoal[])(
    "creates the conclusion for the selected goal: %s",
    (goal) => {
      const form = createValidForm(goal);
      const execution = executeSimulation(form);

      expect(execution.status).toBe("success");
      if (execution.status !== "success") return;
      expect(execution.conclusion.goal).toBe(goal);
      expect(execution.conclusion).toEqual(
        createSummaryConclusion(goal, execution.result),
      );
    },
  );

  it("does not mutate the form state", () => {
    const form = createValidForm("compareDependentAndInsured");
    const before = structuredClone(form);

    executeSimulation(form);

    expect(form).toEqual(before);
  });
});
