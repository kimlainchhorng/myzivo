/**
 * LodgingEmbeddedCheckout - Self-contained, multi-state inline payment hub.
 *
 * State machine inside the card:
 *   loading    → skeleton shimmer
 *   ready      → Stripe <EmbeddedCheckout/> (handles card + Apple/Google Pay)
 *   expired    → "Refresh card form" CTA → re-creates session
 *   error      → banner + retry (auto-focus button)
 *   processing → spinner + 30s watchdog
 *   succeeded  → inline receipt panel
 *   failed     → reason + "Try another card" / "Switch to cash"
 *   cash       → "Pay at check-in" confirmation (driven by parent toggle)
 *
 * Realtime payment_status (from parent) flips the card to succeeded/failed
 * without leaving the booking sheet.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  Loader2, AlertTriangle, Lock, RefreshCw, CheckCircle2, CreditCard,
  Smartphone, Wallet, ShieldCheck, XCircle, Clock, ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getStripe } from "@/lib/stripe";
import { cn } from "@/lib/utils";

export type PaymentMethodChoice = "card" | "wallet" | "cash";

interface Props {
  reservationId: string;
  storeId: string;
  amountCents: number;
  /** "deposit" → manual capture (refundable hold). "full" → immediate full charge. */
  mode: "deposit" | "full";
  onComplete?: () => void;
  /**
   * Live payment_status from realtime subscription on lodge_reservations.
   * Drives the succeeded / failed terminal panels.
   */
  paymentStatus?: string | null;
  /** Last Stripe error message (lodge_reservations.last_payment_error). */
  lastPaymentError?: string | null;
  /** Card brand + last4 (if available from realtime). */
  cardBrand?: string | null;
  cardLast4?: string | null;
  /** Reservation reference shown in the receipt panel. */
  reservationRef?: string | null;
  /** Controlled selected method (so parent can collapse embed for cash). */
  method?: PaymentMethodChoice;
  onMethodChange?: (m: PaymentMethodChoice) => void;
  /** Hide method toggle if parent already shows one. */
  hideMethodToggle?: boolean;
}

type ViewState = "loading" | "ready" | "expired" | "error" | "processing" | "succeeded" | "failed";

// Stripe Checkout Sessions live ~24h. Refresh preemptively after 23h.
const SESSION_TTL_MS = 23 * 60 * 60 * 1000;
// If onComplete fires but realtime hasn't flipped yet, wait this long before nudging user.
const PROCESSING_WATCHDOG_MS = 30_000;

const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

