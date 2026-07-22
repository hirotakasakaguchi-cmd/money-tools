import { createSimulationWarningDisplayItems } from "@/features/social-insurance/components/simulationWarningPresentation";
import type { ValidationWarning } from "@/features/social-insurance/v2/warningTypes";

type SimulationWarningsSectionProps = {
  warnings: readonly ValidationWarning[];
};

const severityClassNames: Record<ValidationWarning["severity"], string> = {
  info: "border-[#c9dce3] bg-[#eef7fa]",
  warning: "border-[#e8c9a7] bg-[#fff4df]",
};

export function SimulationWarningsSection({
  warnings,
}: SimulationWarningsSectionProps) {
  if (warnings.length === 0) {
    return null;
  }

  const items = createSimulationWarningDisplayItems(warnings);

  return (
    <section className="rounded-lg border border-[#eadfce] bg-white p-4 sm:p-5">
      <h2 className="text-base font-bold text-[#33291f]">確認事項</h2>
      <div className="mt-3 space-y-3">
        {items.map(({ key, scopeLabel, warning }) => (
          <article
            key={key}
            className={`rounded-lg border p-3 ${severityClassNames[warning.severity]}`}
          >
            <h3 className="text-sm font-bold text-[#33291f]">{scopeLabel}</h3>
            <p className="mt-2 text-sm leading-6 text-[#5f5041]">
              {warning.message}
            </p>
            <p className="mt-1 text-sm font-bold leading-6 text-[#5f5041]">
              {warning.recommendedAction}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
