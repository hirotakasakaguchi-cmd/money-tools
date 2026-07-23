import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import { calculateR8AnnualNetIncome } from "@/features/social-insurance/r8/calculateR8AnnualNetIncome";
import {
  calculateR8AnnualSalaryYen,
  createR8ScenarioCalculationContext,
} from "@/features/social-insurance/r8/scenarioAdapter";
import { executeR8SimulationInternal } from "@/features/social-insurance/r8/v2/executeR8SimulationInternal";
import type {
  R8InternalSimulationInput,
  R8InternalSimulationScenarioInput,
} from "@/features/social-insurance/r8/v2/r8SimulationTypes";
import { executeSimulation } from "@/features/social-insurance/v2/executeSimulation";
import type { FormState } from "@/features/social-insurance/v2/formTypes";

const NO_ALLOWANCE = {
  status: "notReceived",
  monthlyAmountYen: 0,
} as const;

const ONE_MILLION_INSURED = {
  hourlyWageYen: 1_000,
  weeklyHours: 1_000_000 / (1_000 * 52),
  monthlyRemunerationYen: 88_000,
  enrollmentStatus: "insured",
  spouseAllowance: NO_ALLOWANCE,
} as const satisfies R8InternalSimulationScenarioInput;

const TWO_MILLION_INSURED = {
  hourlyWageYen: 1_000,
  weeklyHours: 2_000_000 / (1_000 * 52),
  monthlyRemunerationYen: 170_000,
  enrollmentStatus: "insured",
  spouseAllowance: NO_ALLOWANCE,
} as const satisfies R8InternalSimulationScenarioInput;

const THREE_POINT_SIX_MILLION_INSURED = {
  hourlyWageYen: 1_500,
  weeklyHours: 3_600_000 / (1_500 * 52),
  monthlyRemunerationYen: 300_000,
  enrollmentStatus: "insured",
  spouseAllowance: NO_ALLOWANCE,
} as const satisfies R8InternalSimulationScenarioInput;

