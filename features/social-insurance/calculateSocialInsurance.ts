import {
  BASIC_DEDUCTIONS,
  EMPLOYEE_PENSION_ACCRUAL_RATE,
  EMPLOYEE_PENSION_STANDARD_MONTHLY_TABLE,
  HEALTH_INSURANCE_STANDARD_MONTHLY_TABLE,
  MONTHS_PER_YEAR,
  PENSION_RECEIVING_YEARS_TO_AGE_90,
  SALARY_INCOME_DEDUCTION_TABLE,
  SOCIAL_INSURANCE_RATES,
  TAX_RATES,
  WORK_WEEKS_PER_YEAR,
} from "@/features/social-insurance/constants";
import type { StandardMonthlyRemunerationGrade } from "@/features/social-insurance/constants";
import type {
  AgeGroup,
  InsuranceStatus,
  SocialInsuranceBreakdown,
  SocialInsuranceInput,
  SocialInsuranceResult,
  WorkScenarioResult,
} from "@/features/social-insurance/types";

export function calculateSocialInsurance(
  input: SocialInsuranceInput,
): SocialInsuranceResult {
  const current = calculateScenario({
    hourlyWage: input.current.hourlyWage,
    weeklyHours: input.current.weeklyHours,
    insuranceStatus: input.current.insuranceStatus,
    ageGroup: input.ageGroup,
    hasSpouseAllowance: input.current.hasSpouseAllowance,
    spouseAllowanceMonthly: input.current.spouseAllowanceMonthly,
  });

  const futureHourlyWage =
    input.future.hourlyWage && input.future.hourlyWage > 0
      ? input.future.hourlyWage
      : input.current.hourlyWage;

  const future = calculateScenario({
    hourlyWage: futureHourlyWage,
    weeklyHours: input.future.weeklyHours,
    insuranceStatus: input.future.insuranceStatus,
    ageGroup: input.ageGroup,
    hasSpouseAllowance: input.current.hasSpouseAllowance,
    spouseAllowanceMonthly: input.current.spouseAllowanceMonthly,
  });

  const takeHomeDifference = future.takeHomePay - current.takeHomePay;
  const increasedAnnualHours = Math.max(
    0,
    (future.weeklyHours - current.weeklyHours) * WORK_WEEKS_PER_YEAR,
  );
  const cashReturnPerIncreasedHour =
    increasedAnnualHours > 0 ? takeHomeDifference / increasedAnnualHours : null;
  const pensionAnnualIncreaseDifference =
    future.pensionAnnualIncrease - current.pensionAnnualIncrease;

  return {
    current,
    future,
    takeHomeDifference,
    increasedAnnualHours,
    cashReturnPerIncreasedHour,
    pensionAnnualIncreaseDifference,
    pensionTotalReturnToAge90:
      pensionAnnualIncreaseDifference * PENSION_RECEIVING_YEARS_TO_AGE_90,
    comments: buildComments({
      currentStatus: input.current.insuranceStatus,
      futureStatus: input.future.insuranceStatus,
      hasSpouseAllowance: input.current.hasSpouseAllowance,
      currentHourlyWage: input.current.hourlyWage,
      ageGroup: input.ageGroup,
      takeHomeDifference,
      cashReturnPerIncreasedHour,
      pensionAnnualIncreaseDifference,
    }),
  };
}

export function calculateSalaryIncomeDeduction(annualIncome: number) {
  const row =
    SALARY_INCOME_DEDUCTION_TABLE.find(
      (deduction) =>
        annualIncome >= deduction.min &&
        (deduction.max === null || annualIncome <= deduction.max),
    ) ?? SALARY_INCOME_DEDUCTION_TABLE[0];

  if (row.type === "fixed") {
    return row.deduction;
  }

  return Math.max(650000, annualIncome * row.rate - row.minus);
}

type ScenarioInput = {
  hourlyWage: number;
  weeklyHours: number;
  insuranceStatus: InsuranceStatus;
  ageGroup: AgeGroup;
  hasSpouseAllowance: boolean;
  spouseAllowanceMonthly: number;
};

