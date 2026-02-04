import { ServerCrash, RefreshCw, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PartnerUnavailableProps {
  partnerName?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  isRetrying?: boolean;
  showContact?: boolean;
}

export default function PartnerUnavailable({
  partnerName = "Our travel partner",
  onRetry,
  onGoBack,
  isRetrying = false,
  showContact = true,
}: PartnerUnavailableProps) {
  return (
    <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
      <CardContent className="p-8 sm:p-12 text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
          <ServerCrash className="h-10 w-10 text-amber-500" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-display font-bold mb-3">
          Temporarily Unavailable
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {partnerName} is experiencing temporary issues. This usually resolves within a few minutes. 
          Please try again or check back shortly.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-gradient-to-r from-primary to-teal-400 text-white min-w-[140px]"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Retrying..." : "Try Again"}
            </Button>
          )}
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>

        {/* Suggestions */}
        <div className="bg-muted/30 rounded-xl p-5 max-w-md mx-auto text-left">
          <p className="font-semibold text-sm mb-3">While you wait, you can:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Try a different date or destination
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Check our other travel partners
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Set up a price alert to be notified when available
            </li>
          </ul>
        </div>

        {/* Contact Support */}
        {showContact && (
          <p className="text-xs text-muted-foreground mt-6">
            Need help?{" "}
            <a href="/help" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
