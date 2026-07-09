export type InsuranceStatus = "dependent" | "insured";
export type AgeGroup = "under40" | "age40To64" | "age65AndOver";

export type CurrentWorkInput = {
  hourlyWage: number;
  weeklyHours: number;
  insuranceStatus: InsuranceStatus;
  hasSpouseAllowance: boolean;
  spouseAllowanceMonthly: number;
};

export type FutureWorkInput = {
  weeklyHours: number;
  insuranceStatus: InsuranceStatus;
  hourlyWage?: number;
};

export type SocialInsuranceInput = {
  ageGroup: AgeGroup;
  current: CurrentWorkInput;
  future: FutureWorkInput;
};

export type SocialInsuranceBreakdown = {
  employeePension: number;
  healthInsurance: number;
  careInsurance: number;
  employmentInsurance: number;
  total: number;
};

export type StandardMonthlyRemunerationResult = {
  healthInsurance: number;
  employeePension: number;
};

export type WorkScenarioResult = {
  hourlyWage: number;
  weeklyHours: number;
  annualIncome: number;
  monthlyIncome: number;
  standardMonthlyRemuneration: StandardMonthlyRemunerationResult;
  salaryIncomeDeduction: number;
  salaryIncome: number;
  socialInsurance: SocialInsuranceBreakdown;
  incomeTax: number;
  residentTax: number;
  spouseAllowanceAnnual: number;
  takeHomePay: number;
  pensionAnnualIncrease: number;
};

export type SocialInsuranceResult = {
  current: WorkScenarioResult;
  future: WorkScenarioResult;
  takeHomeDifference: number;
  increasedAnnualHours: number;
  cashReturnPerIncreasedHour: number | null;
  pensionAnnualIncreaseDifference: number;
  pensionTotalReturnToAge90: number;
  comments: string[];
};
