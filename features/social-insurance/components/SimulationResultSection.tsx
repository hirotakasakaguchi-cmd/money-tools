import type { ReactNode } from "react";
import {
  formatNumber,
  formatOptionalSignedYen,
  formatOptionalYen,
  formatSignedYen,
  formatStandardMonthlyRemuneration,
  formatYen,
} from "@/features/social-insurance/components/simulationResultFormatters";
import type { SimulationResult } from "@/features/social-insurance/v2/resultTypes";

type SimulationResultSectionProps = {
  result: SimulationResult;
};

export function SimulationResultSection({ result }: SimulationResultSectionProps) {
  const legacy = result.legacyCalculation;

  return (
    <section className="rounded-lg border border-[#d6e6d4] bg-white p-4 shadow-[0_14px_36px_rgba(79,125,89,0.14)] sm:p-5">
      <h2 className="text-xl font-bold text-[#33291f]">試算結果</h2>

      <div className="mt-5 space-y-5">
        <ResultGroup title="本人手取り">
          <ResultRow
            label="現在"
            value={formatYen(result.current.personalTakeHomeYen)}
          />
          <ResultRow
            label="変更後"
            value={formatYen(result.proposed.personalTakeHomeYen)}
          />
          <ResultRow
            label="本人手取り差"
            value={formatSignedYen(result.personalTakeHomeDifferenceYen)}
          />
        </ResultGroup>

        <ResultGroup title="配偶者手当">
          <ResultRow
            label="現在（年間）"
            value={formatOptionalYen(result.current.spouseAllowanceAnnualYen)}
          />
          <ResultRow
            label="変更後（年間）"
            value={formatOptionalYen(result.proposed.spouseAllowanceAnnualYen)}
          />
          <ResultRow
            label="配偶者手当差"
            value={formatOptionalSignedYen(
              result.spouseAllowanceDifferenceYen,
            )}
          />
        </ResultGroup>

        <ResultGroup title="世帯現金収支">
          <ResultRow
            label="現在"
            value={formatOptionalYen(result.current.householdCashFlowYen)}
          />
          <ResultRow
            label="変更後"
            value={formatOptionalYen(result.proposed.householdCashFlowYen)}
          />
          <ResultRow
            label="世帯現金収支差"
            value={formatOptionalSignedYen(result.householdDifferenceYen)}
          />
        </ResultGroup>

        <ResultGroup title="標準報酬月額">
          <ResultRow
            label="現在（健康保険・介護保険）"
            value={formatStandardMonthlyRemuneration(
              legacy.current.standardMonthlyRemuneration.healthInsurance,
            )}
          />
          <ResultRow
            label="現在（厚生年金）"
            value={formatStandardMonthlyRemuneration(
              legacy.current.standardMonthlyRemuneration.employeePension,
            )}
          />
          <ResultRow
            label="変更後（健康保険・介護保険）"
            value={formatStandardMonthlyRemuneration(
              legacy.future.standardMonthlyRemuneration.healthInsurance,
            )}
          />
          <ResultRow
            label="変更後（厚生年金）"
            value={formatStandardMonthlyRemuneration(
              legacy.future.standardMonthlyRemuneration.employeePension,
            )}
          />
        </ResultGroup>

        <ResultGroup title="労働時間比較">
          <ResultRow
            label="年間増加時間"
            value={`${formatNumber(legacy.increasedAnnualHours)}時間`}
          />
          <ResultRow
            label="1時間あたり現金リターン"
            value={
              legacy.cashReturnPerIncreasedHour === null
                ? "対象外"
                : formatSignedYen(legacy.cashReturnPerIncreasedHour)
            }
          />
        </ResultGroup>

        <ResultGroup title="将来のメリット">
          <ResultRow
            label="厚生年金増加額（年間）"
            value={formatSignedYen(legacy.pensionAnnualIncreaseDifference)}
          />
          <ResultRow
            label="90歳までの総リターン"
            value={formatSignedYen(legacy.pensionTotalReturnToAge90)}
          />
        </ResultGroup>

        <ResultGroup title="コメント">
          <ul className="space-y-2">
            {legacy.comments.map((comment) => (
              <li
                key={comment}
                className="rounded-lg bg-[#fffaf0] px-3 py-2 text-sm leading-6 text-[#5f5041]"
              >
                {comment}
              </li>
            ))}
          </ul>
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
