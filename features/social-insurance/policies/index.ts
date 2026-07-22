import { R7_LEGACY_POLICY } from "@/features/social-insurance/policies/r7LegacyPolicy";
import { R8_POLICY } from "@/features/social-insurance/policies/r8Policy";
import type {
  CalculationPolicy,
  CalculationPolicyId,
} from "@/features/social-insurance/policies/types";

export { R7_LEGACY_POLICY, R8_POLICY };
export type {
  CalculationMode,
  CalculationPolicy,
  CalculationPolicyId,
  KnownLimitation,
  KnownLimitationCode,
  OfficialSource,
  PolicyArea,
} from "@/features/social-insurance/policies/types";

export const CALCULATION_POLICIES = [
  R7_LEGACY_POLICY,
  R8_POLICY,
] as const satisfies readonly CalculationPolicy[];

export function getCalculationPolicy(
  policyId: CalculationPolicyId,
): CalculationPolicy;
export function getCalculationPolicy(policyId: string): CalculationPolicy | undefined;
export function getCalculationPolicy(
  policyId: string,
): CalculationPolicy | undefined {
  return CALCULATION_POLICIES.find(
    (policy) => policy.policyId === policyId,
  );
}
