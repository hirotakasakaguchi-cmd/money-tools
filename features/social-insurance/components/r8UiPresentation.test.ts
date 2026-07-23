import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const formSource = readFileSync(
  "features/social-insurance/components/SimulationFormSection.tsx",
  "utf8",
);
const currentSource = readFileSync(
  "features/social-insurance/components/CurrentConditionSection.tsx",
  "utf8",
);
const proposedSource = readFileSync(
  "features/social-insurance/components/ProposedConditionSection.tsx",
  "utf8",
);
const resultSource = readFileSync(
  "features/social-insurance/components/R8SimulationResultSection.tsx",
  "utf8",
);
const assumptionsSource = readFileSync(
  "features/social-insurance/components/R8SimulationAssumptionsSection.tsx",
  "utf8",
);
const simulatorSource = readFileSync(
  "features/social-insurance/components/SocialInsuranceSimulator.tsx",
  "utf8",
);
const appSource = readFileSync("app/tools/social-insurance/page.tsx", "utf8");

describe("R8 UI presentation contract", () => {
  it("offers R7 and R8 while keeping the R7 state default in state tests", () => {
    expect(formSource).toContain("令和7年度");
    expect(formSource).toContain("令和8年度");
    expect(formSource).toContain("現在の年齢");
  });

  it("shows separate current and proposed remuneration inputs only through scenario sections", () => {
    expect(currentSource).toContain(
      'data-field-path="current.monthlyRemuneration"',
    );
    expect(proposedSource).toContain(
      'data-field-path="proposed.monthlyRemuneration"',
    );
    expect(currentSource).toContain("現在の総支給月額");
    expect(proposedSource).toContain("社保加入後の総支給月額");
    for (const source of [currentSource, proposedSource]) {
      expect(source).toContain(
        "手取りではなく、基本給や毎月の手当を含む総支給額を入力してください。",
      );
      expect(source).toContain('calculationYear === "r8"');
      expect(source).not.toContain("社会保険料の計算に使う月給");
    }
  });

  it("shows the required R8 result labels and steady-state year label", () => {
    for (const label of [
      "令和8年度・定常年概算",
      "年収",
      "社会保険料",
      "所得税",
      "住民税所得割の概算",
      "年間手取り",
      "月平均手取り",
      "本人手取り差",
      "配偶者手当差",
      "世帯現金収支差",
    ]) {
      expect(resultSource).toContain(label);
    }
  });

  it("shows a non-technical age 65+ message without exposing Issue #5", () => {
    expect(simulatorSource).toContain(
      "65歳以上の計算は現在準備中です",
    );
    expect(simulatorSource).not.toContain("Issue #5");
    expect(simulatorSource).not.toContain("age65AndOverIssue5");
  });

  it("includes every required R8 limitation in the assumptions", () => {
    for (const statement of [
      "住民税は所得割のみの概算",
      "均等割・森林環境税",
      "所得税は給与収入のみの概算",
      "配偶者控除・扶養控除・生命保険料控除",
      "年間手取りを12で割った平均",
      "実際の給与明細や徴収額とは差が出る",
    ]) {
      expect(assumptionsSource).toContain(statement);
    }
  });

  it("keeps the app route free of direct R8 calculation imports", () => {
    expect(appSource).not.toMatch(
      /(?:executeR8SimulationInternal|social-insurance\/r8\/)/,
    );
  });

  it("keeps result focus, aria-live, and responsive mobile-first layout", () => {
    expect(simulatorSource).toContain('aria-live="polite"');
    expect(simulatorSource).toContain("data-simulation-result");
    expect(simulatorSource).toContain("tabIndex={-1}");
    expect(simulatorSource).toContain("lg:grid-cols-");
    expect(resultSource).toContain("flex-wrap");
  });
});
