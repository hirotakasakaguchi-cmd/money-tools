import { describe, expect, it } from "vitest";

import { createSimulationWarningDisplayItems } from "@/features/social-insurance/components/simulationWarningPresentation";
import type { ValidationWarning } from "@/features/social-insurance/v2/warningTypes";

const warnings: readonly ValidationWarning[] = [
  {
    code: "spouseAllowanceUnknown",
    severity: "info",
    scope: "current",
    fieldPaths: ["current.spouseAllowance.status"],
    message: "current message",
    recommendedAction: "current action",
  },
  {
    code: "insuredUnder20Hours",
    severity: "info",
    scope: "proposed",
    fieldPaths: [
      "proposed.workplace.weeklyHours",
      "proposed.workplace.insuranceStatus",
    ],
    message: "proposed message",
    recommendedAction: "proposed action",
  },
];

describe("createSimulationWarningDisplayItems", () => {
  it("preserves warning order and text", () => {
    const items = createSimulationWarningDisplayItems(warnings);

    expect(items.map(({ warning }) => warning)).toEqual(warnings);
    expect(items.map(({ warning }) => warning.message)).toEqual([
      "current message",
      "proposed message",
    ]);
    expect(items.map(({ warning }) => warning.recommendedAction)).toEqual([
      "current action",
      "proposed action",
    ]);
  });

  it("adds scenario labels without merging warnings", () => {
    const items = createSimulationWarningDisplayItems(warnings);

    expect(items.map(({ scopeLabel }) => scopeLabel)).toEqual([
      "現在の働き方について",
      "変更後の働き方について",
    ]);
    expect(items).toHaveLength(warnings.length);
  });
});