describe("executeR8SimulationInternal insured path", () => {
  it("calculates an insured-to-insured comparison from fixed expectations", () => {
    const result = executeR8SimulationInternal({
      goal: "compareAnnualTakeHome",
      age: 40,
      current: ONE_MILLION_INSURED,
      proposed: THREE_POINT_SIX_MILLION_INSURED,
    });

    expect(result.supported).toBe(true);
    if (!result.supported) {
      throw new Error("Expected a supported R8 result.");
    }

    expect(result.current).toMatchObject({
      annualSalaryYen: 1_000_000,
      annualEmployeeSocialInsuranceYen: 164_773,
      annualIncomeTaxYen: 0,
      annualResidentTaxIncomeLevyYen: 0,
      annualNetIncomeYen: 835_227,
      monthlyAverageNetIncomeYen: 69_602,
    });
    expect(result.proposed).toMatchObject({
      annualSalaryYen: 3_600_000,
      annualEmployeeSocialInsuranceYen: 562_680,
      annualIncomeTaxYen: 50_800,
      annualResidentTaxIncomeLevyYen: 144_600,
      annualNetIncomeYen: 2_841_920,
      monthlyAverageNetIncomeYen: 236_827,
    });
    expect(result.personalTakeHomeDifferenceYen).toBe(2_006_693);
    expect(result.spouseAllowanceDifferenceYen).toBe(0);
    expect(result.householdDifferenceYen).toBe(2_006_693);
    expect(result.policy).toBe("r8");
    expect(result.calculationMode).toBe("steadyStateAnnualEstimate");
  });

  it.each([
    {
      label: "one million yen",
      age: 39,
      scenario: ONE_MILLION_INSURED,
      expected: {
        annualSalaryYen: 1_000_000,
        annualEmployeeSocialInsuranceYen: 156_219,
        annualIncomeTaxYen: 0,
        annualResidentTaxIncomeLevyYen: 0,
        annualNetIncomeYen: 843_781,
        monthlyAverageNetIncomeYen: 70_315,
      },
    },
    {
      label: "two million yen",
      age: 39,
      scenario: TWO_MILLION_INSURED,
      expected: {
        annualSalaryYen: 2_000_000,
        annualEmployeeSocialInsuranceYen: 302_128,
        annualIncomeTaxYen: 0,
        annualResidentTaxIncomeLevyYen: 58_600,
        annualNetIncomeYen: 1_639_272,
        monthlyAverageNetIncomeYen: 136_606,
      },
    },
    {
      label: "3.6 million yen",
      age: 40,
      scenario: THREE_POINT_SIX_MILLION_INSURED,
      expected: {
        annualSalaryYen: 3_600_000,
        annualEmployeeSocialInsuranceYen: 562_680,
        annualIncomeTaxYen: 50_800,
        annualResidentTaxIncomeLevyYen: 144_600,
        annualNetIncomeYen: 2_841_920,
        monthlyAverageNetIncomeYen: 236_827,
      },
    },
  ])(
    "returns the fixed $label representative result",
    ({ age, scenario, expected }) => {
      const result = executeR8SimulationInternal({
        goal: "compareAnnualTakeHome",
        age,
        current: scenario,
        proposed: scenario,
      });

      expect(result.supported).toBe(true);
      if (!result.supported) {
        throw new Error("Expected a supported R8 result.");
      }

      expect(result.current).toMatchObject(expected);
      expect(result.proposed).toMatchObject(expected);
    },
  );

  it.each([
    { age: 39, expectedContributionYen: 533_520 },
    { age: 40, expectedContributionYen: 562_680 },
    { age: 64, expectedContributionYen: 562_680 },
  ])(
    "uses the R8 contribution age rule at age $age",
    ({ age, expectedContributionYen }) => {
      const result = executeR8SimulationInternal({
        goal: "compareAnnualTakeHome",
        age,
        current: THREE_POINT_SIX_MILLION_INSURED,
        proposed: THREE_POINT_SIX_MILLION_INSURED,
      });

      expect(result.supported).toBe(true);
      if (!result.supported) {
        throw new Error("Expected a supported R8 result.");
      }

      expect(result.current.annualEmployeeSocialInsuranceYen).toBe(
        expectedContributionYen,
      );
    },
  );

  it("uses different health and pension grades for a high-income scenario", () => {
    const highIncomeScenario = {
      hourlyWageYen: 5_000,
      weeklyHours: 12_000_000 / (5_000 * 52),
      monthlyRemunerationYen: 1_000_000,
      enrollmentStatus: "insured",
      spouseAllowance: NO_ALLOWANCE,
    } as const satisfies R8InternalSimulationScenarioInput;
    const result = executeR8SimulationInternal({
      goal: "compareAnnualTakeHome",
      age: 40,
      current: highIncomeScenario,
      proposed: highIncomeScenario,
    });

    expect(result.supported).toBe(true);
    if (!result.supported) {
      throw new Error("Expected a supported R8 result.");
    }

    expect(result.current.socialInsuranceBreakdown).toMatchObject({
      healthInsuranceYen: 594_468,
      nursingCareInsuranceYen: 95_256,
      pensionInsuranceYen: 713_700,
      childAndFamilySupportYen: 13_524,
      totalEmployeeContributionYen: 1_476_948,
    });
  });

  it("matches the standalone R8 result for each normalized scenario", () => {
    const input = {
      goal: "compareAnnualTakeHome",
      age: 40,
      current: ONE_MILLION_INSURED,
      proposed: THREE_POINT_SIX_MILLION_INSURED,
    } as const satisfies R8InternalSimulationInput;
    const result = executeR8SimulationInternal(input);

    expect(result.supported).toBe(true);
    if (!result.supported) {
      throw new Error("Expected a supported R8 result.");
    }

    expect(result.current).toEqual(calculateStandaloneResult(input.current, 40));
    expect(result.proposed).toEqual(
      calculateStandaloneResult(input.proposed, 40),
    );
  });
});

