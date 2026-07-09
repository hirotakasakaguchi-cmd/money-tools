"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import { NumberInput } from "@/components/ui/NumberInput";
import { EDUCATION_COSTS, SAVING_METHODS } from "@/features/education-cost/constants";
import { calculateEducationCost } from "@/features/education-cost/calculateEducationCost";
import type {
  ChildEducationPlanInput,
  EducationCostDiagnosisLevel,
  SavingMethod,
  SchoolType,
  UniversityType,
} from "@/features/education-cost/types";

type ChildFormState = {
  age: string;
  elementary: SchoolType;
  juniorHigh: SchoolType;
  highSchool: SchoolType;
  university: UniversityType;
};

type FormState = {
  childrenCount: string;
  children: ChildFormState[];
  currentSavings: Record<SavingMethod, string>;
  monthlySavings: Record<SavingMethod, string>;
};

const initialChildState: ChildFormState = {
  age: "0",
  elementary: "public",
  juniorHigh: "public",
  highSchool: "public",
  university: "national",
};

const initialFormState: FormState = {
  childrenCount: "1",
  children: [
    initialChildState,
    initialChildState,
    initialChildState,
  ],
  currentSavings: {
    deposit: "0",
    nisa: "0",
    insurance: "0",
  },
  monthlySavings: {
    deposit: "30000",
    nisa: "0",
    insurance: "0",
  },
};

const savingMethodKeys = Object.keys(SAVING_METHODS) as SavingMethod[];

