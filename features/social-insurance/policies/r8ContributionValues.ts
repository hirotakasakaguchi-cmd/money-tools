import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";

/**
 * Employee contribution rates expressed as decimal multipliers.
 * For example, 0.05055 represents an employee rate of 5.055%.
 *
 * These values belong to the active R8 policy and remain isolated from the
 * legacy R7 calculation path.
 */
export const R8_EMPLOYEE_CONTRIBUTION_VALUES = {
  policyId: R8_POLICY.policyId,
  healthInsuranceEmployeeRate: 0.05055,
  nursingCareEmployeeRate: 0.0081,
  pensionEmployeeRate: 0.0915,
  employmentInsuranceEmployeeRate: 0.005,
  childAndFamilySupportEmployeeRate: 0.00115,
  region: R8_POLICY.region,
  branch: R8_POLICY.healthInsuranceBranch,
  fiscalYear: R8_POLICY.socialInsuranceFiscalYear,
  calculationMode: R8_POLICY.calculationMode,
  officialSourceReference: {
    socialInsurance: R8_POLICY.officialSources[0],
    childAndFamilySupport: R8_POLICY.officialSources[1],
    employmentInsurance: R8_POLICY.officialSources[2],
  },
} as const;
