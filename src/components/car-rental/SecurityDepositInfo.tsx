/**
 * Security Deposit Information Component
 * Displays deposit amount and status
 */

import { Shield, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DepositStatus = "not_required" | "authorized" | "captured" | "released" | "partially_captured";

interface SecurityDepositInfoProps {
  amount: number;
  status: DepositStatus;
  capturedAmount?: number;
  variant?: "card" | "inline" | "compact";
  className?: string;
}

const statusConfig: Record<DepositStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  not_required: {
    label: "Not Required",
    icon: CheckCircle,
    color: "text-muted-foreground",
  },
  authorized: {
    label: "Hold Placed",
    icon: Clock,
    color: "text-amber-500",
  },
  captured: {
    label: "Captured",
    icon: AlertCircle,
    color: "text-red-500",
  },
  released: {
    label: "Released",
    icon: CheckCircle,
    color: "text-emerald-500",
  },
  partially_captured: {
    label: "Partial Deduction",
    icon: DollarSign,
    color: "text-orange-500",
  },
};

export default function SecurityDepositInfo({
  amount,
  status,
  capturedAmount = 0,
  variant = "card",
  className,
}: SecurityDepositInfoProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Shield className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">
          ${amount.toFixed(2)} deposit
        </span>
        <Badge variant="secondary" className={cn("text-xs", config.color)}>
          {config.label}
        </Badge>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center justify-between p-3 bg-muted/30 rounded-lg", className)}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Security Deposit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">${amount.toFixed(2)}</span>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-5 h-5 text-primary" />
          Security Deposit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Deposit Amount</span>
          <span className="text-xl font-bold">${amount.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="outline" className={cn("gap-1", config.color)}>
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>

        {status === "partially_captured" && capturedAmount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount Deducted</span>
            <span className="font-medium text-red-500">-${capturedAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="pt-2 border-t text-xs text-muted-foreground">
          {status === "authorized" && (
            <p>A temporary hold has been placed. This will be released after a successful rental.</p>
          )}
          {status === "released" && (
            <p>The deposit hold has been released. No charges were applied.</p>
          )}
          {status === "captured" && (
            <p>The deposit was captured due to damage or policy violation.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
