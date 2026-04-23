/**
 * Lodging — Reservations list with status filter & quick actions.
 * Tapping a row opens the full reservation details page.
 */
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarRange, Search, CheckCircle2, LogIn, LogOut, XCircle, ChevronRight, ShieldCheck, BedDouble, Mail, Phone, ExternalLink, ClipboardCheck } from "lucide-react";
import { useLodgeReservations, type ReservationStatus } from "@/hooks/lodging/useLodgeReservations";
import { LodgingPaymentBadge } from "@/components/lodging/LodgingPaymentBadge";
import { toast } from "sonner";
import ChangeRequestsInbox from "@/components/lodging/host/ChangeRequestsInbox";
import HostReservationOpsSummary from "@/components/lodging/host/HostReservationOpsSummary";
import { useStoreChangeRequestInbox } from "@/hooks/lodging/useReservationChangeRequests";
import { useHostLodgingOpsToasts } from "@/hooks/lodging/useHostLodgingOpsToasts";

type ReservationFilter = ReservationStatus | "active" | "all";
const CLOSED_STATUSES = new Set<ReservationStatus>(["cancelled", "checked_out", "no_show"]);
const STATUSES: ReservationFilter[] = ["active", "all", "hold", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"];
const STATUS_LABEL: Record<string, string> = {
  active: "Active", all: "All", hold: "Hold", confirmed: "Confirmed", checked_in: "Checked-In",
  checked_out: "Checked-Out", cancelled: "Cancelled", no_show: "No-Show",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  hold: "outline", confirmed: "secondary", checked_in: "default", checked_out: "outline", cancelled: "destructive", no_show: "destructive",
};

const money = (cents?: number | null) => `$${((Number(cents) || 0) / 100).toFixed(2)}`;

export default function LodgingReservationsSection({ storeId }: { storeId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = (searchParams.get("tab") || "active") as ReservationFilter;
  const [status, setStatus] = useState<ReservationFilter>(STATUSES.includes(initialStatus) ? initialStatus : "active");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const queryStatus = status === "active" ? "all" : status;
  const { data: reservations = [], isLoading, setStatus: setResStatus } = useLodgeReservations(storeId, queryStatus);
  const { data: pendingRequests = [] } = useStoreChangeRequestInbox(storeId);
  useHostLodgingOpsToasts(storeId);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const scoped = status === "active" ? reservations.filter(r => !CLOSED_STATUSES.has(r.status)) : reservations;
    if (!term) return scoped;
    return scoped.filter(r =>
      [r.guest_name, r.guest_phone, r.guest_email, r.number, r.room_number, r.payment_status, r.status].some(v => String(v || "").toLowerCase().includes(term))
    );
  }, [reservations, q, status]);

  const act = async (id: string, s: ReservationStatus, msg: string) => {
    try { await setResStatus.mutateAsync({ id, status: s }); toast.success(msg); }
    catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const openReservation = (id: string, workflow?: "cancel" | "review" | "addons" | "payment" | "audit") => {
    const returnTo = `${location.pathname}?tab=${encodeURIComponent(status)}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ""}`;
    navigate(`/admin/stores/${storeId}/lodging/reservations/${id}${workflow ? `?workflow=${workflow}` : ""}`, {
      state: { returnTo, workflow },
    });
  };

  const updateFilter = (nextStatus: ReservationFilter, nextQ = q) => {
    setStatus(nextStatus);
    const next = new URLSearchParams();
    if (nextStatus !== "active") next.set("tab", nextStatus);
    if (nextQ.trim()) next.set("q", nextQ.trim());
    setSearchParams(next, { replace: true });
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
            <button key={s} onClick={() => updateFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${status === s ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"}`}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => { setQ(e.target.value); updateFilter(status, e.target.value); }} placeholder="Search guest, phone, email, room, ref, payment…" className="pl-9" />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {q.trim() ? "No reservations match your search" : status === "active" ? "No active reservations" : `No ${STATUS_LABEL[status].toLowerCase()} reservations`}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => {
              const displayName = r.guest_name?.trim() || `Guest · ${r.number || r.id.slice(0, 8)}`;
              const balance = (r.total_cents || 0) - (r.paid_cents || 0);
              const hasPendingRequest = pendingRequests.some(req => req.reservation_id === r.id);
              const paymentNeedsReview = ["failed", "pending", "processing"].includes(String(r.payment_status || ""));
              const isClosed = CLOSED_STATUSES.has(r.status);
              const needsReview = hasPendingRequest || balance > 0 || paymentNeedsReview || isClosed;
              const reviewWorkflow = hasPendingRequest ? "addons" : paymentNeedsReview || balance > 0 ? "payment" : isClosed ? "audit" : "review";
              return (
              <div key={r.id} className="p-3 rounded-lg border bg-card transition hover:border-primary/40 focus-within:border-primary/40">
                <button
                  type="button"
                  onClick={() => openReservation(r.id)}
                  className="w-full text-left rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                        <LodgingPaymentBadge status={(r as any).payment_status} reservationStatus={r.status} amountCents={(r as any).deposit_cents || r.total_cents} />
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
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openReservation(r.id)}><ExternalLink className="h-3 w-3" /> Open</Button>
                  {needsReview && <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => openReservation(r.id, reviewWorkflow)}><ClipboardCheck className="h-3 w-3" /> Review</Button>}
                  {r.status === "hold" && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => act(r.id, "confirmed", "Confirmed")}><CheckCircle2 className="h-3 w-3" /> Confirm</Button>}
                  {(r.status === "confirmed" || r.status === "hold") && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => act(r.id, "checked_in", "Checked in")}><LogIn className="h-3 w-3" /> Check-In</Button>}
                  {r.status === "checked_in" && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => act(r.id, "checked_out", "Checked out")}><LogOut className="h-3 w-3" /> Check-Out</Button>}
                  {!CLOSED_STATUSES.has(r.status) && <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => openReservation(r.id, "cancel")}><XCircle className="h-3 w-3" /> Cancel / No-show</Button>}
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
