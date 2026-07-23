import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import { calculateR8EmployeeContributions } from "@/features/social-insurance/r8/calculateR8Contributions";
import {
  calculateR8AnnualSalaryYen,
  createR8ScenarioCalculationContext,
  type R8ScenarioInput,
} from "@/features/social-insurance/r8/scenarioAdapter";

const REPRESENTATIVE_INPUT = {
  annualSalaryYen: 3_600_000,
  monthlyRemunerationYen: 300_000,
  age: 40,
  enrollmentStatus: "insured",
} as const satisfies R8ScenarioInput;

describe("R8 annual salary conversion", () => {
  it("rounds hourly wage times weekly hours times 52 to whole yen", () => {
    expect(
      calculateR8AnnualSalaryYen({
        hourlyWageYen: 1,
        weeklyHours: 1 / 104,
      }),
    ).toBe(1);
  });

  it("supports fractional weekly hours before rounding", () => {
    expect(
      calculateR8AnnualSalaryYen({
        hourlyWageYen: 1_000,
        weeklyHours: 20.000_01,
      }),
    ).toBe(1_040_001);
  });

  it("allows zero wage and zero hours", () => {
    expect(
      calculateR8AnnualSalaryYen({
        hourlyWageYen: 0,
        weeklyHours: 0,
      }),
    ).toBe(0);
  });

  it.each([
    ["hourlyWageYen", Number.NaN],
    ["hourlyWageYen", Number.POSITIVE_INFINITY],
    ["hourlyWageYen", -1],
    ["hourlyWageYen", Number.MAX_VALUE],
    ["weeklyHours", Number.NaN],
    ["weeklyHours", Number.POSITIVE_INFINITY],
    ["weeklyHours", -1],
    ["weeklyHours", Number.MAX_VALUE],
  ] as const)("rejects invalid %s: %s", (field, value) => {
    expect(() =>
      calculateR8AnnualSalaryYen({
        hourlyWageYen: 1_000,
        weeklyHours: 20,
        [field]: value,
      }),
    ).toThrow(RangeError);
  });

  it("rejects multiplication overflow", () => {
    expect(() =>
      calculateR8AnnualSalaryYen({
        hourlyWageYen: Number.MAX_SAFE_INTEGER,
        weeklyHours: 2,
      }),
    ).toThrow(RangeError);
  });
});

describe("R8 insured scenario calculation context", () => {
  it("builds a supported contribution input with separate remuneration grades", () => {
    expect(createR8ScenarioCalculationContext(REPRESENTATIVE_INPUT)).toEqual({
      annualSalaryYen: 3_600_000,
      age: 40,
      enrollmentStatus: "insured",
      healthStandardMonthlyRemunerationYen: 300_000,
      pensionStandardMonthlyRemunerationYen: 300_000,
      supported: true,
      unsupportedReason: null,
      employeeContribution: {
        kind: "calculate",
        input: {
          annualSalaryYen: 3_600_000,
          healthStandardMonthlyRemunerationYen: 300_000,
          pensionStandardMonthlyRemunerationYen: 300_000,
          age: 40,
        },
      },
    });
  });

  it("uses the health grade for health, care, and child support and the pension grade for pension", () => {
    const context = createR8ScenarioCalculationContext({
      annualSalaryYen: 12_000_000,
      monthlyRemunerationYen: 1_000_000,
      age: 40,
      enrollmentStatus: "insured",
    });

    expect(context.supported).toBe(true);
    if (!context.supported || context.employeeContribution.kind !== "calculate") {
      throw new Error("Expected a supported insured calculation context.");
    }

    expect(context.healthStandardMonthlyRemunerationYen).toBe(980_000);
    expect(context.pensionStandardMonthlyRemunerationYen).toBe(650_000);
    expect(
      calculateR8EmployeeContributions(context.employeeContribution.input),
    ).toEqual({
      healthInsuranceYen: 594_468,
      nursingCareInsuranceYen: 95_256,
      pensionInsuranceYen: 713_700,
      employmentInsuranceYen: 60_000,
      childAndFamilySupportYen: 13_524,
      totalEmployeeContributionYen: 1_476_948,
    });
  });

  it.each([
    { age: 39, expectedCareYen: 0 },
    { age: 40, expectedCareYen: 29_160 },
    { age: 64, expectedCareYen: 29_160 },
  ])(
    "preserves the R8 contribution age rule at age $age",
    ({ age, expectedCareYen }) => {
      const context = createR8ScenarioCalculationContext({
        ...REPRESENTATIVE_INPUT,
        age,
      });

      expect(context.supported).toBe(true);
      if (
        !context.supported ||
        context.employeeContribution.kind !== "calculate"
      ) {
        throw new Error("Expected a supported insured calculation context.");
      }

      expect(
        calculateR8EmployeeContributions(context.employeeContribution.input)
          .nursingCareInsuranceYen,
      ).toBe(expectedCareYen);
    },
  );

  it("does not mutate the scenario input", () => {
    const input = structuredClone(REPRESENTATIVE_INPUT);
    const before = structuredClone(input);

    createR8ScenarioCalculationContext(input);

    expect(input).toEqual(before);
  });
});

