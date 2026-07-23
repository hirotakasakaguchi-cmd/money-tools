import { NumberInput } from "@/components/ui/NumberInput";
import { FormFieldErrorMessages } from "@/features/social-insurance/components/FormFieldErrorMessages";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import type {
  SimulationUiFieldError,
  SimulationUiFieldPath,
} from "@/features/social-insurance/components/simulationUiState";
import type { SpouseAllowanceStatus } from "@/features/social-insurance/v2/types";

type SpouseAllowanceFieldsProps = {
  scenario: "current" | "proposed";
  status: SpouseAllowanceStatus | "";
  monthlyAmount: string;
  statusFieldPath: SimulationUiFieldPath;
  monthlyAmountFieldPath: SimulationUiFieldPath;
  fieldErrors: readonly SimulationUiFieldError[];
  onStatusChange: (value: SpouseAllowanceStatus) => void;
  onMonthlyAmountChange: (value: string) => void;
};

export function SpouseAllowanceFields({
  scenario,
  status,
  monthlyAmount,
  statusFieldPath,
  monthlyAmountFieldPath,
  fieldErrors,
  onStatusChange,
  onMonthlyAmountChange,
}: SpouseAllowanceFieldsProps) {
  const options =
    scenario === "current"
      ? [
          { value: "received", label: "受給中" },
          { value: "notReceived", label: "受給なし" },
          { value: "unknown", label: "不明" },
        ] as const
      : [
          { value: "received", label: "受給予定" },
          { value: "notReceived", label: "消滅予定" },
          { value: "unknown", label: "不明" },
        ] as const;

  return (
    <>
      <div>
        <SegmentedControl
          label="配偶者手当"
          fieldPath={statusFieldPath}
          value={status}
          columns={3}
          options={[...options]}
          onChange={onStatusChange}
        />
        <FormFieldErrorMessages
          errors={fieldErrors}
          fieldPath={statusFieldPath}
        />
      </div>
      {status === "received" ? (
        <div>
          <NumberInput
            label="配偶者手当の月額"
            data-field-path={monthlyAmountFieldPath}
            className="scroll-mt-24"
            value={monthlyAmount}
            unit="円"
            onChange={onMonthlyAmountChange}
          />
          <FormFieldErrorMessages
            errors={fieldErrors}
            fieldPath={monthlyAmountFieldPath}
          />
        </div>
      ) : null}
    </>
  );
}
