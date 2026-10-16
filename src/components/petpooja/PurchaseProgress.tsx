import React from "react";

export type PurchaseStep = 1 | 2 | 3 | 4;

interface PurchaseProgressProps {
  currentStep: PurchaseStep;
  completedSteps: number[];
  onStepClick?: (step: PurchaseStep) => void;
}

const steps = [
  {
    id: 1,
    title: "Review Items",
    description: "Check invoice",
  },
  {
    id: 2,
    title: "Product Mapping",
    description: "Map products",
  },
  {
    id: 3,
    title: "Purchase Review",
    description: "Review changes",
  },
  {
    id: 4,
    title: "Create Bill",
    description: "Submit purchase",
  },
];

export default function PurchaseProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: PurchaseProgressProps) {
  return (
    <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const completed = completedSteps.includes(step.id);
          const active = currentStep === step.id;

          const clickable =
            completed || step.id <= currentStep;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => {
                  if (clickable) {
                    onStepClick?.(
                      step.id as PurchaseStep
                    );
                  }
                }}
                className="group flex min-w-0 flex-1 flex-col items-center"
              >
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition",
                    completed
                      ? "bg-green-500 text-white"
                      : active
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-400",
                  ].join(" ")}
                >
                  {completed ? "✓" : step.id}
                </div>

                <div className="mt-2 text-center">
                  <p
                    className={[
                      "text-xs font-semibold sm:text-sm",
                      active || completed
                        ? "text-slate-900"
                        : "text-slate-400",
                    ].join(" ")}
                  >
                    {step.title}
                  </p>

                  <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                    {step.description}
                  </p>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div className="mt-4 h-0.5 flex-1 bg-slate-100">
                  <div
                    className={[
                      "h-full transition-all",
                      completed
                        ? "w-full bg-green-500"
                        : "w-0",
                    ].join(" ")}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}