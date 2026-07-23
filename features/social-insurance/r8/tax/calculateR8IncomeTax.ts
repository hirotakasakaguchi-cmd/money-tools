import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import type {
  R8IncomeTaxInput,
  R8IncomeTaxRateResult,
  R8IncomeTaxResult,
} from "@/features/social-insurance/r8/tax/incomeTaxTypes";

const MINIMUM_EMPLOYMENT_INCOME_DEDUCTION_YEN = 740_000;
const EMPLOYMENT_INCOME_MINIMUM_START_YEN = 741_000;
const FIRST_FIXED_EMPLOYMENT_INCOME_START_YEN = 2_191_000;
const SECOND_FIXED_EMPLOYMENT_INCOME_START_YEN = 2_193_000;
const THIRD_FIXED_EMPLOYMENT_INCOME_START_YEN = 2_196_000;
const EMPLOYMENT_INCOME_TABLE_FORMULA_START_YEN = 2_200_000;
const SECOND_EMPLOYMENT_INCOME_TABLE_THRESHOLD_YEN = 3_600_000;
const THIRD_EMPLOYMENT_INCOME_TABLE_THRESHOLD_YEN = 6_600_000;
const MAXIMUM_EMPLOYMENT_INCOME_DEDUCTION_THRESHOLD_YEN = 8_500_000;
const EMPLOYMENT_INCOME_TABLE_QUARTER = 4;
const EMPLOYMENT_INCOME_TABLE_ROUNDING_UNIT_YEN = 1_000;

const BASIC_DEDUCTION_BANDS = [
  { maximumIncomeYen: 1_320_000, deductionYen: 1_040_000 },
  { maximumIncomeYen: 3_360_000, deductionYen: 880_000 },
  { maximumIncomeYen: 4_890_000, deductionYen: 680_000 },
  { maximumIncomeYen: 6_550_000, deductionYen: 670_000 },
  { maximumIncomeYen: 23_500_000, deductionYen: 620_000 },
  { maximumIncomeYen: 24_000_000, deductionYen: 480_000 },
  { maximumIncomeYen: 24_500_000, deductionYen: 320_000 },
  { maximumIncomeYen: 25_000_000, deductionYen: 160_000 },
] as const;

const INCOME_TAX_BANDS = [
  { minimumTaxableIncomeYen: 40_000_000, rate: 0.45, deductionYen: 4_796_000 },
  { minimumTaxableIncomeYen: 18_000_000, rate: 0.4, deductionYen: 2_796_000 },
  { minimumTaxableIncomeYen: 9_000_000, rate: 0.33, deductionYen: 1_536_000 },
  { minimumTaxableIncomeYen: 6_950_000, rate: 0.23, deductionYen: 636_000 },
  { minimumTaxableIncomeYen: 3_300_000, rate: 0.2, deductionYen: 427_500 },
  { minimumTaxableIncomeYen: 1_950_000, rate: 0.1, deductionYen: 97_500 },
  { minimumTaxableIncomeYen: 1_000, rate: 0.05, deductionYen: 0 },
] as const;

const TAXABLE_INCOME_ROUNDING_UNIT_YEN = 1_000;
const FINAL_INCOME_TAX_ROUNDING_UNIT_YEN = 100;
const RECONSTRUCTION_SPECIAL_INCOME_TAX_RATE = 0.021;

/**
 * Calculates an unpublished R8 national income-tax annual estimate.
 *
 * It assumes salary is the only income and accepts only the basic deduction
 * and an explicitly supplied employee social-insurance deduction. It excludes
 * the employment-income adjustment deduction, dependent and spouse
 * deductions, other income deductions, tax credits, withholding reconciliation,
 * and the special minimum tax for very high income.
 *
 * Official National Tax Agency references:
 * - R8 reform: https://www.nta.go.jp/users/gensen/2026kiso/index.htm
 * - R8 reform details: https://www.nta.go.jp/publication/pamph/gensen/2026kaisei.pdf
 * - Employment-income table and tax table: https://www.nta.go.jp/publication/pamph/koho/kurashi/html/02_1.htm
 * - Income-tax rates: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
 * - Reconstruction tax: https://www.nta.go.jp/taxes/shiraberu/shinkoku/tebiki/2025/03/order4/3-4_45.htm
 * - Year-end rounding: https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2662.htm
 */
