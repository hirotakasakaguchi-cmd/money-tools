"use client";

import { useEffect, useRef, useState } from "react";
import { R8SimulationAssumptionsSection } from "@/features/social-insurance/components/R8SimulationAssumptionsSection";
import { R8SimulationResultSection } from "@/features/social-insurance/components/R8SimulationResultSection";
import { SimulationAssumptionsSection } from "@/features/social-insurance/components/SimulationAssumptionsSection";
import { SimulationFormSection } from "@/features/social-insurance/components/SimulationFormSection";
import { SimulationResultSection } from "@/features/social-insurance/components/SimulationResultSection";
import { SimulationWarningsSection } from "@/features/social-insurance/components/SimulationWarningsSection";
import { SummaryConclusionSection } from "@/features/social-insurance/components/SummaryConclusionSection";
import {
  getSimulationFocusTarget,
  getSimulationScrollOptions,
} from "@/features/social-insurance/components/simulationFocus";
import {
  initialSimulationUiState,
  submitSimulation,
  updateSimulationAge,
  updateSimulationCalculationYear,
  updateSimulationForm,
  updateSimulationMonthlyRemuneration,
} from "@/features/social-insurance/components/simulationUiState";
import type { FormState } from "@/features/social-insurance/v2/formTypes";

export function SocialInsuranceSimulator() {
  const [state, setState] = useState(initialSimulationUiState);
  const resultRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = getSimulationFocusTarget(state.execution);

    if (target === null) {
      return;
    }

    const element =
      target.type === "result"
        ? resultRegionRef.current
        : document.querySelector<HTMLElement>(
            `[data-field-path="${target.fieldPath}"]`,
          );

    if (element === null) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    element.focus({ preventScroll: true });
    element.scrollIntoView(getSimulationScrollOptions(prefersReducedMotion));
  }, [state.execution]);

  function updateForm(update: (form: FormState) => FormState) {
    setState((current) => updateSimulationForm(current, update));
  }

  function handleSubmit() {
    setState(submitSimulation(state));
  }

  const fieldErrors =
    state.execution?.status === "invalid" ? state.execution.fieldErrors : [];
  const invalidExecution =
    state.execution?.status === "invalid" ? state.execution : null;
  const r7Execution =
    state.execution?.status === "success" ? state.execution : null;
  const r8Execution =
    state.execution?.status === "r8Success"
      ? state.execution.execution
      : null;
  const unsupportedExecution =
    state.execution?.status === "r8Unsupported"
      ? state.execution.execution
      : null;

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
      <SimulationFormSection
        form={state.form}
        calculationYear={state.calculationYear}
        age={state.age}
        currentMonthlyRemuneration={state.currentMonthlyRemuneration}
        proposedMonthlyRemuneration={state.proposedMonthlyRemuneration}
        fieldErrors={fieldErrors}
        onCalculationYearChange={(value) =>
          setState((current) =>
            updateSimulationCalculationYear(current, value),
          )
        }
        onGoalChange={(value) =>
          updateForm((form) => ({ ...form, goal: value }))
        }
        onAgeChange={(value) =>
          setState((current) => updateSimulationAge(current, value))
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
        onCurrentMonthlyRemunerationChange={(value) =>
          setState((current) =>
            updateSimulationMonthlyRemuneration(
              current,
              "current",
              value,
            ),
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
        onProposedMonthlyRemunerationChange={(value) =>
          setState((current) =>
            updateSimulationMonthlyRemuneration(
              current,
              "proposed",
              value,
            ),
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

        {unsupportedExecution ? (
          <section
            ref={resultRegionRef}
            data-simulation-result
            tabIndex={-1}
            aria-label="試算結果"
            className="scroll-mt-24 rounded-lg border border-[#e8c9a7] bg-[#fff4df] p-5 text-[#62462f]"
          >
            <h2 className="text-xl font-bold">
              65歳以上の計算は現在準備中です
            </h2>
            <p className="mt-2 text-sm leading-6">
              令和7年度を選ぶと、現在の参考値計算をご利用いただけます。
            </p>
          </section>
        ) : null}

        {r7Execution ? (
          <div
            ref={resultRegionRef}
            data-simulation-result
            tabIndex={-1}
            aria-label="試算結果"
            className="scroll-mt-24 space-y-5"
          >
            <SummaryConclusionSection
              conclusion={r7Execution.conclusion}
            />
            <SimulationResultSection result={r7Execution.result} />
            <SimulationWarningsSection warnings={r7Execution.warnings} />
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

        {r8Execution ? (
          <div
            ref={resultRegionRef}
            data-simulation-result
            tabIndex={-1}
            aria-label="試算結果"
            className="scroll-mt-24 space-y-5"
          >
            <SummaryConclusionSection conclusion={r8Execution.conclusion} />
            <R8SimulationResultSection result={r8Execution} />
            <SimulationWarningsSection warnings={r8Execution.warnings} />
            <section className="rounded-lg border border-[#eadfce] bg-white/86 p-4 sm:p-5">
              <h2 className="text-base font-bold text-[#33291f]">
                計算条件・注意書き
              </h2>
              <div className="mt-3">
                <R8SimulationAssumptionsSection />
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
