import { ConsultationGoalSection } from "@/features/social-insurance/components/ConsultationGoalSection";
import { CurrentConditionSection } from "@/features/social-insurance/components/CurrentConditionSection";
import { FormFieldErrorMessages } from "@/features/social-insurance/components/FormFieldErrorMessages";
import { ProposedConditionSection } from "@/features/social-insurance/components/ProposedConditionSection";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import type {
  AgeGroup,
  InsuranceStatus,
} from "@/features/social-insurance/types";
import type {
  FormState,
  FormValidationError,
} from "@/features/social-insurance/v2/formTypes";
import type {
  ConsultationGoal,
  SpouseAllowanceStatus,
} from "@/features/social-insurance/v2/types";

type SimulationFormSectionProps = {
  form: FormState;
  fieldErrors: readonly FormValidationError[];
  onGoalChange: (value: ConsultationGoal) => void;
  onAgeGroupChange: (value: AgeGroup) => void;
  onCurrentHourlyWageChange: (value: string) => void;
  onCurrentWeeklyHoursChange: (value: string) => void;
  onCurrentInsuranceStatusChange: (value: InsuranceStatus) => void;
  onCurrentSpouseAllowanceStatusChange: (value: SpouseAllowanceStatus) => void;
  onCurrentSpouseAllowanceMonthlyChange: (value: string) => void;
  onProposedWeeklyHoursChange: (value: string) => void;
  onProposedInsuranceStatusChange: (value: InsuranceStatus) => void;
  onProposedHourlyWageChange: (value: string) => void;
  onProposedSpouseAllowanceStatusChange: (value: SpouseAllowanceStatus) => void;
  onProposedSpouseAllowanceMonthlyChange: (value: string) => void;
  onSubmit: () => void;
};

export function SimulationFormSection({
  form,
  fieldErrors,
  onGoalChange,
  onAgeGroupChange,
  onCurrentHourlyWageChange,
  onCurrentWeeklyHoursChange,
  onCurrentInsuranceStatusChange,
  onCurrentSpouseAllowanceStatusChange,
  onCurrentSpouseAllowanceMonthlyChange,
  onProposedWeeklyHoursChange,
  onProposedInsuranceStatusChange,
  onProposedHourlyWageChange,
  onProposedSpouseAllowanceStatusChange,
  onProposedSpouseAllowanceMonthlyChange,
  onSubmit,
}: SimulationFormSectionProps) {
  return (
    <section className="rounded-lg border border-[#eadfce] bg-white/86 p-4 shadow-[0_10px_30px_rgba(92,67,39,0.08)] sm:p-5">
      <h2 className="text-xl font-bold text-[#33291f]">入力</h2>

      <div className="mt-5 space-y-6">
        <ConsultationGoalSection
          value={form.goal}
          fieldErrors={fieldErrors}
          onChange={onGoalChange}
        />

        <div>
          <SegmentedControl
            label="年齢区分"
            value={form.ageGroup}
            columns={3}
            options={[
              { value: "under40", label: "39歳以下" },
              { value: "age40To64", label: "40〜64歳" },
              { value: "age65AndOver", label: "65歳以上（参考）" },
            ]}
            onChange={onAgeGroupChange}
          />
          <FormFieldErrorMessages errors={fieldErrors} fieldPath="ageGroup" />
        </div>

        <CurrentConditionSection
          value={form.current}
          fieldErrors={fieldErrors}
          onHourlyWageChange={onCurrentHourlyWageChange}
          onWeeklyHoursChange={onCurrentWeeklyHoursChange}
          onInsuranceStatusChange={onCurrentInsuranceStatusChange}
          onSpouseAllowanceStatusChange={
            onCurrentSpouseAllowanceStatusChange
          }
          onSpouseAllowanceMonthlyChange={
            onCurrentSpouseAllowanceMonthlyChange
          }
        />

        <ProposedConditionSection
          value={form.proposed}
          fieldErrors={fieldErrors}
          onWeeklyHoursChange={onProposedWeeklyHoursChange}
          onInsuranceStatusChange={onProposedInsuranceStatusChange}
          onHourlyWageChange={onProposedHourlyWageChange}
          onSpouseAllowanceStatusChange={
            onProposedSpouseAllowanceStatusChange
          }
          onSpouseAllowanceMonthlyChange={
            onProposedSpouseAllowanceMonthlyChange
          }
        />

        <button
          type="button"
          onClick={onSubmit}
          className="min-h-12 w-full rounded-lg bg-[#5d8666] px-5 py-3 text-base font-bold text-white shadow-sm transition hover:bg-[#4f7658] focus:outline-none focus:ring-4 focus:ring-[#d6e6d4]"
        >
          試算する
        </button>
      </div>
    </section>
  );
}
