import { NumberInput } from "@/components/ui/NumberInput";
import { FormFieldErrorMessages } from "@/features/social-insurance/components/FormFieldErrorMessages";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import { SpouseAllowanceFields } from "@/features/social-insurance/components/SpouseAllowanceFields";
import type { InsuranceStatus } from "@/features/social-insurance/types";
import type {
  ScenarioFormState,
} from "@/features/social-insurance/v2/formTypes";
import type {
  SimulationCalculationYear,
  SimulationUiFieldError,
} from "@/features/social-insurance/components/simulationUiState";

type ProposedConditionSectionProps = {
  value: ScenarioFormState;
  calculationYear: SimulationCalculationYear;
  monthlyRemuneration: string;
  fieldErrors: readonly SimulationUiFieldError[];
  onWeeklyHoursChange: (value: string) => void;
  onInsuranceStatusChange: (value: InsuranceStatus) => void;
  onHourlyWageChange: (value: string) => void;
  onMonthlyRemunerationChange: (value: string) => void;
  onSpouseAllowanceStatusChange: (
    value: Exclude<ScenarioFormState["spouseAllowance"]["status"], "">,
  ) => void;
  onSpouseAllowanceMonthlyChange: (value: string) => void;
};

export function ProposedConditionSection({
  value,
  calculationYear,
  monthlyRemuneration,
  fieldErrors,
  onWeeklyHoursChange,
  onInsuranceStatusChange,
  onHourlyWageChange,
  onMonthlyRemunerationChange,
  onSpouseAllowanceStatusChange,
  onSpouseAllowanceMonthlyChange,
}: ProposedConditionSectionProps) {
  return (
    <fieldset>
      <legend className="text-base font-bold text-[#33291f]">
        変更後の働き方
      </legend>
      <div className="mt-4 grid gap-4">
        <div>
          <NumberInput
            label="週の労働時間"
            data-field-path="proposed.workplace.weeklyHours"
            className="scroll-mt-24"
            value={value.workplace.weeklyHours}
            unit="時間"
            onChange={onWeeklyHoursChange}
          />
          <FormFieldErrorMessages
            errors={fieldErrors}
            fieldPath="proposed.workplace.weeklyHours"
          />
        </div>
        <div>
          <SegmentedControl
            label="社会保険加入予定"
            fieldPath="proposed.workplace.insuranceStatus"
            value={value.workplace.insuranceStatus}
            options={[
              { value: "dependent", label: "扶養内" },
              { value: "insured", label: "社保加入" },
            ]}
            onChange={onInsuranceStatusChange}
          />
          <FormFieldErrorMessages
            errors={fieldErrors}
            fieldPath="proposed.workplace.insuranceStatus"
          />
        </div>
        <div>
          <NumberInput
            label="変更後の時給"
            data-field-path="proposed.workplace.hourlyWage"
            className="scroll-mt-24"
            value={value.workplace.hourlyWage}
            unit="円"
            placeholder="現在の時給を入力"
            onChange={onHourlyWageChange}
          />
          <FormFieldErrorMessages
            errors={fieldErrors}
            fieldPath="proposed.workplace.hourlyWage"
          />
        </div>
        {calculationYear === "r8" ? (
          <div>
            <NumberInput
              label="社保加入後の総支給月額"
              data-field-path="proposed.monthlyRemuneration"
              className="scroll-mt-24"
              value={monthlyRemuneration}
              unit="円"
              inputMode="numeric"
              step="1"
              onChange={onMonthlyRemunerationChange}
            />
            <p className="mt-2 text-xs leading-5 text-[#6f5f4f]">
              手取りではなく、基本給や毎月の手当を含む総支給額を入力してください。
            </p>
            <FormFieldErrorMessages
              errors={fieldErrors}
              fieldPath="proposed.monthlyRemuneration"
            />
          </div>
        ) : null}
        <SpouseAllowanceFields
          scenario="proposed"
          status={value.spouseAllowance.status}
          monthlyAmount={value.spouseAllowance.monthlyAmount}
          statusFieldPath="proposed.spouseAllowance.status"
          monthlyAmountFieldPath="proposed.spouseAllowance.monthlyAmount"
          fieldErrors={fieldErrors}
          onStatusChange={onSpouseAllowanceStatusChange}
          onMonthlyAmountChange={onSpouseAllowanceMonthlyChange}
        />
      </div>
    </fieldset>
  );
}
