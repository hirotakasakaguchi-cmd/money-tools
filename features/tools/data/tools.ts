import type { Tool } from "@/features/tools/types/tool";

export const tools: Tool[] = [
  {
    slug: "social-insurance",
    title: "社会保険シミュレーター",
    description: "扶養内と社保加入を比較",
    status: "available",
    category: "social-insurance",
    categoryLabel: "社会保険",
  },
  {
    slug: "education-cost",
    title: "教育費シミュレーター",
    description: "教育費が足りるか3分でチェック",
    status: "coming-soon",
    category: "education",
    categoryLabel: "教育費",
  },
  {
    slug: "household-check",
    title: "家計診断",
    description: "家計のバランスをチェック",
    status: "coming-soon",
    category: "household",
    categoryLabel: "家計",
  },
  {
    slug: "ai-money-consult",
    title: "AIお金相談",
    description: "AIと一緒にお金の悩みを整理",
    status: "preparing",
    category: "consultation",
    categoryLabel: "相談",
  },
];
