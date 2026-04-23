import { useState } from "react";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CheckCircle2, Circle, Clock, FileText, Link as LinkIcon, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RefundDisputeSheet from "./RefundDisputeSheet";
import type { LodgingRefundDispute } from "@/hooks/lodging/useLodgingRefundDisputes";

interface Props {
  reservationId: string;
  disputes: LodgingRefundDispute[];
  canRequest: boolean;
  maxAmountCents: number;
}

const openStatuses = new Set(["pending", "under_review", "approved"]);
const money = (cents?: number | null) => `$${((Number(cents) || 0) / 100).toFixed(2)}`;

export default function RefundDisputeCard({ reservationId, disputes, canRequest, maxAmountCents }: Props) {
  const [open, setOpen] = useState(false);
  const hasOpen = disputes.some((d) => openStatuses.has(d.status));
  if (!canRequest && !disputes.length) return null;
  const latest = disputes[0];
  const go = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const steps = latest ? [
    { key: "pending", label: "Request submitted", done: true },
    { key: "under_review", label: "Under review", done: ["under_review", "approved", "declined", "paid", "closed"].includes(latest.status) },
    { key: "approved", label: latest.status === "declined" ? "Declined" : "Resolution", done: ["approved", "declined", "paid", "closed"].includes(latest.status) },
    { key: "paid", label: latest.status === "closed" ? "Closed" : "Paid / closed", done: ["paid", "closed"].includes(latest.status) },
  ] : [];

  return (
    <Card id="refund-disputes" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" /> Refund / dispute request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {latest && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Latest update</p>
                <p className="text-sm font-semibold capitalize">{latest.status.replace(/_/g, " ")}</p>
              </div>
              <span className="text-xs text-muted-foreground">Updated {format(parseISO(latest.updated_at), "MMM d, yyyy h:mm a")}</span>
            </div>
            <div className="grid gap-2">
              {steps.map((step) => {
                const current = step.key === latest.status || (latest.status === "declined" && step.key === "approved");
                const Icon = latest.status === "declined" && current ? XCircle : step.done ? CheckCircle2 : current ? Clock : Circle;
                return (
                  <div key={step.key} className="flex items-center gap-2 text-sm">
                    <Icon className={step.done || current ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
                    <span className={current ? "font-semibold" : "text-muted-foreground"}>{step.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => go("#stay-summary")}><LinkIcon className="h-3.5 w-3.5" /> Reservation details</Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => go("#payment-summary")}><LinkIcon className="h-3.5 w-3.5" /> Payment summary</Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => go("#request-history")}><LinkIcon className="h-3.5 w-3.5" /> Request history</Button>
            </div>
          </div>
        )}
        {!disputes.length ? (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">If your cancellation refund needs review, submit one request tied to this reservation.</div>
        ) : disputes.map((d) => (
          <div key={d.id} className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant={d.status === "declined" ? "destructive" : d.status === "paid" || d.status === "approved" ? "default" : "secondary"} className="capitalize">{d.status.replace(/_/g, " ")}</Badge>
              <span className="text-xs text-muted-foreground">{format(parseISO(d.created_at), "MMM d, yyyy h:mm a")}</span>
            </div>
            <p className="text-sm font-medium">{money(d.requested_amount_cents)} requested · {d.reason_category.replace(/_/g, " ")}</p>
            <p className="text-xs text-muted-foreground">{d.description}</p>
            {d.admin_response && <p className="rounded-md bg-background p-2 text-xs">{d.admin_response}</p>}
            {d.resolution_amount_cents != null && <p className="text-xs text-muted-foreground">Resolution amount: {money(d.resolution_amount_cents)}</p>}
          </div>
        ))}
        {canRequest && !hasOpen && (
          <Button variant="outline" className="w-full gap-2" onClick={() => setOpen(true)}><AlertTriangle className="h-4 w-4" /> Request refund review</Button>
        )}
        <RefundDisputeSheet open={open} onOpenChange={setOpen} reservationId={reservationId} maxAmountCents={maxAmountCents} />
      </CardContent>
    </Card>
  );
}
