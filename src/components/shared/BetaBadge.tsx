import { cn } from "@/lib/utils";

interface BetaBadgeProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function BetaBadge({ variant = "default", className }: BetaBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      "bg-primary/10 text-primary border border-primary/20",
      variant === "compact" && "px-1.5 py-0 text-[9px]",
      className
    )}>
      Beta
    </span>
  );
}
