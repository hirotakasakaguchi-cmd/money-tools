import { NumberInput } from "@/components/ui/NumberInput";
import { FormFieldErrorMessages } from "@/features/social-insurance/components/FormFieldErrorMessages";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import { SpouseAllowanceFields } from "@/features/social-insurance/components/SpouseAllowanceFields";
import type { InsuranceStatus } from "@/features/social-insurance/types";
import type {
  FormValidationError,
  ScenarioFormState,
} from "@/features/social-insurance/v2/formTypes";

type CurrentConditionSectionProps = {
  value: ScenarioFormState;
  fieldErrors: readonly FormValidationError[];
  onHourlyWageChange: (value: string) => void;
  onWeeklyHoursChange: (value: string) => void;
  onInsuranceStatusChange: (value: InsuranceStatus) => void;
  onSpouseAllowanceStatusChange: (
    value: Exclude<ScenarioFormState["spouseAllowance"]["status"], "">,
  ) => void;
  onSpouseAllowanceMonthlyChange: (value: string) => void;
};

export function CurrentConditionSection({
  value,
  fieldErrors,
  onHourlyWageChange,
  onWeeklyHoursChange,
  onInsuranceStatusChange,
  onSpouseAllowanceStatusChange,
  onSpouseAllowanceMonthlyChange,
}: CurrentConditionSectionProps) {
  return (
    <fieldset>
      <legend className="text-base font-bold text-[#33291f]">
        現在の働き方
      </legend>
      <div className="mt-4 grid gap-4">
        <div>
          <NumberInput
            label="時給"
            value={value.workplace.hourlyWage}
            unit="円"
            onChange={onHourlyWageChange}
          />
          <FormFieldErrorMessages
            errors={fieldErrors}
            fieldPath="current.workplace.hourlyWage"
          />
        </div>
        <div>
          <NumberInput
            label="週の労働時間"
            value={value.workplace.weeklyHours}
            unit="時間"
            onChange={onWeeklyHoursChange}
          />
          <FormFieldErrorMessages
            errors={fieldErrors}
            fieldPath="current.workplace.weeklyHours"
          />
        </div>
        <div>
          <SegmentedControl
            label="社会保険加入状況"
            value={value.workplace.insuranceStatus}
            options={[
              { value: "dependent", label: "扶養内" },
              { value: "insured", label: "社保加入中" },
            ]}
            onChange={onInsuranceStatusChange}
          />
          <FormFieldErrorMessages
            errors={fieldErrors}
            fieldPath="current.workplace.insuranceStatus"
          />
        </div>
        <SpouseAllowanceFields
          scenario="current"
          status={value.spouseAllowance.status}
          monthlyAmount={value.spouseAllowance.monthlyAmount}
          statusFieldPath="current.spouseAllowance.status"
          monthlyAmountFieldPath="current.spouseAllowance.monthlyAmount"
          fieldErrors={fieldErrors}
          onStatusChange={onSpouseAllowanceStatusChange}
          onMonthlyAmountChange={onSpouseAllowanceMonthlyChange}
        />
      </div>
    </fieldset>
  );
}
