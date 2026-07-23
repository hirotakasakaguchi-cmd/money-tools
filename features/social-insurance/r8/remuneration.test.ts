import { describe, expect, it } from "vitest";

import {
  resolveR8HealthStandardMonthlyRemuneration,
  resolveR8PensionStandardMonthlyRemuneration,
} from "@/features/social-insurance/r8/remuneration";

describe("R8 health standard monthly remuneration", () => {
  it.each([
    [0, 58_000],
    [62_999, 58_000],
    [63_000, 68_000],
    [92_999, 88_000],
    [93_000, 98_000],
    [289_999, 280_000],
    [290_000, 300_000],
    [634_999, 620_000],
    [635_000, 650_000],
    [1_354_999, 1_330_000],
    [1_355_000, 1_390_000],
    [Number.MAX_SAFE_INTEGER, 1_390_000],
  ])(
    "maps monthly remuneration %i yen to %i yen",
    (monthlyRemunerationYen, expectedStandardYen) => {
      expect(
        resolveR8HealthStandardMonthlyRemuneration(monthlyRemunerationYen),
      ).toBe(expectedStandardYen);
    },
  );
});

describe("R8 pension standard monthly remuneration", () => {
  it.each([
    [0, 88_000],
    [92_999, 88_000],
    [93_000, 98_000],
    [289_999, 280_000],
    [290_000, 300_000],
    [634_999, 620_000],
    [635_000, 650_000],
    [1_354_999, 650_000],
    [1_355_000, 650_000],
    [Number.MAX_SAFE_INTEGER, 650_000],
  ])(
    "maps monthly remuneration %i yen to %i yen",
    (monthlyRemunerationYen, expectedStandardYen) => {
      expect(
        resolveR8PensionStandardMonthlyRemuneration(monthlyRemunerationYen),
      ).toBe(expectedStandardYen);
    },
  );

  it("uses a different upper grade from health insurance", () => {
    expect(resolveR8HealthStandardMonthlyRemuneration(1_000_000)).toBe(
      980_000,
    );
    expect(resolveR8PensionStandardMonthlyRemuneration(1_000_000)).toBe(
      650_000,
    );
  });
});

describe("R8 standard monthly remuneration input safety", () => {
  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])("rejects invalid monthly remuneration: %s", (value) => {
    expect(() =>
      resolveR8HealthStandardMonthlyRemuneration(value),
    ).toThrow(RangeError);
    expect(() =>
      resolveR8PensionStandardMonthlyRemuneration(value),
    ).toThrow(RangeError);
  });
});
