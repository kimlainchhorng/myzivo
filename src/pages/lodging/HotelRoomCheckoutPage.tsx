import { useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format, differenceInCalendarDays, parseISO, isValid, addDays } from "date-fns";
import {
  ArrowLeft, Hotel, CalendarRange, Users, CreditCard, Banknote,
  MapPin, Loader2, CheckCircle, ChevronRight, Shield, Star, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useLodgeRooms } from "@/hooks/lodging/useLodgeRooms";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";

const parseParamDate = (s: string | null) => {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? d : null;
};

const formatPrice = (cents: number) =>
  cents > 0 ? `$${(cents / 100).toFixed(0)}` : "—";

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

type PayMethod = "cash" | "card";

export default function HotelRoomCheckoutPage() {
  const { storeId = "" } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const roomId = params.get("room") || "";
  const checkIn = parseParamDate(params.get("ci")) ?? today();
  const checkOut = parseParamDate(params.get("co")) ?? addDays(today(), 1);
  const adults = Number(params.get("adults")) || 2;
  const children = Number(params.get("children")) || 0;
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));

  // Load store
  const storeQ = useQuery({
    queryKey: ["hotel-checkout-store", storeId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("store_profiles")
        .select("id, name, address, logo_url")
        .eq("id", storeId)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; name: string; address: string | null; logo_url: string | null } | null;
    },
    enabled: !!storeId,
  });

  // Load rooms
  const roomsQ = useLodgeRooms(storeId);
  const room = useMemo(
    () => (roomsQ.data || []).find((r) => r.id === roomId) ?? null,
    [roomsQ.data, roomId],
  );

  // Price calc
  const basePerNight = room?.base_rate_cents ?? 0;
  const subtotalCents = basePerNight * nights;
  const taxPct = (room?.fees?.vat_pct ?? 10);
  const taxCents = Math.round(subtotalCents * taxPct / 100);
  const totalCents = subtotalCents + taxCents + (room?.fees?.cleaning_fee_cents ?? 0);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("cash");
  const [submitting, setSubmitting] = useState(false);

  const isLoading = storeQ.isLoading || roomsQ.isLoading;

  const handleConfirm = async () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!phone.trim()) { toast.error("Please enter your phone number"); return; }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const ciStr = format(checkIn, "yyyy-MM-dd");
      const coStr = format(checkOut, "yyyy-MM-dd");

      const payload: any = {
        store_id: storeId,
        room_id: roomId || null,
        guest_id: user?.id ?? null,
        guest_name: name.trim(),
        guest_phone: phone.trim(),
        guest_email: email.trim() || null,
        adults,
        children,
        check_in: ciStr,
        check_out: coStr,
        status: payMethod === "cash" ? "confirmed" : "hold",
        source: "zivo_app",
        rate_cents: basePerNight,
        extras_cents: 0,
        tax_cents: taxCents,
        total_cents: totalCents,
        paid_cents: 0,
        payment_status: payMethod === "cash" ? "pending_cash" : "pending",
        notes: notes.trim() || null,
      };

      const { data: res, error } = await (supabase as any)
        .from("lodge_reservations")
        .insert(payload)
        .select("id, number")
        .single();

      if (error) throw error;

      if (payMethod === "card") {
        // Create Stripe checkout session for lodging reservation
        const { data: session, error: sessionErr } = await supabase.functions.invoke("create-lodging-checkout", {
          body: {
            reservation_id: res.id,
            store_id: storeId,
            room_name: room?.name ?? "Room",
            nights,
            total_cents: totalCents,
            guest_name: name.trim(),
            guest_email: email.trim() || undefined,
            success_url: `${window.location.origin}/hotel/${storeId}/booking-confirmed?reservation_id=${res.id}`,
            cancel_url: window.location.href,
          },
        });

        if (sessionErr || !session?.url) {
          toast.error("Could not open payment. Your reservation is held — pay at check-in.");
          navigate(`/hotel/${storeId}/booking-confirmed?reservation_id=${res.id}`);
          return;
        }

        window.location.href = session.url;
        return;
      }

      toast.success("Booking confirmed!");
      navigate(`/hotel/${storeId}/booking-confirmed?reservation_id=${res.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const store = storeQ.data;
  const photo = room?.photos?.[room.cover_photo_index ?? 0] || room?.photos?.[0];

  return (
    <div className="min-h-screen bg-background pb-32">
      <SEOHead
        title="Hotel Booking – Complete Your Reservation – ZIVO"
        description="Complete your hotel reservation securely. Review pricing, confirm details, and book your stay with flexible payment options."
      />
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">Confirm Booking</h1>
          {store && <p className="text-[11px] text-muted-foreground truncate">{store.name}</p>}
        </div>
        <Shield className="w-4 h-4 text-emerald-600" />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* Room summary card */}
        {isLoading ? (
          <Skeleton className="h-28 rounded-2xl" />
        ) : room ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/40 bg-card overflow-hidden flex gap-0"
          >
            <div className="w-28 shrink-0 relative">
              {photo ? (
                <img src={photo} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full min-h-[96px] bg-muted flex items-center justify-center">
                  <Hotel className="w-6 h-6 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="p-3 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className="text-sm font-bold text-foreground truncate">{room.name}</p>
                {room.breakfast_included && (
                  <Badge variant="outline" className="text-[9px] shrink-0">Breakfast</Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {room.beds || room.room_type || "Room"} · {room.max_guests} guests
              </p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarRange className="w-3 h-3" />
                  {format(checkIn, "MMM d")} – {format(checkOut, "MMM d")}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {adults + children} guest{adults + children > 1 ? "s" : ""}
                </span>
              </div>
              {store?.address && (
                <p className="mt-1 text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  {store.address}
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive text-center">
            Room not found. Please go back and select a room.
          </div>
        )}

        {/* Dates strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-2"
        >
          {[
            { label: "Check-in", value: format(checkIn, "EEE, MMM d") },
            { label: "Check-out", value: format(checkOut, "EEE, MMM d") },
            { label: "Duration", value: `${nights} night${nights > 1 ? "s" : ""}` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-muted/30 border border-border/30 p-2.5 text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</p>
              <p className="text-[11px] font-bold mt-0.5 text-foreground">{item.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Guest info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/40 bg-card p-4 space-y-3"
        >
          <p className="text-sm font-bold text-foreground">Guest Details</p>
          <div className="space-y-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Full name *</Label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Phone number *</Label>
              <Input
                placeholder="+855 12 345 678"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Email (optional)</Label>
              <Input
                placeholder="you@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Special requests (optional)</Label>
              <Textarea
                placeholder="Early check-in, high floor, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl text-sm resize-none"
                rows={2}
              />
            </div>
          </div>
        </motion.div>

        {/* Price breakdown */}
        {room && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border/40 bg-card p-4 space-y-2"
          >
            <p className="text-sm font-bold text-foreground">Price Breakdown</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{formatPrice(basePerNight)} × {nights} night{nights > 1 ? "s" : ""}</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes ({taxPct}%)</span>
                <span>{formatPrice(taxCents)}</span>
              </div>
              {(room.fees?.cleaning_fee_cents ?? 0) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Cleaning fee</span>
                  <span>{formatPrice(room.fees!.cleaning_fee_cents!)}</span>
                </div>
              )}
              <Separator className="my-1 bg-border/30" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalCents)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment method */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/40 bg-card p-4 space-y-3"
        >
          <p className="text-sm font-bold text-foreground">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: "cash" as PayMethod, icon: Banknote, label: "Cash at hotel", sub: "Pay when you arrive" },
              { key: "card" as PayMethod, icon: CreditCard, label: "Pay online", sub: "Secure card payment" },
            ]).map(({ key, icon: Icon, label, sub }) => (
              <button
                key={key}
                onClick={() => setPayMethod(key)}
                className={cn(
                  "flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all",
                  payMethod === key
                    ? "border-primary bg-primary/5"
                    : "border-border/40 bg-muted/20 hover:border-border/70",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("w-4 h-4", payMethod === key ? "text-primary" : "text-muted-foreground")} />
                  {payMethod === key && <CheckCircle className="w-3 h-3 text-primary ml-auto" />}
                </div>
                <p className={cn("text-[12px] font-semibold", payMethod === key ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </button>
            ))}
          </div>
          {payMethod === "cash" && (
            <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Your room is reserved instantly. Pay the full amount at the front desk upon arrival.
            </p>
          )}
        </motion.div>

        {/* Cancellation policy */}
        {room?.cancellation_policy && (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 px-3 py-2.5 text-[11px] text-muted-foreground">
            <span className="font-semibold text-amber-700 dark:text-amber-400">Cancellation: </span>
            {room.cancellation_policy}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="pt-2"
        >
          <Button
            size="lg"
            className="w-full h-13 rounded-2xl font-bold gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            disabled={submitting || !room || isLoading}
            onClick={handleConfirm}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : payMethod === "card" ? (
              <>
                <CreditCard className="w-4 h-4" />
                Pay {formatPrice(totalCents)} · Confirm Booking
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm Booking
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Your booking is protected by ZIVO
          </p>
        </motion.div>

      </div>

      <ZivoMobileNav />
    </div>
  );
}
