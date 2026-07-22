import type { CalculationPolicy } from "@/features/social-insurance/policies/types";

/**
 * Metadata for the existing public calculation protected by the 18 Golden tests.
 * The calculation engine does not read this object yet.
 */
export const R7_LEGACY_POLICY = {
  policyId: "r7LegacyApproximation",
  displayName: "legacy令和7年度概算",
  region: {
    countryCode: "JP",
    prefectureCode: "40",
    prefectureName: "福岡県",
  },
  healthInsuranceBranch: "全国健康保険協会 福岡支部",
  socialInsuranceFiscalYear: {
    kind: "fiscalYear",
    reiwaYear: 7,
    westernYear: 2025,
  },
  incomeTaxYear: {
    kind: "calendarYear",
    reiwaYear: 7,
    westernYear: 2025,
  },
  residentTaxFiscalYear: {
    kind: "fiscalYear",
    reiwaYear: 7,
    westernYear: 2025,
  },
  calculationMode: "legacyApproximation",
  isPubliclyActive: true,
  effectiveDates: {
    healthInsurance: {
      status: "effective",
      appliesFrom: "2025-03-01",
      collectionFrom: "2025-04-01",
    },
    careInsurance: {
      status: "effective",
      appliesFrom: "2025-03-01",
      collectionFrom: "2025-04-01",
    },
    childAndFamilySupport: {
      status: "notApplicable",
      reason: "子ども・子育て支援金は令和8年4月分から開始されます。",
    },
    employmentInsurance: {
      status: "effective",
      appliesFrom: "2025-04-01",
    },
    incomeTax: {
      status: "effective",
      appliesFrom: "2025-01-01",
      administrativeEffectiveFrom: "2025-12-01",
    },
    residentTax: {
      status: "effective",
      appliesFrom: "2025-04-01",
      collectionFrom: "2025-06-01",
    },
  },
  officialSources: [],
  knownLimitations: [
    {
      code: "legacyTaxApproximation",
      description:
        "所得税5%、住民税10%の単一税率など、既存の簡易税計算をそのまま保持します。",
    },
    {
      code: "age65AndOverLegacyConstraint",
      description:
        "65歳以上にも40〜64歳と同じ介護保険料概算を適用する既知制約があります。",
      relatedIssue: "#5",
    },
    {
      code: "legacyCalculationIsUnversioned",
      description:
        "既存計算は年度ポリシーを引数に取らず、18件のGoldenで挙動を固定しています。",
    },
  ],
} as const satisfies CalculationPolicy;
