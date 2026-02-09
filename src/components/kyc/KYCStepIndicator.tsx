/**
 * KYC Step Indicator Component
 * Shows progress through multi-step KYC wizard
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KYCStep } from "@/lib/kyc";

interface KYCStepIndicatorProps {
  steps: KYCStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function KYCStepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  orientation = "horizontal",
  className,
}: KYCStepIndicatorProps) {
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: number) => stepId === currentStep;
  const isStepAccessible = (stepId: number) => 
    stepId <= currentStep || completedSteps.includes(stepId);

  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step.id);
          const isCurrent = isStepCurrent(step.id);
          const isAccessible = isStepAccessible(step.id);

          return (
            <button
              key={step.id}
              onClick={() => isAccessible && onStepClick?.(step.id)}
              disabled={!isAccessible}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                isAccessible && "hover:bg-muted/50 cursor-pointer",
                isCurrent && "bg-primary/10 border border-primary/30",
                !isAccessible && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium transition-colors",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  isCurrent && "text-primary",
                  !isCurrent && "text-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step.id);
          const isCurrent = isStepCurrent(step.id);
          const isAccessible = isStepAccessible(step.id);

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isAccessible && onStepClick?.(step.id)}
                disabled={!isAccessible}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all",
                  isAccessible && "cursor-pointer",
                  !isAccessible && "cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && !isCompleted && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium text-center max-w-[80px] hidden sm:block",
                  isCurrent && "text-primary",
                  !isCurrent && isCompleted && "text-green-600",
                  !isCurrent && !isCompleted && "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <div
                    className={cn(
                      "h-full transition-colors",
                      isCompleted ? "bg-green-500" : "bg-muted"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current step info (mobile) */}
      <div className="mt-4 text-center sm:hidden">
        <p className="font-medium text-sm">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}

export default KYCStepIndicator;