export function LodgingEmbeddedCheckout({
  reservationId,
  storeId,
  amountCents,
  mode,
  onComplete,
  paymentStatus,
  lastPaymentError,
  cardBrand,
  cardLast4,
  reservationRef,
  method: methodProp,
  onMethodChange,
  hideMethodToggle = false,
}: Props) {
  const [internalMethod, setInternalMethod] = useState<PaymentMethodChoice>("card");
  const method = methodProp ?? internalMethod;
  const setMethod = (m: PaymentMethodChoice) => {
    if (onMethodChange) onMethodChange(m);
    else setInternalMethod(m);
  };

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [secretMintedAt, setSecretMintedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [stripeCompleted, setStripeCompleted] = useState(false);
  const [watchdogTripped, setWatchdogTripped] = useState(false);

  const retryBtnRef = useRef<HTMLButtonElement | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const ttlTimerRef = useRef<number | null>(null);

  // ---------- Derive view state from inputs ----------
  const view: ViewState = useMemo(() => {
    if (method === "cash") return "ready"; // cash panel is rendered separately
    // Realtime terminal states win.
    if (paymentStatus === "authorized" || paymentStatus === "paid" || paymentStatus === "captured") return "succeeded";
    if (paymentStatus === "failed") return "failed";
    // Stripe finished but realtime hasn't caught up yet.
    if (stripeCompleted) return "processing";
    if (error) return "error";
    if (clientSecret) {
      const expired = secretMintedAt && Date.now() - secretMintedAt > SESSION_TTL_MS;
      if (expired) return "expired";
      return "ready";
    }
    return "loading";
  }, [method, paymentStatus, stripeCompleted, error, clientSecret, secretMintedAt]);

  // ---------- Fetch / refresh client secret ----------
  const fetchClientSecret = useCallback(async (forceNew = false) => {
    setLoadingSecret(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke(
        "create-lodging-deposit",
        {
          body: {
            reservation_id: reservationId,
            store_id: storeId,
            deposit_cents: amountCents,
            mode,
            ui_mode: "embedded",
            client_attempt_id: `embedded_${reservationId}${forceNew ? `_${Date.now()}` : ""}`,
          },
        }
      );
      if (fnErr) throw fnErr;
      const secret = (data as any)?.client_secret;
      if (!secret) throw new Error("Stripe did not return a client secret");
      setClientSecret(secret);
      setSecretMintedAt(Date.now());
    } catch (e: any) {
      const msg = e?.message || "Could not load secure card form";
      setError(msg);
    } finally {
      setLoadingSecret(false);
    }
  }, [reservationId, storeId, amountCents, mode]);

  // Initial + reload-key triggered fetches. Skip when method !== card/wallet.
  useEffect(() => {
    if (method === "cash") return;
    fetchClientSecret(reloadKey > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, method]);

  // Preemptive expiry timer (23h after mint).
  useEffect(() => {
    if (!secretMintedAt) return;
    if (ttlTimerRef.current) window.clearTimeout(ttlTimerRef.current);
    const remaining = Math.max(0, SESSION_TTL_MS - (Date.now() - secretMintedAt));
    ttlTimerRef.current = window.setTimeout(() => {
      setClientSecret(null);
      setSecretMintedAt(null);
    }, remaining);
    return () => {
      if (ttlTimerRef.current) window.clearTimeout(ttlTimerRef.current);
    };
  }, [secretMintedAt]);

  // Processing watchdog — if Stripe says complete but realtime stalls 30s, surface retry path.
  useEffect(() => {
    if (view !== "processing") {
      setWatchdogTripped(false);
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      return;
    }
    watchdogRef.current = window.setTimeout(() => setWatchdogTripped(true), PROCESSING_WATCHDOG_MS);
    return () => {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    };
  }, [view]);

  // Auto-focus retry button on error/expired for accessibility.
  useEffect(() => {
    if ((view === "error" || view === "expired" || view === "failed") && retryBtnRef.current) {
      retryBtnRef.current.focus();
    }
  }, [view]);

  // ---------- Actions ----------
  const handleRefresh = () => {
    setClientSecret(null);
    setSecretMintedAt(null);
    setStripeCompleted(false);
    setReloadKey((k) => k + 1);
  };

  const handleSwitchToCash = () => setMethod("cash");

  // ---------- Render helpers ----------
  const headerTitle =
    method === "cash" ? "Pay at check-in" :
    view === "succeeded" ? "Payment confirmed" :
    view === "failed" ? "Payment failed" :
    mode === "deposit" ? "Authorise card hold" : "Pay with card";

  const headerSub =
    method === "cash" ? "Confirmed on arrival · no charge now" :
    view === "succeeded" ? "Your booking is locked in" :
    "Secured by Stripe · 256-bit TLS";

  const headerIcon =
    method === "cash" ? Wallet :
    view === "succeeded" ? CheckCircle2 :
    view === "failed" ? XCircle :
    Lock;

  const headerTone =
    view === "succeeded" ? "from-emerald-100 to-card text-emerald-700 dark:from-emerald-950/30 dark:text-emerald-300" :
    view === "failed" ? "from-rose-100 to-card text-rose-700 dark:from-rose-950/30 dark:text-rose-300" :
    "from-emerald-50/60 to-card text-emerald-700 dark:from-emerald-950/20 dark:text-emerald-300";

  const HeaderIcon = headerIcon;

  return (
    <section
      role="region"
      aria-label="Payment"
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
    >
      {/* ---- Method toggle ---- */}
      {!hideMethodToggle && (
        <div role="tablist" aria-label="Payment method" className="flex items-center gap-1 p-1.5 border-b border-border bg-muted/30">
          <MethodTab
            active={method === "card"}
            onClick={() => setMethod("card")}
            icon={CreditCard}
            label="Card"
          />
          <MethodTab
            active={method === "wallet"}
            onClick={() => setMethod("wallet")}
            icon={Smartphone}
            label="Apple / Google Pay"
            hint="(via card form)"
          />
          <MethodTab
            active={method === "cash"}
            onClick={() => setMethod("cash")}
            icon={Wallet}
            label="Cash"
          />
        </div>
      )}

      {/* ---- Header ---- */}
      <div className={cn("flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border bg-gradient-to-r", headerTone)}>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-7 w-7 rounded-lg bg-background/70 flex items-center justify-center shadow-sm">
            <HeaderIcon className="h-3.5 w-3.5" aria-hidden />
          </div>
          <div>
            <p className="font-bold leading-tight">{headerTitle}</p>
            <p className="text-[10px] opacity-80">{headerSub}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase opacity-70">
          {fmt(amountCents)}
        </span>
      </div>

      {/* ---- Body ---- */}
      <div className="p-2">
        {/* CASH PANEL */}
        {method === "cash" && view !== "succeeded" && view !== "failed" && (
          <div
            aria-live="polite"
            className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 p-4 text-sm space-y-2"
          >
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Pay on arrival
            </div>
            <p className="text-xs text-foreground/80">
              No card needed now. Bring <strong>{fmt(amountCents)}</strong> in cash (or pay by card at the front desk) when you check in.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Prefer to lock it in now? Switch to Card or Apple/Google Pay above.
            </p>
          </div>
        )}

        {/* SUCCEEDED PANEL */}
        {view === "succeeded" && (
          <div
            aria-live="assertive"
            className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  {paymentStatus === "authorized"
                    ? "Card authorised"
                    : "Payment received"}
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  {paymentStatus === "authorized"
                    ? "We'll capture only on check-in."
                    : "Your stay is fully paid."}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-y-1.5 text-[11px]">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-semibold text-right tabular-nums">{fmt(amountCents)}</dd>
              {(cardBrand || cardLast4) && (
                <>
                  <dt className="text-muted-foreground">Card</dt>
                  <dd className="font-semibold text-right capitalize">
                    {cardBrand || "Card"} •••• {cardLast4 || "••••"}
                  </dd>
                </>
              )}
              {reservationRef && (
                <>
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="font-mono font-semibold text-right">{reservationRef}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-semibold text-right capitalize">{paymentStatus}</dd>
            </dl>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 pt-1">
              <ReceiptText className="h-3.5 w-3.5" aria-hidden />
              Receipt available below — booking is confirmed.
            </div>
          </div>
        )}

        {/* FAILED PANEL */}
        {view === "failed" && (
          <div
            aria-live="assertive"
            className="rounded-xl bg-destructive/5 border border-destructive/30 p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden />
              <div className="text-xs space-y-1">
                <p className="font-bold text-destructive">Card was declined</p>
                <p className="text-foreground/80">
                  {lastPaymentError || "Your bank rejected the charge. Try another card or switch to cash."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                ref={retryBtnRef}
                size="sm"
                onClick={handleRefresh}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Try another card
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSwitchToCash}
                className="gap-1.5"
              >
                <Wallet className="h-3.5 w-3.5" aria-hidden /> Switch to cash
              </Button>
            </div>
          </div>
        )}

        {/* PROCESSING PANEL */}
        {view === "processing" && (
          <div
            aria-live="polite"
            className="rounded-xl bg-muted/40 border border-border p-5 flex flex-col items-center text-center gap-2"
          >
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden />
            <p className="text-sm font-semibold">Confirming with your bank…</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {watchdogTripped
                ? "Still working — this is taking longer than usual. You can refresh below if it doesn't complete."
                : "Hang tight, this usually takes a few seconds."}
            </p>
            {watchdogTripped && (
              <Button
                ref={retryBtnRef}
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="gap-1.5 mt-1"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Refresh card form
              </Button>
            )}
          </div>
        )}

        {/* EXPIRED PANEL */}
        {view === "expired" && (
          <div
            aria-live="assertive"
            className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300/50 dark:border-amber-900/50 p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-800 dark:text-amber-200">Session expired</p>
                <p className="text-foreground/80">
                  The secure card form timed out. Refresh it to continue — your booking is still held.
                </p>
              </div>
            </div>
            <Button
              ref={retryBtnRef}
              size="sm"
              onClick={handleRefresh}
              className="gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Refresh card form
            </Button>
          </div>
        )}

        {/* ERROR PANEL */}
        {view === "error" && (
          <div
            aria-live="assertive"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3"
          >
            <div className="flex items-start gap-2 text-destructive text-xs font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
              <span>{error}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                ref={retryBtnRef}
                size="sm"
                onClick={handleRefresh}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Try again
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSwitchToCash}
                className="gap-1.5"
              >
                <Wallet className="h-3.5 w-3.5" aria-hidden /> Use cash
              </Button>
            </div>
          </div>
        )}

        {/* LOADING SKELETON */}
        {view === "loading" && (
          <div aria-live="polite" aria-busy="true" className="space-y-2 p-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-2/3 rounded-lg" />
            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Loading secure card form…
            </div>
          </div>
        )}

        {/* READY — Stripe Embedded Checkout */}
        {view === "ready" && method !== "cash" && clientSecret && (
          <div className="rounded-lg overflow-hidden">
            <EmbeddedCheckoutProvider
              key={clientSecret /* force remount when secret changes */}
              stripe={getStripe()}
              options={{
                clientSecret,
                onComplete: () => {
                  setStripeCompleted(true);
                  onComplete?.();
                },
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>

      {/* ---- Footer escape hatch ---- */}
      {method !== "cash" && view !== "succeeded" && view !== "failed" && (
        <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            PCI-compliant · powered by Stripe
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loadingSecret}
            className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3 w-3", loadingSecret && "animate-spin")} aria-hidden />
            Refresh
          </button>
        </div>
      )}
    </section>
  );
}

/* -------------------- Internal: method tab -------------------- */
function MethodTab({
  active, onClick, icon: Icon, label, hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CreditCard;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-bold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
        active
          ? "bg-card text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-500/30"
          : "text-muted-foreground hover:text-foreground hover:bg-card/60"
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="truncate">{label}</span>
      {hint && <span className="hidden sm:inline opacity-60 font-normal">{hint}</span>}
    </button>
  );
}
