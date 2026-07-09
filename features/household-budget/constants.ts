import type { HouseholdExpenseKey } from "@/features/household-budget/types";

export type HouseholdExpenseDefinition = {
  key: HouseholdExpenseKey;
  label: string;
  shortLabel: string;
  description: string;
  benchmarkPercent: number;
  placeholder: string;
  isSaving?: boolean;
  advice: string;
};

export const HOUSEHOLD_EXPENSE_DEFINITIONS = [
  {
    key: "housing",
    label: "住宅費",
    shortLabel: "住宅費",
    description: "家賃・住宅ローン",
    benchmarkPercent: 25,
    placeholder: "例）80000",
    advice:
      "家賃やローン、管理費をまとめて眺めると、無理のない範囲が見えやすくなります。",
  },
  {
    key: "food",
    label: "食費",
    shortLabel: "食費",
    description: "外食含む",
    benchmarkPercent: 15,
    placeholder: "例）70000",
    advice:
      "買い物と外食を分けて見るだけでも、整えやすいポイントが見つかります。",
  },
  {
    key: "communication",
    label: "通信費",
    shortLabel: "通信費",
    description: "スマホ・ネット",
    benchmarkPercent: 3,
    placeholder: "例）12000",
    advice:
      "スマホやネットのプランを一度見比べると、負担を軽くできるかもしれません。",
  },
  {
    key: "insurance",
    label: "保険料",
    shortLabel: "保険料",
    description: "生命保険・医療保険など",
    benchmarkPercent: 5,
    placeholder: "例）20000",
    advice:
      "今の暮らしに合っているかを確認すると、安心は残したまま整えやすくなります。",
  },
  {
    key: "subscriptions",
    label: "サブスク",
    shortLabel: "サブスク",
    description: "動画・音楽・アプリなど",
    benchmarkPercent: 2,
    placeholder: "例）5000",
    advice:
      "使っていないものを数個外すだけでも、毎月のゆとりにつながります。",
  },
  {
    key: "saving",
    label: "貯金・投資額",
    shortLabel: "貯金・投資額",
    description: "NISA・iDeCo・預金など",
    benchmarkPercent: 20,
    placeholder: "例）50000",
    isSaving: true,
    advice:
      "今のペースを続けつつ、急な出費用のお金も別で置けると安心です。",
  },
] as const satisfies HouseholdExpenseDefinition[];

export const SAVING_IDEAL_PERCENT = 10;
export const SAVING_REVIEW_PERCENT = 5;
export const SAVING_PRIORITY_PERCENT = 15;
export const HOUSING_REVIEW_PERCENT = 35;
export const EXPENSE_PRIORITY_MARGIN_PERCENT = 2;
export const SUBSCRIPTION_PRIORITY_PERCENT = 3;
