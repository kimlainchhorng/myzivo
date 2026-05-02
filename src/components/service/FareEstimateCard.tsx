// FareEstimateCard — live fare estimate display

import { Loader2, Clock, MapPin, Calculator, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FareQuote } from "@/hooks/useFareQuote";

interface Props {
  quote: FareQuote | null;
  isLoading: boolean;
  error: string | null;
  emptyHint?: string;
}

const fmt = (cents: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format((cents || 0) / 100);

export default function FareEstimateCard({ quote, isLoading, error, emptyHint }: Props) {
  if (error) {
    return (
      <Card className="border-amber-500/40">
        <CardContent className="pt-4 pb-3 text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium">Couldn't estimate the fare</p>
            <p className="text-xs text-muted-foreground">{error}. You can still submit; the actual fare will be confirmed at completion.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!quote && !isLoading) {
    return emptyHint ? (
      <Card><CardContent className="pt-4 pb-3 text-xs text-muted-foreground text-center">{emptyHint}</CardContent></Card>
    ) : null;
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="pt-4 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calculator className="h-3 w-3" /> Estimated fare
          </span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
        {quote ? (
          <>
            <p className="text-2xl font-bold">{fmt(quote.total_cents, quote.currency)}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" /> {quote.distance_km.toFixed(1)} km
              </div>
              <div className="flex items-center gap-1 text-muted-foreground justify-end">
                <Clock className="h-3 w-3" /> ~{quote.duration_min} min
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-[11px] text-muted-foreground border-t pt-2">
              <span>Subtotal</span>     <span className="text-right">{fmt(quote.subtotal_cents, quote.currency)}</span>
              {quote.delivery_fee_cents > 0 && <>
                <span>Delivery fee</span><span className="text-right">{fmt(quote.delivery_fee_cents, quote.currency)}</span>
              </>}
              <span>Service fee</span>  <span className="text-right">{fmt(quote.service_fee_cents,  quote.currency)}</span>
              {quote.breakdown?.applied_min_total && (
                <span className="col-span-2 text-[10px] italic">Minimum-fare price applied.</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Estimate updates live. Final fare may differ slightly based on actual route.
            </p>
          </>
        ) : (
          <div className="h-12 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
