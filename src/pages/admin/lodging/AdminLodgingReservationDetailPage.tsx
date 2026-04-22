/**
 * AdminLodgingReservationDetailPage — full reservation detail + status workflow + audit log.
 * Route: /admin/stores/:storeId/lodging/reservations/:reservationId
 */
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft, BedDouble, CalendarRange, User, Phone, Mail, Globe,
  CheckCircle2, LogIn, LogOut, XCircle, AlertCircle, History, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLodgeReservationAudit } from "@/hooks/lodging/useLodgeReservationAudit";
import type { ReservationStatus } from "@/hooks/lodging/useLodgeReservations";

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
  const qc = useQueryClient();
  const audit = useLodgeReservationAudit(reservationId);

  const [pendingStatus, setPendingStatus] = useState<ReservationStatus | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const NOTE_TEMPLATES: Record<string, string[]> = {
    confirmed: ["Confirmed by admin", "Payment received", "Phone-verified"],
    checked_in: ["Guest arrived on time", "Early check-in approved", "ID verified at desk"],
    checked_out: ["Standard check-out", "Late check-out (fee applied)", "Damages noted"],
    cancelled: ["Customer cancellation request", "Reschedule requested", "Overbooking"],
    no_show: ["Customer no-show", "Unreachable by phone", "Late arrival cut-off"],
  };
  const REASON_OPTIONS: Record<string, { value: string; label: string }[]> = {
    cancelled: [
      { value: "guest_request", label: "Guest request" },
      { value: "payment_failed", label: "Payment failed" },
      { value: "overbooking", label: "Overbooking" },
      { value: "property_unavailable", label: "Property unavailable" },
      { value: "policy_violation", label: "Policy violation" },
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
          ? `${STATUS_LABEL[pendingStatus]} — reason: ${reasonLabel(reason)}`
          : `Status updated to ${STATUS_LABEL[pendingStatus]}`
      );
      qc.invalidateQueries({ queryKey: ["lodge-reservation", reservationId] });
      qc.invalidateQueries({ queryKey: ["lodge-reservations", reservation.store_id] });
      setPendingStatus(null);
      setNote("");
      setReason("");
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
          </CardContent>
        </Card>

        {/* Status workflow */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Update status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pendingStatus ? (
              <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
                <p className="text-sm font-semibold">
                  {STATUS_LABEL[reservation.status]} → {STATUS_LABEL[pendingStatus]}
                </p>
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
                  <Button variant="outline" size="sm" onClick={() => { setPendingStatus(null); setNote(""); }} disabled={saving}>Cancel</Button>
                  <Button size="sm" onClick={submitTransition} disabled={saving || !note.trim()}>
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
                    onClick={() => { setPendingStatus(t.to); setNote(""); }}>
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit log */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Audit log</CardTitle></CardHeader>
          <CardContent>
            {audit.isLoading ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : (audit.data || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No status changes yet.</p>
            ) : (
              <div className="space-y-2">
                {(audit.data || []).map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg border border-border bg-card text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">
                        {a.from_status ? `${STATUS_LABEL[a.from_status] || a.from_status} → ` : ""}
                        {STATUS_LABEL[a.to_status] || a.to_status}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(a.created_at), "MMM d, HH:mm")}</span>
                    </div>
                    {a.note && <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{a.note}</p>}
                  </div>
                ))}
              </div>
            )}
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
