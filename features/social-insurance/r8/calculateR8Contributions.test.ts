import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { calculateSocialInsurance } from "@/features/social-insurance/calculateSocialInsurance";
import { R8_EMPLOYEE_CONTRIBUTION_VALUES } from "@/features/social-insurance/policies/r8ContributionValues";
import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import { calculateR8EmployeeContributions } from "@/features/social-insurance/r8/calculateR8Contributions";
import type { R8ContributionInput } from "@/features/social-insurance/r8/types";
import type { SocialInsuranceInput } from "@/features/social-insurance/types";

const REPRESENTATIVE_INPUT = {
  annualSalaryYen: 3_600_000,
  standardMonthlyRemunerationYen: 300_000,
  age: 40,
} satisfies R8ContributionInput;

describe("R8 employee contribution values", () => {
  it("defines the employee rates as decimal multipliers", () => {
    expect(R8_EMPLOYEE_CONTRIBUTION_VALUES).toMatchObject({
      healthInsuranceEmployeeRate: 0.05055,
      nursingCareEmployeeRate: 0.0081,
      pensionEmployeeRate: 0.0915,
      employmentInsuranceEmployeeRate: 0.005,
      childAndFamilySupportEmployeeRate: 0.00115,
    });
  });

  it("links the values to the inactive R8 Fukuoka policy and its sources", () => {
    expect(R8_EMPLOYEE_CONTRIBUTION_VALUES).toMatchObject({
      policyId: R8_POLICY.policyId,
      region: R8_POLICY.region,
      branch: R8_POLICY.healthInsuranceBranch,
      fiscalYear: R8_POLICY.socialInsuranceFiscalYear,
      calculationMode: "steadyStateAnnualEstimate",
    });
    expect(
      R8_EMPLOYEE_CONTRIBUTION_VALUES.officialSourceReference.socialInsurance,
    ).toBe(R8_POLICY.officialSources[0]);
    expect(
      R8_EMPLOYEE_CONTRIBUTION_VALUES.officialSourceReference
        .childAndFamilySupport,
    ).toBe(R8_POLICY.officialSources[1]);
    expect(
      R8_EMPLOYEE_CONTRIBUTION_VALUES.officialSourceReference
        .employmentInsurance,
    ).toBe(R8_POLICY.officialSources[2]);
    expect(R8_POLICY.isPubliclyActive).toBe(false);
  });
});

describe("calculateR8EmployeeContributions", () => {
  it("calculates the representative annual contribution breakdown", () => {
    expect(calculateR8EmployeeContributions(REPRESENTATIVE_INPUT)).toEqual({
      healthInsuranceYen: 181_980,
      nursingCareInsuranceYen: 29_160,
      pensionInsuranceYen: 329_400,
      employmentInsuranceYen: 18_000,
      childAndFamilySupportYen: 4_140,
      totalEmployeeContributionYen: 562_680,
    });
  });

  it("keeps child and family support separate from health insurance", () => {
    const result = calculateR8EmployeeContributions(REPRESENTATIVE_INPUT);

    expect(result.childAndFamilySupportYen).toBe(4_140);
    expect(result.healthInsuranceYen).toBe(181_980);
    expect(result.healthInsuranceYen).not.toBe(
      result.healthInsuranceYen + result.childAndFamilySupportYen,
    );
  });

  it.each([
    { age: 39, expectedNursingCareYen: 0 },
    { age: 40, expectedNursingCareYen: 29_160 },
    { age: 64, expectedNursingCareYen: 29_160 },
    { age: 65, expectedNursingCareYen: 0 },
  ])(
    "returns $expectedNursingCareYen yen of nursing care insurance at age $age",
    ({ age, expectedNursingCareYen }) => {
      const result = calculateR8EmployeeContributions({
        ...REPRESENTATIVE_INPUT,
        age,
      });

      expect(result.nursingCareInsuranceYen).toBe(expectedNursingCareYen);
    },
  );

  it("sums only the independently rounded line items", () => {
    const result = calculateR8EmployeeContributions({
      annualSalaryYen: 3_600_001,
      standardMonthlyRemunerationYen: 300_001,
      age: 40,
    });
    const lineItemTotal =
      result.healthInsuranceYen +
      result.nursingCareInsuranceYen +
      result.pensionInsuranceYen +
      result.employmentInsuranceYen +
      result.childAndFamilySupportYen;

    expect(result.totalEmployeeContributionYen).toBe(lineItemTotal);
  });

  it("returns only finite, non-negative integer yen amounts", () => {
    const result = calculateR8EmployeeContributions(REPRESENTATIVE_INPUT);

    for (const amount of Object.values(result)) {
      expect(Number.isSafeInteger(amount)).toBe(true);
      expect(amount).toBeGreaterThanOrEqual(0);
    }
  });

  it.each([
    ["annualSalaryYen", Number.NaN],
    ["annualSalaryYen", Number.POSITIVE_INFINITY],
    ["annualSalaryYen", -1],
    ["annualSalaryYen", 1.5],
    ["standardMonthlyRemunerationYen", Number.NaN],
    ["standardMonthlyRemunerationYen", Number.POSITIVE_INFINITY],
    ["standardMonthlyRemunerationYen", -1],
    ["age", Number.NaN],
    ["age", Number.POSITIVE_INFINITY],
    ["age", -1],
    ["age", 40.5],
  ] satisfies [keyof R8ContributionInput, number][])(
    "rejects invalid %s input: %s",
    (field, value) => {
      expect(() =>
        calculateR8EmployeeContributions({
          ...REPRESENTATIVE_INPUT,
          [field]: value,
        }),
      ).toThrow(RangeError);
    },
  );

  it("rejects contribution amounts outside the safe yen range", () => {
    expect(() =>
      calculateR8EmployeeContributions({
        ...REPRESENTATIVE_INPUT,
        standardMonthlyRemunerationYen: Number.MAX_SAFE_INTEGER,
      }),
    ).toThrow(RangeError);
  });
});

describe("R7 and R8 calculation separation", () => {
  it("does not change the legacy result before or after an R8 calculation", () => {
    const legacyInput: SocialInsuranceInput = {
      ageGroup: "age40To64",
      current: {
        hourlyWage: 1_000,
        weeklyHours: 20,
        insuranceStatus: "dependent",
        hasSpouseAllowance: true,
        spouseAllowanceMonthly: 10_000,
      },
      future: {
        hourlyWage: 1_000,
        weeklyHours: 30,
        insuranceStatus: "insured",
      },
    };
    const before = calculateSocialInsurance(legacyInput);

    calculateR8EmployeeContributions(REPRESENTATIVE_INPUT);

    expect(calculateSocialInsurance(legacyInput)).toEqual(before);
  });

  it("keeps legacy, v2, and UI production sources disconnected from R8", () => {
    const guardedFiles = [
      "features/social-insurance/calculateSocialInsurance.ts",
      ...listSourceFiles("features/social-insurance/v2"),
      ...listSourceFiles("features/social-insurance/components"),
    ];
    const r8ImportPattern =
      /(?:social-insurance\/r8\/|policies\/r8ContributionValues)/;

    for (const file of guardedFiles) {
      expect(readFileSync(file, "utf8"), `${file} imports R8 calculation`).not.toMatch(
        r8ImportPattern,
      );
    }
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
