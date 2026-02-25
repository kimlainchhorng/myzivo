/**
 * Email Consent Checkbox Component
 * 
 * Reusable consent checkbox with proper disclosure language
 */

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Mail, Shield } from "lucide-react";

interface EmailConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

export default function EmailConsentCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
  variant = 'default',
}: EmailConsentCheckboxProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-3">
        <Checkbox
          id="email-consent"
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          disabled={disabled}
        />
        <Label htmlFor="email-consent" className="text-sm leading-tight cursor-pointer">
          I agree to share my information with the booking partner.{" "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
        </Label>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id="email-consent"
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          disabled={disabled}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label 
            htmlFor="email-consent" 
            className="text-sm font-medium leading-tight cursor-pointer flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-primary" />
            I agree to share my information with the booking partner.
          </Label>
          <p className="text-xs text-muted-foreground">
            We'll send you booking confirmations and trip reminders. Your details will be shared 
            securely with our travel partner to complete your booking.{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            {" "}·{" "}
            <Link to="/partner-disclosure" className="text-primary hover:underline">Partner Disclosure</Link>
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 rounded-xl p-2">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Your email is never sold or used for unrelated marketing</span>
      </div>
    </div>
  );
}
