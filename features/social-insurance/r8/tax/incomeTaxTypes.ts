import type { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";

export type R8IncomeTaxInput = {
  readonly annualSalaryYen: number;
  readonly annualEmployeeSocialInsuranceYen: number;
};

export type R8IncomeTaxRateResult = {
  readonly rate: number;
  readonly deductionYen: number;
  readonly incomeTaxYen: number;
};

export type R8IncomeTaxResult = {
  readonly annualSalaryYen: number;
  readonly employmentIncomeDeductionYen: number;
  readonly employmentIncomeYen: number;
  readonly basicDeductionYen: number;
  readonly socialInsuranceDeductionYen: number;
  readonly taxableIncomeYen: number;
  readonly nationalIncomeTaxRate: number;
  readonly nationalIncomeTaxRateDeductionYen: number;
  readonly nationalIncomeTaxBeforeReconstructionYen: number;
  readonly reconstructionSpecialIncomeTaxYen: number;
  readonly totalNationalIncomeTaxYen: number;
  readonly incomeTaxYear: typeof R8_POLICY.incomeTaxYear;
  readonly calculationMode: typeof R8_POLICY.calculationMode;
};
