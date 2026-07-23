import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import { calculateR8EmployeeContributions } from "@/features/social-insurance/r8/calculateR8Contributions";
import type {
  R8AnnualNetIncomeInput,
  R8AnnualNetIncomeResult,
} from "@/features/social-insurance/r8/annualNetIncomeTypes";
import { calculateR8IncomeTax } from "@/features/social-insurance/r8/tax/calculateR8IncomeTax";
import { calculateR8ResidentTax } from "@/features/social-insurance/r8/tax/calculateR8ResidentTax";

const MONTHS_PER_YEAR = 12;

/**
 * Calculates an unpublished R8 steady-state annual net-income estimate.
 *
 * This thin integration layer delegates all contribution and tax rules to the
 * existing R8 calculators. The resident-tax amount is only the income levy; it
 * excludes the per-capita levy, forest environment tax, adjustment deduction,
 * and non-taxable-income determination.
 *
 * The income-tax estimate assumes salary is the only income and excludes
 * spouse, dependent, life-insurance, medical-expense and housing-loan
 * deductions, other deductions and tax credits, and complete withholding or
 * year-end-adjustment reconciliation.
 *
 * The monthly average is the annual net income divided by 12 and rounded to
 * the nearest whole yen. It is an average display value, not a monthly
 * withholding or payment schedule.
 */
export function calculateR8AnnualNetIncome(
  input: R8AnnualNetIncomeInput,
): R8AnnualNetIncomeResult {
  const socialInsuranceBreakdown = calculateR8EmployeeContributions(input);
  const annualEmployeeSocialInsuranceYen =
    socialInsuranceBreakdown.totalEmployeeContributionYen;
  const taxInput = {
    annualSalaryYen: input.annualSalaryYen,
    annualEmployeeSocialInsuranceYen,
  };
  const incomeTaxBreakdown = calculateR8IncomeTax(taxInput);
  const residentTaxBreakdown = calculateR8ResidentTax(taxInput);
  const annualIncomeTaxYen =
    incomeTaxBreakdown.totalNationalIncomeTaxYen;
  const annualResidentTaxIncomeLevyYen =
    residentTaxBreakdown.residentTaxIncomeLevyYen;
  const totalDeductionsYen = addSafeYenAmounts([
    annualEmployeeSocialInsuranceYen,
    annualIncomeTaxYen,
    annualResidentTaxIncomeLevyYen,
  ]);
  const annualNetIncomeYen = subtractWithZeroFloor(
    input.annualSalaryYen,
    totalDeductionsYen,
  );
  const monthlyAverageNetIncomeYen = assertCalculatedYen(
    Math.round(annualNetIncomeYen / MONTHS_PER_YEAR),
    "monthly average net income",
  );

  return {
    annualSalaryYen: input.annualSalaryYen,
    annualEmployeeSocialInsuranceYen,
    annualIncomeTaxYen,
    annualResidentTaxIncomeLevyYen,
    annualNetIncomeYen,
    monthlyAverageNetIncomeYen,
    socialInsuranceBreakdown,
    incomeTaxBreakdown,
    residentTaxBreakdown,
    calculationYear: {
      socialInsuranceFiscalYear: R8_POLICY.socialInsuranceFiscalYear,
      incomeTaxYear: R8_POLICY.incomeTaxYear,
      residentTaxFiscalYear: R8_POLICY.residentTaxFiscalYear,
    },
    calculationMode: R8_POLICY.calculationMode,
  };
}

function addSafeYenAmounts(amounts: readonly number[]) {
  return amounts.reduce((total, amount) => {
    return assertCalculatedYen(total + amount, "total deductions");
  }, 0);
}

function subtractWithZeroFloor(annualSalaryYen: number, deductionsYen: number) {
  return Math.max(0, annualSalaryYen - deductionsYen);
}

function assertCalculatedYen(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Calculated ${label} is outside the safe yen range.`);
  }

  return value;
}
