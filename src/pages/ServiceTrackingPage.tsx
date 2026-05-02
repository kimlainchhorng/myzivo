// ServiceTrackingPage — customer's live tracker for one service order
// Route: /service/track/:orderId

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, DollarSign, User as UserIcon, Phone, Star, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceOrderProgressBar from "@/components/service/ServiceOrderProgressBar";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { isTerminal, STATUS_LABEL } from "@/types/serviceOrder";
import { cn } from "@/lib/utils";

const fmt = (cents: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format((cents || 0) / 100);

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span>{value}</span></div>;
}

const formatEta = (iso: string | null): string | null => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "any moment";
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

export default function ServiceTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, events, driverLocation, isLoading, error, cancel, rate } = useServiceOrder(orderId);
  const recent = useMemo(() => [...events].slice(-6).reverse(), [events]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl p-4 space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="container mx-auto max-w-2xl p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card><CardContent className="pt-6 text-center"><p className="text-destructive">{error ?? "Order not found"}</p></CardContent></Card>
      </div>
    );
  }

  const headline = order.kind === "ride" ? "Ride" : "Delivery";
  const canCancel = !isTerminal(order.status) && order.status !== "in_progress" && order.status !== "picked_up";
  const canRate = order.status === "completed" && !order.rating_by_customer;

  // ETA: prefer pickup ETA before driver_arrived, else dropoff
  const etaIso = order.status === "in_progress" || order.status === "picked_up"
    ? order.eta_dropoff_at
    : order.eta_pickup_at;
  const etaText = formatEta(etaIso);

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-4 pb-24">
      <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{headline}</CardTitle>
            <span className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              order.status === "completed" && "bg-emerald-500/10 text-emerald-600",
              order.status === "cancelled" && "bg-destructive/10 text-destructive",
              !isTerminal(order.status) && "bg-primary/10 text-primary animate-pulse",
            )}>
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          {etaText && !isTerminal(order.status) && (
            <p className="text-sm text-primary flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" /> ETA {etaText}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <ServiceOrderProgressBar kind={order.kind} status={order.status} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 mt-0.5 text-emerald-500" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm">{order.pickup_address ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 mt-0.5 text-rose-500" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Drop-off</p>
              <p className="text-sm">{order.dropoff_address}</p>
            </div>
          </div>
          {(order.distance_km != null || order.duration_minutes != null) && (
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t">
              {order.distance_km != null && <span>{Number(order.distance_km).toFixed(1)} km</span>}
              {order.duration_minutes != null && (
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{order.duration_minutes} min</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {order.driver_id && (
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">Your driver</p>
              <p className="text-xs text-muted-foreground">
                {driverLocation
                  ? `Last seen ${new Date(driverLocation.updated_at).toLocaleTimeString()}`
                  : "Connecting…"}
              </p>
            </div>
            <Button variant="outline" size="icon" disabled><Phone className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      )}

      {order.kind === "delivery" && order.items && order.items.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Order</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{it.qty}× {it.name}</span>
                <span>{fmt(it.price_cents * it.qty, order.currency)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" /> Total</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {order.subtotal_cents     > 0 && <Row label="Subtotal"     value={fmt(order.subtotal_cents,     order.currency)} />}
          {order.delivery_fee_cents > 0 && <Row label="Delivery fee" value={fmt(order.delivery_fee_cents, order.currency)} />}
          {order.service_fee_cents  > 0 && <Row label="Service fee"  value={fmt(order.service_fee_cents,  order.currency)} />}
          {order.tip_cents          > 0 && <Row label="Tip"          value={fmt(order.tip_cents,          order.currency)} />}
          {order.service_promo_discount_cents > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Promo discount</span><span>−{fmt(order.service_promo_discount_cents, order.currency)}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between font-medium">
            <span>Total</span><span>{fmt(order.total_cents, order.currency)}</span>
          </div>
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recent.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium capitalize">{e.event_type.replace(/_/g, " ")}</span>
                  {e.to_status && <span className="text-muted-foreground"> → {STATUS_LABEL[e.to_status]}</span>}
                </div>
                <span className="text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 sticky bottom-4">
        {canCancel && (
          <Button variant="destructive" className="flex-1" onClick={() => cancel("customer_cancelled")}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
        )}
        {canRate && (
          <div className="flex-1 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} aria-label={`Rate ${s} star`} onClick={() => rate(s)}
                className="p-2 hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-yellow-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
