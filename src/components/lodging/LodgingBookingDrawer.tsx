/**
 * LodgingBookingDrawer - Collects guest info & writes a 'hold' reservation.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  storeId: string;
  storeName: string;
  roomId: string;
  roomName: string;
  baseRateCents: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  onClose: () => void;
  onBooked?: () => void;
}

export function LodgingBookingDrawer({
  storeId, storeName, roomId, roomName, baseRateCents,
  checkIn, checkOut, adults, children, onClose, onBooked,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nights = Math.max(1, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  const total = baseRateCents * nights;

  const submit = async () => {
    if (!name.trim() || !phone.trim()) { toast.error("Name and phone required"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("lodge_reservations" as any).insert({
        store_id: storeId,
        room_id: roomId,
        number: `RES-${Date.now().toString().slice(-6)}`,
        guest_name: name, guest_phone: phone, guest_email: email || null, guest_country: country || null,
        adults, children, check_in: checkIn, check_out: checkOut,
        status: "hold", source: "direct",
        rate_cents: baseRateCents, total_cents: total, payment_status: "unpaid",
        notes: notes || null,
      });
      if (error) throw error;
      toast.success(`Booking request sent to ${storeName}`);
      onBooked?.();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed inset-x-0 bottom-0 z-[61] bg-card rounded-t-3xl max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-card border-b px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">Reserve {roomName}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-muted/50 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span className="font-semibold">{checkIn}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span className="font-semibold">{checkOut}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="font-semibold">{adults}A{children ? `/${children}C` : ""}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nights</span><span className="font-semibold">{nights}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold">Total</span><span className="font-bold text-primary">${(total / 100).toFixed(2)}</span></div>
          </div>

          <div><Label>Full name *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Phone *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+855 ..." /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          </div>
          <div><Label>Country</Label><Input value={country} onChange={e => setCountry(e.target.value)} /></div>
          <div><Label>Notes / special requests</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></div>

          <p className="text-[11px] text-muted-foreground">
            Your request will be sent to {storeName} for confirmation. Payment is collected at the property unless otherwise arranged.
          </p>

          <Button onClick={submit} disabled={submitting} className="w-full h-12 text-base font-bold">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : `Request Booking · $${(total / 100).toFixed(2)}`}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
