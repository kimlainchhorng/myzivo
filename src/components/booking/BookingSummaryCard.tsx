import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceItem {
  label: string;
  amount: number;
  isDiscount?: boolean;
  isTotal?: boolean;
}

interface BookingSummaryCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  items: PriceItem[];
  ctaLabel: string;
  onConfirm: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  accentColor?: "primary" | "eats" | "sky" | "amber" | "rides";
  features?: string[];
  estimatedTime?: string;
}

const colorClasses = {
  primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
  eats: "bg-eats hover:bg-eats/90 text-secondary-foreground",
  sky: "bg-sky-500 hover:bg-sky-600 text-white",
  amber: "bg-amber-500 hover:bg-amber-600 text-white",
  rides: "bg-rides hover:bg-rides/90 text-primary-foreground",
};

const borderColors = {
  primary: "border-primary/30",
  eats: "border-eats/30",
  sky: "border-sky-500/30",
  amber: "border-amber-500/30",
  rides: "border-rides/30",
};

export const BookingSummaryCard = ({
  title,
  subtitle,
  icon,
  items,
  ctaLabel,
  onConfirm,
  isLoading = false,
  disabled = false,
  accentColor = "primary",
  features,
  estimatedTime,
}: BookingSummaryCardProps) => {
  const total = items.find((item) => item.isTotal);
  const lineItems = items.filter((item) => !item.isTotal);

  return (
    <Card className={cn("glass-card", borderColors[accentColor])}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                accentColor === "eats" && "bg-eats/20 text-eats",
                accentColor === "sky" && "bg-sky-500/20 text-sky-400",
                accentColor === "amber" && "bg-amber-500/20 text-amber-400",
                accentColor === "rides" && "bg-rides/20 text-rides",
                accentColor === "primary" && "bg-primary/20 text-primary"
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Line Items */}
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span
                className={cn(
                  item.isDiscount && "text-green-500",
                  !item.isDiscount && "font-medium"
                )}
              >
                {item.isDiscount && "-"}${Math.abs(item.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        {total && (
          <div className="flex items-center justify-between">
            <span className="font-semibold">{total.label}</span>
            <span className="text-2xl font-bold">${total.amount.toFixed(2)}</span>
          </div>
        )}

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{estimatedTime}</span>
          </div>
        )}

        {/* Features */}
        {features && features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <Button
          className={cn("w-full h-12", colorClasses[accentColor])}
          onClick={onConfirm}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            ctaLabel
          )}
        </Button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>SSL Encrypted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSummaryCard;
