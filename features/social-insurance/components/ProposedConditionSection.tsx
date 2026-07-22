import { NumberInput } from "@/components/ui/NumberInput";
import { FormFieldErrorMessages } from "@/features/social-insurance/components/FormFieldErrorMessages";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import { SpouseAllowanceFields } from "@/features/social-insurance/components/SpouseAllowanceFields";
import type { InsuranceStatus } from "@/features/social-insurance/types";
import type {
  FormValidationError,
  ScenarioFormState,
} from "@/features/social-insurance/v2/formTypes";

type ProposedConditionSectionProps = {
  value: ScenarioFormState;
  fieldErrors: readonly FormValidationError[];
  onWeeklyHoursChange: (value: string) => void;
  onInsuranceStatusChange: (value: InsuranceStatus) => void;
  onHourlyWageChange: (value: string) => void;
  onSpouseAllowanceStatusChange: (
    value: Exclude<ScenarioFormState["spouseAllowance"]["status"], "">,
  ) => void;
  onSpouseAllowanceMonthlyChange: (value: string) => void;
};

export function ProposedConditionSection({
  value,
  fieldErrors,
  onWeeklyHoursChange,
  onInsuranceStatusChange,
  onHourlyWageChange,
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
