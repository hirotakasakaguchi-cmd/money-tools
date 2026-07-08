import { tools } from "@/features/tools/data/tools";

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
