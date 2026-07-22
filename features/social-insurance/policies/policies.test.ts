import { describe, expect, it } from "vitest";

import {
  CALCULATION_POLICIES,
  getCalculationPolicy,
  R7_LEGACY_POLICY,
  R8_POLICY,
} from "@/features/social-insurance/policies";
import type {
  KnownLimitationCode,
  PolicyArea,
} from "@/features/social-insurance/policies/types";

describe("social insurance calculation policy metadata", () => {
  it("keeps every policy ID unique", () => {
    const policyIds = CALCULATION_POLICIES.map(({ policyId }) => policyId);

    expect(new Set(policyIds).size).toBe(policyIds.length);
  });

  it("describes the existing public calculation as the R7 legacy approximation", () => {
    expect(R7_LEGACY_POLICY).toMatchObject({
      policyId: "r7LegacyApproximation",
      calculationMode: "legacyApproximation",
      isPubliclyActive: true,
      socialInsuranceFiscalYear: {
        kind: "fiscalYear",
        reiwaYear: 7,
        westernYear: 2025,
      },
    });
  });

  it("keeps the planned R8 policy inactive and uses the steady-state mode", () => {
    expect(R8_POLICY).toMatchObject({
      policyId: "r8FukuokaSteadyStateAnnualEstimate",
      calculationMode: "steadyStateAnnualEstimate",
      isPubliclyActive: false,
    });
    expect(
      CALCULATION_POLICIES.filter(({ isPubliclyActive }) => isPubliclyActive),
    ).toEqual([R7_LEGACY_POLICY]);
  });

  it("limits both policies to the Fukuoka branch metadata", () => {
    for (const policy of CALCULATION_POLICIES) {
      expect(policy.region).toEqual({
        countryCode: "JP",
        prefectureCode: "40",
        prefectureName: "福岡県",
      });
      expect(policy.healthInsuranceBranch).toBe(
        "全国健康保険協会 福岡支部",
      );
    }
  });

  it("distinguishes R8 fiscal years from the R8 income-tax calendar year", () => {
    expect(R8_POLICY.socialInsuranceFiscalYear).toEqual({
      kind: "fiscalYear",
      reiwaYear: 8,
      westernYear: 2026,
    });
    expect(R8_POLICY.incomeTaxYear).toEqual({
      kind: "calendarYear",
      reiwaYear: 8,
      westernYear: 2026,
    });
    expect(R8_POLICY.residentTaxFiscalYear).toEqual({
      kind: "fiscalYear",
      reiwaYear: 8,
      westernYear: 2026,
    });
  });

  it("records separate R8 application and collection dates by scheme", () => {
    expect(R8_POLICY.effectiveDates).toEqual({
      healthInsurance: {
        status: "effective",
        appliesFrom: "2026-03-01",
        collectionFrom: "2026-04-01",
      },
      careInsurance: {
        status: "effective",
        appliesFrom: "2026-03-01",
        collectionFrom: "2026-04-01",
      },
      childAndFamilySupport: {
        status: "effective",
        appliesFrom: "2026-04-01",
        collectionFrom: "2026-05-01",
      },
      employmentInsurance: {
        status: "effective",
        appliesFrom: "2026-04-01",
      },
      incomeTax: {
        status: "effective",
        appliesFrom: "2026-01-01",
        administrativeEffectiveFrom: "2026-12-01",
      },
      residentTax: {
        status: "effective",
        appliesFrom: "2026-04-01",
        collectionFrom: "2026-06-01",
      },
    });
  });

  it("contains an official primary source for every required R8 area", () => {
    const requiredAreas = [
      "healthInsurance",
      "careInsurance",
      "childAndFamilySupport",
      "employmentInsurance",
      "incomeTax",
      "residentTax",
      "dependentIncomeRecognition",
    ] satisfies PolicyArea[];
    const sourcedAreas = new Set(
      R8_POLICY.officialSources.flatMap(({ appliesTo }) => appliesTo),
    );

    for (const area of requiredAreas) {
      expect(sourcedAreas.has(area), `missing official source for ${area}`).toBe(
        true,
      );
    }
  });

  it("uses only verified HTTPS official sources", () => {
    expect(R8_POLICY.officialSources).toHaveLength(6);

    for (const source of R8_POLICY.officialSources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.authority).not.toBe("");
      expect(source.title).not.toBe("");
      expect(source.publishedOrEffectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.verifiedAt).toBe("2026-07-22");
      expect(source.appliesTo.length).toBeGreaterThan(0);
    }
  });

  it("records every required R8 limitation", () => {
    const requiredLimitations = [
      "annualizedWithoutMonthlyProration",
      "residentTaxSteadyStateApproximation",
      "age65AndOverLegacyConstraint",
      "multipleWorkplacesUnsupported",
      "bonusesAndAllowancesUnsupported",
      "notConnectedToPublicCalculation",
      "dependentIncomeThresholdDiffersFromIncomeTax",
    ] satisfies KnownLimitationCode[];
    const limitationCodes = R8_POLICY.knownLimitations.map(({ code }) => code);

    expect(limitationCodes).toEqual(requiredLimitations);
    expect(R8_POLICY.knownLimitations).toContainEqual(
      expect.objectContaining({
        code: "age65AndOverLegacyConstraint",
        relatedIssue: "#5",
      }),
    );
  });

  it("retrieves known policies without introducing a default R8 policy", () => {
    expect(getCalculationPolicy(R7_LEGACY_POLICY.policyId)).toBe(
      R7_LEGACY_POLICY,
    );
    expect(getCalculationPolicy(R8_POLICY.policyId)).toBe(R8_POLICY);
  });

  it("returns undefined safely for an unknown policy ID", () => {
    expect(getCalculationPolicy("unknown-policy")).toBeUndefined();
  });
});