describe("R8 dependent scenario calculation context", () => {
  it("fixes every employee contribution and the tax deduction total at zero", () => {
    const context = createR8ScenarioCalculationContext({
      ...REPRESENTATIVE_INPUT,
      enrollmentStatus: "dependent",
    });

    expect(context.supported).toBe(true);
    if (
      !context.supported ||
      context.employeeContribution.kind !== "fixedZero"
    ) {
      throw new Error("Expected a supported dependent calculation context.");
    }

    expect(context.employeeContribution).toEqual({
      kind: "fixedZero",
      annualEmployeeSocialInsuranceYen: 0,
      breakdown: {
        healthInsuranceYen: 0,
        nursingCareInsuranceYen: 0,
        pensionInsuranceYen: 0,
        employmentInsuranceYen: 0,
        childAndFamilySupportYen: 0,
        totalEmployeeContributionYen: 0,
      },
    });
  });
});

describe("R8 age 65 and over handling", () => {
  it.each([65, 66, 100])(
    "returns the Issue #5 unsupported reason at age %i",
    (age) => {
      const context = createR8ScenarioCalculationContext({
        ...REPRESENTATIVE_INPUT,
        age,
      });

      expect(context).toMatchObject({
        age,
        supported: false,
        unsupportedReason: "age65AndOverIssue5",
      });
      expect("employeeContribution" in context).toBe(false);
    },
  );
});

describe("R8 scenario input safety", () => {
  it.each([
    ["annualSalaryYen", Number.NaN],
    ["annualSalaryYen", Number.POSITIVE_INFINITY],
    ["annualSalaryYen", -1],
    ["annualSalaryYen", 1.5],
    ["annualSalaryYen", Number.MAX_SAFE_INTEGER + 1],
    ["monthlyRemunerationYen", Number.NaN],
    ["monthlyRemunerationYen", Number.POSITIVE_INFINITY],
    ["monthlyRemunerationYen", -1],
    ["monthlyRemunerationYen", 1.5],
    ["monthlyRemunerationYen", Number.MAX_SAFE_INTEGER + 1],
    ["age", Number.NaN],
    ["age", Number.POSITIVE_INFINITY],
    ["age", -1],
    ["age", 40.5],
    ["age", Number.MAX_SAFE_INTEGER + 1],
  ] satisfies readonly [keyof R8ScenarioInput, number][])(
    "rejects invalid %s: %s",
    (field, value) => {
      expect(() =>
        createR8ScenarioCalculationContext({
          ...REPRESENTATIVE_INPUT,
          [field]: value,
        }),
      ).toThrow(RangeError);
    },
  );

  it("rejects an unknown enrollment status at runtime", () => {
    expect(() =>
      createR8ScenarioCalculationContext({
        ...REPRESENTATIVE_INPUT,
        enrollmentStatus: "unknown",
      } as unknown as R8ScenarioInput),
    ).toThrow(RangeError);
  });
});

describe("R8 scenario adapter separation", () => {
  it("keeps existing v2 and app routes disconnected while R8 is active", () => {
    const guardedFiles = [
      ...listSourceFiles("features/social-insurance/v2"),
      ...listSourceFiles("app"),
    ];
    const adapterImportPattern =
      /(?:r8\/scenarioAdapter|r8\/remuneration)/;

    for (const file of guardedFiles) {
      expect(
        readFileSync(file, "utf8"),
        `${file} imports the R8 scenario adapter`,
      ).not.toMatch(adapterImportPattern);
    }
    expect(R8_POLICY.isPubliclyActive).toBe(true);
  });
});

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
