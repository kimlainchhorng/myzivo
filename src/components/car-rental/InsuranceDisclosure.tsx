/**
 * Insurance Disclosure Component
 * Legal disclosure about insurance responsibility
 */

import { AlertTriangle, Shield, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InsuranceDisclosureProps {
  variant?: "card" | "alert" | "inline";
  className?: string;
}

export default function InsuranceDisclosure({
  variant = "card",
  className,
}: InsuranceDisclosureProps) {
  const disclosureText =
    "Vehicle owners are responsible for maintaining required insurance coverage. ZIVO does not currently provide rental insurance coverage. Please verify your personal auto insurance policy covers peer-to-peer rentals.";

  if (variant === "alert") {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Insurance Disclosure</AlertTitle>
        <AlertDescription className="text-sm">
          {disclosureText}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-start gap-2 text-sm text-muted-foreground ${className}`}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>{disclosureText}</p>
      </div>
    );
  }

  return (
    <Card className={`bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
              Insurance Disclosure
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-400/80">
              {disclosureText}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
