import {
  resolveR8HealthStandardMonthlyRemuneration,
  resolveR8PensionStandardMonthlyRemuneration,
} from "@/features/social-insurance/r8/remuneration";
import type {
  R8ContributionInput,
  R8ContributionResult,
} from "@/features/social-insurance/r8/types";

export type R8EnrollmentStatus = "dependent" | "insured";

export type R8ScenarioInput = {
  readonly annualSalaryYen: number;
  readonly monthlyRemunerationYen: number;
  readonly age: number;
  readonly enrollmentStatus: R8EnrollmentStatus;
};

export type R8AnnualSalarySource = {
  readonly hourlyWageYen: number;
  readonly weeklyHours: number;
};

export type R8ScenarioUnsupportedReason = "age65AndOverIssue5";

type R8ScenarioContextBase = {
  readonly annualSalaryYen: number;
  readonly age: number;
  readonly enrollmentStatus: R8EnrollmentStatus;
  readonly healthStandardMonthlyRemunerationYen: number;
  readonly pensionStandardMonthlyRemunerationYen: number;
};

export type R8EmployeeContributionContext =
  | {
      readonly kind: "calculate";
      readonly input: R8ContributionInput;
    }
  | {
      readonly kind: "fixedZero";
      readonly annualEmployeeSocialInsuranceYen: 0;
      readonly breakdown: R8ContributionResult;
    };

export type R8ScenarioCalculationContext =
  | (R8ScenarioContextBase & {
      readonly supported: true;
      readonly unsupportedReason: null;
      readonly employeeContribution: R8EmployeeContributionContext;
    })
  | (R8ScenarioContextBase & {
      readonly supported: false;
      readonly unsupportedReason: R8ScenarioUnsupportedReason;
    });

const ZERO_EMPLOYEE_CONTRIBUTION = {
  healthInsuranceYen: 0,
  nursingCareInsuranceYen: 0,
  pensionInsuranceYen: 0,
  employmentInsuranceYen: 0,
  childAndFamilySupportYen: 0,
  totalEmployeeContributionYen: 0,
} as const satisfies R8ContributionResult;

/**
 * Converts hourly work conditions into the integer annual salary required by
 * the unpublished R8 calculators.
 */
export function calculateR8AnnualSalaryYen(
  source: R8AnnualSalarySource,
): number {
  assertNonNegativeFiniteAmount(source.hourlyWageYen, "hourlyWageYen");
  assertNonNegativeFiniteAmount(source.weeklyHours, "weeklyHours");

  const annualSalaryBeforeRounding =
    source.hourlyWageYen * source.weeklyHours * 52;

  if (
    !Number.isFinite(annualSalaryBeforeRounding) ||
    annualSalaryBeforeRounding < 0 ||
    annualSalaryBeforeRounding > Number.MAX_SAFE_INTEGER
  ) {
    throw new RangeError(
      "Calculated annual salary is outside the safe yen range.",
    );
  }

  const annualSalaryYen = Math.round(annualSalaryBeforeRounding);

  if (!Number.isSafeInteger(annualSalaryYen)) {
    throw new RangeError(
      "Calculated annual salary is outside the safe yen range.",
    );
  }

  return annualSalaryYen;
}

/**
 * Builds the isolated calculation context required before connecting an R8
 * scenario to annual net-income calculation.
 *
 * Ages 65 and over remain explicitly unsupported under Issue #5. A dependent
 * scenario carries a fixed-zero employee contribution instead of a
 * contribution calculator input, so its tax deduction also remains zero.
 */
export function createR8ScenarioCalculationContext(
  input: R8ScenarioInput,
): R8ScenarioCalculationContext {
  assertNonNegativeSafeInteger(input.annualSalaryYen, "annualSalaryYen");
  assertNonNegativeSafeInteger(
    input.monthlyRemunerationYen,
    "monthlyRemunerationYen",
  );
  assertNonNegativeSafeInteger(input.age, "age");
  assertEnrollmentStatus(input.enrollmentStatus);

  const healthStandardMonthlyRemunerationYen =
    resolveR8HealthStandardMonthlyRemuneration(input.monthlyRemunerationYen);
  const pensionStandardMonthlyRemunerationYen =
    resolveR8PensionStandardMonthlyRemuneration(input.monthlyRemunerationYen);
  const base = {
    annualSalaryYen: input.annualSalaryYen,
    age: input.age,
    enrollmentStatus: input.enrollmentStatus,
    healthStandardMonthlyRemunerationYen,
    pensionStandardMonthlyRemunerationYen,
  } as const;

  if (input.age >= 65) {
    return {
      ...base,
      supported: false,
      unsupportedReason: "age65AndOverIssue5",
    };
  }

  if (input.enrollmentStatus === "dependent") {
    return {
      ...base,
      supported: true,
      unsupportedReason: null,
      employeeContribution: {
        kind: "fixedZero",
        annualEmployeeSocialInsuranceYen: 0,
        breakdown: ZERO_EMPLOYEE_CONTRIBUTION,
      },
    };
  }

  return {
    ...base,
    supported: true,
    unsupportedReason: null,
    employeeContribution: {
      kind: "calculate",
      input: {
        annualSalaryYen: input.annualSalaryYen,
        healthStandardMonthlyRemunerationYen,
        pensionStandardMonthlyRemunerationYen,
        age: input.age,
      },
    },
  };
}

function assertNonNegativeFiniteAmount(value: number, fieldName: string) {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    Math.abs(value) > Number.MAX_SAFE_INTEGER
  ) {
    throw new RangeError(`${fieldName} must be a non-negative finite amount.`);
  }
}

function assertNonNegativeSafeInteger(value: number, fieldName: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative safe integer.`);
  }
}

function assertEnrollmentStatus(
  value: R8EnrollmentStatus,
): asserts value is R8EnrollmentStatus {
  if (value !== "dependent" && value !== "insured") {
    throw new RangeError(
      'enrollmentStatus must be either "dependent" or "insured".',
    );
  }
}
