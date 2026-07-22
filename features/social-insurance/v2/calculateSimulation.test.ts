import { describe, expect, it } from "vitest";

import {
  calculateScenarioCashFlow,
  calculateSpouseAllowanceAnnual,
} from "@/features/social-insurance/v2/calculateHouseholdCashFlow";
import { calculateV2Simulation } from "@/features/social-insurance/v2/calculateSimulation";
import { toLegacyPersonalTakeHomeInput } from "@/features/social-insurance/v2/legacyInputAdapter";
import type {
  SimulationInput,
  SpouseAllowance,
} from "@/features/social-insurance/v2/types";

function createSimulationInput(
  currentSpouseAllowance: SpouseAllowance,
  proposedSpouseAllowance: SpouseAllowance,
): SimulationInput {
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
      spouseAllowance: currentSpouseAllowance,
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
      spouseAllowance: proposedSpouseAllowance,
    },
  };
}

const received = (monthlyAmountYen: number): SpouseAllowance => ({
  status: "received",
  monthlyAmountYen,
});
const notReceived: SpouseAllowance = {
  status: "notReceived",
  monthlyAmountYen: 0,
};

describe("calculateSpouseAllowanceAnnual", () => {
  it("converts a received monthly amount to an annual amount", () => {
    expect(calculateSpouseAllowanceAnnual(received(10000))).toBe(120000);
  });

  it("returns zero when spouse allowance is not received", () => {
    expect(calculateSpouseAllowanceAnnual(notReceived)).toBe(0);
  });

  it("returns null for unknown even when an amount is retained", () => {
    expect(
      calculateSpouseAllowanceAnnual({
        status: "unknown",
        monthlyAmountYen: 50000,
      }),
    ).toBeNull();
  });
});

describe("calculateScenarioCashFlow", () => {
  it("keeps personal take-home separate from spouse allowance", () => {
    expect(calculateScenarioCashFlow(1000000, received(10000))).toEqual({
      personalTakeHomeYen: 1000000,
      spouseAllowanceAnnualYen: 120000,
      householdCashFlowYen: 1120000,
    });
  });

  it("does not determine household cash flow for unknown allowance", () => {
    expect(
      calculateScenarioCashFlow(1000000, {
        status: "unknown",
        monthlyAmountYen: 10000,
      }),
    ).toEqual({
      personalTakeHomeYen: 1000000,
      spouseAllowanceAnnualYen: null,
      householdCashFlowYen: null,
    });
  });
});

describe("calculateV2Simulation", () => {
  it.each([
    {
      name: "current received and proposed not received",
      current: received(10000),
      proposed: notReceived,
      currentAnnual: 120000,
      proposedAnnual: 0,
      allowanceDifference: -120000,
      householdKnown: true,
    },
    {
      name: "neither scenario receives allowance",
      current: notReceived,
      proposed: notReceived,
      currentAnnual: 0,
      proposedAnnual: 0,
      allowanceDifference: 0,
      householdKnown: true,
    },
    {
      name: "both scenarios receive allowance",
      current: received(10000),
      proposed: received(15000),
      currentAnnual: 120000,
      proposedAnnual: 180000,
      allowanceDifference: 60000,
      householdKnown: true,
    },
    {
      name: "current unknown and proposed received",
      current: { status: "unknown" } satisfies SpouseAllowance,
      proposed: received(10000),
      currentAnnual: null,
      proposedAnnual: 120000,
      allowanceDifference: null,
      householdKnown: false,
    },
    {
      name: "current received and proposed unknown with retained amount",
      current: received(10000),
      proposed: {
        status: "unknown",
        monthlyAmountYen: 50000,
      } satisfies SpouseAllowance,
      currentAnnual: 120000,
      proposedAnnual: null,
      allowanceDifference: null,
      householdKnown: false,
    },
    {
      name: "both scenarios unknown",
      current: {
        status: "unknown",
        monthlyAmountYen: 10000,
      } satisfies SpouseAllowance,
      proposed: { status: "unknown" } satisfies SpouseAllowance,
      currentAnnual: null,
      proposedAnnual: null,
      allowanceDifference: null,
      householdKnown: false,
    },
  ])("separates cash flow when $name", (testCase) => {
    const result = calculateV2Simulation(
      createSimulationInput(testCase.current, testCase.proposed),
    );

    expect(result.current.spouseAllowanceAnnualYen).toBe(
      testCase.currentAnnual,
    );
    expect(result.proposed.spouseAllowanceAnnualYen).toBe(
      testCase.proposedAnnual,
    );
    expect(result.spouseAllowanceDifferenceYen).toBe(
      testCase.allowanceDifference,
    );
    expect(typeof result.personalTakeHomeDifferenceYen).toBe("number");

    if (testCase.householdKnown) {
      expect(result.current.householdCashFlowYen).not.toBeNull();
      expect(result.proposed.householdCashFlowYen).not.toBeNull();
      expect(result.householdDifferenceYen).toBeCloseTo(
        result.personalTakeHomeDifferenceYen +
          (result.spouseAllowanceDifferenceYen ?? 0),
      );
    } else {
      expect(result.householdDifferenceYen).toBeNull();
    }
  });

  it("uses legacy take-home as personal take-home without spouse allowance", () => {
    const input = createSimulationInput(received(10000), received(20000));
    const result = calculateV2Simulation(input);

    expect(result.current.personalTakeHomeYen).toBe(
      result.legacyCalculation.current.takeHomePay,
    );
    expect(result.proposed.personalTakeHomeYen).toBe(
      result.legacyCalculation.future.takeHomePay,
    );
    expect(result.legacyCalculation.current.spouseAllowanceAnnual).toBe(0);
    expect(result.legacyCalculation.future.spouseAllowanceAnnual).toBe(0);
  });

  it("keeps personal take-home unchanged across spouse allowance states", () => {
    const withAllowance = calculateV2Simulation(
      createSimulationInput(received(10000), received(20000)),
    );
    const withoutAllowance = calculateV2Simulation(
      createSimulationInput(notReceived, notReceived),
    );

    expect(withAllowance.current.personalTakeHomeYen).toBe(
      withoutAllowance.current.personalTakeHomeYen,
    );
    expect(withAllowance.proposed.personalTakeHomeYen).toBe(
      withoutAllowance.proposed.personalTakeHomeYen,
    );
    expect(withAllowance.personalTakeHomeDifferenceYen).toBe(
      withoutAllowance.personalTakeHomeDifferenceYen,
    );
  });

  it("uses a legacy input with spouse allowance disabled", () => {
    const input = createSimulationInput(received(10000), received(20000));
    const legacyInput = toLegacyPersonalTakeHomeInput(input);

    expect(legacyInput.current.hasSpouseAllowance).toBe(false);
    expect(legacyInput.current.spouseAllowanceMonthly).toBe(0);
  });
});