function calculateScenario(input: ScenarioInput): WorkScenarioResult {
  const annualIncome =
    input.hourlyWage * input.weeklyHours * WORK_WEEKS_PER_YEAR;
  const monthlyIncome = annualIncome / MONTHS_PER_YEAR;
  const salaryIncomeDeduction = calculateSalaryIncomeDeduction(annualIncome);
  const salaryIncome = Math.max(0, annualIncome - salaryIncomeDeduction);
  const socialInsurance = calculateSocialInsurancePremiums(
    annualIncome,
    monthlyIncome,
    input.insuranceStatus,
    input.ageGroup,
  );
  const { standardMonthlyRemuneration, ...socialInsuranceBreakdown } =
    socialInsurance;
  const incomeTax = calculateTax(
    salaryIncome,
    BASIC_DEDUCTIONS.incomeTax,
    socialInsuranceBreakdown.total,
    TAX_RATES.incomeTax,
  );
  const residentTax = calculateTax(
    salaryIncome,
    BASIC_DEDUCTIONS.residentTax,
    socialInsuranceBreakdown.total,
    TAX_RATES.residentTax,
  );
  const spouseAllowanceAnnual =
    input.insuranceStatus === "dependent" && input.hasSpouseAllowance
      ? input.spouseAllowanceMonthly * MONTHS_PER_YEAR
      : 0;
  const pensionAnnualIncrease =
    input.insuranceStatus === "insured"
      ? monthlyIncome * EMPLOYEE_PENSION_ACCRUAL_RATE * MONTHS_PER_YEAR
      : 0;

  return {
    hourlyWage: input.hourlyWage,
    weeklyHours: input.weeklyHours,
    annualIncome,
    monthlyIncome,
    standardMonthlyRemuneration,
    salaryIncomeDeduction,
    salaryIncome,
    socialInsurance: socialInsuranceBreakdown,
    incomeTax,
    residentTax,
    spouseAllowanceAnnual,
    takeHomePay:
      annualIncome -
      socialInsuranceBreakdown.total -
      incomeTax -
      residentTax +
      spouseAllowanceAnnual,
    pensionAnnualIncrease,
  };
}

function calculateSocialInsurancePremiums(
  annualIncome: number,
  monthlyIncome: number,
  insuranceStatus: InsuranceStatus,
  ageGroup: AgeGroup,
): SocialInsuranceBreakdown & {
  standardMonthlyRemuneration: {
    healthInsurance: number;
    employeePension: number;
  };
} {
  if (insuranceStatus === "dependent") {
    return {
      employeePension: 0,
      healthInsurance: 0,
      careInsurance: 0,
      employmentInsurance: 0,
      total: 0,
      standardMonthlyRemuneration: {
        healthInsurance: 0,
        employeePension: 0,
      },
    };
  }

  const healthInsuranceStandardMonthly =
    findStandardMonthlyRemunerationGrade(
      monthlyIncome,
      HEALTH_INSURANCE_STANDARD_MONTHLY_TABLE,
    ).monthlyAmount;
  const employeePensionStandardMonthly =
    findStandardMonthlyRemunerationGrade(
      monthlyIncome,
      EMPLOYEE_PENSION_STANDARD_MONTHLY_TABLE,
    ).monthlyAmount;
  const employeePension =
    employeePensionStandardMonthly *
    SOCIAL_INSURANCE_RATES.employeePension *
    MONTHS_PER_YEAR;
  const healthInsurance =
    healthInsuranceStandardMonthly *
    SOCIAL_INSURANCE_RATES.healthInsurance *
    MONTHS_PER_YEAR;
  const careInsurance =
    ageGroup === "under40"
      ? 0
      : healthInsuranceStandardMonthly *
        SOCIAL_INSURANCE_RATES.careInsurance *
        MONTHS_PER_YEAR;
  const employmentInsurance =
    annualIncome * SOCIAL_INSURANCE_RATES.employmentInsurance;

  return {
    employeePension,
    healthInsurance,
    careInsurance,
    employmentInsurance,
    total:
      employeePension + healthInsurance + careInsurance + employmentInsurance,
    standardMonthlyRemuneration: {
      healthInsurance: healthInsuranceStandardMonthly,
      employeePension: employeePensionStandardMonthly,
    },
  };
}

