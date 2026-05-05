import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  CheckCircle, Hotel, CalendarRange, Users, MapPin, Copy,
  ChevronRight, Share2, Sparkles, Clock, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { openShareToChat } from "@/components/chat/ShareToChatSheet";
import SEOHead from "@/components/SEOHead";

const formatPrice = (cents: number) =>
  cents > 0 ? `$${(cents / 100).toFixed(0)}` : "—";

interface ReservationSummary {
  id: string;
  number: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  total_cents: number;
  payment_status: string;
  status: string;
  notes: string | null;
  room: { name: string; photos: string[] | null } | null;
  store: { name: string; address: string | null } | null;
}

export default function HotelBookingConfirmedPage() {
  const { storeId = "" } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reservationId = params.get("reservation_id") || "";

  const [reservation, setReservation] = useState<ReservationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reservationId) { setLoading(false); return; }
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("lodge_reservations")
          .select(`
            id, number, guest_name, check_in, check_out, nights,
            adults, children, total_cents, payment_status, status, notes,
            room:lodge_rooms(name, photos),
            store:store_profiles(name, address)
          `)
          .eq("id", reservationId)
          .single();
        if (!error && data) setReservation(data as unknown as ReservationSummary);
      } catch {
        // best-effort
      } finally {
        setLoading(false);
      }
    })();
  }, [reservationId]);

  const copyRef = () => {
    const ref = reservation?.number || reservationId.slice(0, 8).toUpperCase();
    navigator.clipboard.writeText(ref);
    toast.success("Reference copied");
  };

  const handleShare = () => {
    if (!reservation) return;
    openShareToChat({
      kind: "hotel",
      title: reservation.store?.name || "Hotel Booking",
      subtitle: `${format(parseISO(reservation.check_in), "MMM d")} – ${format(parseISO(reservation.check_out), "MMM d")} · ${reservation.room?.name || "Room"}`,
      meta: formatPrice(reservation.total_cents),
      deepLink: `/hotel/${storeId}`,
      image: reservation.room?.photos?.[0] ?? null,
    });
  };

  const isCash = reservation?.payment_status === "pending_cash";
  const nights = reservation?.nights ?? 1;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-28 safe-area-top">
      <SEOHead
        title={loading ? "Hotel Booking – ZIVO" : `${reservation?.room?.name || "Hotel"} Booking Confirmed – ZIVO`}
        description="Your hotel booking has been confirmed. View your reservation details and check-in information."
      />
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-emerald-500/10 blur-[80px]" />
      </div>

      <div className="relative max-w-md mx-auto px-5 pt-12 flex flex-col items-center">

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 150, delay: 0.1 }}
          className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/25 to-emerald-400/10 flex items-center justify-center mb-5 ring-4 ring-emerald-500/10 shadow-2xl shadow-emerald-500/20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-12 w-12 text-emerald-500" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-extrabold mb-1 tracking-tight"
        >
          Booking Confirmed!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[13px] text-muted-foreground text-center max-w-xs mb-6"
        >
          {isCash
            ? "Your room is reserved. Pay the full amount at the front desk upon check-in."
            : "Your payment was received. We look forward to hosting you!"}
        </motion.p>

        {/* Reservation reference */}
        {loading ? (
          <Skeleton className="h-16 w-full rounded-2xl mb-5" />
        ) : reservation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl bg-muted/20 border border-border/20 px-5 py-4 mb-5 w-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Reservation</p>
                <button onClick={copyRef} className="flex items-center gap-1.5 mt-0.5 group">
                  <p className="text-[15px] font-mono font-bold text-foreground">
                    {reservation.number || reservationId.slice(0, 8).toUpperCase()}
                  </p>
                  <Copy className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </button>
                {reservation.store?.name && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{reservation.store.name}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                  <span className="text-[10px] font-bold text-emerald-600">
                    {reservation.status === "confirmed" ? "Confirmed" : "Held"}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-foreground">{formatPrice(reservation.total_cents)}</span>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Stay details */}
        {reservation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full rounded-2xl bg-card border border-border/20 p-4 mb-5 space-y-3"
          >
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" /> Stay Summary
            </p>

            {reservation.room?.name && (
              <div className="flex items-start gap-2.5">
                <Hotel className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-semibold text-foreground">{reservation.room.name}</p>
                  {reservation.store?.address && (
                    <p className="text-[10px] text-muted-foreground">{reservation.store.address}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <CalendarRange className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-foreground">
                  {format(parseISO(reservation.check_in), "EEE, MMM d")} → {format(parseISO(reservation.check_out), "EEE, MMM d")}
                </p>
                <p className="text-[10px] text-muted-foreground">{nights} night{nights > 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[12px] font-semibold text-foreground">
                {reservation.adults} adult{reservation.adults > 1 ? "s" : ""}
                {reservation.children > 0 ? `, ${reservation.children} child${reservation.children > 1 ? "ren" : ""}` : ""}
              </p>
            </div>

            {isCash && (
              <div className="flex items-center gap-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 px-3 py-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Pay {formatPrice(reservation.total_cents)} at front desk upon arrival
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Info chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-2.5 w-full mb-5"
        >
          <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center">
            <Hotel className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[11px] font-bold">{nights}N</p>
            <p className="text-[8px] text-muted-foreground">Nights</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
            <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-[11px] font-bold">Ready</p>
            <p className="text-[8px] text-muted-foreground">Status</p>
          </div>
          <div className="p-3 rounded-2xl bg-muted/20 border border-border/15 text-center">
            <ShoppingBag className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[11px] font-bold">{formatPrice(reservation?.total_cents ?? 0)}</p>
            <p className="text-[8px] text-muted-foreground">Total</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-2.5 w-full"
        >
          {reservationId && (
            <Button
              onClick={() => navigate(`/my-trips/lodging/${reservationId}`)}
              className="w-full rounded-2xl h-12 font-bold gap-2"
            >
              <MapPin className="h-4 w-4" />
              View My Booking
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              onClick={() => navigate(`/hotel/${storeId}`)}
              className="flex-1 rounded-2xl h-11"
            >
              <Hotel className="h-4 w-4 mr-1.5" />
              Back to Hotel
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="rounded-2xl h-11 px-4"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

      </div>

      <ZivoMobileNav />
    </div>
  );
}
