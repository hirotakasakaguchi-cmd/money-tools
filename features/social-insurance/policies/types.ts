export type CalculationPolicyId =
  | "r7LegacyApproximation"
  | "r8FukuokaSteadyStateAnnualEstimate";

export type CalculationMode =
  | "legacyApproximation"
  | "steadyStateAnnualEstimate";

export type IsoDate = `${number}-${number}-${number}`;
export type OfficialHttpsUrl = `https://${string}`;

export type JapaneseFiscalYear = {
  readonly kind: "fiscalYear";
  readonly reiwaYear: number;
  readonly westernYear: number;
};

export type JapaneseCalendarYear = {
  readonly kind: "calendarYear";
  readonly reiwaYear: number;
  readonly westernYear: number;
};

export type CalculationRegion = {
  readonly countryCode: "JP";
  readonly prefectureCode: "40";
  readonly prefectureName: "福岡県";
};

export type PolicyArea =
  | "healthInsurance"
  | "careInsurance"
  | "childAndFamilySupport"
  | "employeePension"
  | "employmentInsurance"
  | "incomeTax"
  | "residentTax"
  | "dependentIncomeRecognition";

export type EffectiveDateMetadata =
  | {
      readonly status: "effective";
      readonly appliesFrom: IsoDate;
      readonly collectionFrom?: IsoDate;
      readonly administrativeEffectiveFrom?: IsoDate;
    }
  | {
      readonly status: "notApplicable";
      readonly reason: string;
    };

export type PolicyEffectiveDates = {
  readonly healthInsurance: EffectiveDateMetadata;
  readonly careInsurance: EffectiveDateMetadata;
  readonly childAndFamilySupport: EffectiveDateMetadata;
  readonly employmentInsurance: EffectiveDateMetadata;
  readonly incomeTax: EffectiveDateMetadata;
  readonly residentTax: EffectiveDateMetadata;
};

export type OfficialSourceAuthority =
  | "全国健康保険協会"
  | "厚生労働省"
  | "国税庁"
  | "福岡市"
  | "日本年金機構";

export type OfficialSource = {
  readonly authority: OfficialSourceAuthority;
  readonly title: string;
  readonly url: OfficialHttpsUrl;
  readonly publishedOrEffectiveDate: IsoDate;
  readonly appliesTo: readonly PolicyArea[];
  readonly verifiedAt: IsoDate;
};

export type KnownLimitationCode =
  | "annualizedWithoutMonthlyProration"
  | "residentTaxSteadyStateApproximation"
  | "age65AndOverLegacyConstraint"
  | "multipleWorkplacesUnsupported"
  | "bonusesAndAllowancesUnsupported"
  | "dependentIncomeThresholdDiffersFromIncomeTax"
  | "legacyTaxApproximation"
  | "legacyCalculationIsUnversioned";

export type KnownLimitation = {
  readonly code: KnownLimitationCode;
  readonly description: string;
  readonly relatedIssue?: `#${number}`;
};

export type CalculationPolicy = {
  readonly policyId: CalculationPolicyId;
  readonly displayName: string;
  readonly region: CalculationRegion;
  readonly healthInsuranceBranch: "全国健康保険協会 福岡支部";
  readonly socialInsuranceFiscalYear: JapaneseFiscalYear;
  readonly incomeTaxYear: JapaneseCalendarYear;
  readonly residentTaxFiscalYear: JapaneseFiscalYear;
  readonly calculationMode: CalculationMode;
  readonly isPubliclyActive: boolean;
  readonly effectiveDates: PolicyEffectiveDates;
  readonly officialSources: readonly OfficialSource[];
  readonly knownLimitations: readonly KnownLimitation[];
};
