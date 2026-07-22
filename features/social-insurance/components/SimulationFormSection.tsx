import { CurrentConditionSection } from "@/features/social-insurance/components/CurrentConditionSection";
import { ProposedConditionSection } from "@/features/social-insurance/components/ProposedConditionSection";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import type {
  AgeGroup,
  InsuranceStatus,
} from "@/features/social-insurance/types";

type SimulationFormSectionProps = {
  ageGroup: AgeGroup;
  currentHourlyWage: string;
  currentWeeklyHours: string;
  currentInsuranceStatus: InsuranceStatus;
  hasSpouseAllowance: boolean;
  spouseAllowanceMonthly: string;
  futureWeeklyHours: string;
  futureInsuranceStatus: InsuranceStatus;
  futureHourlyWage: string;
  onAgeGroupChange: (value: AgeGroup) => void;
  onCurrentHourlyWageChange: (value: string) => void;
  onCurrentWeeklyHoursChange: (value: string) => void;
  onCurrentInsuranceStatusChange: (value: InsuranceStatus) => void;
  onSpouseAllowancePresenceChange: (value: "yes" | "no") => void;
  onSpouseAllowanceMonthlyChange: (value: string) => void;
  onFutureWeeklyHoursChange: (value: string) => void;
  onFutureInsuranceStatusChange: (value: InsuranceStatus) => void;
  onFutureHourlyWageChange: (value: string) => void;
};

export function SimulationFormSection({
  ageGroup,
  currentHourlyWage,
  currentWeeklyHours,
  currentInsuranceStatus,
  hasSpouseAllowance,
  spouseAllowanceMonthly,
  futureWeeklyHours,
  futureInsuranceStatus,
  futureHourlyWage,
  onAgeGroupChange,
  onCurrentHourlyWageChange,
  onCurrentWeeklyHoursChange,
  onCurrentInsuranceStatusChange,
  onSpouseAllowancePresenceChange,
  onSpouseAllowanceMonthlyChange,
  onFutureWeeklyHoursChange,
  onFutureInsuranceStatusChange,
  onFutureHourlyWageChange,
}: SimulationFormSectionProps) {
  return (
    <section className="rounded-lg border border-[#eadfce] bg-white/86 p-4 shadow-[0_10px_30px_rgba(92,67,39,0.08)] sm:p-5">
      <h2 className="text-xl font-bold text-[#33291f]">入力</h2>

      <div className="mt-5 space-y-6">
        <SegmentedControl
          label="年齢区分"
          value={ageGroup}
          columns={3}
          options={[
            { value: "under40", label: "39歳以下" },
            { value: "age40To64", label: "40〜64歳" },
            { value: "age65AndOver", label: "65歳以上（参考）" },
          ]}
          onChange={onAgeGroupChange}
        />

        <CurrentConditionSection
          hourlyWage={currentHourlyWage}
          weeklyHours={currentWeeklyHours}
          insuranceStatus={currentInsuranceStatus}
          hasSpouseAllowance={hasSpouseAllowance}
          spouseAllowanceMonthly={spouseAllowanceMonthly}
          onHourlyWageChange={onCurrentHourlyWageChange}
          onWeeklyHoursChange={onCurrentWeeklyHoursChange}
          onInsuranceStatusChange={onCurrentInsuranceStatusChange}
          onSpouseAllowancePresenceChange={onSpouseAllowancePresenceChange}
          onSpouseAllowanceMonthlyChange={onSpouseAllowanceMonthlyChange}
        />

        <ProposedConditionSection
          weeklyHours={futureWeeklyHours}
          insuranceStatus={futureInsuranceStatus}
          hourlyWage={futureHourlyWage}
          onWeeklyHoursChange={onFutureWeeklyHoursChange}
          onInsuranceStatusChange={onFutureInsuranceStatusChange}
          onHourlyWageChange={onFutureHourlyWageChange}
        />
      </div>
    </section>
  );
}
