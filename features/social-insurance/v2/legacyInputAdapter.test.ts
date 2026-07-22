import { describe, expect, it } from "vitest";

import { calculateSocialInsurance } from "@/features/social-insurance/calculateSocialInsurance";
import { toLegacyPersonalTakeHomeInput } from "@/features/social-insurance/v2/legacyInputAdapter";
import type { SimulationInput } from "@/features/social-insurance/v2/types";

function createSimulationInput(): SimulationInput {
  return {
    goal: "compareDependentAndInsured",
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
          hourlyWageYen: 1400,
          weeklyHours: 30,
          insuranceStatus: "insured",
        },
      ],
      spouseAllowance: {
        status: "notReceived",
        monthlyAmountYen: 0,
      },
    },
  };
}

describe("toLegacyPersonalTakeHomeInput", () => {
  it("maps current and proposed work conditions to the legacy input", () => {
    expect(toLegacyPersonalTakeHomeInput(createSimulationInput())).toEqual({
      ageGroup: "age40To64",
      current: {
        hourlyWage: 1100,
        weeklyHours: 18,
        insuranceStatus: "dependent",
        hasSpouseAllowance: false,
        spouseAllowanceMonthly: 0,
      },
      future: {
        hourlyWage: 1400,
        weeklyHours: 30,
        insuranceStatus: "insured",
      },
    });
  });

  it("always passes the proposed hourly wage explicitly", () => {
    const legacyInput = toLegacyPersonalTakeHomeInput(createSimulationInput());

    expect(legacyInput.future).toHaveProperty("hourlyWage", 1400);
  });

  it("excludes received spouse allowance from personal take-home input", () => {
    const legacyInput = toLegacyPersonalTakeHomeInput(createSimulationInput());

    expect(legacyInput.current.hasSpouseAllowance).toBe(false);
    expect(legacyInput.current.spouseAllowanceMonthly).toBe(0);
  });

  it("produces the same personal take-home input regardless of spouse allowance states", () => {
    const first = createSimulationInput();
    const second = createSimulationInput();
    second.current.spouseAllowance = { status: "unknown" };
    second.proposed.spouseAllowance = {
      status: "received",
      monthlyAmountYen: 20000,
    };

    expect(toLegacyPersonalTakeHomeInput(first)).toEqual(
      toLegacyPersonalTakeHomeInput(second),
    );
  });

  it("does not add spouse allowance when calculating through the adapter", () => {
    const result = calculateSocialInsurance(
      toLegacyPersonalTakeHomeInput(createSimulationInput()),
    );

    expect(result.current.spouseAllowanceAnnual).toBe(0);
    expect(result.future.spouseAllowanceAnnual).toBe(0);
  });
});
