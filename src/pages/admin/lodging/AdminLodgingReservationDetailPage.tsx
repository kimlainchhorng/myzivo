/**
 * AdminLodgingReservationDetailPage — full reservation detail + status workflow + audit log.
 * Route: /admin/stores/:storeId/lodging/reservations/:reservationId
 */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft, BedDouble, CalendarRange, User, Phone, Mail, Globe,
  CheckCircle2, LogIn, LogOut, XCircle, AlertCircle, History, Loader2, Download, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLodgeReservationAudit } from "@/hooks/lodging/useLodgeReservationAudit";
import { useReservationLive } from "@/hooks/lodging/useReservationLive";
import { ReservationStatusTimeline } from "@/components/lodging/ReservationStatusTimeline";
import { ReservationStatusHistory } from "@/components/lodging/ReservationStatusHistory";
import { LodgingPaymentBadge } from "@/components/lodging/LodgingPaymentBadge";
import { PolicyAcknowledgementCard } from "@/components/lodging/PolicyAcknowledgementCard";
import { downloadAuditCsv } from "@/lib/lodging/auditCsv";
import type { ReservationStatus } from "@/hooks/lodging/useLodgeReservations";
import HostAddOnTimeline from "@/components/lodging/host/HostAddOnTimeline";
import HostRefundDisputeCard from "@/components/lodging/host/HostRefundDisputeCard";
import { useReservationChangeRequests } from "@/hooks/lodging/useReservationChangeRequests";
import { useLodgingRefundDisputes } from "@/hooks/lodging/useLodgingRefundDisputes";

const STATUS_LABEL: Record<string, string> = {
  hold: "Hold", confirmed: "Confirmed", checked_in: "Checked-In",
  checked_out: "Checked-Out", cancelled: "Cancelled", no_show: "No-Show",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  hold: "outline", confirmed: "secondary", checked_in: "default",
  checked_out: "outline", cancelled: "destructive", no_show: "destructive",
};

interface AddonLine { name: string; price_cents: number; per: string; qty: number; subtotal_cents: number }

const fmt = (c: number) => `$${((c || 0) / 100).toFixed(2)}`;

