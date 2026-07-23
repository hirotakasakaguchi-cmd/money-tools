import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import type {
  R8ResidentTaxInput,
  R8ResidentTaxResult,
} from "@/features/social-insurance/r8/tax/residentTaxTypes";

const MINIMUM_EMPLOYMENT_INCOME_DEDUCTION_YEN = 650_000;
const EMPLOYMENT_INCOME_MINIMUM_START_YEN = 651_000;
const FIRST_EMPLOYMENT_INCOME_TABLE_THRESHOLD_YEN = 1_900_000;
const SECOND_EMPLOYMENT_INCOME_TABLE_THRESHOLD_YEN = 3_600_000;
const THIRD_EMPLOYMENT_INCOME_TABLE_THRESHOLD_YEN = 6_600_000;
const MAXIMUM_EMPLOYMENT_INCOME_DEDUCTION_THRESHOLD_YEN = 8_500_000;
const EMPLOYMENT_INCOME_TABLE_QUARTER = 4;
const EMPLOYMENT_INCOME_TABLE_ROUNDING_UNIT_YEN = 1_000;

const FULL_BASIC_DEDUCTION_MAXIMUM_INCOME_YEN = 24_000_000;
const REDUCED_BASIC_DEDUCTION_FIRST_MAXIMUM_INCOME_YEN = 24_500_000;
const REDUCED_BASIC_DEDUCTION_SECOND_MAXIMUM_INCOME_YEN = 25_000_000;
const FULL_BASIC_DEDUCTION_YEN = 430_000;
const REDUCED_BASIC_DEDUCTION_FIRST_YEN = 290_000;
const REDUCED_BASIC_DEDUCTION_SECOND_YEN = 150_000;

const MUNICIPAL_INCOME_RATE = 0.08;
const PREFECTURAL_INCOME_RATE = 0.02;
const RESIDENT_TAX_INCOME_RATE =
  MUNICIPAL_INCOME_RATE + PREFECTURAL_INCOME_RATE;
const TAXABLE_INCOME_ROUNDING_UNIT_YEN = 1_000;
const INCOME_LEVY_ROUNDING_UNIT_YEN = 100;

/**
 * Calculates an unpublished R8 resident-tax income-levy approximation.
 *
 * This is a steady-state approximation that treats the current annual salary
 * conditions as if they also applied to the previous calendar year. It does
 * not calculate an actual tax notice and excludes the per-capita levy, forest
 * environment tax, tax credits, non-taxable-income determinations, and other
 * deductions.
 *
 * Official Fukuoka City references:
 * - R8 reform: https://www.city.fukuoka.lg.jp/zaisei/shisanzei/life/R8_kaisei.html
 * - Employment income: https://www.city.fukuoka.lg.jp/zaisei/zeisei/life/kojinshiminkenminzei/001.html
 * - Deductions: https://www.city.fukuoka.lg.jp/zaisei/zeisei/life/kojinshiminkenminzei/002.html
 * - Income rates: https://www.city.fukuoka.lg.jp/zaisei/zeisei/life/kojinshiminkenminzei/004.html
 */
export function calculateR8ResidentTax(
  input: R8ResidentTaxInput,
): R8ResidentTaxResult {
  assertNonNegativeSafeInteger(input.annualSalaryYen, "annualSalaryYen");
  assertNonNegativeSafeInteger(
    input.annualEmployeeSocialInsuranceYen,
    "annualEmployeeSocialInsuranceYen",
  );

  const employmentIncomeYen = calculateR8ResidentTaxEmploymentIncome(
    input.annualSalaryYen,
  );
  const employmentIncomeDeductionYen = subtractSafeYen(
    input.annualSalaryYen,
    employmentIncomeYen,
    "employment income deduction",
  );
  const basicDeductionYen =
    calculateR8ResidentTaxBasicDeduction(employmentIncomeYen);
  const taxableIncomeBeforeRoundingYen = subtractDeductionsWithZeroFloor(
    employmentIncomeYen,
    basicDeductionYen,
    input.annualEmployeeSocialInsuranceYen,
  );
  const taxableIncomeYen = floorToUnit(
    taxableIncomeBeforeRoundingYen,
    TAXABLE_INCOME_ROUNDING_UNIT_YEN,
  );
  const municipalIncomeLevyYen = calculateIncomeLevy(
    taxableIncomeYen,
    MUNICIPAL_INCOME_RATE,
  );
  const prefecturalIncomeLevyYen = calculateIncomeLevy(
    taxableIncomeYen,
    PREFECTURAL_INCOME_RATE,
  );
  const residentTaxIncomeLevyYen = addSafeYen(
    municipalIncomeLevyYen,
    prefecturalIncomeLevyYen,
    "resident tax income levy",
  );

  return {
    annualSalaryYen: input.annualSalaryYen,
    employmentIncomeDeductionYen,
    employmentIncomeYen,
    basicDeductionYen,
    socialInsuranceDeductionYen: input.annualEmployeeSocialInsuranceYen,
    taxableIncomeYen,
    residentTaxIncomeRate: RESIDENT_TAX_INCOME_RATE,
    residentTaxIncomeLevyYen,
    calculationMode: R8_POLICY.calculationMode,
    residentTaxFiscalYear: R8_POLICY.residentTaxFiscalYear,
  };
}

