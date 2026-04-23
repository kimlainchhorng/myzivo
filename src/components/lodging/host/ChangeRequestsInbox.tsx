/**
 * ChangeRequestsInbox — host-facing list of pending guest change requests.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CalendarRange, XCircle, Plus, Inbox, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useStoreChangeRequestInbox, type ReservationChangeRequest } from "@/hooks/lodging/useReservationChangeRequests";
import { toast } from "sonner";

const TYPE_ICON = {
  reschedule: CalendarRange,
  cancel: XCircle,
  addon: Plus,
};

const TYPE_LABEL = {
  reschedule: "Date change",
  cancel: "Cancellation",
  addon: "Add-on",
};

export default function ChangeRequestsInbox({ storeId }: { storeId: string }) {
  const { data: requests = [], isLoading, decide } = useStoreChangeRequestInbox(storeId);
  const [responseFor, setResponseFor] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  const handle = async (req: ReservationChangeRequest, action: "approve" | "decline") => {
    try {
      await decide.mutateAsync({ id: req.id, action, response: response || undefined });
      toast.success(action === "approve" ? "Approved" : "Declined");
      setResponseFor(null);
      setResponse("");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="w-5 h-5" /> Pending requests
          {requests.length > 0 && <Badge variant="secondary">{requests.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const Icon = TYPE_ICON[r.type];
              return (
                <div key={r.id} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{TYPE_LABEL[r.type]}</span>
                          <Badge variant="outline" className="text-[10px]">{format(parseISO(r.created_at), "MMM d, h:mm a")}</Badge>
                        </div>
                        {r.type === "reschedule" && r.proposed_check_in && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Move to <span className="font-medium text-foreground">{r.proposed_check_in} → {r.proposed_check_out}</span>
                          </p>
                        )}
                        {r.price_delta_cents !== 0 && (
                          <p className="text-xs mt-1">
                            Price change:{" "}
                            <span className={r.price_delta_cents > 0 ? "text-destructive font-semibold" : "text-emerald-600 font-semibold"}>
                              {r.price_delta_cents > 0 ? "+" : ""}${(r.price_delta_cents / 100).toFixed(2)}
                            </span>
                          </p>
                        )}
                        {r.reason && <p className="text-xs text-muted-foreground mt-1 italic">"{r.reason}"</p>}
                      </div>
                    </div>
                  </div>

                  {responseFor === r.id && (
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Optional message to the guest…"
                      rows={2}
                      className="text-xs"
                    />
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs gap-1"
                      onClick={() => {
                        if (responseFor !== r.id) setResponseFor(r.id);
                        else handle(r, "decline");
                      }}
                      disabled={decide.isPending}
                    >
                      <X className="w-3 h-3" /> Decline
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs gap-1"
                      onClick={() => handle(r, "approve")}
                      disabled={decide.isPending}
                    >
                      <Check className="w-3 h-3" /> Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
