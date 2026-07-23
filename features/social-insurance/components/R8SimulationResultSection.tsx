import type { ReactNode } from "react";
import {
  formatOptionalSignedYen,
  formatSignedYen,
  formatYen,
} from "@/features/social-insurance/components/simulationResultFormatters";
import type { R8InternalSimulationSuccess } from "@/features/social-insurance/r8/v2/r8SimulationTypes";

type R8SimulationResultSectionProps = {
  result: R8InternalSimulationSuccess;
};

export function R8SimulationResultSection({
  result,
}: R8SimulationResultSectionProps) {
  return (
    <section className="rounded-lg border border-[#d6e6d4] bg-white p-4 shadow-[0_14px_36px_rgba(79,125,89,0.14)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[#33291f]">試算結果</h2>
        <span className="rounded-full bg-[#eaf3e7] px-3 py-1 text-xs font-bold text-[#4f7d59]">
          令和8年度・定常年概算
        </span>
      </div>

      <div className="mt-5 space-y-5">
        <ScenarioResult
          title="現在"
          annualSalaryYen={result.current.annualSalaryYen}
          annualEmployeeSocialInsuranceYen={
            result.current.annualEmployeeSocialInsuranceYen
          }
          annualIncomeTaxYen={result.current.annualIncomeTaxYen}
          annualResidentTaxIncomeLevyYen={
            result.current.annualResidentTaxIncomeLevyYen
          }
          annualNetIncomeYen={result.current.annualNetIncomeYen}
          monthlyAverageNetIncomeYen={
            result.current.monthlyAverageNetIncomeYen
          }
        />

        <ScenarioResult
          title="変更後"
          annualSalaryYen={result.proposed.annualSalaryYen}
          annualEmployeeSocialInsuranceYen={
            result.proposed.annualEmployeeSocialInsuranceYen
          }
          annualIncomeTaxYen={result.proposed.annualIncomeTaxYen}
          annualResidentTaxIncomeLevyYen={
            result.proposed.annualResidentTaxIncomeLevyYen
          }
          annualNetIncomeYen={result.proposed.annualNetIncomeYen}
          monthlyAverageNetIncomeYen={
            result.proposed.monthlyAverageNetIncomeYen
          }
        />

        <ResultGroup title="変更前後の差">
          <ResultRow
            label="本人手取り差"
            value={formatSignedYen(result.personalTakeHomeDifferenceYen)}
          />
          <ResultRow
            label="配偶者手当差"
            value={formatOptionalSignedYen(
              result.spouseAllowanceDifferenceYen,
            )}
          />
          <ResultRow
            label="世帯現金収支差"
            value={formatOptionalSignedYen(result.householdDifferenceYen)}
          />
        </ResultGroup>
      </div>
    </section>
  );
}

type ScenarioResultProps = {
  title: string;
  annualSalaryYen: number;
  annualEmployeeSocialInsuranceYen: number;
  annualIncomeTaxYen: number;
  annualResidentTaxIncomeLevyYen: number;
  annualNetIncomeYen: number;
  monthlyAverageNetIncomeYen: number;
};

function ScenarioResult({
  title,
  annualSalaryYen,
  annualEmployeeSocialInsuranceYen,
  annualIncomeTaxYen,
  annualResidentTaxIncomeLevyYen,
  annualNetIncomeYen,
  monthlyAverageNetIncomeYen,
}: ScenarioResultProps) {
  return (
    <ResultGroup title={title}>
      <ResultRow label="年収" value={formatYen(annualSalaryYen)} />
      <ResultRow
        label="社会保険料"
        value={formatYen(annualEmployeeSocialInsuranceYen)}
      />
      <ResultRow label="所得税" value={formatYen(annualIncomeTaxYen)} />
      <ResultRow
        label="住民税所得割の概算"
        value={formatYen(annualResidentTaxIncomeLevyYen)}
      />
      <ResultRow
        label="年間手取り"
        value={formatYen(annualNetIncomeYen)}
      />
      <ResultRow
        label="月平均手取り"
        value={formatYen(monthlyAverageNetIncomeYen)}
      />
    </ResultGroup>
  );
}

type ResultGroupProps = {
  title: string;
  children: ReactNode;
};

function ResultGroup({ title, children }: ResultGroupProps) {
  return (
    <section className="border-t border-[#eadfce] pt-4">
      <h3 className="text-base font-bold text-[#33291f]">{title}</h3>
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