/**
 * Applies only the R8 resident-tax employment-income table. This function is
 * intentionally separate from income-tax and legacy salary calculations.
 */
export function calculateR8ResidentTaxEmploymentIncome(
  annualSalaryYen: number,
): number {
  assertNonNegativeSafeInteger(annualSalaryYen, "annualSalaryYen");

  if (annualSalaryYen < EMPLOYMENT_INCOME_MINIMUM_START_YEN) {
    return 0;
  }

  if (annualSalaryYen < FIRST_EMPLOYMENT_INCOME_TABLE_THRESHOLD_YEN) {
    return subtractSafeYen(
      annualSalaryYen,
      MINIMUM_EMPLOYMENT_INCOME_DEDUCTION_YEN,
      "employment income",
    );
  }

  if (annualSalaryYen < SECOND_EMPLOYMENT_INCOME_TABLE_THRESHOLD_YEN) {
    const tableBasisYen = calculateEmploymentIncomeTableBasis(annualSalaryYen);

    return assertCalculatedYen(
      tableBasisYen * 2.8 - 80_000,
      "employment income",
    );
  }

  if (annualSalaryYen < THIRD_EMPLOYMENT_INCOME_TABLE_THRESHOLD_YEN) {
    const tableBasisYen = calculateEmploymentIncomeTableBasis(annualSalaryYen);

    return assertCalculatedYen(
      tableBasisYen * 3.2 - 440_000,
      "employment income",
    );
  }

  if (
    annualSalaryYen < MAXIMUM_EMPLOYMENT_INCOME_DEDUCTION_THRESHOLD_YEN
  ) {
    return assertCalculatedYen(
      Math.floor(annualSalaryYen * 0.9) - 1_100_000,
      "employment income",
    );
  }

  return subtractSafeYen(
    annualSalaryYen,
    1_950_000,
    "employment income",
  );
}

function calculateR8ResidentTaxBasicDeduction(employmentIncomeYen: number) {
  if (employmentIncomeYen <= FULL_BASIC_DEDUCTION_MAXIMUM_INCOME_YEN) {
    return FULL_BASIC_DEDUCTION_YEN;
  }

  if (
    employmentIncomeYen <=
    REDUCED_BASIC_DEDUCTION_FIRST_MAXIMUM_INCOME_YEN
  ) {
    return REDUCED_BASIC_DEDUCTION_FIRST_YEN;
  }

  if (
    employmentIncomeYen <=
    REDUCED_BASIC_DEDUCTION_SECOND_MAXIMUM_INCOME_YEN
  ) {
    return REDUCED_BASIC_DEDUCTION_SECOND_YEN;
  }

  return 0;
}

function calculateEmploymentIncomeTableBasis(annualSalaryYen: number) {
  return floorToUnit(
    Math.floor(annualSalaryYen / EMPLOYMENT_INCOME_TABLE_QUARTER),
    EMPLOYMENT_INCOME_TABLE_ROUNDING_UNIT_YEN,
  );
}

function subtractDeductionsWithZeroFloor(
  employmentIncomeYen: number,
  basicDeductionYen: number,
  socialInsuranceDeductionYen: number,
) {
  const afterBasicDeduction = Math.max(
    0,
    employmentIncomeYen - basicDeductionYen,
  );

  return Math.max(0, afterBasicDeduction - socialInsuranceDeductionYen);
}

function calculateIncomeLevy(taxableIncomeYen: number, rate: number) {
  const unroundedLevyYen = taxableIncomeYen * rate;

  if (!Number.isSafeInteger(unroundedLevyYen) || unroundedLevyYen < 0) {
    throw new RangeError("Calculated resident tax is outside the safe yen range.");
  }

  return floorToUnit(unroundedLevyYen, INCOME_LEVY_ROUNDING_UNIT_YEN);
}

function floorToUnit(value: number, unit: number) {
  const floored = Math.floor(value / unit) * unit;

  return assertCalculatedYen(floored, "rounded amount");
}

function subtractSafeYen(minuend: number, subtrahend: number, label: string) {
  return assertCalculatedYen(minuend - subtrahend, label);
}

function addSafeYen(left: number, right: number, label: string) {
  return assertCalculatedYen(left + right, label);
}

function assertCalculatedYen(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Calculated ${label} is outside the safe yen range.`);
  }

  return value;
}

function assertNonNegativeSafeInteger(value: number, fieldName: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative safe integer.`);
  }
}
