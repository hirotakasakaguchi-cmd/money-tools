export const WORK_WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;
export const PENSION_RECEIVING_YEARS_TO_AGE_90 = 25;

export const SOCIAL_INSURANCE_PREMIUM_CONFIG = {
  fiscalYearLabel: "令和7年度",
  prefecture: "福岡県",
  employeePension: 0.0915,
  healthInsurance: 0.05155,
  careInsurance: 0.00795,
  employmentInsurance: 0.0055,
} as const;

export const SOCIAL_INSURANCE_RATE_PARTS = {
  employeePension: SOCIAL_INSURANCE_PREMIUM_CONFIG.employeePension,
  healthInsurance: SOCIAL_INSURANCE_PREMIUM_CONFIG.healthInsurance,
  careInsurance: SOCIAL_INSURANCE_PREMIUM_CONFIG.careInsurance,
  employmentInsurance: SOCIAL_INSURANCE_PREMIUM_CONFIG.employmentInsurance,
} as const;

export const SOCIAL_INSURANCE_RATES = {
  ...SOCIAL_INSURANCE_RATE_PARTS,
  total: Object.values(SOCIAL_INSURANCE_RATE_PARTS).reduce(
    (sum, rate) => sum + rate,
    0,
  ),
} as const;

export const EMPLOYEE_PENSION_ACCRUAL_RATE = 5.481 / 1000;

export type StandardMonthlyRemunerationGrade = {
  grade: number;
  monthlyAmount: number;
  minMonthlyIncome: number;
  maxMonthlyIncome: number | null;
};

const standardMonthlyGradeBoundaries = [
  { monthlyAmount: 58000, minMonthlyIncome: 0, maxMonthlyIncome: 63000 },
  { monthlyAmount: 68000, minMonthlyIncome: 63000, maxMonthlyIncome: 73000 },
  { monthlyAmount: 78000, minMonthlyIncome: 73000, maxMonthlyIncome: 83000 },
  { monthlyAmount: 88000, minMonthlyIncome: 83000, maxMonthlyIncome: 93000 },
  { monthlyAmount: 98000, minMonthlyIncome: 93000, maxMonthlyIncome: 101000 },
  { monthlyAmount: 104000, minMonthlyIncome: 101000, maxMonthlyIncome: 107000 },
  { monthlyAmount: 110000, minMonthlyIncome: 107000, maxMonthlyIncome: 114000 },
  { monthlyAmount: 118000, minMonthlyIncome: 114000, maxMonthlyIncome: 122000 },
  { monthlyAmount: 126000, minMonthlyIncome: 122000, maxMonthlyIncome: 130000 },
  { monthlyAmount: 134000, minMonthlyIncome: 130000, maxMonthlyIncome: 138000 },
  { monthlyAmount: 142000, minMonthlyIncome: 138000, maxMonthlyIncome: 146000 },
  { monthlyAmount: 150000, minMonthlyIncome: 146000, maxMonthlyIncome: 155000 },
  { monthlyAmount: 160000, minMonthlyIncome: 155000, maxMonthlyIncome: 165000 },
  { monthlyAmount: 170000, minMonthlyIncome: 165000, maxMonthlyIncome: 175000 },
  { monthlyAmount: 180000, minMonthlyIncome: 175000, maxMonthlyIncome: 185000 },
  { monthlyAmount: 190000, minMonthlyIncome: 185000, maxMonthlyIncome: 195000 },
  { monthlyAmount: 200000, minMonthlyIncome: 195000, maxMonthlyIncome: 210000 },
  { monthlyAmount: 220000, minMonthlyIncome: 210000, maxMonthlyIncome: 230000 },
  { monthlyAmount: 240000, minMonthlyIncome: 230000, maxMonthlyIncome: 250000 },
  { monthlyAmount: 260000, minMonthlyIncome: 250000, maxMonthlyIncome: 270000 },
  { monthlyAmount: 280000, minMonthlyIncome: 270000, maxMonthlyIncome: 290000 },
  { monthlyAmount: 300000, minMonthlyIncome: 290000, maxMonthlyIncome: 310000 },
  { monthlyAmount: 320000, minMonthlyIncome: 310000, maxMonthlyIncome: 330000 },
  { monthlyAmount: 340000, minMonthlyIncome: 330000, maxMonthlyIncome: 350000 },
  { monthlyAmount: 360000, minMonthlyIncome: 350000, maxMonthlyIncome: 370000 },
  { monthlyAmount: 380000, minMonthlyIncome: 370000, maxMonthlyIncome: 395000 },
  { monthlyAmount: 410000, minMonthlyIncome: 395000, maxMonthlyIncome: 425000 },
  { monthlyAmount: 440000, minMonthlyIncome: 425000, maxMonthlyIncome: 455000 },
  { monthlyAmount: 470000, minMonthlyIncome: 455000, maxMonthlyIncome: 485000 },
  { monthlyAmount: 500000, minMonthlyIncome: 485000, maxMonthlyIncome: 515000 },
  { monthlyAmount: 530000, minMonthlyIncome: 515000, maxMonthlyIncome: 545000 },
  { monthlyAmount: 560000, minMonthlyIncome: 545000, maxMonthlyIncome: 575000 },
  { monthlyAmount: 590000, minMonthlyIncome: 575000, maxMonthlyIncome: 605000 },
  { monthlyAmount: 620000, minMonthlyIncome: 605000, maxMonthlyIncome: 635000 },
  { monthlyAmount: 650000, minMonthlyIncome: 635000, maxMonthlyIncome: 665000 },
  { monthlyAmount: 680000, minMonthlyIncome: 665000, maxMonthlyIncome: 695000 },
  { monthlyAmount: 710000, minMonthlyIncome: 695000, maxMonthlyIncome: 730000 },
  { monthlyAmount: 750000, minMonthlyIncome: 730000, maxMonthlyIncome: 770000 },
  { monthlyAmount: 790000, minMonthlyIncome: 770000, maxMonthlyIncome: 810000 },
  { monthlyAmount: 830000, minMonthlyIncome: 810000, maxMonthlyIncome: 855000 },
  { monthlyAmount: 880000, minMonthlyIncome: 855000, maxMonthlyIncome: 905000 },
  { monthlyAmount: 930000, minMonthlyIncome: 905000, maxMonthlyIncome: 955000 },
  { monthlyAmount: 980000, minMonthlyIncome: 955000, maxMonthlyIncome: 1005000 },
  { monthlyAmount: 1030000, minMonthlyIncome: 1005000, maxMonthlyIncome: 1055000 },
  { monthlyAmount: 1090000, minMonthlyIncome: 1055000, maxMonthlyIncome: 1115000 },
  { monthlyAmount: 1150000, minMonthlyIncome: 1115000, maxMonthlyIncome: 1175000 },
  { monthlyAmount: 1210000, minMonthlyIncome: 1175000, maxMonthlyIncome: 1235000 },
  { monthlyAmount: 1270000, minMonthlyIncome: 1235000, maxMonthlyIncome: 1295000 },
  { monthlyAmount: 1330000, minMonthlyIncome: 1295000, maxMonthlyIncome: 1355000 },
  { monthlyAmount: 1390000, minMonthlyIncome: 1355000, maxMonthlyIncome: null },
] as const;

