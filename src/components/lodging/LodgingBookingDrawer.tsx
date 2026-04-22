/**
 * LodgingBookingDrawer - Multi-step booking sheet (stay → add-ons → guest info).
 * Writes a 'hold' lodge_reservations row with addons + fee breakdown snapshot.
 */
import { useMemo, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Minus, Plus, AlertTriangle } from "lucide-react";
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
import type { LodgeAddon, RoomFees, ChildPolicy } from "@/hooks/lodging/useLodgeRooms";

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
  fees?: RoomFees;
  childPolicy?: ChildPolicy;
  minStay?: number;
  maxStay?: number | null;
  noArrivalWeekdays?: number[];
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

const ETA_OPTIONS = [
  "Before 3 PM", "3 – 6 PM", "6 – 9 PM", "After 9 PM", "Next day", "Not sure yet",
];

export function LodgingBookingDrawer({
  open, onClose, storeId, storeName, roomId, roomName,
  baseRateCents, weekendRateCents, weeklyDiscountPct = 0, monthlyDiscountPct = 0,
  cancellationPolicy, addons = [], fees, childPolicy,
  minStay = 1, maxStay, noArrivalWeekdays = [],
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
  const [eta, setEta] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { availabilityMap, disabledDates } = useRoomAvailability(open ? roomId : undefined);
  const rangeIssue = useMemo(
    () => hasUnavailableNight(availabilityMap, checkIn, checkOut),
    [availabilityMap, checkIn, checkOut]
  );

  // Stay-rules validation
  const stayIssue = useMemo(() => {
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
    if (nights < (minStay || 1)) return { invalid: true, msg: `Minimum stay is ${minStay} night${minStay! > 1 ? "s" : ""}` };
    if (maxStay && nights > maxStay) return { invalid: true, msg: `Maximum stay is ${maxStay} nights` };
    if (noArrivalWeekdays?.includes(ci.getDay())) {
      return { invalid: true, msg: "This room can't be booked to start on this weekday" };
    }
    return { invalid: false, msg: "" };
  }, [checkIn, checkOut, minStay, maxStay, noArrivalWeekdays]);

  const breakdown = useMemo(() => {
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
    const totalGuests = adults + children;
    let roomTotal = 0;
    let weekendNights = 0;
    for (let i = 0; i < nights; i++) {
      const d = new Date(ci.getTime() + i * 86400000);
      const dow = d.getDay(); // 5=Fri, 6=Sat
      const isWeekend = dow === 5 || dow === 6;
      if (isWeekend && weekendRateCents) weekendNights++;
      roomTotal += isWeekend && weekendRateCents ? weekendRateCents : baseRateCents;
    }
    const weekendUplift = weekendNights * Math.max(0, (weekendRateCents || baseRateCents) - baseRateCents);
    let discountPct = 0;
    if (nights >= 28 && monthlyDiscountPct) discountPct = monthlyDiscountPct;
    else if (nights >= 7 && weeklyDiscountPct) discountPct = weeklyDiscountPct;
    const discountCents = Math.round(roomTotal * (discountPct / 100));
    const roomAfter = roomTotal - discountCents;

    // Add-ons
    const addonsSnapshot: (LodgeAddon & { qty: number; subtotal_cents: number })[] = [];
    let addonsTotal = 0;
    Object.values(selected).forEach((a) => {
      if (!a.qty) return;
      let units = a.qty;
      if (a.per === "night") units *= nights;
      else if (a.per === "guest") units *= totalGuests;
      else if (a.per === "person_night") units *= nights * totalGuests;
      const subtotal = a.price_cents * units;
      addonsTotal += subtotal;
      addonsSnapshot.push({
        name: a.name, price_cents: a.price_cents, per: a.per, qty: a.qty,
        subtotal_cents: subtotal, category: a.category, icon: a.icon,
      });
    });

    // Extra-guest fees (rough — only kicks in above 2 base guests)
    const baseOccupancy = 2;
    const extraAdults = Math.max(0, adults - baseOccupancy);
    const extraChildren = children;
    const freeChildAge = childPolicy?.free_age ?? 0;
    // (We don't know individual ages — treat all "children" as paying unless free_age is set high)
    const chargeableChildren = freeChildAge > 0 ? extraChildren : extraChildren;
    const extraAdultFee = (childPolicy?.extra_adult_fee_cents || 0) * extraAdults * nights;
    const extraChildFee = (childPolicy?.extra_child_fee_cents || 0) * chargeableChildren * nights;
    const extraGuestTotal = extraAdultFee + extraChildFee;

    // Fees
    const cityTax = (fees?.city_tax_cents || 0) * totalGuests * nights;
    const resortFee = (fees?.resort_fee_cents || 0) * nights;
    const cleaningFee = fees?.cleaning_fee_cents || 0;
    const taxableSubtotal = roomAfter + addonsTotal + extraGuestTotal + resortFee + cleaningFee;
    const serviceCharge = Math.round(taxableSubtotal * ((fees?.service_charge_pct || 0) / 100));
    const vat = Math.round((taxableSubtotal + serviceCharge) * ((fees?.vat_pct || 0) / 100));

    const feesTotal = cityTax + resortFee + cleaningFee + serviceCharge + vat;
    const total = roomAfter + addonsTotal + extraGuestTotal + feesTotal;

    const feeBreakdown = {
      city_tax_cents: cityTax,
      resort_fee_cents: resortFee,
      cleaning_fee_cents: cleaningFee,
      service_charge_cents: serviceCharge,
      vat_cents: vat,
      extra_adult_fee_cents: extraAdultFee,
      extra_child_fee_cents: extraChildFee,
      weekend_uplift_cents: weekendUplift,
      discount_cents: discountCents,
    };

    return {
      nights, totalGuests, roomTotal, weekendUplift, discountPct, discountCents, roomAfter,
      addonsTotal, addonsSnapshot, extraGuestTotal, extraAdultFee, extraChildFee,
      cityTax, resortFee, cleaningFee, serviceCharge, vat, feesTotal, total, feeBreakdown,
    };
  }, [checkIn, checkOut, baseRateCents, weekendRateCents, weeklyDiscountPct, monthlyDiscountPct, selected, adults, children, fees, childPolicy]);

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
        addon_selections: breakdown.addonsSnapshot,
        fee_breakdown: breakdown.feeBreakdown,
        guest_details: { name, phone, email, country, eta, notes },
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
  const blocked = rangeIssue.invalid || stayIssue.invalid;

  const stepLabel = step === "stay" ? "1 of 3 · Your stay" : step === "addons" ? "2 of 3 · Add-ons" : "3 of 3 · Guest info";

  const setAddonQty = (idx: number, qty: number, addon?: LodgeAddon) => {
    setSelected(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[idx];
      else next[idx] = { ...(addon || prev[idx]), qty };
      return next;
    });
  };

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
              disabled={blocked}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting || blocked} className="gap-1 font-bold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Request · {fmtMoney(breakdown.total)}
            </Button>
          )}
        </ResponsiveModalFooter>
      }
    >
      <div className="space-y-4 pt-2">
        {(rangeIssue.invalid || stayIssue.invalid) && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="text-xs font-medium space-y-0.5">
              {rangeIssue.invalid && (
                <p>One or more nights are no longer available ({rangeIssue.firstReason === "sold_out" ? "sold out" : "restricted"}).</p>
              )}
              {stayIssue.invalid && <p>{stayIssue.msg}</p>}
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
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => setAddonQty(i, v ? 1 : 0, a)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          {a.icon && <span>{a.icon}</span>}
                          {a.name || "Untitled add-on"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtMoney(a.price_cents)} per {a.per === "person_night" ? "guest / night" : a.per}
                        </p>
                      </div>
                      {checked && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button" size="icon" variant="outline" className="h-7 w-7"
                            onClick={() => setAddonQty(i, Math.max(0, (sel.qty || 1) - 1), a)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number" inputMode="numeric" min={1}
                            className="w-12 h-7 text-xs text-center"
                            value={sel.qty}
                            onChange={(e) => {
                              const n = Math.max(1, parseInt(e.target.value) || 1);
                              setAddonQty(i, n, a);
                            }}
                          />
                          <Button
                            type="button" size="icon" variant="outline" className="h-7 w-7"
                            onClick={() => setAddonQty(i, (sel.qty || 1) + 1, a)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
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
            <div>
              <Label>Estimated arrival time</Label>
              <select value={eta} onChange={e => setEta(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Choose ETA…</option>
                {ETA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div><Label>Notes / special requests</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Late check-in, extra pillows, dietary needs…" /></div>

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

type Breakdown = ReturnType<typeof buildBreakdownType>;
// type alias trick — we mirror the breakdown shape via the actual function
function buildBreakdownType() {
  return null as unknown as {
    nights: number;
    totalGuests: number;
    roomTotal: number;
    weekendUplift: number;
    discountPct: number;
    discountCents: number;
    roomAfter: number;
    addonsTotal: number;
    addonsSnapshot: { name: string; price_cents: number; per: string; qty: number; subtotal_cents: number; icon?: string; category?: string }[];
    extraGuestTotal: number;
    extraAdultFee: number;
    extraChildFee: number;
    cityTax: number;
    resortFee: number;
    cleaningFee: number;
    serviceCharge: number;
    vat: number;
    feesTotal: number;
    total: number;
    feeBreakdown: Record<string, number>;
  };
}

function PriceSummary({ breakdown, fmt }: { breakdown: Breakdown; fmt: (c: number) => string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Room · {breakdown.nights} night{breakdown.nights > 1 ? "s" : ""}</span>
        <span className="font-semibold">{fmt(breakdown.roomTotal - breakdown.weekendUplift)}</span>
      </div>
      {breakdown.weekendUplift > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Weekend uplift</span>
          <span>{fmt(breakdown.weekendUplift)}</span>
        </div>
      )}
      {breakdown.discountCents > 0 && (
        <div className="flex justify-between text-primary">
          <span>Discount ({breakdown.discountPct}%)</span>
          <span>−{fmt(breakdown.discountCents)}</span>
        </div>
      )}
      {breakdown.addonsSnapshot.map((a, i) => (
        <div key={i} className="flex justify-between">
          <span className="text-muted-foreground">{a.icon ? `${a.icon} ` : ""}{a.name} ({a.per === "stay" ? "stay" : `${a.qty}× ${a.per === "person_night" ? "guest/night" : a.per}`})</span>
          <span>{fmt(a.subtotal_cents)}</span>
        </div>
      ))}
      {breakdown.extraAdultFee > 0 && (
        <div className="flex justify-between"><span className="text-muted-foreground">Extra adult fee</span><span>{fmt(breakdown.extraAdultFee)}</span></div>
      )}
      {breakdown.extraChildFee > 0 && (
        <div className="flex justify-between"><span className="text-muted-foreground">Extra child fee</span><span>{fmt(breakdown.extraChildFee)}</span></div>
      )}
      {breakdown.cleaningFee > 0 && (
        <div className="flex justify-between"><span className="text-muted-foreground">Cleaning fee</span><span>{fmt(breakdown.cleaningFee)}</span></div>
      )}
      {breakdown.resortFee > 0 && (
        <div className="flex justify-between"><span className="text-muted-foreground">Resort fee</span><span>{fmt(breakdown.resortFee)}</span></div>
      )}
      {breakdown.cityTax > 0 && (
        <div className="flex justify-between"><span className="text-muted-foreground">City tax</span><span>{fmt(breakdown.cityTax)}</span></div>
      )}
      {breakdown.serviceCharge > 0 && (
        <div className="flex justify-between"><span className="text-muted-foreground">Service charge</span><span>{fmt(breakdown.serviceCharge)}</span></div>
      )}
      {breakdown.vat > 0 && (
        <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span>{fmt(breakdown.vat)}</span></div>
      )}
      <div className="flex justify-between border-t border-border/50 pt-1.5 mt-1.5">
        <span className="font-bold">Grand total</span>
        <span className="font-bold text-primary">{fmt(breakdown.total)}</span>
      </div>
    </div>
  );
}
