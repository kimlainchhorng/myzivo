import { Globe, Ticket, Info, Users, Check, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Search", icon: Globe },
  { label: "Results", icon: Ticket },
  { label: "Review", icon: Info },
  { label: "Travelers", icon: Users },
  { label: "Checkout", icon: CreditCard },
];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full overflow-x-auto py-3 px-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[52px]">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2",
                isDone && "bg-[hsl(var(--flights))] border-[hsl(var(--flights))] text-white",
                isActive && "bg-[hsl(var(--flights))]/15 border-[hsl(var(--flights))] text-[hsl(var(--flights))]",
                !isDone && !isActive && "bg-muted border-border/40 text-muted-foreground"
              )}>
                {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
              </div>
              <span className={cn(
                "text-[9px] font-semibold",
                isActive ? "text-[hsl(var(--flights))]" : isDone ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "w-6 sm:w-8 h-[2px] rounded-full -mt-3",
                i < current ? "bg-[hsl(var(--flights))]" : "bg-border/40"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
