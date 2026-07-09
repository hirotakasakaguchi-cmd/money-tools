export type HouseholdExpenseKey =
  | "housing"
  | "food"
  | "communication"
  | "insurance"
  | "subscriptions"
  | "saving";

export type HouseholdDiagnosisLevel = "good" | "check" | "review";

export type HouseholdBudgetInput = {
  monthlyTakeHomePay: number;
  expenses: Record<HouseholdExpenseKey, number>;
};

export type HouseholdBudgetItem = {
  key: HouseholdExpenseKey;
  label: string;
  shortLabel: string;
  amount: number;
  benchmarkPercent: number;
  actualPercent: number;
  targetAmount: number;
  gapPercent: number;
  issueKind: "excess" | "shortage" | "none";
  priorityScore: number;
  advice: string;
  isSaving: boolean;
};

export type HouseholdDiagnosis = {
  level: HouseholdDiagnosisLevel;
  title: string;
  message: string;
};

export type HouseholdBudgetResult = {
  monthlyTakeHomePay: number;
  totalSpending: number;
  balanceAfterSpendingAndSaving: number;
  savingRate: number;
  housingRate: number;
  items: HouseholdBudgetItem[];
  priorities: HouseholdBudgetItem[];
  topPriority: HouseholdBudgetItem | null;
  diagnosis: HouseholdDiagnosis;
  comment: string;
};
