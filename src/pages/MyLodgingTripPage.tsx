/**
 * MyLodgingTripPage — guest-facing trip detail page for a lodge reservation.
 * Route: /my-trips/lodging/:reservationId
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarRange, XCircle, MessageSquare, CreditCard, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useReservationLive } from "@/hooks/lodging/useReservationLive";
import { useReservationChangeRequests } from "@/hooks/lodging/useReservationChangeRequests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StayHeroCard from "@/components/lodging/guest/StayHeroCard";
import RescheduleSheet from "@/components/lodging/guest/RescheduleSheet";
import CancelReservationSheet from "@/components/lodging/guest/CancelReservationSheet";
import CheckInQrCard from "@/components/lodging/guest/CheckInQrCard";
import ReceiptActions from "@/components/lodging/guest/ReceiptActions";

interface FullReservation {
  id: string;
  store_id: string;
  room_id: string;
  number: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  status: string;
  payment_status: string;
  total_cents: number;
  paid_cents: number;
  room_number: string | null;
}

const REQ_STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  auto_approved: "default",
  approved: "default",
  declined: "destructive",
  cancelled: "outline",
};

export default function MyLodgingTripPage() {
  const { reservationId = "" } = useParams();
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: reservation, isLoading } = useQuery({
    queryKey: ["lodge-reservation-full", reservationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lodge_reservations" as any)
        .select("id, store_id, room_id, number, guest_name, check_in, check_out, nights, status, payment_status, total_cents, paid_cents, room_number")
        .eq("id", reservationId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as FullReservation | null;
    },
    enabled: !!reservationId,
  });

  // Realtime status updates
  useReservationLive(reservationId);

  const { data: store } = useQuery({
    queryKey: ["lodge-store-name", reservation?.store_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("restaurants" as any)
        .select("name")
        .eq("id", reservation!.store_id)
        .maybeSingle();
      return (data as unknown) as { name: string } | null;
    },
    enabled: !!reservation?.store_id,
  });

  const { data: requests = [] } = useReservationChangeRequests(reservationId);

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Reservation not found</h1>
        <p className="text-muted-foreground mb-4">It may have been deleted or you don't have access.</p>
        <Button asChild><Link to="/my-trips">Back to my trips</Link></Button>
      </div>
    );
  }

  const isActive = !["cancelled", "checked_out", "no_show"].includes(reservation.status);
  const balanceCents = Math.max(0, reservation.total_cents - reservation.paid_cents);

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4 pb-24">
      <Link to="/my-trips" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> All trips
      </Link>

      <StayHeroCard
        propertyName={store?.name || "Your stay"}
        roomLabel={reservation.room_number ? `Room ${reservation.room_number}` : null}
        checkIn={reservation.check_in}
        checkOut={reservation.check_out}
        nights={reservation.nights}
        status={reservation.status}
      />

      <CheckInQrCard
        reservationNumber={reservation.number}
        reservationId={reservation.id}
        checkIn={reservation.check_in}
        checkOut={reservation.check_out}
        status={reservation.status}
      />

      {/* Manage actions */}
      {isActive && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Manage your stay</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={() => setRescheduleOpen(true)}>
              <CalendarRange className="w-4 h-4" />
              <span className="text-xs">Change dates</span>
            </Button>
            <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={() => setCancelOpen(true)}>
              <XCircle className="w-4 h-4" />
              <span className="text-xs">Cancel</span>
            </Button>
            <Button asChild variant="outline" className="gap-2 h-auto py-3 flex-col col-span-2">
              <Link to={`/chat?store=${reservation.store_id}`}>
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">Message property</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">${(reservation.total_cents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid</span>
            <span>${(reservation.paid_cents / 100).toFixed(2)}</span>
          </div>
          {balanceCents > 0 && (
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Balance due</span>
              <span className="font-bold text-destructive">${(balanceCents / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2">
            <Badge variant="outline" className="capitalize">{reservation.payment_status.replace(/_/g, " ")}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Change request history */}
      {requests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Request history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="flex items-start justify-between gap-2 p-2 rounded-lg border bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium capitalize">{r.type}</span>
                    <Badge variant={REQ_STATUS_VARIANT[r.status]} className="text-[10px] capitalize">
                      {r.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {r.proposed_check_in && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      → {r.proposed_check_in} to {r.proposed_check_out}
                    </p>
                  )}
                  {r.host_response && <p className="text-xs italic text-muted-foreground mt-0.5">"{r.host_response}"</p>}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {format(parseISO(r.created_at), "MMM d")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ReceiptActions
        reservationNumber={reservation.number}
        reservationId={reservation.id}
        propertyName={store?.name || "Your stay"}
        checkIn={reservation.check_in}
        checkOut={reservation.check_out}
      />

      <RescheduleSheet
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        reservationId={reservation.id}
        roomId={reservation.room_id}
        checkIn={reservation.check_in}
        checkOut={reservation.check_out}
        totalCents={reservation.total_cents}
      />
      <CancelReservationSheet
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        reservationId={reservation.id}
        checkIn={reservation.check_in}
        totalCents={reservation.total_cents}
        paidCents={reservation.paid_cents}
      />
    </div>
  );
}
