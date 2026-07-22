import type { SummaryConclusion } from "@/features/social-insurance/v2/conclusionTypes";

type SummaryConclusionSectionProps = {
  conclusion: SummaryConclusion;
};

const toneClassNames: Record<SummaryConclusion["tone"], string> = {
  positive: "border-[#b9d4ba] bg-[#eaf3e7] text-[#253b2a]",
  neutral: "border-[#eadfce] bg-[#f7f1e8] text-[#33291f]",
  caution: "border-[#e8c9a7] bg-[#fff4df] text-[#62462f]",
};

export function SummaryConclusionSection({
  conclusion,
}: SummaryConclusionSectionProps) {
  return (
    <section
      className={`rounded-lg border p-5 ${toneClassNames[conclusion.tone]}`}
    >
      <p className="text-sm font-bold">あなたのケースでは</p>
      <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
        {conclusion.headline}
      </h2>
      <p className="mt-2 text-sm leading-6">{conclusion.detail}</p>
    </section>
  );
}
