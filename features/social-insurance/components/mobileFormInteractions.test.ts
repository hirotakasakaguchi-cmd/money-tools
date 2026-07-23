import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const segmentedControlSource = readFileSync(
  new URL("./SegmentedControl.tsx", import.meta.url),
  "utf8",
);
const consultationGoalSource = readFileSync(
  new URL("./ConsultationGoalSection.tsx", import.meta.url),
  "utf8",
);

const mobileRadioSources = [
  segmentedControlSource,
  consultationGoalSource,
] as const;

describe("mobile form interactions", () => {
  it("connects each visible option to its radio with a stable id", () => {
    for (const source of mobileRadioSources) {
      expect(source).toContain("const optionId = `${groupName}-${option.value}`");
      expect(source).toContain("htmlFor={optionId}");
      expect(source).toContain("id={optionId}");
    }
  });

  it("keeps touch targets interactive when tapping visible content", () => {
    for (const source of mobileRadioSources) {
      expect(source).toContain("touch-manipulation");
      expect(source).toContain("pointer-events-none");
    }
  });

  it("preserves radio and keyboard interaction semantics", () => {
    for (const source of mobileRadioSources) {
      expect(source).toContain('type="radio"');
      expect(source).toContain("checked={isSelected}");
      expect(source).toContain("onChange={() => onChange(option.value)}");
      expect(source).toContain("peer-focus:ring-4");
    }
  });

  it("does not disable the mobile controls", () => {
    for (const source of mobileRadioSources) {
      expect(source).not.toContain("disabled=");
      expect(source).not.toContain("aria-disabled=");
    }
  });
});
