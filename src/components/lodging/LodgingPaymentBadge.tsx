/**
 * LodgingPaymentBadge — Stripe payment_status chip for lodging reservations.
 * Surfaces refund + retry states; renders a "processing" spinner while a Stripe
 * webhook is in flight, plus a micro-caption with the last received event time.
 */
import { ShieldCheck, CheckCircle2, Clock, XCircle, RotateCcw, Undo2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PaymentStatus =
  | "unpaid"
  | "pending"
  | "processing"
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
  /** ISO timestamp of last Stripe webhook touching this reservation. */
  lastEventAt?: string | null;
  /** Stripe event type, e.g. "payment_intent.succeeded". */
  lastEventType?: string | null;
}

const fmt = (c?: number | null) => (c == null ? "" : `$${(c / 100).toFixed(2)}`);

const timeAgo = (iso: string): string => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

const PROCESSING_WINDOW_MS = 8_000;
const TRANSITIONAL = new Set(["pending", "processing"]);

export function LodgingPaymentBadge({
  status,
  amountCents,
  className,
  onRetry,
  lastEventAt,
  lastEventType,
}: Props) {
  const [retrying, setRetrying] = useState(false);
  const retryInFlightRef = useRef(false);
  const [, setTick] = useState(0);

  // Re-render every 5s so timeAgo + processing window stay fresh.
  useEffect(() => {
    if (!lastEventAt && !TRANSITIONAL.has(String(status))) return;
    const id = setInterval(() => setTick((t) => t + 1), 5_000);
    return () => clearInterval(id);
  }, [lastEventAt, status]);

  if (!status || status === "unpaid") return null;

  const eventFresh = lastEventAt
    ? Date.now() - new Date(lastEventAt).getTime() < PROCESSING_WINDOW_MS
    : false;
  const isProcessing = TRANSITIONAL.has(String(status)) || eventFresh;

  const config: Record<string, { tone: string; icon: typeof Clock; label: string }> = {
    pending: {
      tone: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      icon: Clock,
      label: "Awaiting Stripe confirmation",
    },
    processing: {
      tone: "bg-muted text-muted-foreground border-border",
      icon: Loader2,
      label: "Processing Stripe update…",
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

  const handleRetryClick = async () => {
    if (!onRetry) return;
    if (retryInFlightRef.current || retrying) return;
    retryInFlightRef.current = true;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      // 5s cool-down before another retry can fire
      setTimeout(() => {
        retryInFlightRef.current = false;
        setRetrying(false);
      }, 5_000);
    }
  };

  const renderProcessingPill = isProcessing && status !== "failed";

  const wrapperCls = "inline-flex flex-col items-start gap-0.5";

  // Retry-failed clickable variant
  if (status === "failed" && onRetry) {
    return (
      <span className={wrapperCls}>
        <button
          type="button"
          onClick={handleRetryClick}
          disabled={retrying}
          className={cn(
            baseCls,
            "hover:bg-destructive/15 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {retrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
          {retrying ? "Retrying…" : cfg.label}
        </button>
        {lastEventAt && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground pl-1">
            <Clock className="h-2.5 w-2.5" />
            Updated {timeAgo(lastEventAt)}{lastEventType ? ` · ${lastEventType}` : ""}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={wrapperCls}>
      <span className={baseCls}>
        {renderProcessingPill ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Icon className={cn("h-3 w-3", cfg.icon === Loader2 && "animate-spin")} />
        )}
        {renderProcessingPill ? "Processing Stripe update…" : cfg.label}
      </span>
      {lastEventAt && (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground pl-1">
          <Clock className="h-2.5 w-2.5" />
          Updated {timeAgo(lastEventAt)}{lastEventType ? ` · ${lastEventType}` : ""}
        </span>
      )}
    </span>
  );
}
