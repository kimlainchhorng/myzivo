/**
 * Company Billing Badge
 * Shows "Billed to [Company Name]" indicator in order summary
 */
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyBillingBadgeProps {
  companyName: string;
  className?: string;
}

export function CompanyBillingBadge({ companyName, className }: CompanyBillingBadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20",
      className
    )}>
      <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="text-sm font-medium text-primary">
        Billed to {companyName}
      </span>
    </div>
  );
}
