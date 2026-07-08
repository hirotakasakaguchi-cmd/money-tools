export type ToolStatus = "available" | "coming-soon" | "preparing";

export type ToolCategory =
  | "education"
  | "household"
  | "social-insurance"
  | "consultation";

export type Tool = {
  slug: string;
  title: string;
  description: string;
  status: ToolStatus;
  category: ToolCategory;
  categoryLabel: string;
};
