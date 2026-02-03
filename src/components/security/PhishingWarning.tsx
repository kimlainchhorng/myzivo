/**
 * Phishing Warning Component
 * Reusable anti-phishing alert for security-sensitive pages
 */

import { AlertTriangle, Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface PhishingWarningProps {
  variant?: "default" | "compact" | "inline";
  className?: string;
  showLearnMore?: boolean;
}

export default function PhishingWarning({ 
  variant = "default", 
  className,
  showLearnMore = true 
}: PhishingWarningProps) {
  if (variant === "inline") {
    return (
      <div className={cn(
        "flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400",
        className
      )}>
        <Shield className="w-3 h-3 shrink-0" />
        <span>ZIVO will never ask for your password or verification codes.</span>
        {showLearnMore && (
          <Link to="/security/scams" className="underline hover:no-underline">
            Learn more
          </Link>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn(
        "p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3",
        className
      )}>
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Beware of phishing.</strong> ZIVO will never ask for your password or codes.
          </p>
          {showLearnMore && (
            <Link 
              to="/security/scams" 
              className="text-xs text-amber-600 dark:text-amber-400 underline hover:no-underline inline-flex items-center gap-1 mt-1"
            >
              Learn to stay safe <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <Alert className={cn("border-amber-500/50 bg-amber-500/10", className)}>
      <AlertTriangle className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-600 dark:text-amber-400 font-bold">
        Beware of Phishing
      </AlertTitle>
      <AlertDescription className="text-amber-600/90 dark:text-amber-400/90">
        <strong>ZIVO will NEVER ask for your password, one-time codes, or full card numbers.</strong> 
        {" "}If anyone asks for these, it's a scam.
        {showLearnMore && (
          <>
            {" "}
            <Link 
              to="/security/scams" 
              className="underline hover:no-underline inline-flex items-center gap-1"
            >
              Learn how to stay safe <ExternalLink className="w-3 h-3" />
            </Link>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
