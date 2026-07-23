import type { CalculationPolicy } from "@/features/social-insurance/policies/types";

/**
 * Public Reiwa 8 calculation metadata.
 * The public UI uses this policy only when the user explicitly selects R8.
 */
export const R8_POLICY = {
  policyId: "r8FukuokaSteadyStateAnnualEstimate",
  displayName: "令和8年度・令和8年分 福岡県定常年概算",
  region: {
    countryCode: "JP",
    prefectureCode: "40",
    prefectureName: "福岡県",
  },
  healthInsuranceBranch: "全国健康保険協会 福岡支部",
  socialInsuranceFiscalYear: {
    kind: "fiscalYear",
    reiwaYear: 8,
    westernYear: 2026,
  },
  incomeTaxYear: {
    kind: "calendarYear",
    reiwaYear: 8,
    westernYear: 2026,
  },
  residentTaxFiscalYear: {
    kind: "fiscalYear",
    reiwaYear: 8,
    westernYear: 2026,
  },
  calculationMode: "steadyStateAnnualEstimate",
  isPubliclyActive: true,
  effectiveDates: {
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
  },
  officialSources: [
    {
      authority: "全国健康保険協会",
      title: "令和8年3月分からの福岡支部保険料額表",
      url: "https://www.kyoukaikenpo.or.jp/~/media/Files/shared/hokenryouritu/r8/ippan/R8_40fukuoka.pdf",
      publishedOrEffectiveDate: "2026-03-01",
      appliesTo: [
        "healthInsurance",
        "careInsurance",
        "employeePension",
      ],
      verifiedAt: "2026-07-22",
    },
    {
      authority: "全国健康保険協会",
      title: "協会けんぽの子ども・子育て支援金率について",
      url: "https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/003/",
      publishedOrEffectiveDate: "2026-04-01",
      appliesTo: ["childAndFamilySupport"],
      verifiedAt: "2026-07-22",
    },
    {
      authority: "厚生労働省",
      title: "令和8年度 雇用保険料率のご案内",
      url: "https://www.mhlw.go.jp/content/001692566.pdf",
      publishedOrEffectiveDate: "2026-04-01",
      appliesTo: ["employmentInsurance"],
      verifiedAt: "2026-07-22",
    },
    {
      authority: "国税庁",
      title: "令和8年4月 源泉所得税の改正のあらまし",
      url: "https://www.nta.go.jp/publication/pamph/gensen/2026kaisei.pdf",
      publishedOrEffectiveDate: "2026-12-01",
      appliesTo: ["incomeTax"],
      verifiedAt: "2026-07-22",
    },
    {
      authority: "福岡市",
      title: "令和8年度個人市県民税の税制改正",
      url: "https://www.city.fukuoka.lg.jp/zaisei/shisanzei/life/R8_kaisei.html",
      publishedOrEffectiveDate: "2026-04-01",
      appliesTo: ["residentTax"],
      verifiedAt: "2026-07-22",
    },
    {
      authority: "日本年金機構",
      title: "労働契約内容による年間収入での被扶養者の認定の取り扱いについて",
      url: "https://www.nenkin.go.jp/oshirase/taisetu/jigyosho/2026/202605/0501.html",
      publishedOrEffectiveDate: "2026-04-01",
      appliesTo: ["dependentIncomeRecognition"],
      verifiedAt: "2026-07-22",
    },
  ],
  knownLimitations: [
    {
      code: "annualizedWithoutMonthlyProration",
      description:
        "社会保険料は適用開始月の実期間按分を行わず、令和8年度料率を12カ月分へ換算します。",
    },
    {
      code: "residentTaxSteadyStateApproximation",
      description:
        "前年所得を直接入力せず、現在の年間給与条件が前年にも継続した定常年近似とします。",
    },
    {
      code: "age65AndOverLegacyConstraint",
      description:
        "65歳以上の計算仕様は変更せず、Issue #5の既知制約を維持します。",
      relatedIssue: "#5",
    },
    {
      code: "multipleWorkplacesUnsupported",
      description: "複数勤務先と掛け持ち勤務は対象外です。",
    },
    {
      code: "bonusesAndAllowancesUnsupported",
      description: "賞与、毎月固定手当、一時手当は対象外です。",
    },
    {
      code: "dependentIncomeThresholdDiffersFromIncomeTax",
      description:
        "130万円の扶養確認警告は社会保険の確認目安であり、税法上の所得税基準とは別制度です。",
    },
  ],
} as const satisfies CalculationPolicy;
