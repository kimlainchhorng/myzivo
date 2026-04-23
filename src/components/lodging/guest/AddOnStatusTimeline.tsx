import { CheckCircle2, Clock, ReceiptText, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReservationChangeRequest } from "@/hooks/lodging/useReservationChangeRequests";

interface Props { requests: ReservationChangeRequest[]; }

const money = (cents?: number | null) => `$${((Number(cents) || 0) / 100).toFixed(2)}`;

function addonItems(payload: any) {
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.selections) ? payload.selections : [];
  return items.map((item: any) => `${item.name || item.id || "Add-on"}${item.quantity ? ` ×${item.quantity}` : ""}`).join(", ");
}

export default function AddOnStatusTimeline({ requests }: Props) {
  const addons = requests.filter((r) => r.type === "addon");
  return (
    <Card id="addon-status" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><ReceiptText className="h-4 w-4" /> Add-on status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!addons.length ? <p className="text-sm text-muted-foreground">Successful and failed add-on purchase attempts will appear here after checkout.</p> : addons.map((r, index) => {
          const failed = r.status === "failed";
          const success = r.status === "auto_approved" || r.status === "approved";
          const Icon = failed ? XCircle : success ? CheckCircle2 : Clock;
          const payment = String(r.payment_status || "pending").replace(/_/g, " ");
          return (
            <div key={r.id} className="flex gap-3 rounded-lg border bg-muted/30 p-3">
              <span className={failed ? "text-destructive" : success ? "text-primary" : "text-muted-foreground"}><Icon className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{addonItems(r.addon_payload) || "Add-on purchase"}</p>
                  {index === 0 && <Badge variant="outline">Latest</Badge>}
                  <Badge variant={failed ? "destructive" : success ? "default" : "secondary"} className="capitalize">{r.status.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{format(parseISO(r.created_at), "MMM d, yyyy h:mm a")} · {money(r.price_delta_cents)} · {payment}</p>
                <p className="text-xs text-muted-foreground">Saved-card charge {success ? "completed and reservation total updated." : failed ? "failed; reservation total was not changed." : "is pending."}</p>
                {r.stripe_payment_intent_id && <p className="text-xs text-muted-foreground">Payment ref: …{r.stripe_payment_intent_id.slice(-8)}</p>}
                {failed && <p className="text-xs text-destructive">{r.addon_payload?.failure_reason || "The saved payment method was not charged."}</p>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
