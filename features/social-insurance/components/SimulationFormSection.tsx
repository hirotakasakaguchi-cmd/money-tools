import { ConsultationGoalSection } from "@/features/social-insurance/components/ConsultationGoalSection";
import { CurrentConditionSection } from "@/features/social-insurance/components/CurrentConditionSection";
import { FormFieldErrorMessages } from "@/features/social-insurance/components/FormFieldErrorMessages";
import { ProposedConditionSection } from "@/features/social-insurance/components/ProposedConditionSection";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import { NumberInput } from "@/components/ui/NumberInput";
import type { InsuranceStatus } from "@/features/social-insurance/types";
import type { FormState } from "@/features/social-insurance/v2/formTypes";
import type {
  ConsultationGoal,
  SpouseAllowanceStatus,
} from "@/features/social-insurance/v2/types";
import type {
  SimulationCalculationYear,
  SimulationUiFieldError,
} from "@/features/social-insurance/components/simulationUiState";

type SimulationFormSectionProps = {
  form: FormState;
  calculationYear: SimulationCalculationYear;
  age: string;
  currentMonthlyRemuneration: string;
  proposedMonthlyRemuneration: string;
  fieldErrors: readonly SimulationUiFieldError[];
  onCalculationYearChange: (value: SimulationCalculationYear) => void;
  onGoalChange: (value: ConsultationGoal) => void;
  onAgeChange: (value: string) => void;
  onCurrentHourlyWageChange: (value: string) => void;
  onCurrentWeeklyHoursChange: (value: string) => void;
  onCurrentInsuranceStatusChange: (value: InsuranceStatus) => void;
  onCurrentMonthlyRemunerationChange: (value: string) => void;
  onCurrentSpouseAllowanceStatusChange: (value: SpouseAllowanceStatus) => void;
  onCurrentSpouseAllowanceMonthlyChange: (value: string) => void;
  onProposedWeeklyHoursChange: (value: string) => void;
  onProposedInsuranceStatusChange: (value: InsuranceStatus) => void;
  onProposedHourlyWageChange: (value: string) => void;
  onProposedMonthlyRemunerationChange: (value: string) => void;
  onProposedSpouseAllowanceStatusChange: (value: SpouseAllowanceStatus) => void;
  onProposedSpouseAllowanceMonthlyChange: (value: string) => void;
  onSubmit: () => void;
};

export function SimulationFormSection({
  form,
  calculationYear,
  age,
  currentMonthlyRemuneration,
  proposedMonthlyRemuneration,
  fieldErrors,
  onCalculationYearChange,
  onGoalChange,
  onAgeChange,
  onCurrentHourlyWageChange,
  onCurrentWeeklyHoursChange,
  onCurrentInsuranceStatusChange,
  onCurrentMonthlyRemunerationChange,
  onCurrentSpouseAllowanceStatusChange,
  onCurrentSpouseAllowanceMonthlyChange,
  onProposedWeeklyHoursChange,
  onProposedInsuranceStatusChange,
  onProposedHourlyWageChange,
  onProposedMonthlyRemunerationChange,
  onProposedSpouseAllowanceStatusChange,
  onProposedSpouseAllowanceMonthlyChange,
  onSubmit,
}: SimulationFormSectionProps) {
  return (
    <section className="rounded-lg border border-[#eadfce] bg-white/86 p-4 shadow-[0_10px_30px_rgba(92,67,39,0.08)] sm:p-5">
      <h2 className="text-xl font-bold text-[#33291f]">入力</h2>

      <div className="mt-5 space-y-6">
        <SegmentedControl
          label="計算する年度"
          fieldPath="calculationYear"
          value={calculationYear}
          options={[
            { value: "r7", label: "令和7年度" },
            { value: "r8", label: "令和8年度" },
          ]}
          onChange={onCalculationYearChange}
        />

        <ConsultationGoalSection
          value={form.goal}
          fieldErrors={fieldErrors}
          onChange={onGoalChange}
        />

        <div>
          <NumberInput
            label="現在の年齢"
            data-field-path="age"
            className="scroll-mt-24"
            value={age}
            unit="歳"
            inputMode="numeric"
            step="1"
            onChange={onAgeChange}
          />
          <FormFieldErrorMessages errors={fieldErrors} fieldPath="age" />
        </div>

        <CurrentConditionSection
          value={form.current}
          calculationYear={calculationYear}
          monthlyRemuneration={currentMonthlyRemuneration}
          fieldErrors={fieldErrors}
          onHourlyWageChange={onCurrentHourlyWageChange}
          onWeeklyHoursChange={onCurrentWeeklyHoursChange}
          onInsuranceStatusChange={onCurrentInsuranceStatusChange}
          onMonthlyRemunerationChange={onCurrentMonthlyRemunerationChange}
          onSpouseAllowanceStatusChange={
            onCurrentSpouseAllowanceStatusChange
          }
          onSpouseAllowanceMonthlyChange={
            onCurrentSpouseAllowanceMonthlyChange
          }
        />

        <ProposedConditionSection
          value={form.proposed}
          calculationYear={calculationYear}
          monthlyRemuneration={proposedMonthlyRemuneration}
          fieldErrors={fieldErrors}
          onWeeklyHoursChange={onProposedWeeklyHoursChange}
          onInsuranceStatusChange={onProposedInsuranceStatusChange}
          onHourlyWageChange={onProposedHourlyWageChange}
          onMonthlyRemunerationChange={onProposedMonthlyRemunerationChange}
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