describe("executeR8SimulationInternal dependent path", () => {
  it("uses zero social insurance and tax deduction for dependent-to-dependent", () => {
    const current = {
      ...ONE_MILLION_INSURED,
      enrollmentStatus: "dependent",
    } as const;
    const proposed = {
      ...TWO_MILLION_INSURED,
      enrollmentStatus: "dependent",
    } as const;
    const result = executeR8SimulationInternal({
      goal: "compareAnnualTakeHome",
      age: 39,
      current,
      proposed,
    });

    expect(result.supported).toBe(true);
    if (!result.supported) {
      throw new Error("Expected a supported R8 result.");
    }

    expect(result.current).toMatchObject({
      annualEmployeeSocialInsuranceYen: 0,
      annualIncomeTaxYen: 0,
      annualResidentTaxIncomeLevyYen: 0,
      annualNetIncomeYen: 1_000_000,
      monthlyAverageNetIncomeYen: 83_333,
      socialInsuranceBreakdown: {
        healthInsuranceYen: 0,
        nursingCareInsuranceYen: 0,
        pensionInsuranceYen: 0,
        employmentInsuranceYen: 0,
        childAndFamilySupportYen: 0,
        totalEmployeeContributionYen: 0,
      },
      incomeTaxBreakdown: {
        socialInsuranceDeductionYen: 0,
      },
      residentTaxBreakdown: {
        socialInsuranceDeductionYen: 0,
      },
    });
    expect(result.proposed).toMatchObject({
      annualEmployeeSocialInsuranceYen: 0,
      annualIncomeTaxYen: 11_200,
      annualResidentTaxIncomeLevyYen: 89_000,
      annualNetIncomeYen: 1_899_800,
      monthlyAverageNetIncomeYen: 158_317,
    });
  });

  it("preserves spouse allowance and household differences for dependent-to-insured", () => {
    const result = executeR8SimulationInternal({
      goal: "compareDependentAndInsured",
      age: 40,
      current: {
        ...ONE_MILLION_INSURED,
        enrollmentStatus: "dependent",
        spouseAllowance: {
          status: "received",
          monthlyAmountYen: 10_000,
        },
      },
      proposed: THREE_POINT_SIX_MILLION_INSURED,
    });

    expect(result.supported).toBe(true);
    if (!result.supported) {
      throw new Error("Expected a supported R8 result.");
    }

    expect(result.current.annualEmployeeSocialInsuranceYen).toBe(0);
    expect(result.proposed.annualEmployeeSocialInsuranceYen).toBe(562_680);
    expect(result.personalTakeHomeDifferenceYen).toBe(1_841_920);
    expect(result.spouseAllowanceDifferenceYen).toBe(-120_000);
    expect(result.householdDifferenceYen).toBe(1_721_920);
    expect(result.conclusion).toMatchObject({
      goal: "compareDependentAndInsured",
      tone: "positive",
    });
    expect(result.conclusion.headline).toContain("1,721,920円");
  });
});

describe("executeR8SimulationInternal unsupported path", () => {
  it.each([65, 66, 100])(
    "stops before calculation at age %i",
    (age) => {
      const result = executeR8SimulationInternal({
        goal: "compareAnnualTakeHome",
        age,
        current: ONE_MILLION_INSURED,
        proposed: THREE_POINT_SIX_MILLION_INSURED,
      });

      expect(result).toEqual({
        supported: false,
        policy: "r8",
        unsupportedReason: "age65AndOverIssue5",
      });
      expect("current" in result).toBe(false);
      expect("proposed" in result).toBe(false);
    },
  );
});

describe("R8 warning and conclusion connection", () => {
  it("reuses the existing warning order without blocking calculation", () => {
    const result = executeR8SimulationInternal({
      goal: "compareDependentAndInsured",
      age: 40,
      current: {
        hourlyWageYen: 1_000,
        weeklyHours: 19,
        monthlyRemunerationYen: 88_000,
        enrollmentStatus: "insured",
        spouseAllowance: NO_ALLOWANCE,
      },
      proposed: {
        hourlyWageYen: 1_000,
        weeklyHours: 37.5,
        monthlyRemunerationYen: 170_000,
        enrollmentStatus: "dependent",
        spouseAllowance: {
          status: "unknown",
        },
      },
    });

    expect(result.supported).toBe(true);
    if (!result.supported) {
      throw new Error("Expected a supported R8 result.");
    }

    expect(result.warnings.map(({ scope, code }) => [scope, code])).toEqual([
      ["current", "insuredUnder20Hours"],
      ["proposed", "dependentLongHours"],
      ["proposed", "dependentAnnualIncomeOver1300000"],
      ["proposed", "spouseAllowanceUnknown"],
    ]);
    expect(result.householdDifferenceYen).toBeNull();
    expect(result.spouseAllowanceDifferenceYen).toBeNull();
    expect(result.personalTakeHomeDifferenceYen).toEqual(expect.any(Number));
    expect(result.conclusion).toMatchObject({
      goal: "compareDependentAndInsured",
      tone: "neutral",
    });
    expect(result.conclusion.headline).toContain("確定できません");
  });

  it.each([
    "compareAnnualTakeHome",
    "checkTakeHomeMaintenance",
    "compareDependentAndInsured",
  ] as const)("connects the %s conclusion without custom wording", (goal) => {
    const result = executeR8SimulationInternal({
      goal,
      age: 40,
      current: ONE_MILLION_INSURED,
      proposed: THREE_POINT_SIX_MILLION_INSURED,
    });

    expect(result.supported).toBe(true);
    if (!result.supported) {
      throw new Error("Expected a supported R8 result.");
    }

    expect(result.conclusion.goal).toBe(goal);
  });
});

