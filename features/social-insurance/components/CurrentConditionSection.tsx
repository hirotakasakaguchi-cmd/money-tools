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

type CurrentConditionSectionProps = {
  value: ScenarioFormState;
  calculationYear: SimulationCalculationYear;
  monthlyRemuneration: string;
  fieldErrors: readonly SimulationUiFieldError[];
  onHourlyWageChange: (value: string) => void;
  onWeeklyHoursChange: (value: string) => void;
  onInsuranceStatusChange: (value: InsuranceStatus) => void;
  onMonthlyRemunerationChange: (value: string) => void;
  onSpouseAllowanceStatusChange: (
    value: Exclude<ScenarioFormState["spouseAllowance"]["status"], "">,
  ) => void;
  onSpouseAllowanceMonthlyChange: (value: string) => void;
};

export function CurrentConditionSection({
  value,
  calculationYear,
  monthlyRemuneration,
  fieldErrors,
  onHourlyWageChange,
  onWeeklyHoursChange,
  onInsuranceStatusChange,
  onMonthlyRemunerationChange,
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
            data-field-path="current.workplace.hourlyWage"
            className="scroll-mt-24"
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
            data-field-path="current.workplace.weeklyHours"
            className="scroll-mt-24"
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
            fieldPath="current.workplace.insuranceStatus"
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
        {calculationYear === "r8" ? (
          <div>
            <NumberInput
              label="社会保険料の計算に使う月給"
              data-field-path="current.monthlyRemuneration"
              className="scroll-mt-24"
              value={monthlyRemuneration}
              unit="円"
              inputMode="numeric"
              step="1"
              onChange={onMonthlyRemunerationChange}
            />
            <p className="mt-2 text-xs leading-5 text-[#6f5f4f]">
              基本給や毎月の手当を含む、おおよその月額を入力してください。
            </p>
            <FormFieldErrorMessages
              errors={fieldErrors}
              fieldPath="current.monthlyRemuneration"
            />
          </div>
        ) : null}
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
