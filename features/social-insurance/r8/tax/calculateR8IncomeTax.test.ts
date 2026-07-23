import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { calculateSocialInsurance } from "@/features/social-insurance/calculateSocialInsurance";
import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import {
  calculateR8IncomeTax,
  calculateR8IncomeTaxBasicDeduction,
  calculateR8IncomeTaxEmploymentIncome,
  calculateR8NationalIncomeTaxBeforeReconstruction,
} from "@/features/social-insurance/r8/tax/calculateR8IncomeTax";
import type { R8IncomeTaxInput } from "@/features/social-insurance/r8/tax/incomeTaxTypes";
import type { SocialInsuranceInput } from "@/features/social-insurance/types";

const REPRESENTATIVE_INPUT = {
  annualSalaryYen: 3_600_000,
  annualEmployeeSocialInsuranceYen: 562_680,
} satisfies R8IncomeTaxInput;

describe("calculateR8IncomeTax", () => {
  it("calculates the one-million-yen representative case", () => {
    expect(
      calculateR8IncomeTax({
        annualSalaryYen: 1_000_000,
        annualEmployeeSocialInsuranceYen: 0,
      }),
    ).toMatchObject({
      annualSalaryYen: 1_000_000,
      employmentIncomeDeductionYen: 740_000,
      employmentIncomeYen: 260_000,
      basicDeductionYen: 1_040_000,
      socialInsuranceDeductionYen: 0,
      taxableIncomeYen: 0,
      nationalIncomeTaxRate: 0,
      nationalIncomeTaxRateDeductionYen: 0,
      nationalIncomeTaxBeforeReconstructionYen: 0,
      reconstructionSpecialIncomeTaxYen: 0,
      totalNationalIncomeTaxYen: 0,
    });
  });

  it("calculates the two-million-yen representative case", () => {
    expect(
      calculateR8IncomeTax({
        annualSalaryYen: 2_000_000,
        annualEmployeeSocialInsuranceYen: 300_000,
      }),
    ).toMatchObject({
      annualSalaryYen: 2_000_000,
      employmentIncomeDeductionYen: 740_000,
      employmentIncomeYen: 1_260_000,
      basicDeductionYen: 1_040_000,
      socialInsuranceDeductionYen: 300_000,
      taxableIncomeYen: 0,
      nationalIncomeTaxBeforeReconstructionYen: 0,
      reconstructionSpecialIncomeTaxYen: 0,
      totalNationalIncomeTaxYen: 0,
    });
  });

  it("calculates the contribution-aligned 3.6-million-yen representative case", () => {
    expect(calculateR8IncomeTax(REPRESENTATIVE_INPUT)).toMatchObject({
      annualSalaryYen: 3_600_000,
      employmentIncomeDeductionYen: 1_160_000,
      employmentIncomeYen: 2_440_000,
      basicDeductionYen: 880_000,
      socialInsuranceDeductionYen: 562_680,
      taxableIncomeYen: 997_000,
      nationalIncomeTaxRate: 0.05,
      nationalIncomeTaxRateDeductionYen: 0,
      nationalIncomeTaxBeforeReconstructionYen: 49_850,
      reconstructionSpecialIncomeTaxYen: 1_046,
      totalNationalIncomeTaxYen: 50_800,
    });
  });

  it("returns R8 income-tax year and annual-estimate metadata", () => {
    const result = calculateR8IncomeTax(REPRESENTATIVE_INPUT);

    expect(result.incomeTaxYear).toBe(R8_POLICY.incomeTaxYear);
    expect(result.incomeTaxYear).toEqual({
      kind: "calendarYear",
      reiwaYear: 8,
      westernYear: 2026,
    });
    expect(result.calculationMode).toBe(R8_POLICY.calculationMode);
    expect(R8_POLICY.isPubliclyActive).toBe(false);
  });

  it("accepts zero-yen inputs", () => {
    expect(
      calculateR8IncomeTax({
        annualSalaryYen: 0,
        annualEmployeeSocialInsuranceYen: 0,
      }),
    ).toMatchObject({
      annualSalaryYen: 0,
      employmentIncomeDeductionYen: 0,
      employmentIncomeYen: 0,
      taxableIncomeYen: 0,
      totalNationalIncomeTaxYen: 0,
    });
  });

  it("floors taxable income at zero when social insurance exceeds salary", () => {
    expect(
      calculateR8IncomeTax({
        annualSalaryYen: 1_000_000,
        annualEmployeeSocialInsuranceYen: 2_000_000,
      }),
    ).toMatchObject({
      socialInsuranceDeductionYen: 2_000_000,
      taxableIncomeYen: 0,
      totalNationalIncomeTaxYen: 0,
    });
  });

  it("truncates taxable income below 1,000 yen", () => {
    const result = calculateR8IncomeTax({
      annualSalaryYen: 2_061_999,
      annualEmployeeSocialInsuranceYen: 0,
    });

    expect(result.employmentIncomeYen).toBe(1_321_999);
    expect(result.basicDeductionYen).toBe(880_000);
    expect(result.taxableIncomeYen).toBe(441_000);
  });

  it("returns reconstruction tax separately and truncates the final total below 100 yen", () => {
    const result = calculateR8IncomeTax(REPRESENTATIVE_INPUT);

    expect(result.reconstructionSpecialIncomeTaxYen).toBe(
      Math.floor(49_850 * 0.021),
    );
    expect(
      result.nationalIncomeTaxBeforeReconstructionYen +
        result.reconstructionSpecialIncomeTaxYen,
    ).toBe(50_896);
    expect(result.totalNationalIncomeTaxYen).toBe(50_800);
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
  ] satisfies [keyof R8IncomeTaxInput, number][])(
    "rejects invalid %s input: %s",
    (field, value) => {
      expect(() =>
        calculateR8IncomeTax({
          ...REPRESENTATIVE_INPUT,
          [field]: value,
        }),
      ).toThrow(RangeError);
    },
  );

  it("keeps calculated yen amounts finite, non-negative, and integral at the safe input limit", () => {
    const result = calculateR8IncomeTax({
      annualSalaryYen: Number.MAX_SAFE_INTEGER,
      annualEmployeeSocialInsuranceYen: 0,
    });
    const yenAmounts = [
      result.annualSalaryYen,
      result.employmentIncomeDeductionYen,
      result.employmentIncomeYen,
      result.basicDeductionYen,
      result.socialInsuranceDeductionYen,
      result.taxableIncomeYen,
      result.nationalIncomeTaxRateDeductionYen,
      result.nationalIncomeTaxBeforeReconstructionYen,
      result.reconstructionSpecialIncomeTaxYen,
      result.totalNationalIncomeTaxYen,
    ];

    for (const amount of yenAmounts) {
      expect(Number.isSafeInteger(amount)).toBe(true);
      expect(amount).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("R8 income-tax employment income", () => {
  it.each([
    { salaryYen: 0, expectedIncomeYen: 0 },
    { salaryYen: 740_999, expectedIncomeYen: 0 },
    { salaryYen: 741_000, expectedIncomeYen: 1_000 },
    { salaryYen: 1_899_999, expectedIncomeYen: 1_159_999 },
    { salaryYen: 1_900_000, expectedIncomeYen: 1_160_000 },
    { salaryYen: 1_900_001, expectedIncomeYen: 1_160_001 },
    { salaryYen: 2_190_999, expectedIncomeYen: 1_450_999 },
    { salaryYen: 2_191_000, expectedIncomeYen: 1_451_000 },
    { salaryYen: 2_192_999, expectedIncomeYen: 1_451_000 },
    { salaryYen: 2_193_000, expectedIncomeYen: 1_453_000 },
    { salaryYen: 2_195_999, expectedIncomeYen: 1_453_000 },
    { salaryYen: 2_196_000, expectedIncomeYen: 1_456_000 },
    { salaryYen: 2_199_999, expectedIncomeYen: 1_456_000 },
    { salaryYen: 2_200_000, expectedIncomeYen: 1_460_000 },
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
      expect(calculateR8IncomeTaxEmploymentIncome(salaryYen)).toBe(
        expectedIncomeYen,
      );
    },
  );

  it("uses the four-way table basis with sub-1,000-yen truncation", () => {
    expect(calculateR8IncomeTaxEmploymentIncome(2_203_999)).toBe(1_460_000);
    expect(calculateR8IncomeTaxEmploymentIncome(2_204_000)).toBe(1_462_800);
  });
});

describe("R8 income-tax basic deduction", () => {
  it.each([
    { incomeYen: 0, expectedDeductionYen: 1_040_000 },
    { incomeYen: 1_320_000, expectedDeductionYen: 1_040_000 },
    { incomeYen: 1_320_001, expectedDeductionYen: 880_000 },
    { incomeYen: 3_360_000, expectedDeductionYen: 880_000 },
    { incomeYen: 3_360_001, expectedDeductionYen: 680_000 },
    { incomeYen: 4_890_000, expectedDeductionYen: 680_000 },
    { incomeYen: 4_890_001, expectedDeductionYen: 670_000 },
    { incomeYen: 6_550_000, expectedDeductionYen: 670_000 },
    { incomeYen: 6_550_001, expectedDeductionYen: 620_000 },
    { incomeYen: 23_500_000, expectedDeductionYen: 620_000 },
    { incomeYen: 23_500_001, expectedDeductionYen: 480_000 },
    { incomeYen: 24_000_000, expectedDeductionYen: 480_000 },
    { incomeYen: 24_000_001, expectedDeductionYen: 320_000 },
    { incomeYen: 24_500_000, expectedDeductionYen: 320_000 },
    { incomeYen: 24_500_001, expectedDeductionYen: 160_000 },
    { incomeYen: 25_000_000, expectedDeductionYen: 160_000 },
    { incomeYen: 25_000_001, expectedDeductionYen: 0 },
  ])(
    "returns $expectedDeductionYen yen at $incomeYen yen of income",
    ({ incomeYen, expectedDeductionYen }) => {
      expect(calculateR8IncomeTaxBasicDeduction(incomeYen)).toBe(
        expectedDeductionYen,
      );
    },
  );
});

describe("R8 progressive national income-tax rates", () => {
  it.each([
    { taxableYen: 0, rate: 0, deductionYen: 0, incomeTaxYen: 0 },
    { taxableYen: 999, rate: 0, deductionYen: 0, incomeTaxYen: 0 },
    { taxableYen: 1_000, rate: 0.05, deductionYen: 0, incomeTaxYen: 50 },
    { taxableYen: 1_001, rate: 0.05, deductionYen: 0, incomeTaxYen: 50 },
    {
      taxableYen: 1_949_999,
      rate: 0.05,
      deductionYen: 0,
      incomeTaxYen: 97_450,
    },
    {
      taxableYen: 1_950_000,
      rate: 0.1,
      deductionYen: 97_500,
      incomeTaxYen: 97_500,
    },
    {
      taxableYen: 1_950_001,
      rate: 0.1,
      deductionYen: 97_500,
      incomeTaxYen: 97_500,
    },
    {
      taxableYen: 3_299_999,
      rate: 0.1,
      deductionYen: 97_500,
      incomeTaxYen: 232_400,
    },
    {
      taxableYen: 3_300_000,
      rate: 0.2,
      deductionYen: 427_500,
      incomeTaxYen: 232_500,
    },
    {
      taxableYen: 3_300_001,
      rate: 0.2,
      deductionYen: 427_500,
      incomeTaxYen: 232_500,
    },
    {
      taxableYen: 6_949_999,
      rate: 0.2,
      deductionYen: 427_500,
      incomeTaxYen: 962_300,
    },
    {
      taxableYen: 6_950_000,
      rate: 0.23,
      deductionYen: 636_000,
      incomeTaxYen: 962_500,
    },
    {
      taxableYen: 6_950_001,
      rate: 0.23,
      deductionYen: 636_000,
      incomeTaxYen: 962_500,
    },
    {
      taxableYen: 8_999_999,
      rate: 0.23,
      deductionYen: 636_000,
      incomeTaxYen: 1_433_770,
    },
    {
      taxableYen: 9_000_000,
      rate: 0.33,
      deductionYen: 1_536_000,
      incomeTaxYen: 1_434_000,
    },
    {
      taxableYen: 9_000_001,
      rate: 0.33,
      deductionYen: 1_536_000,
      incomeTaxYen: 1_434_000,
    },
    {
      taxableYen: 17_999_999,
      rate: 0.33,
      deductionYen: 1_536_000,
      incomeTaxYen: 4_403_670,
    },
    {
      taxableYen: 18_000_000,
      rate: 0.4,
      deductionYen: 2_796_000,
      incomeTaxYen: 4_404_000,
    },
    {
      taxableYen: 18_000_001,
      rate: 0.4,
      deductionYen: 2_796_000,
      incomeTaxYen: 4_404_000,
    },
    {
      taxableYen: 39_999_999,
      rate: 0.4,
      deductionYen: 2_796_000,
      incomeTaxYen: 13_203_600,
    },
    {
      taxableYen: 40_000_000,
      rate: 0.45,
      deductionYen: 4_796_000,
      incomeTaxYen: 13_204_000,
    },
    {
      taxableYen: 40_000_001,
      rate: 0.45,
      deductionYen: 4_796_000,
      incomeTaxYen: 13_204_000,
    },
  ])(
    "calculates $incomeTaxYen yen at $taxableYen yen of taxable income",
    ({ taxableYen, rate, deductionYen, incomeTaxYen }) => {
      expect(
        calculateR8NationalIncomeTaxBeforeReconstruction(taxableYen),
      ).toEqual({
        rate,
        deductionYen,
        incomeTaxYen,
      });
    },
  );
});

describe("R7, R8 contribution, resident-tax, v2, and UI separation", () => {
  it("does not change the legacy result before or after an R8 income-tax calculation", () => {
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

    calculateR8IncomeTax(REPRESENTATIVE_INPUT);

    expect(calculateSocialInsurance(legacyInput)).toEqual(before);
  });

  it("keeps existing production sources disconnected from R8 income tax", () => {
    const guardedFiles = [
      "features/social-insurance/calculateSocialInsurance.ts",
      "features/social-insurance/r8/calculateR8Contributions.ts",
      "features/social-insurance/r8/tax/calculateR8ResidentTax.ts",
      ...listSourceFiles("features/social-insurance/v2"),
      ...listSourceFiles("features/social-insurance/components"),
    ];
    const incomeTaxImportPattern =
      /(?:calculateR8IncomeTax|r8\/tax\/incomeTaxTypes)/;

    for (const file of guardedFiles) {
      expect(
        readFileSync(file, "utf8"),
        `${file} imports R8 income tax`,
      ).not.toMatch(incomeTaxImportPattern);
    }
  });

  it("does not connect the income-tax calculator to legacy, contributions, resident tax, v2, or UI", () => {
    const source = readFileSync(
      "features/social-insurance/r8/tax/calculateR8IncomeTax.ts",
      "utf8",
    );

    expect(source).not.toMatch(/calculateSocialInsurance/);
    expect(source).not.toMatch(/calculateR8EmployeeContributions/);
    expect(source).not.toMatch(/calculateR8ResidentTax/);
    expect(source).not.toMatch(/social-insurance\/v2/);
    expect(source).not.toMatch(/social-insurance\/components/);
    expect(R8_POLICY.isPubliclyActive).toBe(false);
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
