import type {
  SimulationGoal,
  SummaryConclusion,
} from "@/features/social-insurance/v2/conclusionTypes";
import type { SimulationResult } from "@/features/social-insurance/v2/resultTypes";

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

function formatAbsoluteYen(value: number): string {
  return `${yenFormatter.format(Math.abs(value))}円`;
}

function createAnnualTakeHomeConclusion(
  goal: SimulationGoal,
  differenceYen: number,
): SummaryConclusion {
  if (differenceYen > 0) {
    return {
      goal,
      tone: "positive",
      headline: `変更後は、本人の年間手取りが${formatAbsoluteYen(differenceYen)}増える見込みです。`,
      detail: "配偶者手当を含めない、本人自身の手取り差です。",
    };
  }

  if (differenceYen < 0) {
    return {
      goal,
      tone: "caution",
      headline: `変更後は、本人の年間手取りが${formatAbsoluteYen(differenceYen)}減る見込みです。`,
      detail: "社会保険料や税金を反映した、本人自身の手取り差です。",
    };
  }

  return {
    goal,
    tone: "neutral",
    headline: "本人の年間手取りは、ほぼ変わらない見込みです。",
    detail: "変更前後の本人手取り差は0円です。",
  };
}

function createTakeHomeMaintenanceConclusion(
  goal: SimulationGoal,
  differenceYen: number,
): SummaryConclusion {
  if (differenceYen > 0) {
    return {
      goal,
      tone: "positive",
      headline: `現在の本人手取りを維持しながら、年間${formatAbsoluteYen(differenceYen)}増える見込みです。`,
      detail: "変更後の本人手取りが、現在を上回る試算です。",
    };
  }

  if (differenceYen < 0) {
    return {
      goal,
      tone: "caution",
      headline: `現在の本人手取りより、年間${formatAbsoluteYen(differenceYen)}少なくなる見込みです。`,
      detail: "手取り維持を目指す場合は、勤務時間や時給の再調整が必要です。",
    };
  }

  return {
    goal,
    tone: "neutral",
    headline: "現在とほぼ同じ本人手取りを維持できる見込みです。",
    detail: "変更前後の本人手取り差は0円です。",
  };
}

function createDependentAndInsuredConclusion(
  goal: SimulationGoal,
  differenceYen: number | null,
): SummaryConclusion {
  if (differenceYen === null) {
    return {
      goal,
      tone: "neutral",
      headline:
        "配偶者手当が未確認のため、世帯の現金収支差はまだ確定できません。",
      detail:
        "本人手取り差は計算できますが、配偶者の勤務先へ手当条件を確認してください。",
    };
  }

  if (differenceYen > 0) {
    return {
      goal,
      tone: "positive",
      headline: `変更後は、世帯の年間現金収支が${formatAbsoluteYen(differenceYen)}増える見込みです。`,
      detail: "本人手取りと配偶者手当を合計した比較です。",
    };
  }

  if (differenceYen < 0) {
    return {
      goal,
      tone: "caution",
      headline: `変更後は、世帯の年間現金収支が${formatAbsoluteYen(differenceYen)}減る見込みです。`,
      detail: "本人手取りと配偶者手当を合計した比較です。",
    };
  }

  return {
    goal,
    tone: "neutral",
    headline: "世帯の年間現金収支は、ほぼ変わらない見込みです。",
    detail: "本人手取りと配偶者手当を含めた差額は0円です。",
  };
}

export function createSummaryConclusion(
  goal: SimulationGoal,
  result: SimulationResult,
): SummaryConclusion {
  switch (goal) {
    case "compareAnnualTakeHome":
      return createAnnualTakeHomeConclusion(
        goal,
        result.personalTakeHomeDifferenceYen,
      );
    case "checkTakeHomeMaintenance":
      return createTakeHomeMaintenanceConclusion(
        goal,
        result.personalTakeHomeDifferenceYen,
      );
    case "compareDependentAndInsured":
      return createDependentAndInsuredConclusion(
        goal,
        result.householdDifferenceYen,
      );
  }
}
