/**
 * AbaPaymentModal — Shows ABA KHQR for ride payment.
 * Customer scans the QR with any Bakong-connected app (ABA, Wing, ACLEDA, etc.),
 * pays the exact amount shown, then taps "I've paid" to confirm.
 *
 * TODO: Wire up Bakong API auto-confirmation via Supabase edge function `bakong-verify`.
 */
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy, Shield } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { buildDynamicKhqr } from "@/lib/khqr";
import { supabase } from "@/integrations/supabase/client";

const MERCHANT_NAME = "CHHORNG KIMLAIN";
const USD_TO_KHR = 4062.5;

interface AbaPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountUsd: number;
  reference: string;
  onConfirmed: () => void;
}

export default function AbaPaymentModal({
  open,
  onOpenChange,
  amountUsd,
  reference,
  onConfirmed,
}: AbaPaymentModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [confirming, setConfirming] = useState(false);
  const qrString = useMemo(
    () => buildDynamicKhqr(amountUsd, "USD", reference),
    [amountUsd, reference]
  );

  useEffect(() => {
    if (!open) {
      setSecondsLeft(300);
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  // Poll Bakong API every 4s for payment confirmation
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("bakong-verify", {
          body: { qr: qrString },
        });
        if (cancelled) return;
        if (!error && data?.ok && data?.paid) {
          toast.success("Payment received via Bakong!");
          onConfirmed();
        }
      } catch {
        // network blip — keep polling
      }
    };

    const id = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [open, qrString, onConfirmed]);

  const khr = Math.round(amountUsd * USD_TO_KHR).toLocaleString();
  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft <= 0;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(reference);
    toast.success("Reference copied");
  };

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      onConfirmed();
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">ABA KHQR Payment</DialogTitle>
        <div className="bg-gradient-to-b from-[#003c71] to-[#0066b3] px-5 py-4 text-white text-center">
          <p className="text-xs opacity-90">ABA · KHQR</p>
          <p className="text-base font-bold mt-1">Scan. Pay. Done.</p>
        </div>

        <div className="px-5 py-5 bg-white text-center space-y-3">
          <div className="inline-block p-3 rounded-2xl bg-white border-2 border-border/20">
            <QRCodeSVG value={qrString} size={200} level="M" />
          </div>
          <p className="text-sm font-bold text-foreground">{MERCHANT_NAME}</p>

          <div className="rounded-xl bg-muted/40 px-4 py-3 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Amount</span>
              <span className="text-sm font-bold text-foreground">
                {khr} ៛ <span className="text-muted-foreground font-normal">(${amountUsd.toFixed(2)})</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Reference</span>
              <button
                onClick={handleCopyRef}
                className="flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary truncate"
                type="button"
              >
                <span className="truncate">{reference}</span>
                <Copy className="w-3 h-3 shrink-0" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Expires in</span>
              <span className={`text-sm font-bold ${expired ? "text-destructive" : "text-foreground"}`}>
                {expired ? "Expired" : `${mins}:${secs}`}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-left">
            <p className="text-[11px] font-semibold text-amber-900 leading-snug">
              📱 បើកកម្មវិធី ABA / Bakong មុន រួចចុច "Scan"
            </p>
            <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
              Open the ABA / Bakong app first, then tap "Scan" inside the app.
              The iPhone Camera does not support KHQR.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl font-bold gap-2"
            onClick={() => {
              window.location.href = "abamobile://";
              setTimeout(() => {
                window.location.href = "https://apps.apple.com/kh/app/aba-mobile/id1023262050";
              }, 1500);
            }}
          >
            Open ABA app
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={confirming || expired}
            className="w-full h-12 rounded-xl font-bold gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {confirming ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                I've paid
              </>
            )}
          </Button>
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Secured by Bakong · KHQR</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
