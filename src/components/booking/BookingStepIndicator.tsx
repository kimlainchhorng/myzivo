// CSS animations used instead of framer-motion for performance
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface BookingStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  accentColor?: "primary" | "eats" | "sky" | "amber" | "rides";
  variant?: "default" | "compact" | "vertical";
  onStepClick?: (stepIndex: number) => void;
}

const colorClasses = {
  primary: {
    active: "bg-gradient-to-br from-primary to-teal-400 text-white shadow-lg shadow-primary/40",
    completed: "bg-gradient-to-br from-primary to-teal-400 text-white shadow-md shadow-primary/30",
    upcoming: "bg-muted text-muted-foreground border-2 border-border",
    line: "bg-gradient-to-r from-primary to-teal-400",
    lineInactive: "bg-border",
    glow: "shadow-primary/30",
  },
  eats: {
    active: "bg-gradient-to-br from-eats to-orange-500 text-white shadow-lg shadow-eats/40",
    completed: "bg-gradient-to-br from-eats to-orange-500 text-white shadow-md shadow-eats/30",
    upcoming: "bg-muted text-muted-foreground border-2 border-border",
    line: "bg-gradient-to-r from-eats to-orange-500",
    lineInactive: "bg-border",
    glow: "shadow-eats/30",
  },
  sky: {
    active: "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/40",
    completed: "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30",
    upcoming: "bg-muted text-muted-foreground border-2 border-border",
    line: "bg-gradient-to-r from-sky-500 to-blue-600",
    lineInactive: "bg-border",
    glow: "shadow-sky-500/30",
  },
  amber: {
    active: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40",
    completed: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30",
    upcoming: "bg-muted text-muted-foreground border-2 border-border",
    line: "bg-gradient-to-r from-amber-500 to-orange-500",
    lineInactive: "bg-border",
    glow: "shadow-amber-500/30",
  },
  rides: {
    active: "bg-gradient-to-br from-rides to-green-400 text-white shadow-lg shadow-rides/40",
    completed: "bg-gradient-to-br from-rides to-green-400 text-white shadow-md shadow-rides/30",
    upcoming: "bg-muted text-muted-foreground border-2 border-border",
    line: "bg-gradient-to-r from-rides to-green-400",
    lineInactive: "bg-border",
    glow: "shadow-rides/30",
  },
};

export const BookingStepIndicator = ({
  steps,
  currentStep,
  accentColor = "primary",
  variant = "default",
  onStepClick,
}: BookingStepIndicatorProps) => {
  const colors = colorClasses[accentColor];

  if (variant === "vertical") {
    return (
      <div className="flex flex-col gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-4 p-3 rounded-xl transition-all animate-in fade-in slide-in-from-left-4 duration-300",
                isClickable && "cursor-pointer hover:bg-muted/50",
                isActive && "bg-muted/30"
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isCompleted && colors.completed,
                    isActive && cn(colors.active, "scale-110"),
                    !isCompleted && !isActive && colors.upcoming
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 animate-in zoom-in duration-200" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-8 mt-2 rounded-full transition-colors duration-300",
                    index < currentStep ? colors.line : colors.lineInactive
                  )} />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className={cn(
                  "font-semibold text-sm transition-colors",
                  (isActive || isCompleted) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                )}
              </div>
              {isCompleted && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-xl">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm",
                isActive && "bg-background shadow-md scale-100",
                !isActive && "scale-95",
                isCompleted && "text-foreground",
                !isCompleted && !isActive && "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200",
                isCompleted && "bg-emerald-500 text-white",
                isActive && colors.active.replace("shadow-lg", "").replace("shadow-md", ""),
                !isCompleted && !isActive && "bg-muted"
              )}>
                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
              </div>
              <span className={cn("hidden sm:inline font-medium", isActive && "font-semibold")}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Default variant
  const progressWidth = Math.min((currentStep / (steps.length - 1)) * 100, 100);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-6 right-6 top-6 h-1 bg-muted rounded-full" />
        
        {/* Progress line - CSS transition instead of framer-motion */}
        <div
          className={cn("absolute left-6 top-6 h-1 rounded-full transition-all duration-500 ease-out", colors.line)}
          style={{ width: `calc(${progressWidth}% - 24px)` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center relative z-10",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                  isCompleted && colors.completed,
                  isActive && cn(colors.active, "scale-115 ring-4 ring-offset-2 ring-offset-background", colors.glow),
                  !isCompleted && !isActive && colors.upcoming
                )}
              >
                {isCompleted ? (
                  <div className="animate-in zoom-in spin-in-180 duration-300">
                    <Check className="w-6 h-6" />
                  </div>
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-base font-bold">{index + 1}</span>
                )}
              </div>
              <div className="mt-3 text-center">
                <span
                  className={cn(
                    "text-sm font-semibold transition-colors block",
                    isActive || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-xs text-muted-foreground hidden sm:block mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepIndicator;
