"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import { NumberInput } from "@/components/ui/NumberInput";
import { ToolFooter } from "@/components/ui/ToolFooter";
import { HOUSEHOLD_EXPENSE_DEFINITIONS } from "@/features/household-budget/constants";
import { calculateHouseholdBudget } from "@/features/household-budget/calculateHouseholdBudget";
import type {
  HouseholdBudgetItem,
  HouseholdDiagnosisLevel,
  HouseholdExpenseKey,
} from "@/features/household-budget/types";

type FormState = {
  monthlyTakeHomePay: string;
  expenses: Record<HouseholdExpenseKey, string>;
};

const initialFormState: FormState = {
  monthlyTakeHomePay: "300000",
  expenses: {
    housing: "80000",
    food: "60000",
    communication: "12000",
    insurance: "15000",
    subscriptions: "5000",
    saving: "30000",
  },
};

const expenseKeys = HOUSEHOLD_EXPENSE_DEFINITIONS.map(
  (definition) => definition.key,
) as HouseholdExpenseKey[];

export default function HouseholdBudgetPage() {
  const [form, setForm] = useState<FormState>(initialFormState);

  const result = useMemo(() => {
    return calculateHouseholdBudget({
      monthlyTakeHomePay: toNumber(form.monthlyTakeHomePay),
      expenses: mapExpenseValues(form.expenses),
    });
  }, [form]);

  const diagnosisView = getDiagnosisView(result.diagnosis.level);

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
            家計
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#33291f] sm:text-4xl">
            家計診断シミュレーター
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f5f4f] sm:text-base">
            毎月の手取りと主な支出から、見直し候補と家計バランスをかんたんに確認できます。
          </p>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <section className="rounded-lg border border-[#eadfce] bg-white/86 p-4 shadow-[0_10px_30px_rgba(92,67,39,0.08)] sm:p-5">
            <h2 className="text-xl font-bold text-[#33291f]">入力</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f5f4f]">
              分かる範囲で、毎月の金額を入力してください。
            </p>

            <div className="mt-5 grid gap-4">
              <NumberInput
                label="手取り月収"
                value={form.monthlyTakeHomePay}
                unit="円"
                inputMode="numeric"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    monthlyTakeHomePay: value,
                  }))
                }
              />

              {HOUSEHOLD_EXPENSE_DEFINITIONS.map((definition) => (
                <NumberInput
                  key={definition.key}
                  label={`${definition.label}（${definition.description}）`}
                  value={form.expenses[definition.key]}
                  unit="円"
                  placeholder={definition.placeholder}
                  inputMode="numeric"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      expenses: {
                        ...current.expenses,
                        [definition.key]: value,
                      },
                    }))
                  }
                />
              ))}
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
                {result.diagnosis.title}
              </p>
              <p className="mt-3 text-sm font-bold leading-7">
                {result.diagnosis.message}
              </p>
            </div>

            <div className="mt-5 space-y-5">
              <ResultGroup title="② 最優先の見直し候補">
                {result.topPriority ? (
                  <PriorityCard item={result.topPriority} />
                ) : (
                  <div className="rounded-lg bg-[#eaf3e7] p-4 text-sm font-bold leading-7 text-[#253b2a]">
                    大きな見直し候補は少なめです。
                  </div>
                )}
              </ResultGroup>

              <ResultGroup title="③ 見直し候補ランキング">
                {result.priorities.length > 0 ? (
                  <ol className="space-y-2">
                    {result.priorities.slice(0, 3).map((item, index) => (
                      <li
                        key={item.key}
                        className="rounded-lg bg-[#fffaf0] px-3 py-3 text-sm leading-6 text-[#5f5041]"
                      >
                        <span className="font-bold text-[#33291f]">
                          {index + 1}. {item.shortLabel}
                        </span>
                        <span className="mt-1 block">
                          {getPriorityReason(item)}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-lg bg-[#fffaf0] px-3 py-3 text-sm leading-7 text-[#5f5041]">
                    目安より大きく外れている項目はありません。
                  </p>
                )}
              </ResultGroup>

              <ResultGroup title="④ 項目別の割合">
                <div className="space-y-3">
                  {result.items.map((item) => (
                    <RatioBar key={item.key} item={item} />
                  ))}
                </div>
              </ResultGroup>

              <ResultGroup title="⑤ コメント">
                <div className="rounded-lg bg-[#fffaf0] px-3 py-3 text-sm leading-7 text-[#5f5041]">
                  {result.comment}
                </div>
              </ResultGroup>

              <ResultGroup title="⑥ 注意書き">
                <ul className="space-y-2 text-xs leading-6 text-[#6f5f4f]">
                  <li>令和7年度版</li>
                  <li>最終更新：2026年7月</li>
                  <li>
                    この診断は一般的な目安をもとにした簡易診断です。
                  </li>
                  <li>
                    家族構成・地域・ライフスタイルによって適正額は異なります。
                  </li>
                  <li>
                    入力された金額はブラウザ上で計算するため、保存や送信はしていません。
                  </li>
                </ul>
              </ResultGroup>
            </div>
          </section>
        </div>

        <ToolFooter />
        <SiteFooter />
      </Container>
    </main>
  );
}

type PriorityCardProps = {
  item: HouseholdBudgetItem;
};

function PriorityCard({ item }: PriorityCardProps) {
  const isSaving = item.isSaving;

  return (
    <div className="rounded-lg bg-[#fff1ed] p-4 text-[#7a2e1e]">
      <p className="text-sm font-bold">
        {isSaving ? "まず増やしたい項目" : "まず見直したい項目"}
      </p>
      <p className="mt-2 text-3xl font-bold leading-tight">{item.shortLabel}</p>
      <p className="mt-2 text-sm font-bold leading-7">
        現在 {formatPercent(item.actualPercent)} / 目安{" "}
        {formatPercent(item.benchmarkPercent)}
      </p>
      <p className="mt-2 text-sm leading-7">{item.advice}</p>
    </div>
  );
}

type RatioBarProps = {
  item: HouseholdBudgetItem;
};

function RatioBar({ item }: RatioBarProps) {
  const width = Math.min(
    100,
    Math.max(4, (item.actualPercent / Math.max(item.benchmarkPercent, 1)) * 55),
  );
  const barColor = getBarColor(item);
  const statusText = getStatusText(item);

  return (
    <div className="rounded-lg border border-[#eadfce] bg-[#fffdf8] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#33291f]">{item.shortLabel}</p>
          <p className="mt-1 text-xs leading-5 text-[#7a6a58]">
            目安 {formatPercent(item.benchmarkPercent)} / 現在{" "}
            {formatPercent(item.actualPercent)}
          </p>
        </div>
        <p className="shrink-0 text-right text-xs font-bold text-[#6f5f4f]">
          {statusText}
        </p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#f1e7d9]">
        <div
          className={`h-2 rounded-full ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
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

function getDiagnosisView(level: HouseholdDiagnosisLevel) {
  switch (level) {
    case "good":
      return {
        className: "bg-[#eaf3e7] text-[#253b2a]",
      };
    case "check":
      return {
        className: "bg-[#fff8df] text-[#5f4b13]",
      };
    case "review":
      return {
        className: "bg-[#fff1ed] text-[#7a2e1e]",
      };
  }
}

function getPriorityReason(item: HouseholdBudgetItem) {
  if (item.isSaving) {
    return `現在 ${formatPercent(item.actualPercent)}。目安の ${formatPercent(
      item.benchmarkPercent,
    )} まで少し増やせると安心です。`;
  }

  return `手取りの ${formatPercent(item.actualPercent)}。目安は ${formatPercent(
    item.benchmarkPercent,
  )} です。`;
}

function getStatusText(item: HouseholdBudgetItem) {
  if (item.issueKind === "shortage") {
    return "もう少し貯めたい";
  }

  if (item.issueKind === "excess") {
    return "少し高め";
  }

  return "目安内";
}

function getBarColor(item: HouseholdBudgetItem) {
  if (item.issueKind === "shortage") {
    return "bg-[#b9d6a3]";
  }

  if (item.issueKind === "excess") {
    return "bg-[#d98168]";
  }

  return "bg-[#8fb995]";
}

function mapExpenseValues(values: Record<HouseholdExpenseKey, string>) {
  return expenseKeys.reduce(
    (mapped, key) => ({
      ...mapped,
      [key]: toNumber(values[key]),
    }),
    {} as Record<HouseholdExpenseKey, number>,
  );
}

function toNumber(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function formatPercent(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}
