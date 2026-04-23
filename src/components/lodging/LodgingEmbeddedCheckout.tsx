/**
 * LodgingEmbeddedCheckout - Renders Stripe's Embedded Checkout inline inside the booking sheet.
 * Customers complete card payment without leaving the ZIVO flow.
 *
 * Flow:
 *  1. On mount, invoke `create-lodging-deposit` with `ui_mode: "embedded"` to mint a Checkout Session.
 *  2. The function returns a `client_secret` (instead of a redirect URL).
 *  3. We mount Stripe's <EmbeddedCheckout /> with that secret. Stripe renders the secure card form.
 *  4. On success, Stripe calls `onComplete` and the parent realtime payment badge takes over.
 */
import { useCallback, useEffect, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Loader2, AlertTriangle, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getStripe } from "@/lib/stripe";

interface Props {
  reservationId: string;
  storeId: string;
  amountCents: number;
  /** "deposit" → manual capture (refundable hold). "full" → immediate full charge. */
  mode: "deposit" | "full";
  onComplete?: () => void;
}

export function LodgingEmbeddedCheckout({
  reservationId,
  storeId,
  amountCents,
  mode,
  onComplete,
}: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchClientSecret = useCallback(async () => {
    setLoading(true);
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
            client_attempt_id: `embedded_${reservationId}`,
          },
        }
      );
      if (fnErr) throw fnErr;
      const secret = (data as any)?.client_secret;
      if (!secret) throw new Error("Stripe did not return a client secret");
      setClientSecret(secret);
      return secret as string;
    } catch (e: any) {
      const msg = e?.message || "Could not load secure card form";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [reservationId, storeId, amountCents, mode, reloadKey]);

  // Kick off the initial fetch (also re-fetches when reloadKey changes)
  useEffect(() => {
    fetchClientSecret().catch(() => {});
  }, [fetchClientSecret]);

  if (loading && !clientSecret) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
        <p className="font-medium">Loading secure card form…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <div className="flex items-start gap-2 text-destructive text-xs font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 w-full"
          onClick={() => setReloadKey((k) => k + 1)}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border bg-gradient-to-r from-emerald-50/60 to-card dark:from-emerald-950/20">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              {mode === "deposit" ? "Authorise card hold" : "Pay with card"}
            </p>
            <p className="text-[10px] text-muted-foreground">Secured by Stripe · 256-bit TLS</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Inline</span>
      </div>
      <div className="p-1.5">
        <EmbeddedCheckoutProvider
          key={clientSecret /* force remount when secret changes */}
          stripe={getStripe()}
          options={{
            clientSecret,
            onComplete: () => {
              onComplete?.();
            },
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}
