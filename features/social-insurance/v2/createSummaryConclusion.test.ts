import { describe, expect, it } from "vitest";

import { createSummaryConclusion } from "@/features/social-insurance/v2/createSummaryConclusion";
import type { SimulationResult } from "@/features/social-insurance/v2/resultTypes";

const legacyCalculation: SimulationResult["legacyCalculation"] = {
  current: {
    hourlyWage: 1000,
    weeklyHours: 20,
    annualIncome: 1040000,
    monthlyIncome: 86666.66666666667,
    standardMonthlyRemuneration: {
      healthInsurance: 88000,
      employeePension: 88000,
    },
    salaryIncomeDeduction: 550000,
    salaryIncome: 490000,
    socialInsurance: {
      employeePension: 0,
      healthInsurance: 0,
      careInsurance: 0,
      employmentInsurance: 0,
      total: 0,
    },
    incomeTax: 0,
    residentTax: 0,
    spouseAllowanceAnnual: 0,
    takeHomePay: 1040000,
    pensionAnnualIncrease: 0,
  },
  future: {
    hourlyWage: 1000,
    weeklyHours: 20,
    annualIncome: 1040000,
    monthlyIncome: 86666.66666666667,
    standardMonthlyRemuneration: {
      healthInsurance: 88000,
      employeePension: 88000,
    },
    salaryIncomeDeduction: 550000,
    salaryIncome: 490000,
    socialInsurance: {
      employeePension: 0,
      healthInsurance: 0,
      careInsurance: 0,
      employmentInsurance: 0,
      total: 0,
    },
    incomeTax: 0,
    residentTax: 0,
    spouseAllowanceAnnual: 0,
    takeHomePay: 1040000,
    pensionAnnualIncrease: 0,
  },
  takeHomeDifference: 0,
  increasedAnnualHours: 0,
  cashReturnPerIncreasedHour: null,
  pensionAnnualIncreaseDifference: 0,
  pensionTotalReturnToAge90: 0,
  comments: [],
};

function createResult(
  differences: Partial<
    Pick<
      SimulationResult,
      | "personalTakeHomeDifferenceYen"
      | "spouseAllowanceDifferenceYen"
      | "householdDifferenceYen"
    >
  > = {},
): SimulationResult {
  return {
    current: {
      personalTakeHomeYen: 1040000,
      spouseAllowanceAnnualYen: 120000,
      householdCashFlowYen: 1160000,
    },
    proposed: {
      personalTakeHomeYen: 1040000,
      spouseAllowanceAnnualYen: 120000,
      householdCashFlowYen: 1160000,
    },
    personalTakeHomeDifferenceYen: 0,
    spouseAllowanceDifferenceYen: 0,
    householdDifferenceYen: 0,
    legacyCalculation,
    ...differences,
  };
}

