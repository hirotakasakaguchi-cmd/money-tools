import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { calculateSocialInsurance } from "@/features/social-insurance/calculateSocialInsurance";
import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import { calculateR8AnnualNetIncome } from "@/features/social-insurance/r8/calculateR8AnnualNetIncome";
import { calculateR8EmployeeContributions } from "@/features/social-insurance/r8/calculateR8Contributions";
import { calculateR8IncomeTax } from "@/features/social-insurance/r8/tax/calculateR8IncomeTax";
import { calculateR8ResidentTax } from "@/features/social-insurance/r8/tax/calculateR8ResidentTax";
import type { R8AnnualNetIncomeInput } from "@/features/social-insurance/r8/annualNetIncomeTypes";
import type { SocialInsuranceInput } from "@/features/social-insurance/types";

const REPRESENTATIVE_INPUT = {
  annualSalaryYen: 3_600_000,
  healthStandardMonthlyRemunerationYen: 300_000,
  pensionStandardMonthlyRemunerationYen: 300_000,
  age: 40,
} satisfies R8AnnualNetIncomeInput;

describe("calculateR8AnnualNetIncome", () => {
  it("calculates the one-million-yen representative case from fixed expectations", () => {
    expect(
      calculateR8AnnualNetIncome({
        annualSalaryYen: 1_000_000,
        healthStandardMonthlyRemunerationYen: 88_000,
        pensionStandardMonthlyRemunerationYen: 88_000,
        age: 39,
      }),
    ).toMatchObject({
      annualSalaryYen: 1_000_000,
      annualEmployeeSocialInsuranceYen: 156_219,
      annualIncomeTaxYen: 0,
      annualResidentTaxIncomeLevyYen: 0,
      annualNetIncomeYen: 843_781,
      monthlyAverageNetIncomeYen: 70_315,
      socialInsuranceBreakdown: {
        healthInsuranceYen: 53_381,
        nursingCareInsuranceYen: 0,
        pensionInsuranceYen: 96_624,
        employmentInsuranceYen: 5_000,
        childAndFamilySupportYen: 1_214,
        totalEmployeeContributionYen: 156_219,
      },
    });
  });

  it("calculates the two-million-yen representative case from fixed expectations", () => {
    expect(
      calculateR8AnnualNetIncome({
        annualSalaryYen: 2_000_000,
        healthStandardMonthlyRemunerationYen: 170_000,
        pensionStandardMonthlyRemunerationYen: 170_000,
        age: 39,
      }),
    ).toMatchObject({
      annualSalaryYen: 2_000_000,
      annualEmployeeSocialInsuranceYen: 302_128,
      annualIncomeTaxYen: 0,
      annualResidentTaxIncomeLevyYen: 58_600,
      annualNetIncomeYen: 1_639_272,
      monthlyAverageNetIncomeYen: 136_606,
    });
  });

  it("calculates the 3.6-million-yen representative case from fixed expectations", () => {
    expect(calculateR8AnnualNetIncome(REPRESENTATIVE_INPUT)).toMatchObject({
      annualSalaryYen: 3_600_000,
      annualEmployeeSocialInsuranceYen: 562_680,
      annualIncomeTaxYen: 50_800,
      annualResidentTaxIncomeLevyYen: 144_600,
      annualNetIncomeYen: 2_841_920,
      monthlyAverageNetIncomeYen: 236_827,
      socialInsuranceBreakdown: {
        healthInsuranceYen: 181_980,
        nursingCareInsuranceYen: 29_160,
        pensionInsuranceYen: 329_400,
        employmentInsuranceYen: 18_000,
        childAndFamilySupportYen: 4_140,
        totalEmployeeContributionYen: 562_680,
      },
      incomeTaxBreakdown: {
        taxableIncomeYen: 997_000,
        nationalIncomeTaxBeforeReconstructionYen: 49_850,
        reconstructionSpecialIncomeTaxYen: 1_046,
        totalNationalIncomeTaxYen: 50_800,
      },
      residentTaxBreakdown: {
        taxableIncomeYen: 1_447_000,
        residentTaxIncomeLevyYen: 144_600,
      },
    });
  });

  it.each([
    {
      age: 39,
      careInsuranceYen: 0,
      totalContributionYen: 533_520,
      incomeTaxYen: 52_300,
      residentTaxIncomeLevyYen: 147_500,
      annualNetIncomeYen: 2_866_680,
      monthlyAverageNetIncomeYen: 238_890,
    },
    {
      age: 40,
      careInsuranceYen: 29_160,
      totalContributionYen: 562_680,
      incomeTaxYen: 50_800,
      residentTaxIncomeLevyYen: 144_600,
      annualNetIncomeYen: 2_841_920,
      monthlyAverageNetIncomeYen: 236_827,
    },
    {
      age: 64,
      careInsuranceYen: 29_160,
      totalContributionYen: 562_680,
      incomeTaxYen: 50_800,
      residentTaxIncomeLevyYen: 144_600,
      annualNetIncomeYen: 2_841_920,
      monthlyAverageNetIncomeYen: 236_827,
    },
    {
      age: 65,
      careInsuranceYen: 0,
      totalContributionYen: 533_520,
      incomeTaxYen: 52_300,
      residentTaxIncomeLevyYen: 147_500,
      annualNetIncomeYen: 2_866_680,
      monthlyAverageNetIncomeYen: 238_890,
    },
  ])(
    "preserves the existing R8 age rule at age $age",
    ({
      age,
      careInsuranceYen,
      totalContributionYen,
      incomeTaxYen,
      residentTaxIncomeLevyYen,
      annualNetIncomeYen,
      monthlyAverageNetIncomeYen,
    }) => {
      const result = calculateR8AnnualNetIncome({
        ...REPRESENTATIVE_INPUT,
        age,
      });

      expect(result.socialInsuranceBreakdown.nursingCareInsuranceYen).toBe(
        careInsuranceYen,
      );
      expect(result.annualEmployeeSocialInsuranceYen).toBe(
        totalContributionYen,
      );
      expect(result.annualIncomeTaxYen).toBe(incomeTaxYen);
      expect(result.annualResidentTaxIncomeLevyYen).toBe(
        residentTaxIncomeLevyYen,
      );
      expect(result.annualNetIncomeYen).toBe(annualNetIncomeYen);
      expect(result.monthlyAverageNetIncomeYen).toBe(
        monthlyAverageNetIncomeYen,
      );
    },
  );

  it("passes the complete employee contribution total to both tax calculations", () => {
    const result = calculateR8AnnualNetIncome(REPRESENTATIVE_INPUT);

    expect(result.annualEmployeeSocialInsuranceYen).toBe(
      result.socialInsuranceBreakdown.healthInsuranceYen +
        result.socialInsuranceBreakdown.nursingCareInsuranceYen +
        result.socialInsuranceBreakdown.pensionInsuranceYen +
        result.socialInsuranceBreakdown.employmentInsuranceYen +
        result.socialInsuranceBreakdown.childAndFamilySupportYen,
    );
    expect(result.incomeTaxBreakdown.socialInsuranceDeductionYen).toBe(
      result.annualEmployeeSocialInsuranceYen,
    );
    expect(result.residentTaxBreakdown.socialInsuranceDeductionYen).toBe(
      result.annualEmployeeSocialInsuranceYen,
    );
  });

  it("matches each existing R8 calculator result", () => {
    const result = calculateR8AnnualNetIncome(REPRESENTATIVE_INPUT);
    const socialInsuranceBreakdown =
      calculateR8EmployeeContributions(REPRESENTATIVE_INPUT);
    const taxInput = {
      annualSalaryYen: REPRESENTATIVE_INPUT.annualSalaryYen,
      annualEmployeeSocialInsuranceYen:
        socialInsuranceBreakdown.totalEmployeeContributionYen,
    };

    expect(result.socialInsuranceBreakdown).toEqual(
      socialInsuranceBreakdown,
    );
    expect(result.incomeTaxBreakdown).toEqual(
      calculateR8IncomeTax(taxInput),
    );
    expect(result.residentTaxBreakdown).toEqual(
      calculateR8ResidentTax(taxInput),
    );
  });

  it("satisfies the annual net-income identity", () => {
    const result = calculateR8AnnualNetIncome(REPRESENTATIVE_INPUT);

    expect(result.annualNetIncomeYen).toBe(
      result.annualSalaryYen -
        result.annualEmployeeSocialInsuranceYen -
        result.annualIncomeTaxYen -
        result.annualResidentTaxIncomeLevyYen,
    );
  });

  it("rounds the monthly average to the nearest whole yen", () => {
    const result = calculateR8AnnualNetIncome(REPRESENTATIVE_INPUT);

    expect(result.annualNetIncomeYen / 12).toBeCloseTo(236_826.666);
    expect(result.monthlyAverageNetIncomeYen).toBe(236_827);
  });

  it("floors annual and monthly net income at zero", () => {
    const result = calculateR8AnnualNetIncome({
      annualSalaryYen: 0,
      healthStandardMonthlyRemunerationYen: 1_000_000,
      pensionStandardMonthlyRemunerationYen: 1_000_000,
      age: 40,
    });

    expect(result.annualEmployeeSocialInsuranceYen).toBeGreaterThan(0);
    expect(result.annualNetIncomeYen).toBe(0);
    expect(result.monthlyAverageNetIncomeYen).toBe(0);
  });

  it("returns the three R8 year contexts and annual-estimate mode", () => {
    const result = calculateR8AnnualNetIncome(REPRESENTATIVE_INPUT);

    expect(result.calculationYear).toEqual({
      socialInsuranceFiscalYear: R8_POLICY.socialInsuranceFiscalYear,
      incomeTaxYear: R8_POLICY.incomeTaxYear,
      residentTaxFiscalYear: R8_POLICY.residentTaxFiscalYear,
    });
    expect(result.calculationMode).toBe("steadyStateAnnualEstimate");
    expect(R8_POLICY.isPubliclyActive).toBe(false);
  });

  it("does not mutate the integration input", () => {
    const input = structuredClone(REPRESENTATIVE_INPUT);
    const before = structuredClone(input);

    calculateR8AnnualNetIncome(input);

    expect(input).toEqual(before);
  });

  it.each([
    ["annualSalaryYen", Number.NaN],
    ["annualSalaryYen", Number.POSITIVE_INFINITY],
    ["annualSalaryYen", -1],
    ["annualSalaryYen", 1.5],
    ["annualSalaryYen", Number.MAX_SAFE_INTEGER + 1],
    ["healthStandardMonthlyRemunerationYen", Number.NaN],
    ["healthStandardMonthlyRemunerationYen", Number.POSITIVE_INFINITY],
    ["healthStandardMonthlyRemunerationYen", -1],
    ["healthStandardMonthlyRemunerationYen", 1.5],
    ["healthStandardMonthlyRemunerationYen", Number.MAX_SAFE_INTEGER + 1],
    ["pensionStandardMonthlyRemunerationYen", Number.NaN],
    ["pensionStandardMonthlyRemunerationYen", Number.POSITIVE_INFINITY],
    ["pensionStandardMonthlyRemunerationYen", -1],
    ["pensionStandardMonthlyRemunerationYen", 1.5],
    ["pensionStandardMonthlyRemunerationYen", Number.MAX_SAFE_INTEGER + 1],
    ["age", Number.NaN],
    ["age", Number.POSITIVE_INFINITY],
    ["age", -1],
    ["age", 40.5],
    ["age", Number.MAX_SAFE_INTEGER + 1],
  ] satisfies [keyof R8AnnualNetIncomeInput, number][])(
    "rejects invalid %s input: %s",
    (field, value) => {
      expect(() =>
        calculateR8AnnualNetIncome({
          ...REPRESENTATIVE_INPUT,
          [field]: value,
        }),
      ).toThrow(RangeError);
    },
  );

  it("returns only finite, non-negative safe integer yen amounts at the safe salary limit", () => {
    const result = calculateR8AnnualNetIncome({
      annualSalaryYen: Number.MAX_SAFE_INTEGER,
      healthStandardMonthlyRemunerationYen: 0,
      pensionStandardMonthlyRemunerationYen: 0,
      age: 39,
    });
    const yenAmounts = [
      result.annualSalaryYen,
      result.annualEmployeeSocialInsuranceYen,
      result.annualIncomeTaxYen,
      result.annualResidentTaxIncomeLevyYen,
      result.annualNetIncomeYen,
      result.monthlyAverageNetIncomeYen,
    ];

    for (const amount of yenAmounts) {
      expect(Number.isSafeInteger(amount)).toBe(true);
      expect(Number.isFinite(amount)).toBe(true);
      expect(amount).toBeGreaterThanOrEqual(0);
    }
  });

  it("rejects a contribution calculation that exceeds the safe yen range", () => {
    expect(() =>
      calculateR8AnnualNetIncome({
        annualSalaryYen: Number.MAX_SAFE_INTEGER,
        healthStandardMonthlyRemunerationYen: Number.MAX_SAFE_INTEGER,
        pensionStandardMonthlyRemunerationYen: Number.MAX_SAFE_INTEGER,
        age: 40,
      }),
    ).toThrow(RangeError);
  });

});

