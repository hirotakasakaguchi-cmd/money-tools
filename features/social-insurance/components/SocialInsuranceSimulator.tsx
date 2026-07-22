"use client";

import { useState } from "react";
import { SimulationFormSection } from "@/features/social-insurance/components/SimulationFormSection";
import {
  initialSimulationUiState,
  submitSimulation,
  updateSimulationForm,
} from "@/features/social-insurance/components/simulationUiState";
import type { FormState } from "@/features/social-insurance/v2/formTypes";

export function SocialInsuranceSimulator() {
  const [state, setState] = useState(initialSimulationUiState);

  function updateForm(update: (form: FormState) => FormState) {
    setState((current) => updateSimulationForm(current, update));
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
      <SimulationFormSection
        form={state.form}
        onGoalChange={(value) =>
          updateForm((form) => ({ ...form, goal: value }))
        }
        onAgeGroupChange={(value) =>
          updateForm((form) => ({ ...form, ageGroup: value }))
        }
        onCurrentHourlyWageChange={(value) =>
          updateForm((form) => updateWorkplace(form, "current", "hourlyWage", value))
        }
        onCurrentWeeklyHoursChange={(value) =>
          updateForm((form) => updateWorkplace(form, "current", "weeklyHours", value))
        }
        onCurrentInsuranceStatusChange={(value) =>
          updateForm((form) => updateWorkplace(form, "current", "insuranceStatus", value))
        }
        onCurrentSpouseAllowanceStatusChange={(value) =>
          updateForm((form) => updateSpouseAllowance(form, "current", "status", value))
        }
        onCurrentSpouseAllowanceMonthlyChange={(value) =>
          updateForm((form) => updateSpouseAllowance(form, "current", "monthlyAmount", value))
        }
        onProposedWeeklyHoursChange={(value) =>
          updateForm((form) => updateWorkplace(form, "proposed", "weeklyHours", value))
        }
        onProposedInsuranceStatusChange={(value) =>
          updateForm((form) => updateWorkplace(form, "proposed", "insuranceStatus", value))
        }
        onProposedHourlyWageChange={(value) =>
          updateForm((form) => updateWorkplace(form, "proposed", "hourlyWage", value))
        }
        onProposedSpouseAllowanceStatusChange={(value) =>
          updateForm((form) => updateSpouseAllowance(form, "proposed", "status", value))
        }
        onProposedSpouseAllowanceMonthlyChange={(value) =>
          updateForm((form) => updateSpouseAllowance(form, "proposed", "monthlyAmount", value))
        }
        onSubmit={() => setState((current) => submitSimulation(current))}
      />
    </div>
  );
}

function updateWorkplace<K extends keyof FormState["current"]["workplace"]>(
  form: FormState,
  scenario: "current" | "proposed",
  field: K,
  value: FormState["current"]["workplace"][K],
): FormState {
  return {
    ...form,
    [scenario]: {
      ...form[scenario],
      workplace: {
        ...form[scenario].workplace,
        [field]: value,
      },
    },
  };
}

function updateSpouseAllowance<
  K extends keyof FormState["current"]["spouseAllowance"],
>(
  form: FormState,
  scenario: "current" | "proposed",
  field: K,
  value: FormState["current"]["spouseAllowance"][K],
): FormState {
  return {
    ...form,
    [scenario]: {
      ...form[scenario],
      spouseAllowance: {
        ...form[scenario].spouseAllowance,
        [field]: value,
      },
    },
  };
}
