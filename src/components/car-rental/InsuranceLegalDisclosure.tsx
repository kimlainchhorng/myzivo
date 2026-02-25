/**
 * Insurance Legal Disclosure Component
 * Critical legal text for insurance/protection compliance
 */

import { AlertTriangle, Shield, Info, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface InsuranceLegalDisclosureProps {
  variant?: "full" | "compact" | "inline" | "checkout";
  className?: string;
}

const DISCLOSURE_TEXT = {
  main: "ZIVO does not provide insurance coverage. Protection plans are offered by licensed third-party providers. Coverage is subject to terms, conditions, and exclusions.",
  extended: "ZIVO acts as a facilitator between renters, vehicle owners, and insurance partners. ZIVO does not underwrite, guarantee, or assume any insurance risk. All claims are subject to review and approval by the insurance provider.",
  checkout: "By selecting a protection plan, you acknowledge that coverage is provided by our licensed insurance partner, not ZIVO. Review the full policy terms before completing your booking.",
  provider: "Protection plans are underwritten by licensed insurance partners. Policy details and coverage limits vary by state.",
};

export default function InsuranceLegalDisclosure({
  variant = "full",
  className,
}: InsuranceLegalDisclosureProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-start gap-2 text-xs text-muted-foreground", className)}>
        <Info className="w-3 h-3 mt-0.5 shrink-0" />
        <p>{DISCLOSURE_TEXT.main}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl", className)}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {DISCLOSURE_TEXT.main}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "checkout") {
    return (
      <Alert className={cn("border-amber-200 dark:border-amber-800/30", className)}>
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-300">
          Insurance Disclosure
        </AlertTitle>
        <AlertDescription className="text-sm text-amber-700 dark:text-amber-400 space-y-2">
          <p>{DISCLOSURE_TEXT.checkout}</p>
          <p className="text-xs">{DISCLOSURE_TEXT.provider}</p>
        </AlertDescription>
      </Alert>
    );
  }

  // Full variant
  return (
    <Card className={cn("bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30", className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          <h4 className="font-semibold text-amber-800 dark:text-amber-300">
            Important Insurance Disclosure
          </h4>
        </div>
        
        <div className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
          <p>{DISCLOSURE_TEXT.main}</p>
          <p>{DISCLOSURE_TEXT.extended}</p>
        </div>

        <div className="pt-2 border-t border-amber-200 dark:border-amber-800/30">
          <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {DISCLOSURE_TEXT.provider}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Export disclosure texts for use elsewhere
export const INSURANCE_DISCLOSURES = DISCLOSURE_TEXT;
