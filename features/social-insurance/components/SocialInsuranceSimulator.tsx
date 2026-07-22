"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SimulationFormSection } from "@/features/social-insurance/components/SimulationFormSection";
import { calculateSocialInsurance } from "@/features/social-insurance/calculateSocialInsurance";
import type {
  AgeGroup,
  InsuranceStatus,
} from "@/features/social-insurance/types";

type FormState = {
  ageGroup: AgeGroup;
  currentHourlyWage: string;
  currentWeeklyHours: string;
  currentInsuranceStatus: InsuranceStatus;
  hasSpouseAllowance: boolean;
  spouseAllowanceMonthly: string;
  futureWeeklyHours: string;
  futureInsuranceStatus: InsuranceStatus;
  futureHourlyWage: string;
};

const initialFormState: FormState = {
  ageGroup: "under40",
  currentHourlyWage: "1000",
  currentWeeklyHours: "20",
  currentInsuranceStatus: "dependent",
  hasSpouseAllowance: false,
  spouseAllowanceMonthly: "10000",
  futureWeeklyHours: "30",
  futureInsuranceStatus: "insured",
  futureHourlyWage: "",
};

export function SocialInsuranceSimulator() {
  const [form, setForm] = useState<FormState>(initialFormState);

  const result = useMemo(() => {
    return calculateSocialInsurance({
      ageGroup: form.ageGroup,
      current: {
        hourlyWage: toNumber(form.currentHourlyWage),
        weeklyHours: toNumber(form.currentWeeklyHours),
        insuranceStatus: form.currentInsuranceStatus,
        hasSpouseAllowance: form.hasSpouseAllowance,
        spouseAllowanceMonthly: toNumber(form.spouseAllowanceMonthly),
      },
      future: {
        hourlyWage:
          form.futureHourlyWage.trim() === ""
            ? undefined
            : toNumber(form.futureHourlyWage),
        weeklyHours: toNumber(form.futureWeeklyHours),
        insuranceStatus: form.futureInsuranceStatus,
      },
    });
  }, [form]);

  const conclusionTone =
    result.takeHomeDifference > 0
      ? "増える見込み"
      : result.takeHomeDifference < 0
        ? "減る見込み"
        : "ほぼ同じ";

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
      <SimulationFormSection
        ageGroup={form.ageGroup}
        currentHourlyWage={form.currentHourlyWage}
        currentWeeklyHours={form.currentWeeklyHours}
        currentInsuranceStatus={form.currentInsuranceStatus}
        hasSpouseAllowance={form.hasSpouseAllowance}
        spouseAllowanceMonthly={form.spouseAllowanceMonthly}
        futureWeeklyHours={form.futureWeeklyHours}
        futureInsuranceStatus={form.futureInsuranceStatus}
        futureHourlyWage={form.futureHourlyWage}
        onAgeGroupChange={(value) =>
          setForm((current) => ({ ...current, ageGroup: value }))
        }
        onCurrentHourlyWageChange={(value) =>
          setForm((current) => ({ ...current, currentHourlyWage: value }))
        }
        onCurrentWeeklyHoursChange={(value) =>
          setForm((current) => ({ ...current, currentWeeklyHours: value }))
        }
        onCurrentInsuranceStatusChange={(value) =>
          setForm((current) => ({
            ...current,
            currentInsuranceStatus: value,
          }))
        }
        onSpouseAllowancePresenceChange={(value) =>
          setForm((current) => ({
            ...current,
            hasSpouseAllowance: value === "yes",
          }))
        }
        onSpouseAllowanceMonthlyChange={(value) =>
          setForm((current) => ({
            ...current,
            spouseAllowanceMonthly: value,
          }))
        }
        onFutureWeeklyHoursChange={(value) =>
          setForm((current) => ({ ...current, futureWeeklyHours: value }))
        }
        onFutureInsuranceStatusChange={(value) =>
          setForm((current) => ({
            ...current,
            futureInsuranceStatus: value,
          }))
        }
        onFutureHourlyWageChange={(value) =>
          setForm((current) => ({ ...current, futureHourlyWage: value }))
        }
      />

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
              value={formatSignedYen(
                result.pensionAnnualIncreaseDifference,
              )}
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
            <ul className="space-y-2 text-xs leading-6 text-[#6f5f4f]">
              <li>令和7年度版</li>
              <li>最終更新：2026年7月</li>
              <li>1年52週、賞与なしで計算しています。</li>
              <li>
                このシミュレーションは協会けんぽ・福岡県・40〜64歳相当の料率をもとにした概算です。実際の金額は勤務先・加入先・地域・年齢・賞与・各種控除により異なります。
              </li>
              <li>
                社会保険料は月収から標準報酬月額を概算判定して計算しています。実際の保険料は勤務先で決定される標準報酬月額・加入先・地域・年齢により異なります。
              </li>
              <li>
                このツールは、社会保険の加入対象になる前提で手取りを比較しています。実際に加入対象になるかは、勤務先の規模・所定労働時間・雇用期間・学生かどうか等により異なります。
              </li>
              <li>
                配偶者手当は扶養内の場合のみ受け取る前提です。実際の支給条件は勤務先の条件により異なります。
              </li>
              <li>
                厚生年金は「平均標準報酬額 ≒ 月収」として、報酬比例部分を概算しています。
              </li>
              <li>
                正確な個別判定ではなく、比較の目安としてご利用ください。
              </li>
            </ul>
          </ResultGroup>
        </div>
      </section>
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

function toNumber(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
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
