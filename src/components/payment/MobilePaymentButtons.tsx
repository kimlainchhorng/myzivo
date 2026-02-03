/**
 * Mobile Payment Buttons
 * Apple Pay and Google Pay support for native apps
 */
import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MobilePaymentButtonsProps {
  amount: number;
  currency?: string;
  onApplePayClick?: () => Promise<void>;
  onGooglePayClick?: () => Promise<void>;
  onStripeClick?: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

// Apple Pay icon SVG
const ApplePayIcon = () => (
  <svg viewBox="0 0 165.5 105.4" className="h-5 w-auto">
    <path fill="currentColor" d="M150.7 0H14.8C6.6 0 0 6.6 0 14.8v75.8c0 8.2 6.6 14.8 14.8 14.8h135.9c8.2 0 14.8-6.6 14.8-14.8V14.8c0-8.2-6.6-14.8-14.8-14.8zM34.1 41.8c1.5-1.9 2.5-4.4 2.2-7-.1-.1-.2-.1-.2-.1-2.3.1-5.1 1.5-6.7 3.5-1.4 1.7-2.7 4.4-2.4 7 2.6.2 5.2-1.4 7.1-3.4zm17.5 31.7c-.1 0-.1 0 0 0-3.1-.1-5.8-1.8-7.3-1.8-1.5 0-3.9 1.7-6.4 1.7h-.1c-4.8-.1-9.2-4.1-9.2-11.3 0-6.6 4.3-10.6 8.6-10.6h.1c1.9.1 4.2 1.2 5.5 1.2 1.2 0 3.4-1.4 6.2-1.4h.1c3.2.1 6.2 1.5 7.9 4-3.2 2-5.4 5.3-5.4 9.4 0 4.5 2.6 8 6.5 9.5-.9 2.2-2.4 5.6-4.9 8.7-2.2 2.8-4.5 5.6-8.1 5.6h-.1c-2-.1-3.4-1-5.2-1.5-1.7.5-3.3 1.5-5.3 1.5h-.1c-4.3-.1-7.5-4.9-10.7-10.1-3.5-5.7-6.3-14.3-6.3-22.4 0-13.2 8.6-20.2 17-20.2h.1c3.4.1 6.2 1.6 8.3 1.6 2 0 5-1.7 8.9-1.7h.1c1.4 0 6.5.1 9.9 4.9-2.5 1.7-5.9 5-5.9 10.4 0 6.2 4 10 6 11.4-1.6 4.7-3.9 9-6.2 12.1zm40.7-1.1h-5.4l-9.5-29.9h5l7.2 24.1 7.2-24.1h4.9l-9.4 29.9zm23.4.3c-5.7 0-9.4-3.3-9.4-8.4V55h5v8.9c0 3 1.8 4.9 4.7 4.9 2.9 0 4.7-1.9 4.7-4.9V55h5v8.9c0 5.1-3.7 8.4-10 8.4zm30.3-.3h-5v-3c-1.3 2.1-3.5 3.4-6.4 3.4-4.5 0-8.1-3.5-8.1-8.4s3.6-8.4 8.1-8.4c2.9 0 5.1 1.3 6.4 3.4v-3h5v16zm-5-8c0-2.6-1.9-4.4-4.5-4.4s-4.5 1.8-4.5 4.4 1.9 4.4 4.5 4.4 4.5-1.8 4.5-4.4z"/>
  </svg>
);

// Google Pay icon SVG
const GooglePayIcon = () => (
  <svg viewBox="0 0 41 17" className="h-4 w-auto">
    <path fill="#5F6368" d="M19.5 8.4v4.9h-1.6V1.7h4.2c1 0 1.9.4 2.6 1 .7.6 1.1 1.5 1.1 2.5s-.4 1.9-1.1 2.5c-.7.7-1.6 1-2.6 1h-2.6v-.3zm0-5.3v4h2.7c.6 0 1.2-.2 1.6-.6.4-.4.7-.9.7-1.4 0-.5-.2-1-.6-1.4-.4-.4-1-.6-1.6-.6h-2.8z"/>
    <path fill="#5F6368" d="M28.3 5.2c1.2 0 2.1.3 2.8 1 .7.6 1 1.5 1 2.6v5.4h-1.5v-1.2c-.5.9-1.4 1.4-2.6 1.4-.9 0-1.7-.3-2.3-.8-.6-.5-.9-1.1-.9-1.9 0-.8.3-1.5.9-2 .6-.5 1.4-.7 2.5-.7.9 0 1.6.2 2.2.5v-.4c0-.5-.2-1-.6-1.3-.4-.3-.9-.5-1.5-.5-.9 0-1.6.4-2 1.1l-1.3-.8c.6-1 1.7-1.4 3.3-1.4zm-1.9 6.3c0 .4.2.7.5.9.3.2.7.3 1.1.3.6 0 1.2-.2 1.7-.7.5-.5.7-1 .7-1.6-.5-.4-1.1-.5-2-.5-.6 0-1.1.1-1.5.4-.3.3-.5.7-.5 1.2z"/>
    <path fill="#5F6368" d="M41 5.4l-4.9 11.3h-1.6l1.8-4L33 5.4h1.7l2.5 5.8 2.4-5.8H41z"/>
    <path fill="#4285F4" d="M13.2 7.3c0-.5 0-.9-.1-1.4H6.8v2.7h3.6c-.2.9-.7 1.6-1.4 2.1v1.7h2.3c1.3-1.2 2-3 2-5.1z"/>
    <path fill="#34A853" d="M6.8 14c1.9 0 3.5-.6 4.7-1.7l-2.3-1.7c-.6.4-1.4.7-2.4.7-1.8 0-3.4-1.2-4-2.9H.5v1.8C1.7 12.5 4 14 6.8 14z"/>
    <path fill="#FBBC04" d="M2.8 8.4c-.1-.4-.2-.8-.2-1.3s.1-.9.2-1.3V4H.5C.2 4.7 0 5.5 0 6.4s.2 1.7.5 2.4l2.3-1.8z"/>
    <path fill="#EA4335" d="M6.8 2.4c1 0 1.9.4 2.7 1.1l2-2C10.2.6 8.6 0 6.8 0 4 0 1.7 1.5.5 3.8l2.3 1.8c.6-1.7 2.2-2.8 4-2.8z"/>
  </svg>
);

const MobilePaymentButtons = ({
  amount,
  currency = "USD",
  onApplePayClick,
  onGooglePayClick,
  onStripeClick,
  disabled = false,
  className,
}: MobilePaymentButtonsProps) => {
  const [platform, setPlatform] = useState<"ios" | "android" | "web">("web");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const currentPlatform = Capacitor.getPlatform();
    if (currentPlatform === "ios") {
      setPlatform("ios");
    } else if (currentPlatform === "android") {
      setPlatform("android");
    } else {
      setPlatform("web");
    }
  }, []);

  const handlePaymentClick = async (paymentFn?: () => Promise<void>) => {
    if (!paymentFn || disabled) return;
    
    setIsProcessing(true);
    try {
      await paymentFn();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Apple Pay (iOS only) */}
      {platform === "ios" && onApplePayClick && (
        <Button
          onClick={() => handlePaymentClick(onApplePayClick)}
          disabled={disabled || isProcessing}
          className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-medium"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <ApplePayIcon />
              <span className="ml-2">Pay {formattedAmount}</span>
            </>
          )}
        </Button>
      )}

      {/* Google Pay (Android only) */}
      {platform === "android" && onGooglePayClick && (
        <Button
          onClick={() => handlePaymentClick(onGooglePayClick)}
          disabled={disabled || isProcessing}
          className="w-full h-12 bg-white hover:bg-gray-50 text-black border border-gray-300 rounded-xl font-medium"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <GooglePayIcon />
              <span className="ml-2">Pay {formattedAmount}</span>
            </>
          )}
        </Button>
      )}

      {/* Stripe (fallback for all platforms) */}
      {onStripeClick && (
        <Button
          onClick={() => handlePaymentClick(onStripeClick)}
          disabled={disabled || isProcessing}
          variant={platform === "web" ? "default" : "outline"}
          className={cn(
            "w-full h-12 rounded-xl font-medium",
            platform !== "web" && "mt-2"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {platform === "web" ? (
                <span>Pay {formattedAmount}</span>
              ) : (
                <span>Pay with Card</span>
              )}
            </>
          )}
        </Button>
      )}

      {/* Divider for native platforms */}
      {platform !== "web" && onStripeClick && (onApplePayClick || onGooglePayClick) && (
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-background text-muted-foreground">or</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePaymentButtons;
