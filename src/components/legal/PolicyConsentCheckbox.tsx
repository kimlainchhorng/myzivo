/**
 * Policy Consent Checkbox Component
 * Reusable consent checkbox with proper disclosure
 */

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Shield, Lock, ExternalLink } from "lucide-react";
import { PolicyType } from "@/types/legal";
import { cn } from "@/lib/utils";

interface PolicyConsentCheckboxProps {
  policyType: PolicyType;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

const POLICY_CONFIG: Record<PolicyType, {
  label: string;
  description: string;
  href: string;
  icon: typeof Shield;
  iconColor: string;
}> = {
  terms: {
    label: "I agree to the Terms of Service",
    description: "By checking, you agree to be bound by our Terms of Service.",
    href: "/legal/terms",
    icon: Shield,
    iconColor: "text-primary",
  },
  privacy: {
    label: "I agree to the Privacy Policy",
    description: "Your data will be handled according to our Privacy Policy.",
    href: "/legal/privacy",
    icon: Lock,
    iconColor: "text-emerald-500",
  },
  seller_of_travel: {
    label: "I acknowledge the Seller of Travel disclosure",
    description: "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.",
    href: "/legal/seller-of-travel",
    icon: ExternalLink,
    iconColor: "text-amber-500",
  },
  transportation: {
    label: "I acknowledge the Transportation Network disclaimer",
    description: "Drivers are independent contractors, not ZIVO employees.",
    href: "/legal/transportation-disclaimer",
    icon: Shield,
    iconColor: "text-blue-500",
  },
  car_rental: {
    label: "I acknowledge the Car Rental Marketplace disclaimer",
    description: "Vehicle owners are independent providers responsible for their vehicles.",
    href: "/legal/car-rental-disclaimer",
    icon: Shield,
    iconColor: "text-violet-500",
  },
  insurance: {
    label: "I acknowledge the Insurance disclosure",
    description: "Protection plans are provided by third-party insurers, not ZIVO.",
    href: "/legal/insurance-disclosure",
    icon: Shield,
    iconColor: "text-amber-500",
  },
  refunds: {
    label: "I acknowledge the Refund Policy",
    description: "Refund eligibility varies by service and provider.",
    href: "/legal/refunds",
    icon: Shield,
    iconColor: "text-muted-foreground",
  },
};

export default function PolicyConsentCheckbox({
  policyType,
  checked,
  onCheckedChange,
  disabled = false,
  variant = 'default',
  className,
}: PolicyConsentCheckboxProps) {
  const config = POLICY_CONFIG[policyType];
  const Icon = config.icon;

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <Checkbox
          id={`consent-${policyType}`}
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          disabled={disabled}
          className="mt-0.5"
        />
        <Label 
          htmlFor={`consent-${policyType}`} 
          className="text-sm leading-tight cursor-pointer"
        >
          {config.label}{" "}
          <Link 
            to={config.href} 
            className="text-primary hover:underline"
            target="_blank"
          >
            View
          </Link>
        </Label>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border border-border bg-muted/30 p-4 space-y-3",
      className
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={`consent-${policyType}`}
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          disabled={disabled}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label 
            htmlFor={`consent-${policyType}`} 
            className="text-sm font-medium leading-tight cursor-pointer flex items-center gap-2"
          >
            <Icon className={cn("w-4 h-4", config.iconColor)} />
            {config.label} *
          </Label>
          <p className="text-xs text-muted-foreground">
            {config.description}{" "}
            <Link 
              to={config.href} 
              className="text-primary hover:underline"
              target="_blank"
            >
              Read full policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
