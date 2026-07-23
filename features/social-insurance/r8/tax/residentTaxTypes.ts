import type { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";

export type R8ResidentTaxInput = {
  readonly annualSalaryYen: number;
  readonly annualEmployeeSocialInsuranceYen: number;
};

export type R8ResidentTaxResult = {
  readonly annualSalaryYen: number;
  readonly employmentIncomeDeductionYen: number;
  readonly employmentIncomeYen: number;
  readonly basicDeductionYen: number;
  readonly socialInsuranceDeductionYen: number;
  readonly taxableIncomeYen: number;
  readonly residentTaxIncomeRate: number;
  readonly residentTaxIncomeLevyYen: number;
  readonly calculationMode: typeof R8_POLICY.calculationMode;
  readonly residentTaxFiscalYear: typeof R8_POLICY.residentTaxFiscalYear;
};