describe("createSummaryConclusion", () => {
  describe("compareAnnualTakeHome", () => {
    it("describes a positive personal take-home difference", () => {
      const conclusion = createSummaryConclusion(
        "compareAnnualTakeHome",
        createResult({
          personalTakeHomeDifferenceYen: 12000,
          householdDifferenceYen: -99999,
        }),
      );

      expect(conclusion).toEqual({
        goal: "compareAnnualTakeHome",
        tone: "positive",
        headline:
          "変更後は、本人の年間手取りが12,000円増える見込みです。",
        detail: "配偶者手当を含めない、本人自身の手取り差です。",
      });
      expect(conclusion.headline).not.toContain("世帯");
    });

    it("describes a negative difference using its absolute amount", () => {
      const conclusion = createSummaryConclusion(
        "compareAnnualTakeHome",
        createResult({ personalTakeHomeDifferenceYen: -12000 }),
      );

      expect(conclusion.tone).toBe("caution");
      expect(conclusion.headline).toBe(
        "変更後は、本人の年間手取りが12,000円減る見込みです。",
      );
      expect(conclusion.headline).not.toContain("-");
    });

    it("returns a neutral conclusion for no difference", () => {
      const conclusion = createSummaryConclusion(
        "compareAnnualTakeHome",
        createResult(),
      );

      expect(conclusion.tone).toBe("neutral");
      expect(conclusion.headline).toContain("ほぼ変わらない");
      expect(conclusion.detail).toContain("0円");
    });
  });

  describe("checkTakeHomeMaintenance", () => {
    it("treats a positive difference as maintaining and increasing take-home", () => {
      const conclusion = createSummaryConclusion(
        "checkTakeHomeMaintenance",
        createResult({
          personalTakeHomeDifferenceYen: 12000,
          householdDifferenceYen: -50000,
        }),
      );

      expect(conclusion.tone).toBe("positive");
      expect(conclusion.headline).toBe(
        "現在の本人手取りを維持しながら、年間12,000円増える見込みです。",
      );
    });

    it("describes a negative difference as lower than current take-home", () => {
      const conclusion = createSummaryConclusion(
        "checkTakeHomeMaintenance",
        createResult({ personalTakeHomeDifferenceYen: -8500 }),
      );

      expect(conclusion.tone).toBe("caution");
      expect(conclusion.headline).toBe(
        "現在の本人手取りより、年間8,500円少なくなる見込みです。",
      );
      expect(conclusion.headline).not.toContain("-");
    });

    it("returns a neutral conclusion when take-home is unchanged", () => {
      const conclusion = createSummaryConclusion(
        "checkTakeHomeMaintenance",
        createResult({ householdDifferenceYen: 50000 }),
      );

      expect(conclusion.tone).toBe("neutral");
      expect(conclusion.headline).toContain("ほぼ同じ");
      expect(conclusion.detail).toContain("0円");
    });
  });

  describe("compareDependentAndInsured", () => {
    it("describes a positive household cash-flow difference", () => {
      const conclusion = createSummaryConclusion(
        "compareDependentAndInsured",
        createResult({
          personalTakeHomeDifferenceYen: -99999,
          householdDifferenceYen: 12000,
        }),
      );

      expect(conclusion.tone).toBe("positive");
      expect(conclusion.headline).toBe(
        "変更後は、世帯の年間現金収支が12,000円増える見込みです。",
      );
    });

    it("describes a negative household difference using its absolute amount", () => {
      const conclusion = createSummaryConclusion(
        "compareDependentAndInsured",
        createResult({ householdDifferenceYen: -12000 }),
      );

      expect(conclusion.tone).toBe("caution");
      expect(conclusion.headline).toContain("12,000円減る見込み");
      expect(conclusion.headline).not.toContain("-");
    });

    it("returns a neutral conclusion for no household difference", () => {
      const conclusion = createSummaryConclusion(
        "compareDependentAndInsured",
        createResult(),
      );

      expect(conclusion.tone).toBe("neutral");
      expect(conclusion.headline).toContain("ほぼ変わらない");
      expect(conclusion.detail).toContain("0円");
    });

    it("does not infer household change when the difference is unknown", () => {
      const conclusion = createSummaryConclusion(
        "compareDependentAndInsured",
        createResult({
          personalTakeHomeDifferenceYen: 999999,
          householdDifferenceYen: null,
        }),
      );

      expect(conclusion).toEqual({
        goal: "compareDependentAndInsured",
        tone: "neutral",
        headline:
          "配偶者手当が未確認のため、世帯の現金収支差はまだ確定できません。",
        detail:
          "本人手取り差は計算できますが、配偶者の勤務先へ手当条件を確認してください。",
      });
      expect(conclusion.headline).not.toMatch(/増|減|円/);
    });
  });

  it("formats amounts as comma-separated integer yen", () => {
    const conclusion = createSummaryConclusion(
      "compareAnnualTakeHome",
      createResult({ personalTakeHomeDifferenceYen: 12345.4 }),
    );

    expect(conclusion.headline).toContain("12,345円");
    expect(conclusion.headline).not.toContain("NaN");
    expect(conclusion.headline).not.toMatch(/12,345[.,]\d/);
  });

  it("does not mutate the simulation result", () => {
    const result = createResult({
      personalTakeHomeDifferenceYen: 12000,
      householdDifferenceYen: 24000,
    });
    const before = structuredClone(result);

    createSummaryConclusion("compareAnnualTakeHome", result);

    expect(result).toEqual(before);
  });

  it("does not use prohibited definitive expressions", () => {
    const prohibitedExpressions = [
      "必ず",
      "絶対",
      "得です",
      "損です",
      "加入できます",
      "加入できません",
      "扶養に入れます",
      "扶養から外れます",
      "社会保険に加入しなければなりません",
      "この働き方が正解です",
    ];
    const cases = [
      createSummaryConclusion(
        "compareAnnualTakeHome",
        createResult({ personalTakeHomeDifferenceYen: 12000 }),
      ),
      createSummaryConclusion(
        "compareAnnualTakeHome",
        createResult({ personalTakeHomeDifferenceYen: -12000 }),
      ),
      createSummaryConclusion(
        "checkTakeHomeMaintenance",
        createResult({ personalTakeHomeDifferenceYen: 12000 }),
      ),
      createSummaryConclusion(
        "checkTakeHomeMaintenance",
        createResult({ personalTakeHomeDifferenceYen: -12000 }),
      ),
      createSummaryConclusion(
        "compareDependentAndInsured",
        createResult({ householdDifferenceYen: 12000 }),
      ),
      createSummaryConclusion(
        "compareDependentAndInsured",
        createResult({ householdDifferenceYen: -12000 }),
      ),
      createSummaryConclusion(
        "compareDependentAndInsured",
        createResult({ householdDifferenceYen: null }),
      ),
    ];

    for (const conclusion of cases) {
      const text = `${conclusion.headline}${conclusion.detail}`;
      for (const expression of prohibitedExpressions) {
        expect(text).not.toContain(expression);
      }
    }
  });
});
