// useFareQuote
// ----------------------------------------------------------------------
// Calls zivo-quote-fare (Distance Matrix → fare estimate). Debounced so
// it doesn't fire on every keystroke.
// ----------------------------------------------------------------------

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FareQuote {
  ok: true;
  kind: "ride" | "delivery";
  distance_km: number;
  duration_min: number;
  subtotal_cents: number;
  service_fee_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  currency: string;
  source: string;
  breakdown?: {
    base_cents: number;
    per_min_cents: number;
    per_km_cents: number;
    service_pct: number;
    applied_min_total: boolean;
  };
}

export interface QuoteParams {
  kind: "ride" | "delivery";
  pickup:  { lat: number; lng: number } | null;
  dropoff: { lat: number; lng: number } | null;
  currency?: string;
}

export interface UseFareQuoteResult {
  quote: FareQuote | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const DEBOUNCE_MS = 600;

export function useFareQuote(params: QuoteParams): UseFareQuoteResult {
  const [quote, setQuote] = useState<FareQuote | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const reqIdRef = useRef(0);

  const fetchQuote = useCallback(async () => {
    if (!params.pickup || !params.dropoff) { setQuote(null); return; }
    const myReq = ++reqIdRef.current;
    setLoading(true); setError(null);
    const { data, error: invErr } = await supabase.functions.invoke<FareQuote & { error?: string }>(
      "zivo-quote-fare",
      { body: { kind: params.kind, pickup: params.pickup, dropoff: params.dropoff, currency: params.currency } },
    );
    if (myReq !== reqIdRef.current) return;
    setLoading(false);
    if (invErr) { setError(invErr.message); setQuote(null); return; }
    if (!data || (data as { ok?: boolean }).ok !== true) {
      setError((data as { error?: string } | null)?.error ?? "quote_failed");
      setQuote(null);
      return;
    }
    setQuote(data);
  }, [params.kind, params.pickup?.lat, params.pickup?.lng, params.dropoff?.lat, params.dropoff?.lng, params.currency]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => { void fetchQuote(); }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [fetchQuote]);

  return { quote, isLoading, error, refresh: fetchQuote };
}