describe("R8 annual net-income integration separation", () => {
  it("does not change the legacy result before or after an integrated calculation", () => {
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

    calculateR8AnnualNetIncome(REPRESENTATIVE_INPUT);

    expect(calculateSocialInsurance(legacyInput)).toEqual(before);
  });

  it("keeps legacy, v2, UI, and public routes disconnected", () => {
    const guardedFiles = [
      "features/social-insurance/calculateSocialInsurance.ts",
      ...listSourceFiles("features/social-insurance/v2"),
      ...listSourceFiles("features/social-insurance/components"),
      ...listSourceFiles("app"),
    ];
    const integrationImportPattern =
      /(?:calculateR8AnnualNetIncome|annualNetIncomeTypes)/;

    for (const file of guardedFiles) {
      expect(
        readFileSync(file, "utf8"),
        `${file} imports the R8 annual net-income integration`,
      ).not.toMatch(integrationImportPattern);
    }
  });

  it("keeps the integration layer thin and the R8 policy inactive", () => {
    const source = readFileSync(
      "features/social-insurance/r8/calculateR8AnnualNetIncome.ts",
      "utf8",
    );

    expect(source).toContain("calculateR8EmployeeContributions(input)");
    expect(source).toContain("calculateR8IncomeTax(taxInput)");
    expect(source).toContain("calculateR8ResidentTax(taxInput)");
    expect(source).not.toMatch(
      /(?:ContributionValues|EMPLOYEE_RATE|INCOME_TAX_BANDS|BASIC_DEDUCTION_BANDS)/,
    );
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
