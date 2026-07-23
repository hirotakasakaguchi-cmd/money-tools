export type R8ContributionInput = {
  readonly annualSalaryYen: number;
  readonly healthStandardMonthlyRemunerationYen: number;
  readonly pensionStandardMonthlyRemunerationYen: number;
  readonly age: number;
};

export type R8ContributionResult = {
  readonly healthInsuranceYen: number;
  readonly nursingCareInsuranceYen: number;
  readonly pensionInsuranceYen: number;
  readonly employmentInsuranceYen: number;
  readonly childAndFamilySupportYen: number;
  readonly totalEmployeeContributionYen: number;
};
