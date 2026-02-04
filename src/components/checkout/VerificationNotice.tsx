/**
 * Verification Notice
 * Shows when additional verification may be required for high-risk transactions
 */

import { cn } from "@/lib/utils";
import { Shield, Info } from "lucide-react";

interface VerificationNoticeProps {
  className?: string;
  variant?: "subtle" | "prominent";
}

const VerificationNotice = ({ 
  className, 
  variant = "subtle" 
}: VerificationNoticeProps) => {
  if (variant === "prominent") {
    return (
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30",
        className
      )}>
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-1">
            Security Verification
          </h4>
          <p className="text-sm text-muted-foreground">
            To protect your payment, we may request additional verification. 
            This helps prevent fraud and keeps your transaction secure.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-xs text-muted-foreground",
      className
    )}>
      <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
      <span>
        To protect users, some transactions may require verification.
      </span>
    </div>
  );
};

export default VerificationNotice;
