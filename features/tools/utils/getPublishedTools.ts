import { tools } from "@/features/tools/data/tools";

export function getPublishedTools() {
  return tools.filter((tool) => tool.status === "available");
}
