import type { ReactNode } from "react";
import { SimulationAssumptionsSection } from "@/features/social-insurance/components/SimulationAssumptionsSection";
import type { SocialInsuranceResult } from "@/features/social-insurance/types";

type SimulationResultSectionProps = {
  result: SocialInsuranceResult;
  conclusionTone: string;
};

export function SimulationResultSection({
  result,
  conclusionTone,
}: SimulationResultSectionProps) {
  return (
    <section
      className="rounded-lg border border-[#d6e6d4] bg-white p-4 shadow-[0_14px_36px_rgba(79,125,89,0.14)] sm:p-5"
      aria-live="polite"
    >
      <p className="text-sm font-bold text-[#5d8666]">
        あなたのケースでは
      </p>

      <div className="mt-3 rounded-lg bg-[#eaf3e7] p-5">
        <p className="text-sm font-bold text-[#4f7d59]">
          ① 結論（年間手取り差額）
        </p>
        <p className="mt-2 text-3xl font-bold leading-tight text-[#253b2a] sm:text-4xl">
          {formatSignedYen(result.takeHomeDifference)}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#4f684f]">
          変更後は年間手取りが{conclusionTone}です。
        </p>
      </div>

      <div className="mt-5 space-y-5">
        <ResultGroup title="② 年間手取り比較">
          <ResultRow
            label="現在"
            value={formatYen(result.current.takeHomePay)}
          />
          <ResultRow
            label="変更後"
            value={formatYen(result.future.takeHomePay)}
          />
        </ResultGroup>

        <ResultGroup title="③ 標準報酬月額">
          <ResultRow
            label="現在（健康保険・介護保険）"
            value={formatStandardMonthlyRemuneration(
              result.current.standardMonthlyRemuneration.healthInsurance,
            )}
          />
          <ResultRow
            label="現在（厚生年金）"
            value={formatStandardMonthlyRemuneration(
              result.current.standardMonthlyRemuneration.employeePension,
            )}
          />
          <ResultRow
            label="変更後（健康保険・介護保険）"
            value={formatStandardMonthlyRemuneration(
              result.future.standardMonthlyRemuneration.healthInsurance,
            )}
          />
          <ResultRow
            label="変更後（厚生年金）"
            value={formatStandardMonthlyRemuneration(
              result.future.standardMonthlyRemuneration.employeePension,
            )}
          />
        </ResultGroup>

        <ResultGroup title="④ 労働時間比較">
          <ResultRow
            label="年間増加時間"
            value={`${formatNumber(result.increasedAnnualHours)}時間`}
          />
          <ResultRow
            label="1時間あたり現金リターン"
            value={
              result.cashReturnPerIncreasedHour === null
                ? "対象外"
                : formatSignedYen(result.cashReturnPerIncreasedHour)
            }
          />
        </ResultGroup>

        <ResultGroup title="⑤ 将来のメリット">
          <ResultRow
            label="厚生年金増加額（年間）"
            value={formatSignedYen(result.pensionAnnualIncreaseDifference)}
          />
          <ResultRow
            label="90歳までの総リターン"
            value={formatSignedYen(result.pensionTotalReturnToAge90)}
          />
        </ResultGroup>

        <ResultGroup title="⑥ コメント">
          <ul className="space-y-2">
            {result.comments.map((comment) => (
              <li
                key={comment}
                className="rounded-lg bg-[#fffaf0] px-3 py-2 text-sm leading-6 text-[#5f5041]"
              >
                {comment}
              </li>
            ))}
          </ul>
        </ResultGroup>

        <ResultGroup title="⑦ 計算条件・注意書き">
          <SimulationAssumptionsSection />
        </ResultGroup>
      </div>
    </section>
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

function formatYen(value: number) {
  return `${formatNumber(Math.round(value))}円`;
}

function formatSignedYen(value: number) {
  const rounded = Math.round(value);

  if (rounded === 0) {
    return "0円";
  }

  return `${rounded > 0 ? "+" : "-"}${formatNumber(Math.abs(rounded))}円`;
}

function formatStandardMonthlyRemuneration(value: number) {
  return value > 0 ? formatYen(value) : "対象外";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(value));
}
