import {
  HOUSEHOLD_EXPENSE_DEFINITIONS,
  EXPENSE_PRIORITY_MARGIN_PERCENT,
  HOUSING_REVIEW_PERCENT,
  SAVING_IDEAL_PERCENT,
  SAVING_PRIORITY_PERCENT,
  SAVING_REVIEW_PERCENT,
  SUBSCRIPTION_PRIORITY_PERCENT,
} from "@/features/household-budget/constants";
import type {
  HouseholdBudgetInput,
  HouseholdBudgetItem,
  HouseholdBudgetResult,
  HouseholdDiagnosis,
  HouseholdExpenseKey,
} from "@/features/household-budget/types";

export function calculateHouseholdBudget(
  input: HouseholdBudgetInput,
): HouseholdBudgetResult {
  const monthlyTakeHomePay = Math.max(0, input.monthlyTakeHomePay);
  const items = HOUSEHOLD_EXPENSE_DEFINITIONS.map((definition) => {
    const amount = Math.max(0, input.expenses[definition.key] ?? 0);
    const actualPercent =
      monthlyTakeHomePay > 0 ? (amount / monthlyTakeHomePay) * 100 : 0;
    const targetAmount =
      monthlyTakeHomePay * (definition.benchmarkPercent / 100);
    const gapPercent = actualPercent - definition.benchmarkPercent;
    const isSaving = "isSaving" in definition && Boolean(definition.isSaving);
    const issueKind = getIssueKind(
      definition.key,
      isSaving,
      actualPercent,
      definition.benchmarkPercent,
    );
    const priorityScore = getPriorityScore(
      isSaving,
      actualPercent,
      definition.benchmarkPercent,
    );

    return {
      key: definition.key,
      label: definition.label,
      shortLabel: definition.shortLabel,
      amount,
      benchmarkPercent: definition.benchmarkPercent,
      actualPercent,
      targetAmount,
      gapPercent,
      issueKind,
      priorityScore,
      advice: definition.advice,
      isSaving,
    } satisfies HouseholdBudgetItem;
  });

  const priorities = buildPriorities(items);
  const savingRate = findItemPercent(items, "saving");
  const housingRate = findItemPercent(items, "housing");
  const diagnosis = getDiagnosis({
    prioritiesCount: priorities.length,
    savingRate,
    housingRate,
  });
  const totalSpending = items
    .filter((item) => !item.isSaving)
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    monthlyTakeHomePay,
    totalSpending,
    balanceAfterSpendingAndSaving:
      monthlyTakeHomePay -
      totalSpending -
      (input.expenses.saving ?? 0),
    savingRate,
    housingRate,
    items,
    priorities,
    topPriority: priorities[0] ?? null,
    diagnosis,
    comment: getDiagnosisComment(diagnosis.level, priorities),
  };
}

function getIssueKind(
  key: HouseholdExpenseKey,
  isSaving: boolean,
  actualPercent: number,
  benchmarkPercent: number,
): HouseholdBudgetItem["issueKind"] {
  if (isSaving) {
    return actualPercent < SAVING_PRIORITY_PERCENT ? "shortage" : "none";
  }

  if (key === "subscriptions") {
    return actualPercent >= SUBSCRIPTION_PRIORITY_PERCENT ? "excess" : "none";
  }

  return actualPercent > benchmarkPercent + EXPENSE_PRIORITY_MARGIN_PERCENT
    ? "excess"
    : "none";
}

function getPriorityScore(
  isSaving: boolean,
  actualPercent: number,
  benchmarkPercent: number,
) {
  if (benchmarkPercent <= 0) {
    return 0;
  }

  if (isSaving) {
    return Math.max(0, benchmarkPercent - actualPercent) / benchmarkPercent * 100;
  }

  return Math.max(0, actualPercent - benchmarkPercent) / benchmarkPercent * 100;
}

function buildPriorities(items: HouseholdBudgetItem[]) {
  return items
    .filter((item) => item.issueKind !== "none")
    .sort(
      (a, b) =>
        b.priorityScore - a.priorityScore ||
        getTiePriority(b.key) - getTiePriority(a.key),
    );
}

function getTiePriority(key: HouseholdExpenseKey) {
  switch (key) {
    case "saving":
      return 100;
    case "housing":
      return 90;
    case "insurance":
      return 80;
    case "communication":
      return 70;
    case "subscriptions":
      return 60;
    case "food":
      return 50;
  }
}

function getDiagnosis({
  prioritiesCount,
  savingRate,
  housingRate,
}: {
  prioritiesCount: number;
  savingRate: number;
  housingRate: number;
}): HouseholdDiagnosis {
  if (
    prioritiesCount >= 3 ||
    savingRate < SAVING_REVIEW_PERCENT ||
    housingRate >= HOUSING_REVIEW_PERCENT
  ) {
    return {
      level: "review",
      title: "🔴 優先して見直したいです",
      message:
        "まずは負担が大きい項目を1つ選んで、今月できる見直しから始めましょう。",
    };
  }

  if (
    prioritiesCount >= 1 ||
    (savingRate >= SAVING_REVIEW_PERCENT && savingRate < SAVING_IDEAL_PERCENT)
  ) {
    return {
      level: "check",
      title: "🟡 見直し余地あり",
      message:
        "大きく崩れてはいません。気になる支出を少し整えると、家計に余白が作れます。",
    };
  }

  return {
    level: "good",
    title: "🟢 いい感じです",
    message:
      "大きな見直し候補は少なめです。今の家計管理を続けながら、無理なく積立も続けましょう。",
  };
}

function getDiagnosisComment(
  level: HouseholdDiagnosis["level"],
  priorities: HouseholdBudgetItem[],
) {
  const topPriority = priorities[0];

  if (!topPriority) {
    return "支出バランスは比較的整っています。今の家計管理を続けながら、固定費だけ時々確認しておくと安心です。";
  }

  if (topPriority.isSaving) {
    return "貯金・投資額が目安より少なめです。まずは月収の5〜10%から積立の仕組みを作ると、将来への安心につながります。";
  }

  if (level === "review") {
    return `${topPriority.shortLabel}の割合が高めです。全部を一気に変えようとせず、まずは一番負担が大きい項目から確認してみましょう。`;
  }

  return `${topPriority.shortLabel}に見直し余地があります。今の暮らしに必要な支出は残しつつ、無理なく下げられる部分を探してみましょう。`;
}

function findItemPercent(items: HouseholdBudgetItem[], key: HouseholdExpenseKey) {
  return items.find((item) => item.key === key)?.actualPercent ?? 0;
}