export const HEALTH_INSURANCE_STANDARD_MONTHLY_TABLE =
  standardMonthlyGradeBoundaries.map((grade, index) => ({
    grade: index + 1,
    ...grade,
  })) satisfies StandardMonthlyRemunerationGrade[];

export const EMPLOYEE_PENSION_STANDARD_MONTHLY_TABLE =
  standardMonthlyGradeBoundaries.slice(3, 35).map((grade, index) => ({
    grade: index + 1,
    monthlyAmount: grade.monthlyAmount,
    minMonthlyIncome: index === 0 ? 0 : grade.minMonthlyIncome,
    maxMonthlyIncome: index === 31 ? null : grade.maxMonthlyIncome,
  })) satisfies StandardMonthlyRemunerationGrade[];

export const BASIC_DEDUCTIONS = {
  incomeTax: 480000,
  residentTax: 430000,
} as const;

export const TAX_RATES = {
  incomeTax: 0.05,
  residentTax: 0.1,
} as const;

export const SALARY_INCOME_DEDUCTION_TABLE = [
  {
    min: 0,
    max: 1900000,
    type: "fixed",
    deduction: 650000,
  },
  {
    min: 1900001,
    max: 3600000,
    type: "rateMinus",
    rate: 0.3,
    minus: 80000,
  },
  {
    min: 3600001,
    max: 6600000,
    type: "rateMinus",
    rate: 0.2,
    minus: 440000,
  },
  {
    min: 6600001,
    max: 8500000,
    type: "rateMinus",
    rate: 0.1,
    minus: 1100000,
  },
  {
    min: 8500001,
    max: null,
    type: "fixed",
    deduction: 1950000,
  },
] as const;
