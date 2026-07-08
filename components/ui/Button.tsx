type ButtonVariant = "primary" | "disabled";

const baseClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-bold transition focus:outline-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#6f9b79] text-white shadow-sm hover:bg-[#5d8666] focus:ring-4 focus:ring-[#cfe3d2]",
  disabled:
    "cursor-not-allowed border border-[#eadfce] bg-[#f7f1e8] text-[#8a7a67]",
};

export function buttonClassName(variant: ButtonVariant, className = "") {
  return `${baseClassName} ${variants[variant]} ${className}`.trim();
}
