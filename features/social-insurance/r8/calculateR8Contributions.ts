import { R8_EMPLOYEE_CONTRIBUTION_VALUES } from "@/features/social-insurance/policies/r8ContributionValues";
import type {
  R8ContributionInput,
  R8ContributionResult,
} from "@/features/social-insurance/r8/types";

const ANNUALIZATION_MONTHS = 12;
const NURSING_CARE_MINIMUM_AGE = 40;
const NURSING_CARE_MAXIMUM_AGE_EXCLUSIVE = 65;

/**
 * Calculates an unpublished R8 steady-state annual estimate.
 *
 * Monthly proration is intentionally not performed. Each annual line item is
 * rounded independently to the nearest yen, then the rounded line items are
 * summed. This does not reproduce the official monthly withholding table's
 * employer-specific fractional-yen handling.
 */
export function calculateR8EmployeeContributions(
  input: R8ContributionInput,
): R8ContributionResult {
  assertNonNegativeSafeInteger(input.annualSalaryYen, "annualSalaryYen");
  assertNonNegativeSafeInteger(
    input.healthStandardMonthlyRemunerationYen,
    "healthStandardMonthlyRemunerationYen",
  );
  assertNonNegativeSafeInteger(
    input.pensionStandardMonthlyRemunerationYen,
    "pensionStandardMonthlyRemunerationYen",
  );
  assertNonNegativeSafeInteger(input.age, "age");

  const healthMonthlyRemuneration =
    input.healthStandardMonthlyRemunerationYen;
  const pensionMonthlyRemuneration =
    input.pensionStandardMonthlyRemunerationYen;
  const healthInsuranceYen = roundAnnualContribution(
    healthMonthlyRemuneration,
    R8_EMPLOYEE_CONTRIBUTION_VALUES.healthInsuranceEmployeeRate,
  );
  const nursingCareInsuranceYen = isNursingCareInsuranceAge(input.age)
    ? roundAnnualContribution(
        healthMonthlyRemuneration,
        R8_EMPLOYEE_CONTRIBUTION_VALUES.nursingCareEmployeeRate,
      )
    : 0;
  const pensionInsuranceYen = roundAnnualContribution(
    pensionMonthlyRemuneration,
    R8_EMPLOYEE_CONTRIBUTION_VALUES.pensionEmployeeRate,
  );
  const employmentInsuranceYen = roundYen(
    input.annualSalaryYen *
      R8_EMPLOYEE_CONTRIBUTION_VALUES.employmentInsuranceEmployeeRate,
  );
  const childAndFamilySupportYen = roundAnnualContribution(
    healthMonthlyRemuneration,
    R8_EMPLOYEE_CONTRIBUTION_VALUES.childAndFamilySupportEmployeeRate,
  );
  const totalEmployeeContributionYen = addSafeYenAmounts([
    healthInsuranceYen,
    nursingCareInsuranceYen,
    pensionInsuranceYen,
    employmentInsuranceYen,
    childAndFamilySupportYen,
  ]);

  return {
    healthInsuranceYen,
    nursingCareInsuranceYen,
    pensionInsuranceYen,
    employmentInsuranceYen,
    childAndFamilySupportYen,
    totalEmployeeContributionYen,
  };
}

function isNursingCareInsuranceAge(age: number) {
  return (
    age >= NURSING_CARE_MINIMUM_AGE &&
    age < NURSING_CARE_MAXIMUM_AGE_EXCLUSIVE
  );
}

function roundAnnualContribution(
  standardMonthlyRemunerationYen: number,
  employeeRate: number,
) {
  return roundYen(
    standardMonthlyRemunerationYen * employeeRate * ANNUALIZATION_MONTHS,
  );
}

function roundYen(value: number) {
  const rounded = Math.round(value);

  if (!Number.isSafeInteger(rounded) || rounded < 0) {
    throw new RangeError("Calculated contribution is outside the safe yen range.");
  }

  return rounded;
}

function addSafeYenAmounts(amounts: readonly number[]) {
  return amounts.reduce((total, amount) => roundYen(total + amount), 0);
}

function assertNonNegativeSafeInteger(value: number, fieldName: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative safe integer.`);
  }
}
