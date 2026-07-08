import { ToolStatusBadge } from "@/components/tools/ToolStatusBadge";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Tool } from "@/features/tools/types/tool";

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  const isAvailable = tool.status === "available";
  const actionLabel = getActionLabel(tool.status);

  return (
    <Card className="flex min-h-48 flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-full bg-[#eaf3e7] px-3 py-1 text-xs font-bold text-[#4f7d59]">
            {tool.categoryLabel}
          </div>
          <ToolStatusBadge status={tool.status} />
        </div>

        <h3 className="mt-5 text-xl font-bold leading-8 text-[#33291f]">
          {tool.title}
        </h3>
        <p className="mt-2 text-sm leading-7 text-[#6f5f4f]">{tool.description}</p>
      </div>

      {isAvailable ? (
        <a
          href={`/tools/${tool.slug}`}
          className={buttonClassName("primary", "mt-6")}
        >
          {actionLabel}
        </a>
      ) : (
        <div className="mt-6">
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-describedby={`${tool.slug}-status-note`}
            className={buttonClassName("disabled")}
          >
            {actionLabel}
          </button>
          <p id={`${tool.slug}-status-note`} className="mt-2 text-center text-xs leading-5 text-[#8a7a67]">
            {getStatusNote(tool.status)}
          </p>
        </div>
      )}
    </Card>
  );
}

function getActionLabel(status: Tool["status"]) {
  switch (status) {
    case "available":
      return "使ってみる";
    case "coming-soon":
      return "近日公開";
    case "preparing":
      return "準備中";
  }
}

function getStatusNote(status: Tool["status"]) {
  switch (status) {
    case "available":
      return "";
    case "coming-soon":
      return "公開までしばらくお待ちください。";
    case "preparing":
      return "ただいま準備を進めています。";
  }
}
