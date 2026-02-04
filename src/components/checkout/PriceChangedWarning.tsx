import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PriceChangedWarningProps {
  originalPrice: number;
  newPrice: number;
  currency?: string;
  onAccept: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PriceChangedWarning({
  originalPrice,
  newPrice,
  currency = "USD",
  onAccept,
  onCancel,
  isLoading = false,
}: PriceChangedWarningProps) {
  const priceDiff = newPrice - originalPrice;
  const percentChange = ((priceDiff / originalPrice) * 100).toFixed(1);
  const isIncrease = priceDiff > 0;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <Card className="border-2 border-amber-500/50 bg-amber-500/5 overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">Price Has Changed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The price for this booking has {isIncrease ? "increased" : "decreased"} since you started checkout.
              Prices may change until ticketing is completed.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Original Price</p>
                <p className="font-semibold line-through text-muted-foreground">
                  {formatPrice(originalPrice)}
                </p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div>
                <p className="text-xs text-muted-foreground">New Price</p>
                <p className={`font-bold text-xl ${isIncrease ? "text-destructive" : "text-emerald-500"}`}>
                  {formatPrice(newPrice)}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isIncrease 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-emerald-500/10 text-emerald-500"
              }`}>
                {isIncrease ? "+" : ""}{formatPrice(priceDiff)} ({isIncrease ? "+" : ""}{percentChange}%)
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onAccept}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-teal-400 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Continue at {formatPrice(newPrice)}
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
