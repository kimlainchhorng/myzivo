/**
 * StripeEmbeddedOnboarding — Stripe Connect Embedded Components.
 * Renders Stripe's onboarding flow INSIDE the app (no redirect).
 */
import { useEffect, useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { Loader2, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";
import { toast } from "sonner";
import { useConnectOnboard } from "@/hooks/useStripeConnect";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  country?: string;
}

export default function StripeEmbeddedOnboarding({ open, onClose, onComplete, country = "US" }: Props) {
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const onboard = useConnectOnboard();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBlocked(false);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("connect-account-session", {
          body: { country },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (cancelled) return;

        let connect;
        try {
          connect = await loadConnectAndInitialize({
            publishableKey: STRIPE_PUBLISHABLE_KEY,
            fetchClientSecret: async () => data.client_secret,
            appearance: {
              overlays: "dialog",
              variables: {
                colorPrimary: "#10b981",
                borderRadius: "12px",
              },
            },
          });
        } catch (loadErr: any) {
          if (!cancelled) {
            setBlocked(true);
            setError("Embedded Stripe is blocked in this browser/preview. Use secure redirect instead.");
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setInstance(connect);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message || "Failed to load Stripe";
          const isBlocked = msg.includes("Connect.js") || msg.includes("connect-js");
          setBlocked(isBlocked);
          setError(isBlocked ? "Embedded Stripe is blocked in this browser/preview. Use secure redirect instead." : msg);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, country]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card">
        <div>
          <h2 className="text-base font-bold">Stripe Setup</h2>
          <p className="text-[11px] text-muted-foreground">Secure onboarding by Stripe</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#635bff]" />
            <p className="text-sm text-muted-foreground">Loading Stripe…</p>
          </div>
        )}
        {error && (
          <div className="p-6 text-center">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        )}
        {instance && !loading && !error && (
          <div className="p-3 max-w-2xl mx-auto">
            <ConnectComponentsProvider connectInstance={instance}>
              <ConnectAccountOnboarding
                onExit={() => {
                  toast.success("Stripe setup complete!");
                  onComplete();
                }}
              />
            </ConnectComponentsProvider>
          </div>
        )}
      </div>
    </div>
  );
}
