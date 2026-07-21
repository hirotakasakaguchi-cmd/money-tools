import { describe, expect, it } from "vitest";
import {
  calculateSalaryIncomeDeduction,
  calculateSocialInsurance,
} from "@/features/social-insurance/calculateSocialInsurance";
import type { AgeGroup } from "@/features/social-insurance/types";

/**
 * Legacy characterization tests for the current approximation.
 *
 * These Golden values describe what the existing calculator returns today.
 * They do not establish制度上の正確性 and are not a legal determination.
 */

function dependentToInsured(hasSpouseAllowance: boolean) {
  return calculateSocialInsurance({
    ageGroup: "age40To64",
    current: {
      hourlyWage: 1000,
      weeklyHours: 20,
      insuranceStatus: "dependent",
      hasSpouseAllowance,
      spouseAllowanceMonthly: 10000,
    },
    future: {
      weeklyHours: 30,
      insuranceStatus: "insured",
    },
  });
}

function insuredToInsured(ageGroup: AgeGroup) {
  return calculateSocialInsurance({
    ageGroup,
    current: {
      hourlyWage: 1200,
      weeklyHours: 30,
      insuranceStatus: "insured",
      hasSpouseAllowance: false,
      spouseAllowanceMonthly: 0,
    },
    future: {
      hourlyWage: 1300,
      weeklyHours: 35,
      insuranceStatus: "insured",
    },
  });
}

function insuredAtMonthlyIncome(monthlyIncome: number) {
  const hourlyWage = (monthlyIncome * 12) / 52;

  return calculateSocialInsurance({
    ageGroup: "under40",
    current: {
      hourlyWage,
      weeklyHours: 1,
      insuranceStatus: "insured",
      hasSpouseAllowance: false,
      spouseAllowanceMonthly: 0,
    },
    future: {
      hourlyWage,
      weeklyHours: 1,
      insuranceStatus: "insured",
    },
  }).current.standardMonthlyRemuneration;
}

describe("calculateSocialInsurance legacy characterization", () => {
  it("A: fixes the current dependent-to-insured result with a spouse allowance", () => {
    const result = dependentToInsured(true);

    expect(result).toMatchObject({
      current: {
        annualIncome: 1040000,
        takeHomePay: 1160000,
      },
      future: {
        annualIncome: 1560000,
        takeHomePay: 1276820.2,
      },
      takeHomeDifference: 116820.19999999995,
      increasedAnnualHours: 520,
      cashReturnPerIncreasedHour: 224.65423076923068,
      pensionAnnualIncreaseDifference: 8550.36,
      pensionTotalReturnToAge90: 213759,
      comments: [
        "年間手取りは増えますが、増えた労働時間に対する現金リターンは小さめです。",
        "配偶者手当がなくなる前提のため、損益が大きく変わっています。",
        "将来の厚生年金メリットは増える見込みです。",
      ],
    });
  });

  it("B: does not add the spouse-allowance-loss comment when no allowance is set", () => {
    const result = dependentToInsured(false);

    expect(result.takeHomeDifference).toBe(236820.19999999995);
    expect(result.comments).not.toContain(
      "配偶者手当がなくなる前提のため、損益が大きく変わっています。",
    );
  });

  it("C: fixes insured-to-insured remuneration grades, difference, and comment", () => {
    const result = insuredToInsured("age40To64");

    expect(result.current.standardMonthlyRemuneration).toEqual({
      healthInsurance: 160000,
      employeePension: 160000,
    });
    expect(result.future.standardMonthlyRemuneration).toEqual({
      healthInsurance: 200000,
      employeePension: 200000,
    });
    expect(result.takeHomeDifference).toBe(355982.5499999998);
    expect(result.comments).toContain(
      "社保加入の有無ではなく、労働時間や時給の差による比較です。",
    );
  });

  it.each([
    ["under40", 0, 0],
    ["age40To64", 15264, 19080],
    // Legacy behavior: age 65+ currently uses the same care-insurance
    // approximation as age 40-64. This test intentionally preserves it.
    ["age65AndOver", 15264, 19080],
  ] satisfies [AgeGroup, number, number][]) (
    "D: fixes care-insurance output for %s",
    (ageGroup, currentCareInsurance, futureCareInsurance) => {
      const result = insuredToInsured(ageGroup);

      expect(result.current.socialInsurance.careInsurance).toBe(
        currentCareInsurance,
      );
      expect(result.future.socialInsurance.careInsurance).toBe(
        futureCareInsurance,
      );

      if (ageGroup === "age65AndOver") {
        expect(result.comments).toContain(
          "65歳以上は介護保険料の徴収方法が異なるため参考値です。",
        );
      }
    },
  );

  it("E: returns null cash return when annual working hours do not increase", () => {
    const result = calculateSocialInsurance({
      ageGroup: "under40",
      current: {
        hourlyWage: 1000,
        weeklyHours: 20,
        insuranceStatus: "dependent",
        hasSpouseAllowance: false,
        spouseAllowanceMonthly: 0,
      },
      future: {
        weeklyHours: 20,
        insuranceStatus: "insured",
      },
    });

    expect(result.increasedAnnualHours).toBe(0);
    expect(result.cashReturnPerIncreasedHour).toBeNull();
  });

  it("F: inherits the current hourly wage when the future wage is unspecified", () => {
    const result = dependentToInsured(false);

    expect(result.future.hourlyWage).toBe(1000);
    expect(result.future.annualIncome).toBe(1560000);
  });

  it.each([
    [92999, { healthInsurance: 88000, employeePension: 88000 }],
    [93000, { healthInsurance: 98000, employeePension: 98000 }],
    [129999, { healthInsurance: 126000, employeePension: 126000 }],
    [130000, { healthInsurance: 134000, employeePension: 134000 }],
  ])(
    "G: fixes the standard-monthly-remuneration boundary near %d yen",
    (monthlyIncome, expected) => {
      expect(insuredAtMonthlyIncome(monthlyIncome)).toEqual(expected);
    },
  );

  it.each([
    [1900000, 650000],
    [1900001, 650000],
    [3600000, 1000000],
    // Legacy behavior: the current rate-minus approximation drops back to
    // the 650,000-yen floor immediately above this boundary.
    [3600001, 650000],
    [6600000, 880000],
    [6600001, 650000],
  ])(
    "H: characterizes the current salary-income-deduction boundary at %d yen",
    (annualIncome, expectedDeduction) => {
      expect(calculateSalaryIncomeDeduction(annualIncome)).toBe(
        expectedDeduction,
      );
    },
  );
});
