/**
 * Fraud Prevention Notice Component
 * Displays fraud prevention messaging at checkout
 */

import { Shield, AlertTriangle, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FRAUD_PREVENTION_COPY } from "@/config/fraudPrevention";

interface FraudPreventionNoticeProps {
  variant?: "checkout" | "review" | "declined" | "3ds" | "verification_required";
  className?: string;
}

export function FraudPreventionNotice({
  variant = "checkout",
  className,
}: FraudPreventionNoticeProps) {
  const getContent = () => {
    switch (variant) {
      case "review":
        return {
          icon: Clock,
          title: "Booking Under Review",
          message: FRAUD_PREVENTION_COPY.manualReview,
          color: "text-amber-500",
          bg: "bg-amber-500/10 border-amber-500/30",
        };
      case "declined":
        return {
          icon: AlertTriangle,
          title: "Booking Could Not Be Processed",
          message: FRAUD_PREVENTION_COPY.declined,
          color: "text-red-500",
          bg: "bg-red-500/10 border-red-500/30",
        };
      case "3ds":
        return {
          icon: Lock,
          title: "Verification Required",
          message: FRAUD_PREVENTION_COPY.threeDsRequired,
          color: "text-blue-500",
          bg: "bg-blue-500/10 border-blue-500/30",
        };
      case "verification_required":
        return {
          icon: Shield,
          title: "Verification Required",
          message: FRAUD_PREVENTION_COPY.highRiskVerification,
          color: "text-amber-500",
          bg: "bg-amber-500/10 border-amber-500/30",
        };
      default:
        return {
          icon: Shield,
          title: "Secure Booking",
          message: FRAUD_PREVENTION_COPY.checkoutNotice,
          color: "text-muted-foreground",
          bg: "bg-muted/30 border-border/50",
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  if (variant === "checkout") {
    // Compact version for checkout footer
    return (
      <div className={cn(
        "flex items-center gap-2 text-[11px] text-muted-foreground",
        className
      )}>
        <Shield className="w-3 h-3 shrink-0" />
        <span>{content.message}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border",
      content.bg,
      className
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        variant === "review" && "bg-amber-500/20",
        variant === "declined" && "bg-red-500/20",
        variant === "3ds" && "bg-blue-500/20"
      )}>
        <Icon className={cn("w-5 h-5", content.color)} />
      </div>
      <div>
        <h4 className={cn("font-semibold mb-1", content.color)}>
          {content.title}
        </h4>
        <p className="text-sm text-muted-foreground">{content.message}</p>
      </div>
    </div>
  );
}

// Manual review status component
interface ReviewStatusProps {
  status: "pending" | "approved" | "declined";
  estimatedTime?: string;
  className?: string;
}

export function ReviewStatus({
  status,
  estimatedTime,
  className,
}: ReviewStatusProps) {
  const getStatusContent = () => {
    switch (status) {
      case "approved":
        return {
          icon: Shield,
          title: "Booking Approved",
          message: "Your booking has been verified and confirmed.",
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      case "declined":
        return {
          icon: AlertTriangle,
          title: "Booking Declined",
          message: "We were unable to verify this booking. Your payment has been refunded.",
          color: "text-red-500",
          bg: "bg-red-500/10",
        };
      default:
        return {
          icon: Clock,
          title: "Review In Progress",
          message: estimatedTime 
            ? `Expected completion: ${estimatedTime}` 
            : "We're reviewing your booking. You'll receive an email shortly.",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        };
    }
  };

  const content = getStatusContent();
  const Icon = content.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl",
      content.bg,
      className
    )}>
      <Icon className={cn("w-5 h-5 shrink-0", content.color)} />
      <div>
        <p className={cn("font-medium", content.color)}>{content.title}</p>
        <p className="text-sm text-muted-foreground">{content.message}</p>
      </div>
    </div>
  );
}

export default FraudPreventionNotice;
