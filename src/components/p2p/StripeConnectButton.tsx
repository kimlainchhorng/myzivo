/**
 * Stripe Connect Button
 * Button component for initiating owner Stripe Connect onboarding
 */

import { ExternalLink, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCreateStripeConnectLink,
  useCheckStripeConnectStatus,
  useRefreshStripeConnectStatus,
  getStripeConnectStatusBadge,
} from "@/hooks/useStripeConnect";

interface StripeConnectButtonProps {
  showStatus?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function StripeConnectButton({
  showStatus = true,
  variant = "default",
  size = "default",
  className = "",
}: StripeConnectButtonProps) {
  const { data: status, isLoading: statusLoading } = useCheckStripeConnectStatus();
  const createLink = useCreateStripeConnectLink();
  const refreshStatus = useRefreshStripeConnectStatus();

  const handleConnect = () => {
    createLink.mutate();
  };

  const handleRefresh = () => {
    refreshStatus.mutate();
  };

  const isLoading = createLink.isPending || statusLoading;
  const statusBadge = getStripeConnectStatusBadge(status);

  // Already fully connected
  if (status?.connected && status?.payouts_enabled && status?.charges_enabled) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showStatus && (
          <Badge className={statusBadge.className}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {statusBadge.label}
          </Badge>
        )}
        <Button
          variant="outline"
          size={size}
          onClick={handleRefresh}
          disabled={refreshStatus.isPending}
        >
          {refreshStatus.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="ml-2">Refresh Status</span>
        </Button>
      </div>
    );
  }

  // Connected but setup incomplete
  if (status?.connected && !status?.payouts_enabled) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {showStatus && (
          <div className="flex items-center gap-2">
            <Badge className={statusBadge.className}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {statusBadge.label}
            </Badge>
            {status.requirements && status.requirements.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {status.requirements.length} requirement(s) pending
              </span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant={variant}
            size={size}
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            Complete Setup
          </Button>
          <Button
            variant="outline"
            size={size}
            onClick={handleRefresh}
            disabled={refreshStatus.isPending}
          >
            {refreshStatus.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Not connected
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showStatus && (
        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
      )}
      <Button
        variant={variant}
        size={size}
        onClick={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <ExternalLink className="w-4 h-4 mr-2" />
        )}
        Connect Stripe Account
      </Button>
    </div>
  );
}
