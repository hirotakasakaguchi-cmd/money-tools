import { describe, expect, it } from "vitest";

import type {
  FormFieldPath,
  FormState,
} from "@/features/social-insurance/v2/formTypes";
import { parseSimulationForm } from "@/features/social-insurance/v2/formStateAdapter";

function createValidForm(): FormState {
  return {
    goal: "compareAnnualTakeHome",
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

function expectErrorAt(form: FormState, fieldPath: FormFieldPath) {
  const result = parseSimulationForm(form);

  expect(result.ok).toBe(false);
  if (result.ok) {
    throw new Error("Expected form parsing to fail");
  }
  expect(result.errors.some((error) => error.fieldPath === fieldPath)).toBe(
    true,
  );
}

describe("parseSimulationForm", () => {
  it("converts a complete form into independent current and proposed scenarios", () => {
    const result = parseSimulationForm(createValidForm());

    expect(result).toEqual({
      ok: true,
      value: {
        goal: "compareAnnualTakeHome",
        ageGroup: "age40To64",
        current: {
          key: "current",
          workplaces: [
            {
              id: "current-primary",
              hourlyWageYen: 1100,
              weeklyHours: 18,
              insuranceStatus: "dependent",
            },
          ],
          spouseAllowance: {
            status: "received",
            monthlyAmountYen: 10000,
          },
        },
        proposed: {
          key: "proposed",
          workplaces: [
            {
              id: "proposed-primary",
              hourlyWageYen: 1350,
              weeklyHours: 30,
              insuranceStatus: "insured",
            },
          ],
          spouseAllowance: {
            status: "notReceived",
            monthlyAmountYen: 0,
          },
        },
      },
    });
  });

  it("creates exactly one workplace for each scenario", () => {
    const result = parseSimulationForm(createValidForm());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.current.workplaces).toHaveLength(1);
    expect(result.value.proposed.workplaces).toHaveLength(1);
  });

  it("allows unknown spouse allowance with an empty amount", () => {
    const form = createValidForm();
    form.proposed.spouseAllowance = { status: "unknown", monthlyAmount: "" };

    const result = parseSimulationForm(form);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.proposed.spouseAllowance).toEqual({
      status: "unknown",
    });
  });

  it("preserves a non-negative amount when unknown", () => {
    const form = createValidForm();
    form.proposed.spouseAllowance = {
      status: "unknown",
      monthlyAmount: "5000",
    };

    const result = parseSimulationForm(form);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.proposed.spouseAllowance).toEqual({
      status: "unknown",
      monthlyAmountYen: 5000,
    });
  });

  it("requires a consultation goal", () => {
    const form = createValidForm();
    form.goal = "";

    expectErrorAt(form, "goal");
  });

  it("requires an age group", () => {
    const form = createValidForm();
    form.ageGroup = "";

    expectErrorAt(form, "ageGroup");
  });

  it.each([
    ["current", ""],
    ["proposed", ""],
  ] as const)("rejects an empty %s hourly wage", (scenario, value) => {
    const form = createValidForm();
    form[scenario].workplace.hourlyWage = value;

    expectErrorAt(form, `${scenario}.workplace.hourlyWage`);
  });

  it.each(["0", "-1"])("rejects a non-positive hourly wage: %s", (value) => {
    const form = createValidForm();
    form.current.workplace.hourlyWage = value;

    expectErrorAt(form, "current.workplace.hourlyWage");
  });

  it("rejects negative weekly hours while allowing zero", () => {
    const invalidForm = createValidForm();
    invalidForm.proposed.workplace.weeklyHours = "-0.5";
    expectErrorAt(invalidForm, "proposed.workplace.weeklyHours");

    const validForm = createValidForm();
    validForm.proposed.workplace.weeklyHours = "0";
    expect(parseSimulationForm(validForm).ok).toBe(true);
  });

  it.each(["not-a-number", "NaN", "Infinity", "-Infinity"])(
    "rejects a non-finite or invalid number: %s",
    (value) => {
      const form = createValidForm();
      form.current.workplace.hourlyWage = value;

      expectErrorAt(form, "current.workplace.hourlyWage");
    },
  );

  it("requires insurance status and spouse allowance status", () => {
    const form = createValidForm();
    form.current.workplace.insuranceStatus = "";
    form.proposed.spouseAllowance.status = "";

    const result = parseSimulationForm(form);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((error) => error.fieldPath)).toEqual(
      expect.arrayContaining([
        "current.workplace.insuranceStatus",
        "proposed.spouseAllowance.status",
      ]),
    );
  });

  it("requires a non-negative amount when spouse allowance is received", () => {
    const emptyForm = createValidForm();
    emptyForm.current.spouseAllowance.monthlyAmount = "";
    expectErrorAt(emptyForm, "current.spouseAllowance.monthlyAmount");

    const negativeForm = createValidForm();
    negativeForm.current.spouseAllowance.monthlyAmount = "-1";
    expectErrorAt(negativeForm, "current.spouseAllowance.monthlyAmount");
  });

  it("reports current and proposed failures with distinct field paths", () => {
    const form = createValidForm();
    form.current.workplace.hourlyWage = "bad";
    form.proposed.workplace.hourlyWage = "bad";

    const result = parseSimulationForm(form);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((error) => error.fieldPath)).toEqual(
      expect.arrayContaining([
        "current.workplace.hourlyWage",
        "proposed.workplace.hourlyWage",
      ]),
    );
  });
});
