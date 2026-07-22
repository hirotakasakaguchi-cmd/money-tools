import type { ValidationWarning } from "@/features/social-insurance/v2/warningTypes";

export type SimulationWarningDisplayItem = {
  readonly key: string;
  readonly scopeLabel: "現在の働き方について" | "変更後の働き方について";
  readonly warning: ValidationWarning;
};

export function createSimulationWarningDisplayItems(
  warnings: readonly ValidationWarning[],
): readonly SimulationWarningDisplayItem[] {
  return warnings.map((warning) => ({
    key: `${warning.scope}:${warning.code}`,
    scopeLabel:
      warning.scope === "current"
        ? "現在の働き方について"
        : "変更後の働き方について",
    warning,
  }));
}
