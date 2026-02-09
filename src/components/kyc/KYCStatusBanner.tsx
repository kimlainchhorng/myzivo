/**
 * KYC Status Banner Component
 * Full-width banner showing KYC status with CTA
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { KYCRole, KYCStatus } from "@/lib/kyc";

interface KYCStatusBannerProps {
  status: KYCStatus | "not_started";
  role: KYCRole;
  rejectionReason?: string | null;
  infoRequestMessage?: string | null;
  onStartClick?: () => void;
  className?: string;
}

interface StatusConfigItem {
  icon: typeof Shield;
  title: string;
  description: string;
  bgClass: string;
  iconClass: string;
  showCTA: boolean;
  ctaText?: string;
}

const statusConfig: Record<KYCStatus | "not_started", StatusConfigItem> = {
  not_started: {
    icon: Shield,
    title: "Verification Required",
    description: "Complete your verification to unlock all features",
    bgClass: "bg-amber-500/10 border-amber-500/30",
    iconClass: "text-amber-500",
    showCTA: true,
    ctaText: "Start Verification",
  },
  draft: {
    icon: Shield,
    title: "Verification In Progress",
    description: "Continue where you left off to complete verification",
    bgClass: "bg-blue-500/10 border-blue-500/30",
    iconClass: "text-blue-500",
    showCTA: true,
    ctaText: "Continue",
  },
  submitted: {
    icon: Clock,
    title: "Verification Pending",
    description: "Your documents are being reviewed. This usually takes 1-2 business days.",
    bgClass: "bg-amber-500/10 border-amber-500/30",
    iconClass: "text-amber-500",
    showCTA: false,
  },
  under_review: {
    icon: Clock,
    title: "Under Review",
    description: "An admin is currently reviewing your submission.",
    bgClass: "bg-blue-500/10 border-blue-500/30",
    iconClass: "text-blue-500",
    showCTA: false,
  },
  approved: {
    icon: CheckCircle,
    title: "Verified",
    description: "Your account is verified and all features are unlocked.",
    bgClass: "bg-green-500/10 border-green-500/30",
    iconClass: "text-green-500",
    showCTA: false,
  },
  rejected: {
    icon: XCircle,
    title: "Verification Rejected",
    description: "Your verification was not approved.",
    bgClass: "bg-destructive/10 border-destructive/30",
    iconClass: "text-destructive",
    showCTA: true,
    ctaText: "Resubmit",
  },
  needs_info: {
    icon: AlertTriangle,
    title: "More Information Needed",
    description: "Please provide the requested information to continue.",
    bgClass: "bg-orange-500/10 border-orange-500/30",
    iconClass: "text-orange-500",
    showCTA: true,
    ctaText: "Provide Info",
  },
};

export function KYCStatusBanner({
  status,
  role,
  rejectionReason,
  infoRequestMessage,
  onStartClick,
  className,
}: KYCStatusBannerProps) {
  const navigate = useNavigate();
  const config = statusConfig[status];
  const Icon = config.icon;

  const handleClick = () => {
    if (onStartClick) {
      onStartClick();
    } else {
      navigate(role === "driver" ? "/driver/kyc" : "/merchant/kyc");
    }
  };

  // Don't show banner for approved status in some contexts
  if (status === "approved") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-4",
        config.bgClass,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-full bg-background/50", config.iconClass)}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{config.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {status === "rejected" && rejectionReason 
              ? rejectionReason 
              : status === "needs_info" && infoRequestMessage 
              ? infoRequestMessage 
              : config.description}
          </p>
        </div>

        {config.showCTA && (
          <Button
            size="sm"
            onClick={handleClick}
            className="shrink-0"
          >
            {config.ctaText}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default KYCStatusBanner;