export default function AdminLodgingReservationDetailPage() {
  const { storeId, reservationId } = useParams<{ storeId: string; reservationId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const audit = useLodgeReservationAudit(reservationId);

  const [pendingStatus, setPendingStatus] = useState<ReservationStatus | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  useReservationLive(reservationId);
  const { data: changeRequests = [] } = useReservationChangeRequests(reservationId);
  const { data: refundDisputes = [] } = useLodgingRefundDisputes(reservationId);

  const NOTE_TEMPLATES: Record<string, string[]> = {
    confirmed: ["Confirmed by admin", "Payment received", "Phone-verified"],
    checked_in: ["Guest arrived on time", "Early check-in approved", "ID verified at desk"],
    checked_out: ["Standard check-out", "Late check-out (fee applied)", "Damages noted"],
    cancelled: ["Guest requested cancellation", "Payment could not be captured", "Room unavailable / maintenance", "Refund handled outside Stripe"],
    no_show: ["Late arrival beyond cut-off", "Unreachable by phone", "Guest moved to another room"],
  };
  const REASON_OPTIONS: Record<string, { value: string; label: string }[]> = {
    cancelled: [
      { value: "guest_request", label: "Guest request" },
      { value: "payment_failed", label: "Payment failed" },
      { value: "overbooking", label: "Overbooking" },
      { value: "property_unavailable", label: "Property unavailable" },
      { value: "room_maintenance", label: "Room unavailable / maintenance" },
      { value: "policy_violation", label: "Policy violation" },
      { value: "external_refund", label: "Refund handled outside Stripe" },
      { value: "other", label: "Other" },
    ],
    no_show: [
      { value: "no_arrival", label: "No arrival" },
      { value: "unreachable", label: "Unreachable" },
      { value: "late_beyond_cutoff", label: "Late beyond cut-off" },
      { value: "other", label: "Other" },
    ],
  };
  const reasonRequired = pendingStatus === "cancelled" || pendingStatus === "no_show";
  const destructiveWorkflow = pendingStatus === "cancelled" || pendingStatus === "no_show";
  const reasonLabel = (val: string) =>
    REASON_OPTIONS[pendingStatus || ""]?.find((o) => o.value === val)?.label || val;

  const appendTemplate = (tpl: string) => {
    setNote((prev) => (prev.trim() ? `${prev}\n${tpl}` : tpl));
  };

  const { data: reservation, isLoading } = useQuery({
    queryKey: ["lodge-reservation", reservationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lodge_reservations" as any)
        .select("*")
        .eq("id", reservationId!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!reservationId,
  });

  const { data: room } = useQuery({
    queryKey: ["lodge-room", reservation?.room_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lodge_rooms" as any)
        .select("name, photos, cover_photo_index, base_rate_cents")
        .eq("id", reservation!.room_id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!reservation?.room_id,
  });

  const addons: AddonLine[] = useMemo(
    () => Array.isArray(reservation?.addons) ? (reservation.addons as AddonLine[]) : [],
    [reservation]
  );

  const balanceDue = (reservation?.total_cents || 0) - (reservation?.paid_cents || 0);
  const cover = (() => {
    if (!room?.photos) return undefined;
    const photos = room.photos as string[];
    const ci = (room.cover_photo_index as number) ?? 0;
    return photos[ci] ?? photos[0];
  })();

  const transitions: { to: ReservationStatus; label: string; icon: any; variant?: "default" | "destructive" | "outline" }[] = useMemo(() => {
    const cur = reservation?.status as ReservationStatus | undefined;
    if (!cur) return [];
    const all: typeof transitions = [];
    if (cur === "hold") all.push({ to: "confirmed", label: "Confirm", icon: CheckCircle2 });
    if (cur === "hold" || cur === "confirmed") all.push({ to: "checked_in", label: "Check-In", icon: LogIn });
    if (cur === "checked_in") all.push({ to: "checked_out", label: "Check-Out", icon: LogOut });
    if (!["cancelled", "checked_out"].includes(cur)) {
      all.push({ to: "cancelled", label: "Cancel", icon: XCircle, variant: "destructive" });
      all.push({ to: "no_show", label: "No-Show", icon: AlertCircle, variant: "destructive" });
    }
    return all;
  }, [reservation?.status]);

  useEffect(() => {
    if (!reservation || pendingStatus) return;
    const workflow = searchParams.get("workflow");
    if (workflow === "cancel" && !["cancelled", "checked_out", "no_show"].includes(reservation.status)) {
      setPendingStatus("cancelled");
    } else if (workflow === "no_show" && !["cancelled", "checked_out", "no_show"].includes(reservation.status)) {
      setPendingStatus("no_show");
    }
  }, [pendingStatus, reservation, searchParams]);

  const submitTransition = async () => {
    if (!pendingStatus || !reservation) return;
    if (!note.trim()) { toast.error("Audit note required"); return; }
    if (reasonRequired && !reason) { toast.error("Reason required"); return; }
    setSaving(true);
    try {
      const finalNote = reasonRequired
        ? `[Reason: ${reasonLabel(reason)}] ${note.trim()}`
        : note.trim();
      const { error } = await supabase
        .from("lodge_reservations" as any)
        .update({ status: pendingStatus })
        .eq("id", reservation.id);
      if (error) throw error;
      await audit.append.mutateAsync({
        reservation_id: reservation.id,
        store_id: reservation.store_id,
        from_status: reservation.status,
        to_status: pendingStatus,
        note: finalNote,
      });
      toast.success(
        reasonRequired
          ? `${STATUS_LABEL[pendingStatus]} saved`
          : `Status updated to ${STATUS_LABEL[pendingStatus]}`,
        reasonRequired ? { description: "Removed from Active. Review refund/payment follow-up if needed." } : undefined
      );
      qc.invalidateQueries({ queryKey: ["lodge-reservation", reservationId] });
      qc.invalidateQueries({ queryKey: ["lodge-reservations", reservation.store_id] });
      setPendingStatus(null);
      setNote("");
      setReason("");
      setSearchParams({});
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm text-muted-foreground">Reservation not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold truncate">{reservation.guest_name || "Guest"}</h1>
              <Badge variant={STATUS_VARIANT[reservation.status]}>{STATUS_LABEL[reservation.status]}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">{reservation.number} · {reservation.source}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Status timeline (live) */}
        <Card>
          <CardContent className="pt-4">
            <ReservationStatusTimeline status={reservation.status as any} />
          </CardContent>
        </Card>

        {/* Stay */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><CalendarRange className="h-4 w-4" /> Stay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {cover ? <img src={cover} alt={room?.name || ""} className="h-full w-full object-cover" />
                  : <div className="h-full w-full flex items-center justify-center"><BedDouble className="h-6 w-6 text-muted-foreground/40" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{room?.name || "Room"}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(reservation.check_in), "EEE, MMM d")} → {format(new Date(reservation.check_out), "EEE, MMM d")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reservation.nights} night{reservation.nights !== 1 ? "s" : ""} · {reservation.adults} adult{reservation.adults !== 1 ? "s" : ""}{reservation.children ? ` · ${reservation.children} child${reservation.children > 1 ? "ren" : ""}` : ""}
                </p>
              </div>
            </div>
            {reservation.notes && (
              <div className="p-2.5 rounded-lg bg-muted/40 text-xs">
                <p className="font-semibold mb-0.5">Special requests</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{reservation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Guest</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="font-semibold">{reservation.guest_name || "—"}</p>
            {reservation.guest_phone && <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {reservation.guest_phone}</p>}
            {reservation.guest_email && <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {reservation.guest_email}</p>}
            {reservation.guest_country && <p className="flex items-center gap-2 text-muted-foreground"><Globe className="h-3.5 w-3.5" /> {reservation.guest_country}</p>}
          </CardContent>
        </Card>

        {/* Price breakdown */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Price breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label={`Room · ${reservation.nights} night${reservation.nights !== 1 ? "s" : ""}`} value={fmt((reservation.rate_cents || 0) * reservation.nights)} muted />
            {addons.map((a, i) => (
              <Row
                key={i}
                label={`${a.name} · ${a.qty}× ${a.per}`}
                value={fmt(a.subtotal_cents)}
                muted
              />
            ))}
            <div className="border-t border-border pt-2 mt-2 space-y-1">
              <Row label="Total" value={fmt(reservation.total_cents)} bold />
              <Row label="Paid" value={fmt(reservation.paid_cents || 0)} muted />
              <Row label="Balance due" value={fmt(balanceDue)} bold className={balanceDue > 0 ? "text-destructive" : "text-primary"} />
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 capitalize">Payment: {reservation.payment_status}</p>
            <div className="pt-2">
              <LodgingPaymentBadge
                status={reservation.payment_status}
                reservationStatus={reservation.status}
                amountCents={reservation.deposit_cents || reservation.total_cents}
                onRetry={async () => {
                  if (retrying) return;
                  setRetrying(true);
                  try {
                    const { data, error } = await supabase.functions.invoke("create-lodging-deposit", {
                      body: {
                        reservation_id: reservation.id,
                        store_id: reservation.store_id,
                        deposit_cents: reservation.deposit_cents || reservation.total_cents,
                        mode: reservation.deposit_cents ? "deposit" : "full",
                      },
                    });
                    if (error) throw error;
                    if ((data as any)?.already_paid) {
                      toast.info((data as any).message || "Already paid");
                    } else if ((data as any)?.url) {
                      window.open((data as any).url, "_blank");
                      toast.success("Opening Stripe checkout…");
                    }
                  } catch (e: any) {
                    toast.error(e.message || "Retry failed");
                  } finally {
                    setRetrying(false);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <HostAddOnTimeline requests={changeRequests} />
        <HostRefundDisputeCard disputes={refundDisputes} />

        {/* Policy acknowledgement */}
        {reservation.policy_consent && (
          <PolicyAcknowledgementCard
            consent={reservation.policy_consent as any}
            versionStamp={reservation.policy_consent_version}
          />
        )}

        {/* Status workflow */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Update status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pendingStatus ? (
              <div className="space-y-2.5 p-3 rounded-lg border border-border bg-muted/20">
                <p className="text-sm font-semibold">
                  {STATUS_LABEL[reservation.status]} → {STATUS_LABEL[pendingStatus]}
                </p>

                {destructiveWorkflow && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-semibold text-foreground">Confirm before saving</p>
                    <p>This reservation will leave the Active queue after it is marked {STATUS_LABEL[pendingStatus].toLowerCase()}.</p>
                    <p>Next steps: save a clear audit note, review payment/refund follow-up, then return to Active reservations.</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <Button type="button" size="sm" variant={pendingStatus === "cancelled" ? "destructive" : "outline"} className="h-7 text-xs" onClick={() => { setPendingStatus("cancelled"); setReason(""); }}>
                        Cancel reservation
                      </Button>
                      <Button type="button" size="sm" variant={pendingStatus === "no_show" ? "destructive" : "outline"} className="h-7 text-xs" onClick={() => { setPendingStatus("no_show"); setReason(""); }}>
                        Mark no-show
                      </Button>
                    </div>
                  </div>
                )}

                {reasonRequired && (
                  <div>
                    <Label className="text-xs">Reason (required)</Label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="">Select a reason…</option>
                      {(REASON_OPTIONS[pendingStatus] || []).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(NOTE_TEMPLATES[pendingStatus] || []).length > 0 && (
                  <div>
                    <Label className="text-xs mb-1 block">Quick templates</Label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5 scrollbar-none">
                      {NOTE_TEMPLATES[pendingStatus].map((tpl) => (
                        <button
                          key={tpl}
                          type="button"
                          onClick={() => appendTemplate(tpl)}
                          className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border border-border bg-background hover:bg-muted hover:border-primary/40 transition whitespace-nowrap"
                        >
                          + {tpl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Audit note (required)</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Reason for the change…"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => { setPendingStatus(null); setNote(""); setReason(""); setSearchParams({}); }} disabled={saving}>Cancel</Button>
                  <Button
                    size="sm"
                    onClick={submitTransition}
                    disabled={saving || !note.trim() || (reasonRequired && !reason)}
                  >
                    {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Save
                  </Button>
                </div>
              </div>
            ) : transitions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No further transitions available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {transitions.map((t) => (
                  <Button key={t.to} size="sm" variant={t.variant === "destructive" ? "outline" : "outline"}
                    className={`gap-1 h-8 text-xs ${t.variant === "destructive" ? "text-destructive" : ""}`}
                    onClick={() => { setPendingStatus(t.to); setNote(""); setReason(""); }}>
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit log */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Audit log</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              disabled={!(audit.data || []).length}
              onClick={() => downloadAuditCsv(reservation.number || reservation.id, (audit.data || []) as any)}
            >
              <Download className="h-3 w-3" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            <ReservationStatusHistory reservationId={reservation.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, muted, bold, className }: { label: string; value: string; muted?: boolean; bold?: boolean; className?: string }) {
  return (
    <div className={`flex justify-between ${className || ""}`}>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={bold ? "font-bold" : ""}>{value}</span>
    </div>
  );
}
