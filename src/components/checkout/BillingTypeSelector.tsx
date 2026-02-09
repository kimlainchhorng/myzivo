/**
 * Billing Type Selector
 * Toggle between Personal and Company billing for business account members
 */
import { CreditCard, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessMembership } from "@/hooks/useBusinessMembership";

interface BillingTypeSelectorProps {
  membership: BusinessMembership;
  selected: "personal" | "company";
  onSelect: (type: "personal" | "company") => void;
  disabled?: boolean;
  className?: string;
}

export function BillingTypeSelector({
  membership,
  selected,
  onSelect,
  disabled = false,
  className,
}: BillingTypeSelectorProps) {
  // Don't render if user is not a company member
  if (!membership.isMember || !membership.company) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-muted-foreground">Bill this order to</p>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Personal Option */}
        <button
          type="button"
          onClick={() => !disabled && onSelect("personal")}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            selected === "personal"
              ? "bg-primary/5 border-primary"
              : "bg-muted/30 border-border hover:border-muted-foreground/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            selected === "personal" ? "bg-primary/10" : "bg-muted"
          )}>
            <CreditCard className={cn(
              "w-5 h-5",
              selected === "personal" ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div className="text-center">
            <p className={cn(
              "font-medium text-sm",
              selected === "personal" ? "text-primary" : "text-foreground"
            )}>
              Personal
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">My payment</p>
          </div>
          
          {selected === "personal" && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </button>

        {/* Company Option */}
        <button
          type="button"
          onClick={() => !disabled && onSelect("company")}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            selected === "company"
              ? "bg-primary/5 border-primary"
              : "bg-muted/30 border-border hover:border-muted-foreground/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            selected === "company" ? "bg-primary/10" : "bg-muted"
          )}>
            <Building2 className={cn(
              "w-5 h-5",
              selected === "company" ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div className="text-center">
            <p className={cn(
              "font-medium text-sm",
              selected === "company" ? "text-primary" : "text-foreground"
            )}>
              Company
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[100px]">
              {membership.company.name}
            </p>
          </div>
          
          {selected === "company" && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
