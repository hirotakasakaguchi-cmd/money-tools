import type { InputHTMLAttributes } from "react";

type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  label: string;
  value: string;
  unit?: string;
  onChange: (value: string) => void;
};

export function NumberInput({
  label,
  value,
  unit,
  onChange,
  inputMode = "decimal",
  min = "0",
  className = "",
  onWheel,
  ...props
}: NumberInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#4c4034]">{label}</span>
      <span className="mt-2 flex min-h-12 items-center rounded-lg border border-[#eadfce] bg-white px-3 focus-within:border-[#8fb995] focus-within:ring-4 focus-within:ring-[#eaf3e7]">
        <input
          {...props}
          type="number"
          inputMode={inputMode}
          min={min}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onWheel={(event) => {
            event.currentTarget.blur();
            onWheel?.(event);
          }}
          className={`min-w-0 flex-1 bg-transparent py-3 text-base font-bold text-[#33291f] outline-none placeholder:text-sm placeholder:font-medium placeholder:text-[#a69786] ${className}`.trim()}
        />
        {unit ? (
          <span className="ml-2 shrink-0 text-sm font-bold text-[#7a6a58]">
            {unit}
          </span>
        ) : null}
      </span>
    </label>
  );
}