describe("R8 annual salary and input behavior", () => {
  it("uses the shared annual salary rounding for both scenarios", () => {
    const roundedScenario = {
      hourlyWageYen: 1,
      weeklyHours: 1 / 104,
      monthlyRemunerationYen: 0,
      enrollmentStatus: "dependent",
      spouseAllowance: NO_ALLOWANCE,
    } as const satisfies R8InternalSimulationScenarioInput;
    const result = executeR8SimulationInternal({
      goal: "compareAnnualTakeHome",
      age: 39,
      current: roundedScenario,
      proposed: roundedScenario,
    });

    expect(result.supported).toBe(true);
    if (!result.supported) {
      throw new Error("Expected a supported R8 result.");
    }

    expect(result.current.annualSalaryYen).toBe(1);
    expect(result.proposed.annualSalaryYen).toBe(1);
  });

  it("does not mutate the internal input", () => {
    const input = structuredClone({
      goal: "compareAnnualTakeHome",
      age: 40,
      current: ONE_MILLION_INSURED,
      proposed: THREE_POINT_SIX_MILLION_INSURED,
    } as const satisfies R8InternalSimulationInput);
    const before = structuredClone(input);

    executeR8SimulationInternal(input);

    expect(input).toEqual(before);
  });
});

describe("R7 and public-path separation", () => {
  it("leaves executeSimulation results unchanged before and after R8 execution", () => {
    const r7Form = createR7Form();
    const before = executeSimulation(r7Form);

    executeR8SimulationInternal({
      goal: "compareAnnualTakeHome",
      age: 40,
      current: ONE_MILLION_INSURED,
      proposed: THREE_POINT_SIX_MILLION_INSURED,
    });

    expect(executeSimulation(r7Form)).toEqual(before);
  });

  it("keeps v2, UI, and public routes disconnected and R8 inactive", () => {
    const guardedFiles = [
      ...listSourceFiles("features/social-insurance/v2"),
      ...listSourceFiles("features/social-insurance/components"),
      ...listSourceFiles("app"),
    ];
    const internalR8Pattern =
      /(?:executeR8SimulationInternal|r8\/v2\/r8SimulationTypes)/;

    for (const file of guardedFiles) {
      expect(
        readFileSync(file, "utf8"),
        `${file} imports the internal R8 v2 path`,
      ).not.toMatch(internalR8Pattern);
    }
    expect(R8_POLICY.isPubliclyActive).toBe(false);
  });
});

function calculateStandaloneResult(
  scenario: R8InternalSimulationScenarioInput,
  age: number,
) {
  const annualSalaryYen = calculateR8AnnualSalaryYen(scenario);
  const context = createR8ScenarioCalculationContext({
    annualSalaryYen,
    monthlyRemunerationYen: scenario.monthlyRemunerationYen,
    age,
    enrollmentStatus: scenario.enrollmentStatus,
  });

  if (!context.supported) {
    throw new Error("Expected a supported standalone context.");
  }

  return calculateR8AnnualNetIncome({
    annualSalaryYen,
    employeeContribution: context.employeeContribution,
  });
}

function createR7Form(): FormState {
  return {
    goal: "compareAnnualTakeHome",
    ageGroup: "age40To64",
    current: {
      workplace: {
        hourlyWage: "1000",
        weeklyHours: "20",
        insuranceStatus: "dependent",
      },
      spouseAllowance: {
        status: "received",
        monthlyAmount: "10000",
      },
    },
    proposed: {
      workplace: {
        hourlyWage: "1000",
        weeklyHours: "30",
        insuranceStatus: "insured",
      },
      spouseAllowance: {
        status: "notReceived",
        monthlyAmount: "",
      },
    },
  };
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(path);
    }

    if (
      (extname(entry.name) === ".ts" || extname(entry.name) === ".tsx") &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test.tsx")
    ) {
      return [path];
    }

    return [];
  });
}
