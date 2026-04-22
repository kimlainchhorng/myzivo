/**
 * LodgingBookingDrawer - Multi-step booking sheet (stay → add-ons → guest → review → success).
 * Writes a 'hold' lodge_reservations row with addons + fee breakdown + payment method.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, ChevronLeft, ChevronRight, CheckCircle2, Minus, Plus, AlertTriangle,
  Wallet, CreditCard, Building2, Copy, CalendarPlus, MessageCircle, ShieldCheck,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ResponsiveModal, ResponsiveModalFooter } from "@/components/ui/responsive-modal";
import { CountryPhoneInput } from "@/components/auth/CountryPhoneInput";
import { LodgingStaySelector } from "@/components/lodging/LodgingStaySelector";
import { ReservationStatusTimeline } from "@/components/lodging/ReservationStatusTimeline";
import { useRoomAvailability, hasUnavailableNight } from "@/hooks/lodging/useRoomAvailability";
import { useLodgePropertyProfile } from "@/hooks/lodging/useLodgePropertyProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { cancellationLabel, cancellationDescription } from "@/lib/lodging/cancellationCopy";
import { validateGuest } from "@/lib/lodging/guestSchema";
import { buildBookingIcs, downloadIcsFile } from "@/lib/lodging/ics";
import type { LodgeAddon, RoomFees, ChildPolicy } from "@/hooks/lodging/useLodgeRooms";

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  storePhone?: string | null;
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

type Step = "stay" | "addons" | "guest" | "review" | "success";
type PayMethod = "pay_at_property" | "card_on_arrival" | "bank_transfer";

interface SelectedAddon extends LodgeAddon {
  qty: number;
}

const ETA_OPTIONS = [
  "Before 3 PM", "3 – 6 PM", "6 – 9 PM", "After 9 PM", "Next day", "Not sure yet",
];

const PAY_METHODS: { id: PayMethod; label: string; sub: string; icon: typeof Wallet }[] = [
  { id: "pay_at_property", label: "Pay at the property", sub: "Cash or card on arrival — no charge now", icon: Wallet },
  { id: "card_on_arrival", label: "Card on file (charged on arrival)", sub: "We'll collect card details at check-in", icon: CreditCard },
  { id: "bank_transfer",  label: "Bank transfer / deposit", sub: "Host will share details by message", icon: Building2 },
];

export function LodgingBookingDrawer({
  open, onClose, storeId, storeName, storePhone, roomId, roomName,
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
  const [payMethod, setPayMethod] = useState<PayMethod>("pay_at_property");
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeCancel, setAgreeCancel] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservationStatus] = useState<"hold" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show">("hold");
  const [guestTouched, setGuestTouched] = useState<Record<string, boolean>>({});
  const [policyScrolled, setPolicyScrolled] = useState(false);
  const [policyOverflows, setPolicyOverflows] = useState(false);
  const policyRef = useRef<HTMLDivElement | null>(null);

  const { data: propertyProfile } = useLodgePropertyProfile(storeId);
  const houseRules = (propertyProfile?.house_rules || {}) as Record<string, any>;

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
      const dow = d.getDay();
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

    const baseOccupancy = 2;
    const extraAdults = Math.max(0, adults - baseOccupancy);
    const extraChildren = children;
    const extraAdultFee = (childPolicy?.extra_adult_fee_cents || 0) * extraAdults * nights;
    const extraChildFee = (childPolicy?.extra_child_fee_cents || 0) * extraChildren * nights;
    const extraGuestTotal = extraAdultFee + extraChildFee;

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

  const hasAddons = (addons || []).length > 0;
  const securityDeposit = (childPolicy as any)?.security_deposit_cents || 0;

  const goNext = () => {
    if (step === "stay") setStep(hasAddons ? "addons" : "guest");
    else if (step === "addons") setStep("guest");
    else if (step === "guest") setStep("review");
  };
  const goBack = () => {
    if (step === "review") setStep("guest");
    else if (step === "guest") setStep(hasAddons ? "addons" : "stay");
    else if (step === "addons") setStep("stay");
  };

  const guestValid = name.trim().length > 1 && phone.trim().length > 5;
  const reviewValid = agreeRules && agreeCancel && !!payMethod;

  const submit = async () => {
    if (!guestValid) { toast.error("Name and phone required"); setStep("guest"); return; }
    if (!reviewValid) { toast.error("Please confirm the policies"); return; }
    setSubmitting(true);
    try {
      const ref = `RES-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("lodge_reservations" as any).insert({
        store_id: storeId,
        room_id: roomId,
        number: ref,
        guest_name: name, guest_phone: phone, guest_email: email || null, guest_country: country || null,
        adults, children, check_in: checkIn, check_out: checkOut,
        status: "hold", source: "direct",
        rate_cents: baseRateCents, total_cents: breakdown.total, payment_status: "unpaid",
        addons: breakdown.addonsSnapshot,
        addon_selections: breakdown.addonsSnapshot,
        fee_breakdown: breakdown.feeBreakdown,
        guest_details: { name, phone, email, country, eta, notes, pay_method: payMethod },
        notes: notes || null,
      });
      if (error) throw error;
      setReference(ref);
      setStep("success");
      onBooked?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const fmtMoney = (c: number) => `$${(c / 100).toFixed(2)}`;
  const blocked = rangeIssue.invalid || stayIssue.invalid;

  const stepLabel =
    step === "stay" ? "Step 1 · Your stay" :
    step === "addons" ? "Step 2 · Add-ons" :
    step === "guest" ? "Step 3 · Guest info" :
    step === "review" ? "Step 4 · Review & confirm" :
    "Booking submitted";

  const setAddonQty = (idx: number, qty: number, addon?: LodgeAddon) => {
    setSelected(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[idx];
      else next[idx] = { ...(addon || prev[idx]), qty };
      return next;
    });
  };

  const handleClose = () => {
    // Reset for next open
    if (step === "success") {
      setStep("stay"); setSelected({}); setReference(null);
      setName(""); setPhone(""); setEmail(""); setCountry(""); setEta(""); setNotes("");
      setAgreeRules(false); setAgreeCancel(false); setPayMethod("pay_at_property");
    }
    onClose();
  };

  // Calendar (.ics) generator
  const downloadIcs = () => {
    const dt = (s: string) => s.replace(/-/g, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ZIVO//Lodging//EN",
      "BEGIN:VEVENT",
      `UID:${reference}@zivo`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${dt(checkIn)}`,
      `DTEND;VALUE=DATE:${dt(checkOut)}`,
      `SUMMARY:Stay at ${storeName} – ${roomName}`,
      `DESCRIPTION:Booking ${reference}\\nGuest: ${name}\\nTotal: ${fmtMoney(breakdown.total)}`,
      `LOCATION:${storeName}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${reference}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyRef = () => {
    if (!reference) return;
    navigator.clipboard.writeText(reference);
    toast.success("Reference copied");
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(v) => !v && handleClose()}
      title={step === "success" ? "🎉 Booking submitted" : `Reserve ${roomName}`}
      description={stepLabel}
      footer={
        step === "success" ? (
          <ResponsiveModalFooter>
            <Button onClick={handleClose} className="font-bold w-full">Done</Button>
          </ResponsiveModalFooter>
        ) : (
          <ResponsiveModalFooter>
            {step !== "stay" && (
              <Button variant="outline" onClick={goBack} className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step !== "review" ? (
              <Button
                onClick={goNext}
                className="gap-1"
                disabled={blocked || (step === "guest" && !guestValid)}
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting || blocked || !reviewValid} className="gap-1 font-bold">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirm · {fmtMoney(breakdown.total)}
              </Button>
            )}
          </ResponsiveModalFooter>
        )
      }
    >
      <div className="space-y-4 pt-2">
        {step !== "success" && (rangeIssue.invalid || stayIssue.invalid) && (
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

        {(step === "addons" || step === "guest" || step === "review") && (
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
                          <Button type="button" size="icon" variant="outline" className="h-7 w-7"
                            onClick={() => setAddonQty(i, Math.max(0, (sel.qty || 1) - 1), a)}>
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
                          <Button type="button" size="icon" variant="outline" className="h-7 w-7"
                            onClick={() => setAddonQty(i, (sel.qty || 1) + 1, a)}>
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
          </>
        )}

        {step === "review" && (
          <>
            {/* Booking summary */}
            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5 text-xs">
              <p className="font-bold text-sm">{roomName}</p>
              <p className="text-muted-foreground">{storeName}</p>
              <div className="flex justify-between"><span className="text-muted-foreground">Dates</span><span>{checkIn} → {checkOut} · {breakdown.nights}n</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span>{adults} adult{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} child${children > 1 ? "ren" : ""}` : ""}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Guest</span><span>{name}</span></div>
              {eta && <div className="flex justify-between"><span className="text-muted-foreground">Arrival ETA</span><span>{eta}</span></div>}
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label>Payment method</Label>
              {PAY_METHODS.map(m => {
                const Icon = m.icon;
                const active = payMethod === m.id;
                return (
                  <button
                    key={m.id} type="button" onClick={() => setPayMethod(m.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors",
                      active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground">{m.sub}</p>
                    </div>
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 mt-1 shrink-0",
                      active ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )} />
                  </button>
                );
              })}
            </div>

            {/* Deposit notice */}
            {securityDeposit > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 border border-border text-xs">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>A refundable security deposit of <strong>{fmtMoney(securityDeposit)}</strong> may be collected at check-in.</p>
              </div>
            )}

            <PriceSummary breakdown={breakdown} fmt={fmtMoney} />

            {/* Consent */}
            <div className="space-y-2">
              <label className="flex items-start gap-2 text-xs cursor-pointer">
                <Checkbox checked={agreeRules} onCheckedChange={(v) => setAgreeRules(!!v)} className="mt-0.5" />
                <span>I have read and agree to the <strong>house rules</strong> and check-in policy.</span>
              </label>
              <label className="flex items-start gap-2 text-xs cursor-pointer">
                <Checkbox checked={agreeCancel} onCheckedChange={(v) => setAgreeCancel(!!v)} className="mt-0.5" />
                <span>
                  I accept the <strong>cancellation policy</strong>
                  {cancellationPolicy ? <> ({cancellationPolicy.replace(/_/g, "-")})</> : null} and authorise {storeName} to contact me about this reservation.
                </span>
              </label>
            </div>

            <p className="text-[11px] text-muted-foreground">
              By tapping <strong>Confirm</strong>, your request is sent to {storeName} for confirmation. ZIVO is a marketplace; the property is the merchant of record for your stay.
            </p>
          </>
        )}

        {step === "success" && reference && (
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Your booking request was sent to</p>
              <p className="font-bold text-lg">{storeName}</p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Reference</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="font-extrabold text-xl tracking-wider">{reference}</p>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyRef}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span className="font-semibold">{roomName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span>{checkIn}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span>{checkOut}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span>{adults + children}</span></div>
              <div className="flex justify-between border-t border-border/50 pt-1.5 mt-1.5">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{fmtMoney(breakdown.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-1.5" onClick={downloadIcs}>
                <CalendarPlus className="h-4 w-4" /> Add to calendar
              </Button>
              {storePhone ? (
                <a href={`tel:${storePhone}`} className="block">
                  <Button variant="outline" className="gap-1.5 w-full">
                    <MessageCircle className="h-4 w-4" /> Contact host
                  </Button>
                </a>
              ) : (
                <Button variant="outline" className="gap-1.5" disabled>
                  <MessageCircle className="h-4 w-4" /> Contact host
                </Button>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              You'll receive a confirmation once {storeName} accepts your request. Keep your reference handy for check-in.
            </p>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}

type Breakdown = ReturnType<typeof buildBreakdownType>;
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
