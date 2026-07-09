export type SchoolType = "public" | "private";

export type UniversityType =
  | "national"
  | "privateHumanities"
  | "privateScience";

export type EducationStageKey =
  | "elementary"
  | "juniorHigh"
  | "highSchool"
  | "university";

export type SavingMethod = "deposit" | "nisa" | "insurance";

export type ChildEducationPlanInput = {
  childNumber: number;
  age: number;
  stages: {
    elementary: SchoolType;
    juniorHigh: SchoolType;
    highSchool: SchoolType;
    university: UniversityType;
  };
};

export type EducationCostInput = {
  children: ChildEducationPlanInput[];
  currentSavings: Record<SavingMethod, number>;
  monthlySavings: Record<SavingMethod, number>;
};

export type ChildStageResult = {
  stage: EducationStageKey;
  stageLabel: string;
  optionLabel: string;
  cost: number;
};

export type ChildEducationCostResult = {
  childNumber: number;
  age: number;
  courseCost: number;
  courseLabel: string;
  stages: ChildStageResult[];
  remainingMonths: number;
};

export type EducationCostDiagnosisLevel = "good" | "check" | "grow";

export type EducationCostDiagnosis = {
  level: EducationCostDiagnosisLevel;
  title: string;
  message: string;
};

export type EducationCostResult = {
  children: ChildEducationCostResult[];
  totalCost: number;
  currentSavingsTotal: number;
  monthlySavingsTotal: number;
  plannedSavings: number;
  shortage: number;
  achievementRate: number;
  longestRemainingMonths: number;
  additionalMonthly: number;
  diagnosis: EducationCostDiagnosis;
};
