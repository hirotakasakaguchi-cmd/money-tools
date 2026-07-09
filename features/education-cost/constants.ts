import type { EducationStageKey, SavingMethod } from "@/features/education-cost/types";

export const TARGET_AGE = 18;
export const MONTHS_PER_YEAR = 12;

export const EDUCATION_COSTS = {
  elementary: {
    label: "小学校",
    options: {
      public: {
        label: "公立",
        cost: 2_000_000,
      },
      private: {
        label: "私立",
        cost: 10_000_000,
      },
    },
  },
  juniorHigh: {
    label: "中学校",
    options: {
      public: {
        label: "公立",
        cost: 1_500_000,
      },
      private: {
        label: "私立",
        cost: 4_000_000,
      },
    },
  },
  highSchool: {
    label: "高校",
    options: {
      public: {
        label: "公立",
        cost: 1_500_000,
      },
      private: {
        label: "私立",
        cost: 3_000_000,
      },
    },
  },
  university: {
    label: "大学",
    options: {
      national: {
        label: "国公立",
        cost: 3_000_000,
      },
      privateHumanities: {
        label: "私立文系",
        cost: 5_000_000,
      },
      privateScience: {
        label: "私立理系",
        cost: 7_000_000,
      },
    },
  },
} as const satisfies Record<
  EducationStageKey,
  {
    label: string;
    options: Record<string, { label: string; cost: number }>;
  }
>;

export const SAVING_METHODS = {
  deposit: {
    label: "預金",
    annualRate: 0,
  },
  nisa: {
    label: "NISA",
    annualRate: 0.05,
  },
  insurance: {
    label: "学資保険",
    annualRate: 0.005,
  },
} as const satisfies Record<
  SavingMethod,
  {
    label: string;
    annualRate: number;
  }
>;
