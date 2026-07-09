import {
  EDUCATION_COSTS,
  MONTHS_PER_YEAR,
  SAVING_METHODS,
  TARGET_AGE,
} from "@/features/education-cost/constants";
import type {
  ChildEducationCostResult,
  ChildEducationPlanInput,
  ChildStageResult,
  EducationStageKey,
  EducationCostDiagnosis,
  EducationCostInput,
  EducationCostResult,
  SavingMethod,
} from "@/features/education-cost/types";

export function calculateEducationCost(
  input: EducationCostInput,
): EducationCostResult {
  const children = input.children.map((child) => calculateChildEducationCost(child));
  const totalCost = children.reduce((sum, child) => sum + child.courseCost, 0);
  const currentSavingsTotal = sumSavingValues(input.currentSavings);
  const monthlySavingsTotal = sumSavingValues(input.monthlySavings);
  const longestRemainingMonths = Math.max(
    0,
    ...children.map((child) => child.remainingMonths),
  );
  const plannedSavings = calculatePlannedSavings(
    input.currentSavings,
    input.monthlySavings,
    longestRemainingMonths,
  );
  const shortage = Math.max(0, totalCost - plannedSavings);
  const achievementRate = totalCost > 0 ? (plannedSavings / totalCost) * 100 : 0;
  const additionalMonthly = calculateAdditionalMonthly(
    shortage,
    longestRemainingMonths,
  );
  const diagnosis = getDiagnosis(achievementRate, getAgeGroup(children));

  return {
    children,
    totalCost,
    currentSavingsTotal,
    monthlySavingsTotal,
    plannedSavings,
    shortage,
    achievementRate,
    longestRemainingMonths,
    additionalMonthly,
    diagnosis,
  };
}

function calculateChildEducationCost(child: ChildEducationPlanInput): ChildEducationCostResult {
  const stages = buildStageResults(child);
  const remainingMonths = Math.max(0, (TARGET_AGE - child.age) * MONTHS_PER_YEAR);
  const courseCost = stages.reduce((sum, stage) => sum + stage.cost, 0);

  return {
    childNumber: child.childNumber,
    age: child.age,
    stages,
    courseCost,
    courseLabel: stages
      .map((stage) => `${stage.stageLabel}：${stage.optionLabel}`)
      .join(" / "),
    remainingMonths,
  };
}

function buildStageResults(child: ChildEducationPlanInput): ChildStageResult[] {
  return [
    buildStageResult("elementary", child.stages.elementary),
    buildStageResult("juniorHigh", child.stages.juniorHigh),
    buildStageResult("highSchool", child.stages.highSchool),
    buildStageResult("university", child.stages.university),
  ];
}

function buildStageResult(
  stage: EducationStageKey,
  selectedValue: string,
): ChildStageResult {
  const stageSetting = EDUCATION_COSTS[stage];
  const options = stageSetting.options as Record<
    string,
    { label: string; cost: number }
  >;
  const option = options[selectedValue];

  return {
    stage,
    stageLabel: stageSetting.label,
    optionLabel: option.label,
    cost: option.cost,
  };
}

function calculatePlannedSavings(
  currentSavings: Record<SavingMethod, number>,
  monthlySavings: Record<SavingMethod, number>,
  longestRemainingMonths: number,
) {
  return Object.entries(SAVING_METHODS).reduce(
    (total, [method, setting]) =>
      total +
      calculateFutureValue(
        currentSavings[method as SavingMethod],
        monthlySavings[method as SavingMethod],
        longestRemainingMonths,
        setting.annualRate,
      ),
    0,
  );
}

function calculateFutureValue(
  currentSavings: number,
  monthlySaving: number,
  months: number,
  annualRate: number,
) {
  const monthlyRate = annualRate / MONTHS_PER_YEAR;

  if (monthlyRate <= 0) {
    return currentSavings + monthlySaving * months;
  }

  const futureCurrentSavings = currentSavings * (1 + monthlyRate) ** months;
  const futureMonthlySavings =
    monthlySaving * (((1 + monthlyRate) ** months - 1) / monthlyRate);

  return futureCurrentSavings + futureMonthlySavings;
}

function calculateAdditionalMonthly(shortage: number, months: number) {
  if (shortage <= 0 || months <= 0) {
    return 0;
  }

  return shortage / months;
}

function getAgeGroup(children: ChildEducationCostResult[]) {
  const oldestAge = Math.max(0, ...children.map((child) => child.age));

  if (oldestAge <= 5) {
    return "early";
  }

  if (oldestAge <= 11) {
    return "middle";
  }

  return "late";
}

function getDiagnosis(
  achievementRate: number,
  ageGroup: "early" | "middle" | "late",
): EducationCostDiagnosis {
  if (achievementRate >= 80) {
    return {
      level: "good",
      title: "順調です",
      message: getDiagnosisMessage("good", ageGroup),
    };
  }

  if (achievementRate >= 50) {
    return {
      level: "check",
      title: "あと少しです",
      message: getDiagnosisMessage("check", ageGroup),
    };
  }

  return {
    level: "grow",
    title: "改善が必要です",
    message: getDiagnosisMessage("grow", ageGroup),
  };
}

function getDiagnosisMessage(
  level: "good" | "check" | "grow",
  ageGroup: "early" | "middle" | "late",
) {
  const messages = {
    good: {
      early:
        "現在の積立ペースなら、目標とする教育費を準備できる見込みです。今後も無理のない範囲で継続していきましょう。",
      middle:
        "現在の積立ペースなら、目標とする教育費を準備できる見込みです。教育方針や進路の変化に合わせて定期的に確認するのがおすすめです。",
      late:
        "現在の積立ペースなら、目標とする教育費を準備できる見込みです。進学が近づく時期なので、必要なタイミングで使えるよう準備状況を確認しておきましょう。",
    },
    check: {
      early:
        "教育費の準備は順調に進んでいます。目標まではあと少しです。今のうちに積立額を少し増やせると、将来の負担をさらに減らせそうです。",
      middle:
        "教育費の準備は順調です。目標まであと少しの位置にいます。毎月あと必要な金額を確認しながら、無理のない範囲で調整してみましょう。",
      late:
        "教育費の準備は順調です。進学までの期間を考えると、今後の積立計画を定期的に確認しておくと安心です。",
    },
    grow: {
      early:
        "まだ準備期間は十分あります。現在の積立ペースでは目標額に届かない可能性がありますが、今から見直せば改善しやすい時期です。不足額と毎月あと必要な金額を確認してみましょう。",
      middle:
        "教育費が増え始める時期です。現在の積立ペースでは目標額に届かない可能性があります。まずは家計や積立額を見直せるポイントがないか確認してみましょう。",
      late:
        "大学進学までの期間が短くなっています。現在の積立ペースでは目標額に届かない可能性があります。積立額だけでなく、進路や教育費の計画もあわせて確認しておきましょう。",
    },
  };

  return messages[level][ageGroup];
}

function sumSavingValues(values: Record<SavingMethod, number>) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}
