import type { ToolStatus } from "@/features/tools/types/tool";

type ToolStatusBadgeProps = {
  status: ToolStatus;
};

const statusLabels: Record<ToolStatus, string> = {
  available: "公開中",
  "coming-soon": "近日公開",
  preparing: "準備中",
};

export function ToolStatusBadge({ status }: ToolStatusBadgeProps) {
  const tone =
    status === "available"
      ? "bg-[#eaf3e7] text-[#4f7d59]"
      : "bg-[#fff4df] text-[#9a6a2f]";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
      {statusLabels[status]}
    </span>
  );
}
