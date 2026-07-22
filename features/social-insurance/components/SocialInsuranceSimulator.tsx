"use client";

import { useState } from "react";
import { SimulationAssumptionsSection } from "@/features/social-insurance/components/SimulationAssumptionsSection";
import { SimulationFormSection } from "@/features/social-insurance/components/SimulationFormSection";
import { SimulationResultSection } from "@/features/social-insurance/components/SimulationResultSection";
import { SimulationWarningsSection } from "@/features/social-insurance/components/SimulationWarningsSection";
import { SummaryConclusionSection } from "@/features/social-insurance/components/SummaryConclusionSection";
import {
  initialSimulationUiState,
  submitSimulation,
  updateSimulationForm,
} from "@/features/social-insurance/components/simulationUiState";
import type { FormState } from "@/features/social-insurance/v2/formTypes";
import type {
  SimulationExecutionFailure,
  SimulationExecutionSuccess,
} from "@/features/social-insurance/v2/simulationExecutionTypes";

export function SocialInsuranceSimulator() {
  const [state, setState] = useState(initialSimulationUiState);

  function updateForm(update: (form: FormState) => FormState) {
    setState((current) => updateSimulationForm(current, update));
  }

  function handleSubmit() {
    setState(submitSimulation(state));
  }

  const fieldErrors =
    state.execution?.status === "invalid" ? state.execution.fieldErrors : [];
  const invalidExecution: SimulationExecutionFailure | null =
    state.execution?.status === "invalid" ? state.execution : null;
  const successExecution: SimulationExecutionSuccess | null =
    state.execution?.status === "success" ? state.execution : null;

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
      <SimulationFormSection
        form={state.form}
        fieldErrors={fieldErrors}
        onGoalChange={(value) =>
          updateForm((form) => ({ ...form, goal: value }))
        }
        onAgeGroupChange={(value) =>
          updateForm((form) => ({ ...form, ageGroup: value }))
        }
        onCurrentHourlyWageChange={(value) =>
          updateForm((form) =>
            updateWorkplace(form, "current", "hourlyWage", value),
          )
        }
        onCurrentWeeklyHoursChange={(value) =>
          updateForm((form) =>
            updateWorkplace(form, "current", "weeklyHours", value),
          )
        }
        onCurrentInsuranceStatusChange={(value) =>
          updateForm((form) =>
            updateWorkplace(form, "current", "insuranceStatus", value),
          )
        }
        onCurrentSpouseAllowanceStatusChange={(value) =>
          updateForm((form) =>
            updateSpouseAllowance(form, "current", "status", value),
          )
        }
        onCurrentSpouseAllowanceMonthlyChange={(value) =>
          updateForm((form) =>
            updateSpouseAllowance(form, "current", "monthlyAmount", value),
          )
        }
        onProposedWeeklyHoursChange={(value) =>
          updateForm((form) =>
            updateWorkplace(form, "proposed", "weeklyHours", value),
          )
        }
        onProposedInsuranceStatusChange={(value) =>
          updateForm((form) =>
            updateWorkplace(form, "proposed", "insuranceStatus", value),
          )
        }
        onProposedHourlyWageChange={(value) =>
          updateForm((form) =>
            updateWorkplace(form, "proposed", "hourlyWage", value),
          )
        }
        onProposedSpouseAllowanceStatusChange={(value) =>
          updateForm((form) =>
            updateSpouseAllowance(form, "proposed", "status", value),
          )
        }
        onProposedSpouseAllowanceMonthlyChange={(value) =>
          updateForm((form) =>
            updateSpouseAllowance(form, "proposed", "monthlyAmount", value),
          )
        }
        onSubmit={handleSubmit}
      />

      <div aria-live="polite">
        {invalidExecution ? (
          <section className="rounded-lg border border-[#eadfce] bg-white p-4 shadow-[0_10px_30px_rgba(92,67,39,0.08)] sm:p-5">
            <h2 className="text-lg font-bold text-[#9a4f43]">
              入力内容を確認してください
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6f5f4f]">
              入力欄の近くに表示された内容を確認して、もう一度試算してください。
            </p>
          </section>
        ) : null}

        {successExecution ? (
          <div
            data-simulation-result
            tabIndex={-1}
            aria-label="試算結果"
            className="scroll-mt-24 space-y-5"
          >
            <SummaryConclusionSection
              conclusion={successExecution.conclusion}
            />
            <SimulationResultSection result={successExecution.result} />
            <SimulationWarningsSection warnings={successExecution.warnings} />
            <section className="rounded-lg border border-[#eadfce] bg-white/86 p-4 sm:p-5">
              <h2 className="text-base font-bold text-[#33291f]">
                計算条件・注意書き
              </h2>
              <div className="mt-3">
                <SimulationAssumptionsSection />
              </div>
            </section>
          </div>
        ) : null}
      </div>
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
