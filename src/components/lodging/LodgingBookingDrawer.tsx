/**
 * LodgingBookingDrawer - Multi-step booking sheet (stay → add-ons → guest info).
 * Writes a 'hold' lodge_reservations row with addons snapshot.
 */
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ResponsiveModal, ResponsiveModalFooter } from "@/components/ui/responsive-modal";
import { CountryPhoneInput } from "@/components/auth/CountryPhoneInput";
import { LodgingStaySelector } from "@/components/lodging/LodgingStaySelector";
import { useRoomAvailability, hasUnavailableNight } from "@/hooks/lodging/useRoomAvailability";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LodgeAddon } from "@/hooks/lodging/useLodgeRooms";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  roomId: string;
  roomName: string;
  baseRateCents: number;
  weekendRateCents?: number;
  weeklyDiscountPct?: number;
  monthlyDiscountPct?: number;
  cancellationPolicy?: string | null;
  addons?: LodgeAddon[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  onBooked?: () => void;
}

type Step = "stay" | "addons" | "guest";

interface SelectedAddon extends LodgeAddon {
  qty: number;
}

export function LodgingBookingDrawer({
  open, onClose, storeId, storeName, roomId, roomName,
  baseRateCents, weekendRateCents, weeklyDiscountPct = 0, monthlyDiscountPct = 0,
  cancellationPolicy, addons = [],
  checkIn: initialCi, checkOut: initialCo, adults: initialAdults, children: initialChildren,
  onBooked,
}: Props) {
  const [step, setStep] = useState<Step>("stay");
  const [checkIn, setCheckIn] = useState(initialCi);
  const [checkOut, setCheckOut] = useState(initialCo);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [selected, setSelected] = useState<Record<number, SelectedAddon>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { availabilityMap, disabledDates } = useRoomAvailability(open ? roomId : undefined);
  const rangeIssue = useMemo(
    () => hasUnavailableNight(availabilityMap, checkIn, checkOut),
    [availabilityMap, checkIn, checkOut]
  );

  const breakdown = useMemo(() => {
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
    let roomTotal = 0;
    for (let i = 0; i < nights; i++) {
      const d = new Date(ci.getTime() + i * 86400000);
      const dow = d.getDay(); // 5=Fri, 6=Sat
      const isWeekend = dow === 5 || dow === 6;
      roomTotal += isWeekend && weekendRateCents ? weekendRateCents : baseRateCents;
    }
    let discountPct = 0;
    if (nights >= 28 && monthlyDiscountPct) discountPct = monthlyDiscountPct;
    else if (nights >= 7 && weeklyDiscountPct) discountPct = weeklyDiscountPct;
    const discountCents = Math.round(roomTotal * (discountPct / 100));
    const roomAfter = roomTotal - discountCents;

    const addonsSnapshot: (LodgeAddon & { qty: number; subtotal_cents: number })[] = [];
    let addonsTotal = 0;
    Object.values(selected).forEach((a) => {
      if (!a.qty) return;
      let units = a.qty;
      if (a.per === "night") units *= nights;
      else if (a.per === "guest") units *= (adults + children);
      else if (a.per === "person_night") units *= nights * (adults + children);
      const subtotal = a.price_cents * units;
      addonsTotal += subtotal;
      addonsSnapshot.push({ name: a.name, price_cents: a.price_cents, per: a.per, qty: a.qty, subtotal_cents: subtotal });
    });

    return { nights, roomTotal, discountPct, discountCents, roomAfter, addonsTotal, addonsSnapshot, total: roomAfter + addonsTotal };
  }, [checkIn, checkOut, baseRateCents, weekendRateCents, weeklyDiscountPct, monthlyDiscountPct, selected, adults, children]);

  const goNext = () => setStep(step === "stay" ? "addons" : "guest");
  const goBack = () => setStep(step === "guest" ? "addons" : "stay");

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
        rate_cents: baseRateCents, total_cents: breakdown.total, payment_status: "unpaid",
        addons: breakdown.addonsSnapshot,
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

  const fmtMoney = (c: number) => `$${(c / 100).toFixed(2)}`;
  const hasAddons = (addons || []).length > 0;

  const stepLabel = step === "stay" ? "1 of 3 · Your stay" : step === "addons" ? "2 of 3 · Add-ons" : "3 of 3 · Guest info";

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={`Reserve ${roomName}`}
      description={stepLabel}
      footer={
        <ResponsiveModalFooter>
          {step !== "stay" && (
            <Button variant="outline" onClick={goBack} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {step !== "guest" ? (
            <Button
              onClick={() => (step === "stay" && !hasAddons ? setStep("guest") : goNext())}
              className="gap-1"
              disabled={rangeIssue.invalid}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting || rangeIssue.invalid} className="gap-1 font-bold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Request · {fmtMoney(breakdown.total)}
            </Button>
          )}
        </ResponsiveModalFooter>
      }
    >
      <div className="space-y-4 pt-2">
        {rangeIssue.invalid && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="text-xs font-medium space-y-0.5">
              <p>One or more nights are no longer available ({rangeIssue.firstReason === "sold_out" ? "sold out" : "restricted"}).</p>
              {step !== "stay" && <p className="font-semibold">Tap Back to pick new dates.</p>}
            </div>
          </div>
        )}
        {step === "stay" && (
          <>
            <LodgingStaySelector
              checkIn={checkIn} checkOut={checkOut} adults={adults} children={children}
              onChange={(v) => { setCheckIn(v.checkIn); setCheckOut(v.checkOut); setAdults(v.adults); setChildren(v.children); }}
              disabledDates={disabledDates}
              availabilityMap={availabilityMap}
              showReasonLegend
            />
            <PriceSummary breakdown={breakdown} fmt={fmtMoney} />
          </>
        )}

        {step !== "stay" && (
          <LodgingStaySelector
            checkIn={checkIn} checkOut={checkOut} adults={adults} children={children}
            onChange={() => {}}
            availabilityMap={availabilityMap}
            disabledDates={disabledDates}
            locked
          />
        )}

        {step === "addons" && (
          <>
            {!hasAddons ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No extras for this room.</p>
            ) : (
              <div className="space-y-2">
                {addons.map((a, i) => {
                  const sel = selected[i];
                  const checked = !!sel?.qty;
                  return (
                    <label key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          setSelected(prev => {
                            const next = { ...prev };
                            if (v) next[i] = { ...a, qty: 1 };
                            else delete next[i];
                            return next;
                          });
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{a.name || "Untitled add-on"}</p>
                        <p className="text-xs text-muted-foreground">
                          {fmtMoney(a.price_cents)} per {a.per}
                        </p>
                      </div>
                      {checked && a.per === "guest" && (
                        <Input
                          type="number" inputMode="numeric" min={1}
                          className="w-16 h-8 text-xs"
                          value={sel.qty}
                          onChange={(e) => {
                            const n = Math.max(1, parseInt(e.target.value) || 1);
                            setSelected(prev => ({ ...prev, [i]: { ...prev[i], qty: n } }));
                          }}
                          onClick={(e) => e.preventDefault()}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            <PriceSummary breakdown={breakdown} fmt={fmtMoney} />
          </>
        )}

        {step === "guest" && (
          <>
            <div><Label>Full name *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" /></div>
            <div>
              <Label>Phone *</Label>
              <CountryPhoneInput value={phone} onChange={setPhone} />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
              <div><Label>Country</Label><Input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. United States" /></div>
            </div>
            <div><Label>Notes / special requests</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></div>

            <PriceSummary breakdown={breakdown} fmt={fmtMoney} />

            <div className="text-[11px] text-muted-foreground space-y-1">
              <p>Your request will be sent to {storeName} for confirmation. Pay at the property unless arranged with the host.</p>
              {cancellationPolicy && (
                <p>Cancellation policy: <span className="font-semibold">{cancellationPolicy.replace("_", "-")}</span>.</p>
              )}
            </div>
          </>
        )}
      </div>
    </ResponsiveModal>
  );
}

type Breakdown = {
  nights: number;
  roomTotal: number;
  discountPct: number;
  discountCents: number;
  roomAfter: number;
  addonsTotal: number;
  addonsSnapshot: { name: string; price_cents: number; per: string; qty: number; subtotal_cents: number }[];
  total: number;
};

function PriceSummary({ breakdown, fmt }: { breakdown: Breakdown; fmt: (c: number) => string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Room · {breakdown.nights} night{breakdown.nights > 1 ? "s" : ""}</span>
        <span className="font-semibold">{fmt(breakdown.roomTotal)}</span>
      </div>
      {breakdown.discountCents > 0 && (
        <div className="flex justify-between text-primary">
          <span>Discount ({breakdown.discountPct}%)</span>
          <span>−{fmt(breakdown.discountCents)}</span>
        </div>
      )}
      {breakdown.addonsSnapshot.map((a, i) => (
        <div key={i} className="flex justify-between">
          <span className="text-muted-foreground">{a.name} ({a.per === "stay" ? "stay" : `${a.qty}× ${a.per}`})</span>
          <span>{fmt(a.subtotal_cents)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-border/50 pt-1.5 mt-1.5">
        <span className="font-bold">Total</span>
        <span className="font-bold text-primary">{fmt(breakdown.total)}</span>
      </div>
    </div>
  );
}

