import { describe, expect, it } from "vitest";

import {
  initialSimulationUiState,
  submitSimulation,
  updateSimulationAge,
  updateSimulationCalculationYear,
  updateSimulationForm,
  updateSimulationMonthlyRemuneration,
} from "@/features/social-insurance/components/simulationUiState";
import { executeSimulation } from "@/features/social-insurance/v2/executeSimulation";
import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";

describe("simulationUiState", () => {
  it("starts without a displayed execution result", () => {
    expect(initialSimulationUiState.calculationYear).toBe("r7");
    expect(initialSimulationUiState.age).toBe("39");
    expect(initialSimulationUiState.execution).toBeNull();
  });

  it("keeps the initial R7 result identical to executeSimulation", () => {
    const state = submitSimulation(initialSimulationUiState);
    const expected = executeSimulation(initialSimulationUiState.form);

    expect(state.execution?.status).toBe("success");
    expect(state.execution).toEqual(expected);
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

  it("clears the previous result when calculation year changes", () => {
    const submitted = submitSimulation(initialSimulationUiState);
    const updated = updateSimulationCalculationYear(submitted, "r8");

    expect(updated.calculationYear).toBe("r8");
    expect(updated.execution).toBeNull();
  });

  it("clears the previous result when age or remuneration changes", () => {
    const submitted = submitSimulation(initialSimulationUiState);
    const ageUpdated = updateSimulationAge(submitted, "40");
    const remunerationUpdated = updateSimulationMonthlyRemuneration(
      submitted,
      "current",
      "100000",
    );

    expect(ageUpdated.age).toBe("40");
    expect(ageUpdated.execution).toBeNull();
    expect(remunerationUpdated.currentMonthlyRemuneration).toBe("100000");
    expect(remunerationUpdated.execution).toBeNull();
  });

  it("uses the internal R8 path only after R8 is explicitly selected", () => {
    const submitted = submitSimulation(createR8State());

    expect(submitted.execution?.status).toBe("r8Success");
    if (submitted.execution?.status !== "r8Success") {
      throw new Error("Expected an R8 success result.");
    }

    expect(submitted.execution.execution).toMatchObject({
      supported: true,
      policy: "r8",
      current: {
        annualSalaryYen: 1_040_000,
        annualEmployeeSocialInsuranceYen: 0,
      },
      proposed: {
        annualSalaryYen: 1_560_000,
      },
    });
  });

  it("supports insured-to-insured and keeps current and proposed separate", () => {
    const state = createR8State();
    const insuredState = updateSimulationForm(state, (form) => ({
      ...form,
      current: {
        ...form.current,
        workplace: {
          ...form.current.workplace,
          insuranceStatus: "insured",
        },
      },
    }));
    const submitted = submitSimulation(insuredState);

    expect(submitted.execution?.status).toBe("r8Success");
    if (submitted.execution?.status !== "r8Success") {
      throw new Error("Expected an R8 success result.");
    }

    expect(
      submitted.execution.execution.current
        .annualEmployeeSocialInsuranceYen,
    ).toBeGreaterThan(0);
    expect(
      submitted.execution.execution.proposed
        .annualEmployeeSocialInsuranceYen,
    ).toBeGreaterThan(0);
    expect(submitted.execution.execution.current.annualSalaryYen).toBe(
      1_040_000,
    );
    expect(submitted.execution.execution.proposed.annualSalaryYen).toBe(
      1_560_000,
    );
  });

  it("uses fixed-zero contributions for dependent-to-dependent", () => {
    const state = createR8State();
    const dependentState = updateSimulationForm(state, (form) => ({
      ...form,
      proposed: {
        ...form.proposed,
        workplace: {
          ...form.proposed.workplace,
          insuranceStatus: "dependent",
        },
      },
    }));
    const submitted = submitSimulation(dependentState);

    expect(submitted.execution?.status).toBe("r8Success");
    if (submitted.execution?.status !== "r8Success") {
      throw new Error("Expected an R8 success result.");
    }

    expect(
      submitted.execution.execution.current.socialInsuranceBreakdown,
    ).toMatchObject({
      healthInsuranceYen: 0,
      nursingCareInsuranceYen: 0,
      pensionInsuranceYen: 0,
      employmentInsuranceYen: 0,
      childAndFamilySupportYen: 0,
      totalEmployeeContributionYen: 0,
    });
    expect(
      submitted.execution.execution.proposed
        .annualEmployeeSocialInsuranceYen,
    ).toBe(0);
  });

  it.each([
    { age: "39", expectedCareInsuranceYen: 0 },
    { age: "40", expectedCareInsuranceYen: 13_802 },
    { age: "64", expectedCareInsuranceYen: 13_802 },
  ])(
    "uses the real age $age in the R8 calculation",
    ({ age, expectedCareInsuranceYen }) => {
      const state = updateSimulationAge(createR8State(), age);
      const submitted = submitSimulation(state);

      expect(submitted.execution?.status).toBe("r8Success");
      if (submitted.execution?.status !== "r8Success") {
        throw new Error("Expected an R8 success result.");
      }

      expect(
        submitted.execution.execution.proposed.socialInsuranceBreakdown
          .nursingCareInsuranceYen,
      ).toBe(expectedCareInsuranceYen);
    },
  );

  it("returns the non-technical preparation state at age 65", () => {
    const state = updateSimulationAge(createR8State(), "65");
    const submitted = submitSimulation(state);

    expect(submitted.execution).toEqual({
      status: "r8Unsupported",
      execution: {
        supported: false,
        policy: "r8",
        unsupportedReason: "age65AndOverIssue5",
      },
    });
  });

  it("validates actual age and both R8 monthly remuneration fields", () => {
    const state = updateSimulationAge(
      updateSimulationCalculationYear(initialSimulationUiState, "r8"),
      "39.5",
    );
    const submitted = submitSimulation(state);

    expect(submitted.execution?.status).toBe("invalid");
    if (submitted.execution?.status !== "invalid") {
      throw new Error("Expected invalid R8 input.");
    }

    expect(submitted.execution.fieldErrors[0]?.fieldPath).toBe("age");

    const missingRemuneration = submitSimulation(
      updateSimulationAge(state, "39"),
    );
    expect(missingRemuneration.execution?.status).toBe("invalid");
    if (missingRemuneration.execution?.status !== "invalid") {
      throw new Error("Expected invalid R8 remuneration input.");
    }
    expect(
      missingRemuneration.execution.fieldErrors.map(
        ({ fieldPath }) => fieldPath,
      ),
    ).toEqual([
      "current.monthlyRemuneration",
      "proposed.monthlyRemuneration",
    ]);
  });

  it("preserves null household comparison and the existing conclusion for unknown allowance", () => {
    const state = updateSimulationForm(createR8State(), (form) => ({
      ...form,
      proposed: {
        ...form.proposed,
        spouseAllowance: {
          status: "unknown",
          monthlyAmount: "",
        },
      },
    }));
    const submitted = submitSimulation(state);

    expect(submitted.execution?.status).toBe("r8Success");
    if (submitted.execution?.status !== "r8Success") {
      throw new Error("Expected an R8 success result.");
    }

    expect(
      submitted.execution.execution.spouseAllowanceDifferenceYen,
    ).toBeNull();
    expect(
      submitted.execution.execution.householdDifferenceYen,
    ).toBeNull();
    expect(submitted.execution.execution.conclusion).toMatchObject({
      goal: "compareAnnualTakeHome",
    });
    expect(
      submitted.execution.execution.warnings.map(({ code }) => code),
    ).toContain("spouseAllowanceUnknown");
  });

  it("keeps household difference equal to personal difference plus allowance difference", () => {
    const state = updateSimulationForm(createR8State(), (form) => ({
      ...form,
      current: {
        ...form.current,
        spouseAllowance: {
          status: "received",
          monthlyAmount: "10000",
        },
      },
    }));
    const submitted = submitSimulation(state);

    expect(submitted.execution?.status).toBe("r8Success");
    if (submitted.execution?.status !== "r8Success") {
      throw new Error("Expected an R8 success result.");
    }

    const result = submitted.execution.execution;
    expect(result.spouseAllowanceDifferenceYen).toBe(-120_000);
    if (result.spouseAllowanceDifferenceYen === null) {
      throw new Error("Expected a known spouse allowance difference.");
    }
    expect(result.householdDifferenceYen).toBe(
      result.personalTakeHomeDifferenceYen +
        result.spouseAllowanceDifferenceYen,
    );
  });

  it("keeps R8 policy metadata inactive", () => {
    expect(R8_POLICY.isPubliclyActive).toBe(false);
  });
});

function createR8State() {
  const r8State = updateSimulationCalculationYear(
    initialSimulationUiState,
    "r8",
  );
  const withCurrentRemuneration = updateSimulationMonthlyRemuneration(
    r8State,
    "current",
    "100000",
  );

  return updateSimulationMonthlyRemuneration(
    withCurrentRemuneration,
    "proposed",
    "140000",
  );
}
