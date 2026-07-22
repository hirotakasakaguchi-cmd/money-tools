import { FormFieldErrorMessages } from "@/features/social-insurance/components/FormFieldErrorMessages";
import type { FormValidationError } from "@/features/social-insurance/v2/formTypes";
import type { ConsultationGoal } from "@/features/social-insurance/v2/types";

type ConsultationGoalSectionProps = {
  value: ConsultationGoal | "";
  fieldErrors: readonly FormValidationError[];
  onChange: (value: ConsultationGoal) => void;
};

const goalOptions: readonly {
  value: ConsultationGoal;
  label: string;
  description: string;
}[] = [
  {
    value: "compareAnnualTakeHome",
    label: "年間手取りを比較したい",
    description:
      "変更前と変更後で、自分の手取りがどれくらい変わるか確認します。",
  },
  {
    value: "checkTakeHomeMaintenance",
    label: "今の手取りを維持したい",
    description:
      "勤務時間を増やしたあとも、現在の手取りを保てるか確認します。",
  },
  {
    value: "compareDependentAndInsured",
    label: "扶養内と社保加入を比べたい",
    description:
      "本人手取りと配偶者手当を含め、世帯のお金の差を確認します。",
  },
];

export function ConsultationGoalSection({
  value,
  fieldErrors,
  onChange,
}: ConsultationGoalSectionProps) {
  return (
    <fieldset>
      <legend className="text-base font-bold text-[#33291f]">
        相談目的
      </legend>
      <div className="mt-3 grid gap-2">
        {goalOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`block cursor-pointer rounded-lg border p-3 transition ${
                isSelected
                  ? "border-[#8fb995] bg-[#eaf3e7]"
                  : "border-[#eadfce] bg-white"
              }`}
            >
              <input
                type="radio"
                name="consultationGoal"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="block text-sm font-bold text-[#33291f]">
                {option.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[#6f5f4f]">
                {option.description}
              </span>
            </label>
          );
        })}
      </div>
      <FormFieldErrorMessages errors={fieldErrors} fieldPath="goal" />
    </fieldset>
  );
}
