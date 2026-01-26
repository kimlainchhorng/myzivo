import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Step {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface BookingStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  accentColor?: "primary" | "eats" | "sky" | "amber" | "rides";
}

const colorClasses = {
  primary: {
    active: "bg-primary text-primary-foreground border-primary",
    completed: "bg-primary text-primary-foreground border-primary",
    upcoming: "bg-muted text-muted-foreground border-border",
    line: "bg-primary",
    lineInactive: "bg-border",
  },
  eats: {
    active: "bg-eats text-secondary-foreground border-eats",
    completed: "bg-eats text-secondary-foreground border-eats",
    upcoming: "bg-muted text-muted-foreground border-border",
    line: "bg-eats",
    lineInactive: "bg-border",
  },
  sky: {
    active: "bg-sky-500 text-white border-sky-500",
    completed: "bg-sky-500 text-white border-sky-500",
    upcoming: "bg-muted text-muted-foreground border-border",
    line: "bg-sky-500",
    lineInactive: "bg-border",
  },
  amber: {
    active: "bg-amber-500 text-white border-amber-500",
    completed: "bg-amber-500 text-white border-amber-500",
    upcoming: "bg-muted text-muted-foreground border-border",
    line: "bg-amber-500",
    lineInactive: "bg-border",
  },
  rides: {
    active: "bg-rides text-primary-foreground border-rides",
    completed: "bg-rides text-primary-foreground border-rides",
    upcoming: "bg-muted text-muted-foreground border-border",
    line: "bg-rides",
    lineInactive: "bg-border",
  },
};

export const BookingStepIndicator = ({
  steps,
  currentStep,
  accentColor = "primary",
}: BookingStepIndicatorProps) => {
  const colors = colorClasses[accentColor];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" />
        
        {/* Progress line */}
        <motion.div
          className={cn("absolute left-0 top-5 h-0.5", colors.line)}
          initial={{ width: "0%" }}
          animate={{
            width: `${Math.min((currentStep / (steps.length - 1)) * 100, 100)}%`,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-200",
                  isCompleted && colors.completed,
                  isActive && colors.active,
                  !isCompleted && !isActive && colors.upcoming
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium transition-colors",
                  isActive || isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepIndicator;
