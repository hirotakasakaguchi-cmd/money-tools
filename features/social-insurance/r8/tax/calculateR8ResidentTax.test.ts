import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { calculateSocialInsurance } from "@/features/social-insurance/calculateSocialInsurance";
import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import {
  calculateR8ResidentTax,
  calculateR8ResidentTaxEmploymentIncome,
} from "@/features/social-insurance/r8/tax/calculateR8ResidentTax";
import type { R8ResidentTaxInput } from "@/features/social-insurance/r8/tax/residentTaxTypes";
import type { SocialInsuranceInput } from "@/features/social-insurance/types";

const TWO_MILLION_YEN_INPUT = {
  annualSalaryYen: 2_000_000,
  annualEmployeeSocialInsuranceYen: 300_000,
} satisfies R8ResidentTaxInput;

describe("calculateR8ResidentTax", () => {
  it("calculates the low-income representative case", () => {
    expect(
      calculateR8ResidentTax({
        annualSalaryYen: 1_000_000,
        annualEmployeeSocialInsuranceYen: 0,
      }),
    ).toMatchObject({
      annualSalaryYen: 1_000_000,
      employmentIncomeDeductionYen: 650_000,
      employmentIncomeYen: 350_000,
      basicDeductionYen: 430_000,
      socialInsuranceDeductionYen: 0,
      taxableIncomeYen: 0,
      residentTaxIncomeRate: 0.1,
      residentTaxIncomeLevyYen: 0,
    });
  });

  it("calculates the two-million-yen representative case", () => {
    expect(calculateR8ResidentTax(TWO_MILLION_YEN_INPUT)).toMatchObject({
      annualSalaryYen: 2_000_000,
      employmentIncomeDeductionYen: 680_000,
      employmentIncomeYen: 1_320_000,
      basicDeductionYen: 430_000,
      socialInsuranceDeductionYen: 300_000,
      taxableIncomeYen: 590_000,
      residentTaxIncomeRate: 0.1,
      residentTaxIncomeLevyYen: 59_000,
    });
  });

  it("calculates the R8 contribution-aligned representative case independently", () => {
    expect(
      calculateR8ResidentTax({
        annualSalaryYen: 3_600_000,
        annualEmployeeSocialInsuranceYen: 562_680,
      }),
    ).toMatchObject({
      annualSalaryYen: 3_600_000,
      employmentIncomeDeductionYen: 1_160_000,
      employmentIncomeYen: 2_440_000,
      basicDeductionYen: 430_000,
      socialInsuranceDeductionYen: 562_680,
      taxableIncomeYen: 1_447_000,
      residentTaxIncomeRate: 0.1,
      residentTaxIncomeLevyYen: 144_600,
    });
  });

  it("returns R8 fiscal-year and steady-state metadata from the inactive policy", () => {
    const result = calculateR8ResidentTax(TWO_MILLION_YEN_INPUT);

    expect(result.calculationMode).toBe(R8_POLICY.calculationMode);
    expect(result.residentTaxFiscalYear).toBe(
      R8_POLICY.residentTaxFiscalYear,
    );
    expect(result.residentTaxFiscalYear).toEqual({
      kind: "fiscalYear",
      reiwaYear: 8,
      westernYear: 2026,
    });
    expect(R8_POLICY.isPubliclyActive).toBe(false);
    expect(R8_POLICY.knownLimitations).toContainEqual(
      expect.objectContaining({
        code: "residentTaxSteadyStateApproximation",
      }),
    );
  });

  it("accepts zero-yen inputs", () => {
    expect(
      calculateR8ResidentTax({
        annualSalaryYen: 0,
        annualEmployeeSocialInsuranceYen: 0,
      }),
    ).toMatchObject({
      annualSalaryYen: 0,
      employmentIncomeDeductionYen: 0,
      employmentIncomeYen: 0,
      basicDeductionYen: 430_000,
      socialInsuranceDeductionYen: 0,
      taxableIncomeYen: 0,
      residentTaxIncomeLevyYen: 0,
    });
  });

  it("floors taxable income at zero when social insurance exceeds salary", () => {
    expect(
      calculateR8ResidentTax({
        annualSalaryYen: 1_000_000,
        annualEmployeeSocialInsuranceYen: 2_000_000,
      }),
    ).toMatchObject({
      socialInsuranceDeductionYen: 2_000_000,
      taxableIncomeYen: 0,
      residentTaxIncomeLevyYen: 0,
    });
  });

  it.each([
    ["annualSalaryYen", Number.NaN],
    ["annualSalaryYen", Number.POSITIVE_INFINITY],
    ["annualSalaryYen", -1],
    ["annualSalaryYen", 1.5],
    ["annualSalaryYen", Number.MAX_SAFE_INTEGER + 1],
    ["annualEmployeeSocialInsuranceYen", Number.NaN],
    ["annualEmployeeSocialInsuranceYen", Number.POSITIVE_INFINITY],
    ["annualEmployeeSocialInsuranceYen", -1],
    ["annualEmployeeSocialInsuranceYen", 1.5],
    ["annualEmployeeSocialInsuranceYen", Number.MAX_SAFE_INTEGER + 1],
  ] satisfies [keyof R8ResidentTaxInput, number][])(
    "rejects invalid %s input: %s",
    (field, value) => {
      expect(() =>
        calculateR8ResidentTax({
          ...TWO_MILLION_YEN_INPUT,
          [field]: value,
        }),
      ).toThrow(RangeError);
    },
  );

  it("keeps every calculated yen amount finite, non-negative, and integral", () => {
    const result = calculateR8ResidentTax({
      annualSalaryYen: Number.MAX_SAFE_INTEGER,
      annualEmployeeSocialInsuranceYen: Number.MAX_SAFE_INTEGER,
    });
    const yenAmounts = [
      result.annualSalaryYen,
      result.employmentIncomeDeductionYen,
      result.employmentIncomeYen,
      result.basicDeductionYen,
      result.socialInsuranceDeductionYen,
      result.taxableIncomeYen,
      result.residentTaxIncomeLevyYen,
    ];

    for (const amount of yenAmounts) {
      expect(Number.isSafeInteger(amount)).toBe(true);
      expect(amount).toBeGreaterThanOrEqual(0);
    }
  });

  it("truncates taxable income below 1,000 yen", () => {
    const result = calculateR8ResidentTax({
      annualSalaryYen: 1_081_999,
      annualEmployeeSocialInsuranceYen: 0,
    });

    expect(result.employmentIncomeYen).toBe(431_999);
    expect(result.taxableIncomeYen).toBe(1_000);
  });

  it("truncates municipal and prefectural income levies separately below 100 yen", () => {
    const result = calculateR8ResidentTax({
      annualSalaryYen: 3_600_000,
      annualEmployeeSocialInsuranceYen: 562_680,
    });

    expect(result.taxableIncomeYen).toBe(1_447_000);
    expect(result.taxableIncomeYen * result.residentTaxIncomeRate).toBe(
      144_700,
    );
    expect(result.residentTaxIncomeLevyYen).toBe(144_600);
  });
});

