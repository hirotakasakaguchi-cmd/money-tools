import { describe, expect, it } from "vitest";

import { calculateV2Simulation } from "@/features/social-insurance/v2/calculateSimulation";
import type { SimulationInput } from "@/features/social-insurance/v2/types";
import { validateSimulation } from "@/features/social-insurance/v2/validateSimulation";

function createValidSimulationInput(): SimulationInput {
  return {
    goal: "compareAnnualTakeHome",
    ageGroup: "age40To64",
    current: {
      key: "current",
      workplaces: [
        {
          id: "current-primary",
          hourlyWageYen: 1000,
          weeklyHours: 10,
          insuranceStatus: "dependent",
        },
      ],
      spouseAllowance: {
        status: "notReceived",
        monthlyAmountYen: 0,
      },
    },
    proposed: {
      key: "proposed",
      workplaces: [
        {
          id: "proposed-primary",
          hourlyWageYen: 1000,
          weeklyHours: 20,
          insuranceStatus: "insured",
        },
      ],
      spouseAllowance: {
        status: "received",
        monthlyAmountYen: 10000,
      },
    },
  };
}

describe("validateSimulation", () => {
  it("returns no warnings for conditions without confirmation triggers", () => {
    expect(validateSimulation(createValidSimulationInput())).toEqual([]);
  });

  it("warns when insured work is under 20 hours per week", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].insuranceStatus = "insured";
    input.current.workplaces[0].weeklyHours = 19.99;

    expect(validateSimulation(input)).toEqual([
      {
        code: "insuredUnder20Hours",
        severity: "warning",
        scope: "current",
        fieldPaths: [
          "current.workplace.weeklyHours",
          "current.workplace.insuranceStatus",
        ],
        message:
          "週20時間未満で社会保険加入を選択しています。勤務先への確認が必要な可能性があります。",
        recommendedAction:
          "勤務先へ社会保険の加入条件を確認してください。",
      },
    ]);
  });

  it("switches field paths between current and proposed scopes", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].insuranceStatus = "insured";
    input.current.workplaces[0].weeklyHours = 19;
    input.proposed.workplaces[0].weeklyHours = 19;

    expect(
      validateSimulation(input).map(({ scope, fieldPaths }) => ({
        scope,
        fieldPaths,
      })),
    ).toEqual([
      {
        scope: "current",
        fieldPaths: [
          "current.workplace.weeklyHours",
          "current.workplace.insuranceStatus",
        ],
      },
      {
        scope: "proposed",
        fieldPaths: [
          "proposed.workplace.weeklyHours",
          "proposed.workplace.insuranceStatus",
        ],
      },
    ]);
  });

  it("does not warn for insured work at exactly 20 hours", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].insuranceStatus = "insured";
    input.current.workplaces[0].weeklyHours = 20;

    expect(validateSimulation(input)).toEqual([]);
  });

  it("warns when dependent work is at least 37.5 hours per week", () => {
    const input = createValidSimulationInput();
    input.proposed.workplaces[0].insuranceStatus = "dependent";
    input.proposed.workplaces[0].hourlyWageYen = 500;
    input.proposed.workplaces[0].weeklyHours = 37.5;

    expect(validateSimulation(input)).toEqual([
      expect.objectContaining({
        code: "dependentLongHours",
        severity: "warning",
        scope: "proposed",
        fieldPaths: [
          "proposed.workplace.weeklyHours",
          "proposed.workplace.insuranceStatus",
        ],
        recommendedAction:
          "勤務先へ社会保険の加入状況を確認してください。",
      }),
    ]);
  });

  it("does not warn for dependent work below 37.5 hours when income is low", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].hourlyWageYen = 500;
    input.current.workplaces[0].weeklyHours = 37.49;

    expect(validateSimulation(input)).toEqual([]);
  });

  it("warns when estimated annual income exceeds 1.3 million yen while dependent", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].hourlyWageYen = 1000.01;
    input.current.workplaces[0].weeklyHours = 25;

    expect(validateSimulation(input)).toEqual([
      expect.objectContaining({
        code: "dependentAnnualIncomeOver1300000",
        severity: "warning",
        scope: "current",
        fieldPaths: [
          "current.workplace.hourlyWage",
          "current.workplace.weeklyHours",
          "current.workplace.insuranceStatus",
        ],
        recommendedAction:
          "配偶者の健康保険の加入先へ扶養条件を確認してください。",
      }),
    ]);
  });

  it("does not warn at exactly 1.3 million yen", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].hourlyWageYen = 1000;
    input.current.workplaces[0].weeklyHours = 25;

    expect(validateSimulation(input)).toEqual([]);
  });

  it("does not apply the dependent income warning to insured work", () => {
    const input = createValidSimulationInput();
    input.proposed.workplaces[0].hourlyWageYen = 3000;
    input.proposed.workplaces[0].weeklyHours = 20;

    expect(validateSimulation(input)).toEqual([]);
  });

  it("returns an info warning for unknown spouse allowance", () => {
    const input = createValidSimulationInput();
    input.current.spouseAllowance = { status: "unknown" };

    expect(validateSimulation(input)).toEqual([
      {
        code: "spouseAllowanceUnknown",
        severity: "info",
        scope: "current",
        fieldPaths: ["current.spouseAllowance.status"],
        message:
          "配偶者手当の受給状態が不明です。勤務先への確認が必要な可能性があります。",
        recommendedAction:
          "配偶者の勤務先へ手当の支給条件を確認してください。",
      },
    ]);
  });

  it("warns for unknown allowance even when an amount is retained", () => {
    const input = createValidSimulationInput();
    input.proposed.spouseAllowance = {
      status: "unknown",
      monthlyAmountYen: 50000,
    };

    expect(validateSimulation(input)).toEqual([
      expect.objectContaining({
        code: "spouseAllowanceUnknown",
        scope: "proposed",
        fieldPaths: ["proposed.spouseAllowance.status"],
        recommendedAction:
          "配偶者の勤務先へ手当の支給条件を確認してください。",
      }),
    ]);
  });

  it("returns all matching warnings in deterministic scenario and rule order", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].hourlyWageYen = 1000;
    input.current.workplaces[0].weeklyHours = 40;
    input.current.spouseAllowance = { status: "unknown" };
    input.proposed.workplaces[0].weeklyHours = 19;
    input.proposed.spouseAllowance = { status: "unknown" };

    expect(
      validateSimulation(input).map(
        ({ scope, code }) => `${scope}:${code}`,
      ),
    ).toEqual([
      "current:dependentLongHours",
      "current:dependentAnnualIncomeOver1300000",
      "current:spouseAllowanceUnknown",
      "proposed:insuredUnder20Hours",
      "proposed:spouseAllowanceUnknown",
    ]);
  });

  it("does not block personal take-home calculation when warnings exist", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].weeklyHours = 40;
    input.current.spouseAllowance = { status: "unknown" };

    expect(validateSimulation(input).length).toBeGreaterThan(0);

    const result = calculateV2Simulation(input);
    expect(typeof result.current.personalTakeHomeYen).toBe("number");
    expect(typeof result.proposed.personalTakeHomeYen).toBe("number");
  });

  it("uses confirmation language without legal determinations", () => {
    const input = createValidSimulationInput();
    input.current.workplaces[0].weeklyHours = 40;
    input.current.spouseAllowance = { status: "unknown" };
    input.proposed.workplaces[0].weeklyHours = 19;

    const messages = validateSimulation(input).map(({ message }) => message);
    const prohibitedPhrases = [
      "加入対象です",
      "扶養から外れます",
      "違法です",
      "必ず社保加入になります",
    ];

    expect(messages.every((message) => message.includes("確認"))).toBe(true);
    expect(
      messages.every((message) =>
        prohibitedPhrases.every((phrase) => !message.includes(phrase)),
      ),
    ).toBe(true);
  });
});
