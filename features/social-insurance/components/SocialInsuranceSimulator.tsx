"use client";

import { useMemo, useState } from "react";
import { SimulationFormSection } from "@/features/social-insurance/components/SimulationFormSection";
import { SimulationResultSection } from "@/features/social-insurance/components/SimulationResultSection";
import { calculateSocialInsurance } from "@/features/social-insurance/calculateSocialInsurance";
import type {
  AgeGroup,
  InsuranceStatus,
} from "@/features/social-insurance/types";

type FormState = {
  ageGroup: AgeGroup;
  currentHourlyWage: string;
  currentWeeklyHours: string;
  currentInsuranceStatus: InsuranceStatus;
  hasSpouseAllowance: boolean;
  spouseAllowanceMonthly: string;
  futureWeeklyHours: string;
  futureInsuranceStatus: InsuranceStatus;
  futureHourlyWage: string;
};

const initialFormState: FormState = {
  ageGroup: "under40",
  currentHourlyWage: "1000",
  currentWeeklyHours: "20",
  currentInsuranceStatus: "dependent",
  hasSpouseAllowance: false,
  spouseAllowanceMonthly: "10000",
  futureWeeklyHours: "30",
  futureInsuranceStatus: "insured",
  futureHourlyWage: "",
};

export function SocialInsuranceSimulator() {
  const [form, setForm] = useState<FormState>(initialFormState);

  const result = useMemo(() => {
    return calculateSocialInsurance({
      ageGroup: form.ageGroup,
      current: {
        hourlyWage: toNumber(form.currentHourlyWage),
        weeklyHours: toNumber(form.currentWeeklyHours),
        insuranceStatus: form.currentInsuranceStatus,
        hasSpouseAllowance: form.hasSpouseAllowance,
        spouseAllowanceMonthly: toNumber(form.spouseAllowanceMonthly),
      },
      future: {
        hourlyWage:
          form.futureHourlyWage.trim() === ""
            ? undefined
            : toNumber(form.futureHourlyWage),
        weeklyHours: toNumber(form.futureWeeklyHours),
        insuranceStatus: form.futureInsuranceStatus,
      },
    });
  }, [form]);

  const conclusionTone =
    result.takeHomeDifference > 0
      ? "増える見込み"
      : result.takeHomeDifference < 0
        ? "減る見込み"
        : "ほぼ同じ";

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
      <SimulationFormSection
        ageGroup={form.ageGroup}
        currentHourlyWage={form.currentHourlyWage}
        currentWeeklyHours={form.currentWeeklyHours}
        currentInsuranceStatus={form.currentInsuranceStatus}
        hasSpouseAllowance={form.hasSpouseAllowance}
        spouseAllowanceMonthly={form.spouseAllowanceMonthly}
        futureWeeklyHours={form.futureWeeklyHours}
        futureInsuranceStatus={form.futureInsuranceStatus}
        futureHourlyWage={form.futureHourlyWage}
        onAgeGroupChange={(value) =>
          setForm((current) => ({ ...current, ageGroup: value }))
        }
        onCurrentHourlyWageChange={(value) =>
          setForm((current) => ({ ...current, currentHourlyWage: value }))
        }
        onCurrentWeeklyHoursChange={(value) =>
          setForm((current) => ({ ...current, currentWeeklyHours: value }))
        }
        onCurrentInsuranceStatusChange={(value) =>
          setForm((current) => ({
            ...current,
            currentInsuranceStatus: value,
          }))
        }
        onSpouseAllowancePresenceChange={(value) =>
          setForm((current) => ({
            ...current,
            hasSpouseAllowance: value === "yes",
          }))
        }
        onSpouseAllowanceMonthlyChange={(value) =>
          setForm((current) => ({
            ...current,
            spouseAllowanceMonthly: value,
          }))
        }
        onFutureWeeklyHoursChange={(value) =>
          setForm((current) => ({ ...current, futureWeeklyHours: value }))
        }
        onFutureInsuranceStatusChange={(value) =>
          setForm((current) => ({
            ...current,
            futureInsuranceStatus: value,
          }))
        }
        onFutureHourlyWageChange={(value) =>
          setForm((current) => ({ ...current, futureHourlyWage: value }))
        }
      />

      <SimulationResultSection
        result={result}
        conclusionTone={conclusionTone}
      />
    </div>
  );
}

function toNumber(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}
