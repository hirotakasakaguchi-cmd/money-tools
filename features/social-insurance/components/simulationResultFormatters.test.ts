import { describe, expect, it } from "vitest";

import {
  formatOptionalSignedYen,
  formatOptionalYen,
  formatSignedYen,
  formatYen,
} from "@/features/social-insurance/components/simulationResultFormatters";

describe("simulationResultFormatters", () => {
  it("formats yen values with grouping", () => {
    expect(formatYen(1234567)).toBe("1,234,567円");
    expect(formatSignedYen(-1234567)).toBe("-1,234,567円");
  });

  it("shows null values as unconfirmed", () => {
    expect(formatOptionalYen(null)).toBe("未確認");
    expect(formatOptionalSignedYen(null)).toBe("未確認");
  });

  it("does not confuse zero with null", () => {
    expect(formatOptionalYen(0)).toBe("0円");
    expect(formatOptionalSignedYen(0)).toBe("0円");
  });
});
