/**
 * Mobile Booking Stepper
 * Compact step indicator for booking flow
 */
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  shortLabel?: string;
}

interface MobileBookingStepperProps {
  steps?: Step[];
  currentStep: number;
  variant?: "flights" | "hotels" | "cars" | "default";
}

const defaultSteps: Step[] = [
  { id: "search", label: "Search", shortLabel: "1" },
  { id: "choose", label: "Choose", shortLabel: "2" },
  { id: "checkout", label: "Checkout", shortLabel: "3" },
];

const MobileBookingStepper = ({
  steps = defaultSteps,
  currentStep,
  variant = "default",
}: MobileBookingStepperProps) => {
  const variantColors = {
    flights: "bg-flights text-white",
    hotels: "bg-hotels text-white",
    cars: "bg-cars text-white",
    default: "bg-primary text-primary-foreground",
  };

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-muted/30 lg:hidden">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                isCompleted && variantColors[variant],
                isCurrent && "ring-2 ring-offset-2 ring-offset-background " + variantColors[variant],
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Step Label (mobile: only show current) */}
            {isCurrent && (
              <span className="ml-2 text-sm font-semibold">{step.label}</span>
            )}

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-2",
                  isCompleted ? variantColors[variant] : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MobileBookingStepper;