export default function EducationCostPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const childrenCount = clamp(toNumber(form.childrenCount), 1, 3);

  const result = useMemo(() => {
    return calculateEducationCost({
      children: form.children
        .slice(0, childrenCount)
        .map((child, index): ChildEducationPlanInput => ({
          childNumber: index + 1,
          age: clamp(toNumber(child.age), 0, 18),
          stages: {
            elementary: child.elementary,
            juniorHigh: child.juniorHigh,
            highSchool: child.highSchool,
            university: child.university,
          },
      })),
      currentSavings: mapSavingValues(form.currentSavings),
      monthlySavings: mapSavingValues(form.monthlySavings),
    });
  }, [childrenCount, form]);

  const hasShortage = result.shortage > 0;
  const diagnosisView = getDiagnosisView(result.diagnosis.level);
  const conclusionClassName = hasShortage
    ? "bg-[#fff1ed] text-[#7a2e1e]"
    : "bg-[#eaf3e7] text-[#253b2a]";

  return (
    <main className="min-h-screen">
      <Container className="pb-10 pt-5 sm:pb-14 sm:pt-8">
        <SiteHeader />

        <div className="mt-6">
          <a href="/" className="text-sm font-bold text-[#5d8666]">
            ← ツール一覧へ戻る
          </a>
        </div>

        <section className="mt-6">
          <div className="inline-flex rounded-full border border-[#eadfce] bg-white/75 px-3 py-1 text-xs font-bold text-[#6f5f4f]">
            教育費
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#33291f] sm:text-4xl">
            教育費シミュレーター
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f5f4f] sm:text-base">
            お子さまごとの年齢と進路から、教育費の目安・準備率・毎月あと必要な金額を確認できます。
          </p>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <section className="rounded-lg border border-[#eadfce] bg-white/86 p-4 shadow-[0_10px_30px_rgba(92,67,39,0.08)] sm:p-5">
            <h2 className="text-xl font-bold text-[#33291f]">入力</h2>

            <div className="mt-5 space-y-6">
              <label className="block">
                <span className="text-sm font-bold text-[#4c4034]">
                  子どもの人数
                </span>
                <select
                  value={form.childrenCount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      childrenCount: event.target.value,
                    }))
                  }
                  className="mt-2 min-h-12 w-full rounded-lg border border-[#eadfce] bg-white px-3 text-base font-bold text-[#33291f] outline-none focus:border-[#8fb995] focus:ring-4 focus:ring-[#eaf3e7]"
                >
                  <option value="1">1人</option>
                  <option value="2">2人</option>
                  <option value="3">3人</option>
                </select>
              </label>

              <fieldset>
                <legend className="text-base font-bold text-[#33291f]">
                  子どもの情報
                </legend>
                <div className="mt-4 space-y-4">
                  {form.children.slice(0, childrenCount).map((child, index) => (
                    <ChildCard
                      key={index}
                      child={child}
                      childNumber={index + 1}
                      onChange={(nextChild) =>
                        setForm((current) => ({
                          ...current,
                          children: current.children.map((item, childIndex) =>
                            childIndex === index ? nextChild : item,
                          ),
                        }))
                      }
                    />
                  ))}
                </div>
              </fieldset>

              <SavingsFieldset
                title="現在の教育費準備額"
                values={form.currentSavings}
                hint="3項目の合計を、現在の教育費準備額として計算します。"
                onChange={(method, value) =>
                  setForm((current) => ({
                    ...current,
                    currentSavings: {
                      ...current.currentSavings,
                      [method]: value,
                    },
                  }))
                }
              />

              <SavingsFieldset
                title="今後の毎月積立額"
                values={form.monthlySavings}
                hint="子ども1人あたりではなく、家庭全体で毎月積み立てる合計額です。"
                onChange={(method, value) =>
                  setForm((current) => ({
                    ...current,
                    monthlySavings: {
                      ...current.monthlySavings,
                      [method]: value,
                    },
                  }))
                }
              />
            </div>
          </section>

          <section
            className="rounded-lg border border-[#d6e6d4] bg-white p-4 shadow-[0_14px_36px_rgba(79,125,89,0.14)] sm:p-5"
            aria-live="polite"
          >
            <p className="text-sm font-bold text-[#5d8666]">
              あなたのケースでは
            </p>

            <div className={`mt-3 rounded-lg p-5 ${diagnosisView.className}`}>
              <p className="text-sm font-bold">① 診断ステージ</p>
              <p className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                {diagnosisView.title}
              </p>
              <p className="mt-3 text-sm font-bold leading-7">
                {diagnosisView.message}
              </p>
            </div>

            <div className="mt-5 space-y-5">
              <ResultGroup title="② 不足額">
                <div
                  className={`rounded-lg p-5 text-center text-3xl font-bold leading-tight sm:text-4xl ${conclusionClassName}`}
                >
                {hasShortage ? (
                  <>
                    <span className="block text-base font-bold">あと</span>
                    <span className="block">{formatManYen(result.shortage)}</span>
                    <span className="block text-base font-bold">必要です</span>
                  </>
                ) : (
                  "不足はありません"
                )}
                </div>
              </ResultGroup>

              <ResultGroup title="③ 毎月あと必要な積立額">
                <div className="rounded-lg bg-[#fffaf0] p-4 text-center">
                  <p className="text-sm font-bold text-[#7a6a58]">毎月あと</p>
                  <p className="mt-2 text-3xl font-bold leading-tight text-[#33291f]">
                    {
                    result.additionalMonthly <= 0
                      ? "追加積立は不要です"
                      : formatYen(result.additionalMonthly)
                    }
                  </p>
                </div>
              </ResultGroup>

              <ResultGroup title="④ 準備率">
                <p className="text-3xl font-bold leading-tight text-[#33291f]">
                  {formatPercent(result.achievementRate)}
                </p>
              </ResultGroup>

              <ResultGroup title="⑤ 必要教育費">
                <ResultRow
                  label="必要な教育費の目安"
                  value={formatManYen(result.totalCost)}
                />
              </ResultGroup>

              <ResultGroup title="⑥ 18歳時点の予想資産額">
                <ResultRow
                  label="予想資産額"
                  value={formatManYen(result.plannedSavings)}
                />
              </ResultGroup>

              <ResultGroup title="⑦ 子どもごとの教育費内訳">
                <div className="space-y-3">
                  {result.children.map((child) => (
                    <div
                      key={child.childNumber}
                      className="rounded-lg border border-[#eadfce] bg-[#fffdf8] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-[#33291f]">
                          {child.childNumber}人目（{child.age}歳）
                        </p>
                        <p className="text-sm font-bold text-[#4f7d59]">
                          {formatManYen(child.courseCost)}
                        </p>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-[#6f5f4f]">
                        {child.courseLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </ResultGroup>

              <ResultGroup title="⑧ コメント">
                <div className="rounded-lg bg-[#fffaf0] px-3 py-3 text-sm leading-7 text-[#5f5041]">
                  {result.diagnosis.message}
                </div>
              </ResultGroup>

              <ResultGroup title="⑨ 計算根拠">
                <ResultRow
                  label="現在の教育費準備額"
                  value={formatManYen(result.currentSavingsTotal)}
                />
                <ResultRow
                  label="毎月積立額"
                  value={formatYen(result.monthlySavingsTotal)}
                />
                <ResultRow
                  label="一番下の子が18歳になるまで"
                  value={`${formatNumber(result.longestRemainingMonths)}か月`}
                />
                <ResultRow
                  label="試算利回り"
                  value="預金0% / NISA5% / 学資保険0.5%"
                />
              </ResultGroup>

              <ResultGroup title="⑩ 注意書き">
                <ul className="space-y-2 text-xs leading-6 text-[#6f5f4f]">
                  <li>令和7年度版</li>
                  <li>最終更新：2026年7月</li>
                  <li>
                    教育費は文部科学省「学習費調査」等を参考にした目安です。
                  </li>
                  <li>
                    学校教育費だけでなく、塾・習い事・教材費などの学校外費用も含めた概算です。
                  </li>
                  <li>
                    預金0%・NISA5%・学資保険0.5%で試算しています。実際の運用結果を保証するものではありません。
                  </li>
                  <li>
                    実際の教育費や必要な準備額は、進路・地域・家庭の状況によって異なります。
                  </li>
                </ul>
              </ResultGroup>
            </div>
          </section>
        </div>

        <SiteFooter />
      </Container>
    </main>
  );
}

type ChildCardProps = {
  child: ChildFormState;
  childNumber: number;
  onChange: (child: ChildFormState) => void;
};

function ChildCard({ child, childNumber, onChange }: ChildCardProps) {
  return (
    <section className="rounded-lg border border-[#eadfce] bg-[#fffdf8] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-[#33291f]">
          {childNumber}人目
        </h3>
        <p className="text-xs font-bold text-[#7a6a58]">年齢と進路</p>
      </div>

      <div className="mt-4 grid gap-4">
        <NumberInput
          label={`${childNumber}人目の年齢`}
          value={child.age}
          unit="歳"
          inputMode="numeric"
          min="0"
          max="18"
          onChange={(value) =>
            onChange({
              ...child,
              age: value,
            })
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="小学校"
            value={child.elementary}
            options={[
              { value: "public", label: "公立" },
              { value: "private", label: "私立" },
            ]}
            onChange={(value) =>
              onChange({
                ...child,
                elementary: value,
              })
            }
          />
          <SelectField
            label="中学校"
            value={child.juniorHigh}
            options={[
              { value: "public", label: "公立" },
              { value: "private", label: "私立" },
            ]}
            onChange={(value) =>
              onChange({
                ...child,
                juniorHigh: value,
              })
            }
          />
          <SelectField
            label="高校"
            value={child.highSchool}
            options={[
              { value: "public", label: "公立" },
              { value: "private", label: "私立" },
            ]}
            onChange={(value) =>
              onChange({
                ...child,
                highSchool: value,
              })
            }
          />
          <SelectField
            label="大学"
            value={child.university}
            options={[
              { value: "national", label: "国公立" },
              { value: "privateHumanities", label: "私立文系" },
              { value: "privateScience", label: "私立理系" },
            ]}
            onChange={(value) =>
              onChange({
                ...child,
                university: value,
              })
            }
          />
        </div>
      </div>
    </section>
  );
}

type SelectFieldProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#4c4034]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-2 min-h-12 w-full rounded-lg border border-[#eadfce] bg-white px-3 text-base font-bold text-[#33291f] outline-none focus:border-[#8fb995] focus:ring-4 focus:ring-[#eaf3e7]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type SavingsFieldsetProps = {
  title: string;
  values: Record<SavingMethod, string>;
  hint: string;
  onChange: (method: SavingMethod, value: string) => void;
};

function SavingsFieldset({
  title,
  values,
  hint,
  onChange,
}: SavingsFieldsetProps) {
  return (
    <fieldset>
      <legend className="text-base font-bold text-[#33291f]">{title}</legend>
      <div className="mt-4 grid gap-4">
        {savingMethodKeys.map((method) => (
          <NumberInput
            key={method}
            label={SAVING_METHODS[method].label}
            value={values[method]}
            unit="円"
            inputMode="numeric"
            onChange={(value) => onChange(method, value)}
          />
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-[#7a6a58]">{hint}</p>
    </fieldset>
  );
}

type ResultGroupProps = {
  title: string;
  children: ReactNode;
};

function ResultGroup({ title, children }: ResultGroupProps) {
  return (
    <section className="border-t border-[#eadfce] pt-4">
      <h2 className="text-base font-bold text-[#33291f]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

type ResultRowProps = {
  label: string;
  value: string;
};

function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm leading-6 text-[#6f5f4f]">{label}</span>
      <span className="text-right text-base font-bold text-[#33291f]">
        {value}
      </span>
    </div>
  );
}

function getDiagnosisView(level: EducationCostDiagnosisLevel) {
  switch (level) {
    case "good":
      return {
        title: "🟢 順調です！",
        message:
          "今のペースなら教育費準備は順調です。このまま積立を続けましょう。",
        className: "bg-[#eaf3e7] text-[#253b2a]",
      };
    case "check":
      return {
        title: "🟡 あと少しです！",
        message:
          "教育費は準備できていますが、まだ不足する可能性があります。積立額や家計を見直すと安心です。",
        className: "bg-[#fff8df] text-[#5f4b13]",
      };
    case "grow":
      return {
        title: "🔴 対策が必要です",
        message:
          "このままでは教育費が不足する可能性があります。積立額や家計を早めに見直しましょう。",
        className: "bg-[#fff1ed] text-[#7a2e1e]",
      };
  }
}

function mapSavingValues(values: Record<SavingMethod, string>) {
  return savingMethodKeys.reduce(
    (mapped, method) => ({
      ...mapped,
      [method]: toNumber(values[method]),
    }),
    {} as Record<SavingMethod, number>,
  );
}

function toNumber(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatYen(value: number) {
  return `${formatNumber(Math.ceil(value))}円`;
}

function formatManYen(value: number) {
  return `${formatNumber(Math.ceil(value / 10000))}万円`;
}

function formatPercent(value: number) {
  return `${formatNumber(Math.min(100, Math.floor(value)))}%`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(value));
}