describe("R8 resident-tax employment income", () => {
  it.each([
    { salaryYen: 0, expectedIncomeYen: 0 },
    { salaryYen: 649_999, expectedIncomeYen: 0 },
    { salaryYen: 650_000, expectedIncomeYen: 0 },
    { salaryYen: 650_001, expectedIncomeYen: 1 },
    { salaryYen: 1_000_000, expectedIncomeYen: 350_000 },
    { salaryYen: 1_624_999, expectedIncomeYen: 974_999 },
    { salaryYen: 1_625_000, expectedIncomeYen: 975_000 },
    { salaryYen: 1_625_001, expectedIncomeYen: 975_001 },
    { salaryYen: 1_799_999, expectedIncomeYen: 1_149_999 },
    { salaryYen: 1_800_000, expectedIncomeYen: 1_150_000 },
    { salaryYen: 1_899_999, expectedIncomeYen: 1_249_999 },
    { salaryYen: 1_900_000, expectedIncomeYen: 1_250_000 },
    { salaryYen: 1_900_001, expectedIncomeYen: 1_250_000 },
    { salaryYen: 3_599_999, expectedIncomeYen: 2_437_200 },
    { salaryYen: 3_600_000, expectedIncomeYen: 2_440_000 },
    { salaryYen: 3_600_001, expectedIncomeYen: 2_440_000 },
    { salaryYen: 6_599_999, expectedIncomeYen: 4_836_800 },
    { salaryYen: 6_600_000, expectedIncomeYen: 4_840_000 },
    { salaryYen: 6_600_001, expectedIncomeYen: 4_840_000 },
    { salaryYen: 8_499_999, expectedIncomeYen: 6_549_999 },
    { salaryYen: 8_500_000, expectedIncomeYen: 6_550_000 },
    { salaryYen: 8_500_001, expectedIncomeYen: 6_550_001 },
  ])(
    "returns $expectedIncomeYen yen for $salaryYen yen of salary",
    ({ salaryYen, expectedIncomeYen }) => {
      expect(calculateR8ResidentTaxEmploymentIncome(salaryYen)).toBe(
        expectedIncomeYen,
      );
    },
  );

  it("uses the four-way table basis with sub-1,000-yen truncation", () => {
    expect(calculateR8ResidentTaxEmploymentIncome(2_003_999)).toBe(1_320_000);
    expect(calculateR8ResidentTaxEmploymentIncome(2_004_000)).toBe(1_322_800);
  });
});

