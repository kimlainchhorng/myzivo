/**
 * LodgingPaymentBadge — Stripe payment_status chip for lodging reservations.
 * Supports refund + retry states. When `onRetry` is provided and status is
 * "failed", the badge becomes a clickable retry button.
 */
import { ShieldCheck, CheckCircle2, Clock, XCircle, RotateCcw, Undo2, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type PaymentStatus =
  | "unpaid"
  | "pending"
  | "authorized"
  | "paid"
  | "captured"
  | "refunded"
  | "refund_pending"
  | "failed"
  | string
  | null;

interface Props {
  status: PaymentStatus;
  amountCents?: number | null;
  className?: string;
  onRetry?: () => Promise<void> | void;
}

const fmt = (c?: number | null) => (c == null ? "" : `$${(c / 100).toFixed(2)}`);

export function LodgingPaymentBadge({ status, amountCents, className, onRetry }: Props) {
  const [retrying, setRetrying] = useState(false);
  if (!status || status === "unpaid") return null;

  const config: Record<string, { tone: string; icon: typeof Clock; label: string }> = {
    pending: {
      tone: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      icon: Clock,
      label: "Awaiting Stripe confirmation",
    },
    authorized: {
      tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      icon: ShieldCheck,
      label: `Deposit authorized${amountCents ? ` · ${fmt(amountCents)}` : ""}`,
    },
    paid: {
      tone: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
      icon: CheckCircle2,
      label: `Payment captured${amountCents ? ` · ${fmt(amountCents)}` : ""}`,
    },
    captured: {
      tone: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
      icon: CheckCircle2,
      label: `Payment captured${amountCents ? ` · ${fmt(amountCents)}` : ""}`,
    },
    refund_pending: {
      tone: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      icon: RotateCcw,
      label: "Refund in progress",
    },
    refunded: {
      tone: "bg-muted text-muted-foreground border-border",
      icon: Undo2,
      label: `Deposit refunded${amountCents ? ` · ${fmt(amountCents)}` : ""}`,
    },
    failed: {
      tone: "bg-destructive/10 text-destructive border-destructive/30",
      icon: XCircle,
      label: "Payment failed — retry",
    },
  };

  const cfg = config[status] || {
    tone: "bg-muted text-muted-foreground border-border",
    icon: Clock,
    label: status,
  };
  const Icon = cfg.icon;
  const baseCls = cn(
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold",
    cfg.tone,
    className
  );

  if (status === "failed" && onRetry) {
    const handleClick = async () => {
      if (retrying) return;
      setRetrying(true);
      try { await onRetry(); } finally { setRetrying(false); }
    };
    return (
      <button type="button" onClick={handleClick} className={cn(baseCls, "hover:bg-destructive/15 transition-colors cursor-pointer")}>
        {retrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
        {retrying ? "Retrying…" : cfg.label}
      </button>
    );
  }

  return (
    <span className={baseCls}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
