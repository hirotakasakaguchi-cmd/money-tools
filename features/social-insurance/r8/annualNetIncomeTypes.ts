import type { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import type { R8EmployeeContributionContext } from "@/features/social-insurance/r8/scenarioAdapter";
import type { R8ContributionResult } from "@/features/social-insurance/r8/types";
import type { R8IncomeTaxResult } from "@/features/social-insurance/r8/tax/incomeTaxTypes";
import type { R8ResidentTaxResult } from "@/features/social-insurance/r8/tax/residentTaxTypes";

export type R8AnnualNetIncomeInput = {
  readonly annualSalaryYen: number;
  readonly healthStandardMonthlyRemunerationYen: number;
  readonly pensionStandardMonthlyRemunerationYen: number;
  readonly age: number;
};

export type R8AnnualNetIncomeContextInput = {
  readonly annualSalaryYen: number;
  readonly employeeContribution: R8EmployeeContributionContext;
};

export type R8AnnualNetIncomeCalculationYear = {
  readonly socialInsuranceFiscalYear:
    typeof R8_POLICY.socialInsuranceFiscalYear;
  readonly incomeTaxYear: typeof R8_POLICY.incomeTaxYear;
  readonly residentTaxFiscalYear: typeof R8_POLICY.residentTaxFiscalYear;
};

export type R8AnnualNetIncomeResult = {
  readonly annualSalaryYen: number;
  readonly annualEmployeeSocialInsuranceYen: number;
  readonly annualIncomeTaxYen: number;
  readonly annualResidentTaxIncomeLevyYen: number;
  readonly annualNetIncomeYen: number;
  readonly monthlyAverageNetIncomeYen: number;
  readonly socialInsuranceBreakdown: R8ContributionResult;
  readonly incomeTaxBreakdown: R8IncomeTaxResult;
  readonly residentTaxBreakdown: R8ResidentTaxResult;
  readonly calculationYear: R8AnnualNetIncomeCalculationYear;
  readonly calculationMode: typeof R8_POLICY.calculationMode;
};