describe("R8 resident-tax deductions", () => {
  it.each([
    {
      salaryYen: 25_950_000,
      expectedEmploymentIncomeYen: 24_000_000,
      expectedBasicDeductionYen: 430_000,
    },
    {
      salaryYen: 25_950_001,
      expectedEmploymentIncomeYen: 24_000_001,
      expectedBasicDeductionYen: 290_000,
    },
    {
      salaryYen: 26_450_000,
      expectedEmploymentIncomeYen: 24_500_000,
      expectedBasicDeductionYen: 290_000,
    },
    {
      salaryYen: 26_450_001,
      expectedEmploymentIncomeYen: 24_500_001,
      expectedBasicDeductionYen: 150_000,
    },
    {
      salaryYen: 26_950_000,
      expectedEmploymentIncomeYen: 25_000_000,
      expectedBasicDeductionYen: 150_000,
    },
    {
      salaryYen: 26_950_001,
      expectedEmploymentIncomeYen: 25_000_001,
      expectedBasicDeductionYen: 0,
    },
  ])(
    "uses a $expectedBasicDeductionYen-yen basic deduction at $expectedEmploymentIncomeYen yen of income",
    ({
      salaryYen,
      expectedEmploymentIncomeYen,
      expectedBasicDeductionYen,
    }) => {
      expect(
        calculateR8ResidentTax({
          annualSalaryYen: salaryYen,
          annualEmployeeSocialInsuranceYen: 0,
        }),
      ).toMatchObject({
        employmentIncomeYen: expectedEmploymentIncomeYen,
        basicDeductionYen: expectedBasicDeductionYen,
      });
    },
  );

  it("deducts the explicitly supplied annual employee social insurance in full", () => {
    const withoutSocialInsurance = calculateR8ResidentTax({
      annualSalaryYen: 2_000_000,
      annualEmployeeSocialInsuranceYen: 0,
    });
    const withSocialInsurance = calculateR8ResidentTax(
      TWO_MILLION_YEN_INPUT,
    );

    expect(withoutSocialInsurance.taxableIncomeYen).toBe(890_000);
    expect(withSocialInsurance.socialInsuranceDeductionYen).toBe(300_000);
    expect(withSocialInsurance.taxableIncomeYen).toBe(590_000);
  });
});

describe("R7, R8 contribution, income-tax, and UI separation", () => {
  it("does not change the legacy result before or after an R8 resident-tax calculation", () => {
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

    calculateR8ResidentTax(TWO_MILLION_YEN_INPUT);

    expect(calculateSocialInsurance(legacyInput)).toEqual(before);
  });

  it("keeps legacy, R8 contributions, v2, and UI disconnected from R8 resident tax", () => {
    const guardedFiles = [
      "features/social-insurance/calculateSocialInsurance.ts",
      "features/social-insurance/r8/calculateR8Contributions.ts",
      ...listSourceFiles("features/social-insurance/v2"),
      ...listSourceFiles("features/social-insurance/components"),
    ];
    const residentTaxImportPattern = /social-insurance\/r8\/tax\//;

    for (const file of guardedFiles) {
      expect(
        readFileSync(file, "utf8"),
        `${file} imports R8 resident tax`,
      ).not.toMatch(residentTaxImportPattern);
    }
  });

  it("does not connect the resident-tax calculator to legacy, v2, contribution, UI, or income-tax calculations", () => {
    const source = readFileSync(
      "features/social-insurance/r8/tax/calculateR8ResidentTax.ts",
      "utf8",
    );

    expect(source).not.toMatch(/calculateSocialInsurance/);
    expect(source).not.toMatch(/calculateR8EmployeeContributions/);
    expect(source).not.toMatch(/social-insurance\/v2/);
    expect(source).not.toMatch(/social-insurance\/components/);
    expect(source).not.toMatch(/incomeTax/);
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
