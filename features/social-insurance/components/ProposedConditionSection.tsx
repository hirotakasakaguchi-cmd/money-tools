import { NumberInput } from "@/components/ui/NumberInput";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import type { InsuranceStatus } from "@/features/social-insurance/types";

type ProposedConditionSectionProps = {
  weeklyHours: string;
  insuranceStatus: InsuranceStatus;
  hourlyWage: string;
  onWeeklyHoursChange: (value: string) => void;
  onInsuranceStatusChange: (value: InsuranceStatus) => void;
  onHourlyWageChange: (value: string) => void;
};

export function ProposedConditionSection({
  weeklyHours,
  insuranceStatus,
  hourlyWage,
  onWeeklyHoursChange,
  onInsuranceStatusChange,
  onHourlyWageChange,
}: ProposedConditionSectionProps) {
  return (
    <fieldset>
      <legend className="text-base font-bold text-[#33291f]">
        変更後の働き方
      </legend>
      <div className="mt-4 grid gap-4">
        <NumberInput
          label="週の労働時間"
          value={weeklyHours}
          unit="時間"
          onChange={onWeeklyHoursChange}
        />
        <SegmentedControl
          label="社会保険加入予定"
          value={insuranceStatus}
          options={[
            { value: "dependent", label: "扶養内" },
            { value: "insured", label: "社保加入" },
          ]}
          onChange={onInsuranceStatusChange}
        />
        <NumberInput
          label="変更後の時給"
          value={hourlyWage}
          unit="円"
          placeholder="未入力なら現在と同じ"
          onChange={onHourlyWageChange}
        />
      </div>
    </fieldset>
  );
}
