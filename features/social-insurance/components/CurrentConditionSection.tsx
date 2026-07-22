import { NumberInput } from "@/components/ui/NumberInput";
import { SegmentedControl } from "@/features/social-insurance/components/SegmentedControl";
import type { InsuranceStatus } from "@/features/social-insurance/types";

type CurrentConditionSectionProps = {
  hourlyWage: string;
  weeklyHours: string;
  insuranceStatus: InsuranceStatus;
  hasSpouseAllowance: boolean;
  spouseAllowanceMonthly: string;
  onHourlyWageChange: (value: string) => void;
  onWeeklyHoursChange: (value: string) => void;
  onInsuranceStatusChange: (value: InsuranceStatus) => void;
  onSpouseAllowancePresenceChange: (value: "yes" | "no") => void;
  onSpouseAllowanceMonthlyChange: (value: string) => void;
};

export function CurrentConditionSection({
  hourlyWage,
  weeklyHours,
  insuranceStatus,
  hasSpouseAllowance,
  spouseAllowanceMonthly,
  onHourlyWageChange,
  onWeeklyHoursChange,
  onInsuranceStatusChange,
  onSpouseAllowancePresenceChange,
  onSpouseAllowanceMonthlyChange,
}: CurrentConditionSectionProps) {
  return (
    <fieldset>
      <legend className="text-base font-bold text-[#33291f]">
        現在の働き方
      </legend>
      <div className="mt-4 grid gap-4">
        <NumberInput
          label="時給"
          value={hourlyWage}
          unit="円"
          onChange={onHourlyWageChange}
        />
        <NumberInput
          label="週の労働時間"
          value={weeklyHours}
          unit="時間"
          onChange={onWeeklyHoursChange}
        />
        <SegmentedControl
          label="社会保険加入状況"
          value={insuranceStatus}
          options={[
            { value: "dependent", label: "扶養内" },
            { value: "insured", label: "社保加入中" },
          ]}
          onChange={onInsuranceStatusChange}
        />
        <SegmentedControl
          label="配偶者手当"
          value={hasSpouseAllowance ? "yes" : "no"}
          options={[
            { value: "yes", label: "あり" },
            { value: "no", label: "なし" },
          ]}
          onChange={onSpouseAllowancePresenceChange}
        />
        {hasSpouseAllowance ? (
          <NumberInput
            label="配偶者手当の月額"
            value={spouseAllowanceMonthly}
            unit="円"
            onChange={onSpouseAllowanceMonthlyChange}
          />
        ) : null}
      </div>
    </fieldset>
  );
}
