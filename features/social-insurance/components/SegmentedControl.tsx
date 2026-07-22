import { useId } from "react";
import type { FormFieldPath } from "@/features/social-insurance/v2/formTypes";

type SegmentedControlProps<T extends string> = {
  label: string;
  fieldPath: FormFieldPath;
  value: T | "";
  columns?: 2 | 3;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  label,
  fieldPath,
  value,
  columns = 2,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  const groupName = useId();
  const gridClassName =
    columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2";

  return (
    <div>
      <p className="text-sm font-bold text-[#4c4034]">{label}</p>
      <div
        className={`mt-2 grid ${gridClassName} gap-2 rounded-lg bg-[#f7f1e8] p-1`}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <label
              key={option.value}
              className="block cursor-pointer rounded-md"
            >
              <input
                type="radio"
                data-field-path={fieldPath}
                name={groupName}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="peer sr-only scroll-mt-24"
              />
              <span
                className={`flex min-h-11 items-center justify-center rounded-md px-3 text-center text-sm font-bold transition peer-focus:ring-4 peer-focus:ring-[#d6e6d4] ${
                  isSelected
                    ? "bg-white text-[#4f7d59] shadow-sm"
                    : "text-[#7a6a58]"
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
