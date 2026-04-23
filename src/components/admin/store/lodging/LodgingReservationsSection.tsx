/**
 * Lodging — Reservations list with status filter & quick actions.
 * Tapping a row opens the full reservation details page.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarRange, Search, CheckCircle2, LogIn, LogOut, XCircle, ChevronRight, ShieldCheck, BedDouble, Mail, Phone } from "lucide-react";
import { useLodgeReservations, type ReservationStatus } from "@/hooks/lodging/useLodgeReservations";
import { LodgingPaymentBadge } from "@/components/lodging/LodgingPaymentBadge";
import { toast } from "sonner";
import ChangeRequestsInbox from "@/components/lodging/host/ChangeRequestsInbox";
import HostReservationOpsSummary from "@/components/lodging/host/HostReservationOpsSummary";
import { useStoreChangeRequestInbox } from "@/hooks/lodging/useReservationChangeRequests";
import { useHostLodgingOpsToasts } from "@/hooks/lodging/useHostLodgingOpsToasts";

const STATUSES: (ReservationStatus | "all")[] = ["all", "hold", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"];
const STATUS_LABEL: Record<string, string> = {
  all: "All", hold: "Hold", confirmed: "Confirmed", checked_in: "Checked-In",
  checked_out: "Checked-Out", cancelled: "Cancelled", no_show: "No-Show",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  hold: "outline", confirmed: "secondary", checked_in: "default", checked_out: "outline", cancelled: "destructive", no_show: "destructive",
};

export default function LodgingReservationsSection({ storeId }: { storeId: string }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ReservationStatus | "all">("all");
  const [q, setQ] = useState("");
  const { data: reservations = [], isLoading, setStatus: setResStatus } = useLodgeReservations(storeId, status);
  const { data: pendingRequests = [] } = useStoreChangeRequestInbox(storeId);
  useHostLodgingOpsToasts(storeId);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return reservations;
    return reservations.filter(r =>
      [r.guest_name, r.guest_phone, r.guest_email, r.number, r.room_number, r.payment_status, r.status].some(v => String(v || "").toLowerCase().includes(term))
    );
  }, [reservations, q]);

  const act = async (id: string, s: ReservationStatus, msg: string) => {
    try { await setResStatus.mutateAsync({ id, status: s }); toast.success(msg); }
    catch (e: any) { toast.error(e.message || "Failed"); }
  };

  return (
    <div className="space-y-4">
      <HostReservationOpsSummary reservations={reservations} requests={pendingRequests} onFilter={(value) => setQ(value)} />
      <ChangeRequestsInbox storeId={storeId} />
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CalendarRange className="h-5 w-5" /> Reservations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${status === s ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"}`}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search guest, phone, email, room, ref, payment…" className="pl-9" />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No reservations</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => {
              const displayName = r.guest_name?.trim() || `Guest · ${r.number || r.id.slice(0, 8)}`;
              const balance = (r.total_cents || 0) - (r.paid_cents || 0);
              const hasPendingRequest = pendingRequests.some(req => req.reservation_id === r.id);
              return (
              <div key={r.id} className="p-3 rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/stores/${storeId}/lodging/reservations/${r.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                         <span className="font-semibold text-sm">{displayName}</span>
                        <Badge variant={STATUS_VARIANT[r.status] || "outline"} className="text-[10px]">{STATUS_LABEL[r.status]}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{r.number}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.check_in} → {r.check_out} · {r.nights} night{r.nights !== 1 ? "s" : ""} · {r.adults}A{r.children ? `/${r.children}C` : ""}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1"><BedDouble className="h-3 w-3" />{r.room_number ? `Unit ${r.room_number}` : "Room unassigned"}</span>
                        {r.guest_phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.guest_phone}</span>}
                        {r.guest_email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.guest_email}</span>}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <LodgingPaymentBadge status={(r as any).payment_status} amountCents={(r as any).deposit_cents || r.total_cents} />
                        {balance > 0 && <Badge variant="destructive" className="text-[10px]">Balance {money(balance)}</Badge>}
                        {hasPendingRequest && <Badge variant="secondary" className="text-[10px]">Pending guest request</Badge>}
                        {r.status === "cancelled" && String(r.payment_status).includes("refund") && <Badge variant="secondary" className="text-[10px]">Refund workflow</Badge>}
                        {(r as any).policy_consent && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                            <ShieldCheck className="h-2.5 w-2.5" /> Policies acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-1">
                      <div>
                        <p className="font-bold text-sm">{money(r.total_cents)}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">Paid {money(r.paid_cents || 0)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>
                <div className="flex flex-wrap gap-1 mt-2">
                  {r.status === "hold" && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => act(r.id, "confirmed", "Confirmed")}><CheckCircle2 className="h-3 w-3" /> Confirm</Button>}
                  {(r.status === "confirmed" || r.status === "hold") && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => act(r.id, "checked_in", "Checked in")}><LogIn className="h-3 w-3" /> Check-In</Button>}
                  {r.status === "checked_in" && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => act(r.id, "checked_out", "Checked out")}><LogOut className="h-3 w-3" /> Check-Out</Button>}
                  {!["cancelled", "checked_out"].includes(r.status) && <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => act(r.id, "cancelled", "Cancelled")}><XCircle className="h-3 w-3" /> Cancel</Button>}
                </div>
              </div>
            );})}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