function findStandardMonthlyRemunerationGrade(
  monthlyIncome: number,
  table: readonly StandardMonthlyRemunerationGrade[],
) {
  return (
    table.find(
      (grade) =>
        monthlyIncome >= grade.minMonthlyIncome &&
        (grade.maxMonthlyIncome === null ||
          monthlyIncome < grade.maxMonthlyIncome),
    ) ?? table[0]
  );
}

function calculateTax(
  salaryIncome: number,
  basicDeduction: number,
  socialInsuranceDeduction: number,
  taxRate: number,
) {
  return Math.max(
    0,
    (salaryIncome - basicDeduction - socialInsuranceDeduction) * taxRate,
  );
}

type CommentInput = {
  currentStatus: InsuranceStatus;
  futureStatus: InsuranceStatus;
  hasSpouseAllowance: boolean;
  currentHourlyWage: number;
  ageGroup: AgeGroup;
  takeHomeDifference: number;
  cashReturnPerIncreasedHour: number | null;
  pensionAnnualIncreaseDifference: number;
};

function buildComments(input: CommentInput) {
  const comments: string[] = [];
  const cashReturnLevel = getCashReturnLevel(input.cashReturnPerIncreasedHour);
  const hasWeakCashReturn =
    cashReturnLevel === "very-low" || cashReturnLevel === "low";

  if (cashReturnLevel === "very-low" && input.takeHomeDifference > 0) {
    comments.push(
      "年間手取りは少し増えますが、増えた労働時間に対する現金リターンはかなり小さめです。",
    );
  }

  if (cashReturnLevel === "low" && input.takeHomeDifference > 0) {
    comments.push(
      "年間手取りは増えますが、増えた労働時間に対する現金リターンは小さめです。",
    );
  }

  if (cashReturnLevel === "positive" && input.takeHomeDifference > 0) {
    comments.push("増えた労働時間に対して、現金リターンも一定の増加があります。");
  }

  if (hasWeakCashReturn && input.takeHomeDifference <= 0) {
    comments.push("増えた労働時間に対して、現金リターンは弱めです。");
  }

  if (
    input.currentStatus === "dependent" &&
    input.futureStatus === "insured" &&
    input.hasSpouseAllowance
  ) {
    comments.push(
      "配偶者手当がなくなる前提のため、損益が大きく変わっています。",
    );
  }

  if (input.currentStatus === "insured" && input.futureStatus === "insured") {
    comments.push(
      "社保加入の有無ではなく、労働時間や時給の差による比較です。",
    );
  }

  if (input.currentStatus === "insured" && input.futureStatus === "dependent") {
    comments.push(
      input.takeHomeDifference > 0
        ? "手取りは増えても、将来の厚生年金メリットは減る可能性があります。"
        : "手取りは減り、将来の厚生年金メリットも減る可能性があります。",
    );
  }

  if (
    input.takeHomeDifference < 0 &&
    input.pensionAnnualIncreaseDifference > 0
  ) {
    comments.push(
      "手取りは減りますが、将来の厚生年金メリットが増える可能性があります。",
    );
  }

  if (
    input.takeHomeDifference >= 0 &&
    input.pensionAnnualIncreaseDifference > 0 &&
    hasWeakCashReturn
  ) {
    comments.push("将来の厚生年金メリットは増える見込みです。");
  }

  if (
    input.takeHomeDifference > 0 &&
    input.pensionAnnualIncreaseDifference > 0 &&
    !hasWeakCashReturn
  ) {
    comments.push(
      "現金収入と将来の年金メリットの両方が増える可能性があります。",
    );
  }

  if (input.ageGroup === "age65AndOver") {
    comments.push(
      "65歳以上は介護保険料の徴収方法が異なるため参考値です。",
    );
  }

  if (comments.length === 0) {
    comments.push("大きな差は出にくい条件です。働きやすさも含めて比べてみましょう。");
  }

  return comments;
}

function getCashReturnLevel(cashReturnPerIncreasedHour: number | null) {
  if (cashReturnPerIncreasedHour === null) {
    return "none";
  }

  if (cashReturnPerIncreasedHour < 100) {
    return "very-low";
  }

  if (cashReturnPerIncreasedHour < 500) {
    return "low";
  }

  return "positive";
}