export function calculateR8IncomeTax(
  input: R8IncomeTaxInput,
): R8IncomeTaxResult {
  assertNonNegativeSafeInteger(input.annualSalaryYen, "annualSalaryYen");
  assertNonNegativeSafeInteger(
    input.annualEmployeeSocialInsuranceYen,
    "annualEmployeeSocialInsuranceYen",
  );

  const employmentIncomeYen = calculateR8IncomeTaxEmploymentIncome(
    input.annualSalaryYen,
  );
  const employmentIncomeDeductionYen = subtractSafeYen(
    input.annualSalaryYen,
    employmentIncomeYen,
    "employment income deduction",
  );
  const basicDeductionYen =
    calculateR8IncomeTaxBasicDeduction(employmentIncomeYen);
  const taxableIncomeBeforeRoundingYen = subtractDeductionsWithZeroFloor(
    employmentIncomeYen,
    basicDeductionYen,
    input.annualEmployeeSocialInsuranceYen,
  );
  const taxableIncomeYen = floorToUnit(
    taxableIncomeBeforeRoundingYen,
    TAXABLE_INCOME_ROUNDING_UNIT_YEN,
  );
  const incomeTaxRateResult =
    calculateR8NationalIncomeTaxBeforeReconstruction(taxableIncomeYen);
  const reconstructionSpecialIncomeTaxYen = floorYen(
    incomeTaxRateResult.incomeTaxYen *
      RECONSTRUCTION_SPECIAL_INCOME_TAX_RATE,
    "reconstruction special income tax",
  );
  const totalBeforeFinalRoundingYen = addSafeYen(
    incomeTaxRateResult.incomeTaxYen,
    reconstructionSpecialIncomeTaxYen,
    "total national income tax",
  );
  const totalNationalIncomeTaxYen = floorToUnit(
    totalBeforeFinalRoundingYen,
    FINAL_INCOME_TAX_ROUNDING_UNIT_YEN,
  );

  return {
    annualSalaryYen: input.annualSalaryYen,
    employmentIncomeDeductionYen,
    employmentIncomeYen,
    basicDeductionYen,
    socialInsuranceDeductionYen: input.annualEmployeeSocialInsuranceYen,
    taxableIncomeYen,
    nationalIncomeTaxRate: incomeTaxRateResult.rate,
    nationalIncomeTaxRateDeductionYen: incomeTaxRateResult.deductionYen,
    nationalIncomeTaxBeforeReconstructionYen:
      incomeTaxRateResult.incomeTaxYen,
    reconstructionSpecialIncomeTaxYen,
    totalNationalIncomeTaxYen,
    incomeTaxYear: R8_POLICY.incomeTaxYear,
    calculationMode: R8_POLICY.calculationMode,
  };
}

/**
 * Applies only the R8 national income-tax employment-income table.
 * It intentionally does not share the resident-tax or legacy calculation.
 */
export function calculateR8IncomeTaxEmploymentIncome(
  annualSalaryYen: number,
): number {
  assertNonNegativeSafeInteger(annualSalaryYen, "annualSalaryYen");

  if (annualSalaryYen < EMPLOYMENT_INCOME_MINIMUM_START_YEN) {
    return 0;
  }

  if (annualSalaryYen < FIRST_FIXED_EMPLOYMENT_INCOME_START_YEN) {
    return subtractSafeYen(
      annualSalaryYen,
      MINIMUM_EMPLOYMENT_INCOME_DEDUCTION_YEN,
      "employment income",
    );
  }

  if (annualSalaryYen < SECOND_FIXED_EMPLOYMENT_INCOME_START_YEN) {
    return 1_451_000;
  }

  if (annualSalaryYen < THIRD_FIXED_EMPLOYMENT_INCOME_START_YEN) {
    return 1_453_000;
  }

  if (annualSalaryYen < EMPLOYMENT_INCOME_TABLE_FORMULA_START_YEN) {
    return 1_456_000;
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
    return floorYen(
      annualSalaryYen * 0.9 - 1_100_000,
      "employment income",
    );
  }

  return subtractSafeYen(
    annualSalaryYen,
    1_950_000,
    "employment income",
  );
}

export function calculateR8IncomeTaxBasicDeduction(
  totalIncomeYen: number,
): number {
  assertNonNegativeSafeInteger(totalIncomeYen, "totalIncomeYen");

  return (
    BASIC_DEDUCTION_BANDS.find(
      ({ maximumIncomeYen }) => totalIncomeYen <= maximumIncomeYen,
    )?.deductionYen ?? 0
  );
}

export function calculateR8NationalIncomeTaxBeforeReconstruction(
  taxableIncomeYen: number,
): R8IncomeTaxRateResult {
  assertNonNegativeSafeInteger(taxableIncomeYen, "taxableIncomeYen");

  const roundedTaxableIncomeYen = floorToUnit(
    taxableIncomeYen,
    TAXABLE_INCOME_ROUNDING_UNIT_YEN,
  );
  const band = INCOME_TAX_BANDS.find(
    ({ minimumTaxableIncomeYen }) =>
      roundedTaxableIncomeYen >= minimumTaxableIncomeYen,
  );

  if (!band) {
    return {
      rate: 0,
      deductionYen: 0,
      incomeTaxYen: 0,
    };
  }

  const incomeTaxYen = subtractSafeYen(
    roundedTaxableIncomeYen * band.rate,
    band.deductionYen,
    "national income tax",
  );

  return {
    rate: band.rate,
    deductionYen: band.deductionYen,
    incomeTaxYen,
  };
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

function floorToUnit(value: number, unit: number) {
  const floored = Math.floor(value / unit) * unit;

  return assertCalculatedYen(floored, "rounded amount");
}

function floorYen(value: number, label: string) {
  return assertCalculatedYen(Math.floor(value), label);
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
