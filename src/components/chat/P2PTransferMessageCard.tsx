/**
 * P2PTransferMessageCard
 * ----------------------
 * Renders an in-chat money transfer card. Reads live status from the
 * `p2p_transfers` row referenced by `transferId` so Accept / Decline
 * actions update both peers' bubbles via Realtime. The bubble shows:
 *   - the amount + optional note
 *   - sender/receiver context
 *   - Accept / Decline / Cancel buttons gated on the viewer's role
 *   - a status badge once settled
 *
 * Settlement is performed by the `accept_p2p_transfer`,
 * `decline_p2p_transfer`, and `cancel_p2p_transfer` Postgres RPCs which
 * atomically debit/credit the user_wallets and write ledger rows.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X, ArrowDownToLine, AlertCircle, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { topicForGroupSync } from "@/lib/security/channelName";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  transferId: string;
  amountCents: number;
  note?: string | null;
  /** "send" = sender->receiver flow, "request" = receiver->sender flow. */
  mode?: "send" | "request";
  /** True when the current viewer authored the chat message. */
  isMe: boolean;
  /** Current user's id, used to decide which buttons to show. */
  currentUserId: string;
  time: string;
}

interface TransferRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount_cents: number;
  status: "pending" | "completed" | "declined" | "cancelled";
  completed_at: string | null;
}

const STATUS_LABEL: Record<TransferRow["status"], string> = {
  pending: "Pending",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<TransferRow["status"], string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300",
  completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  declined: "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function fmtUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function P2PTransferMessageCard({
  transferId, amountCents, note, mode = "send", isMe, currentUserId, time,
}: Props) {
  const [row, setRow] = useState<TransferRow | null>(null);
  const [busy, setBusy] = useState<"accept" | "decline" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: lErr } = await (supabase as any)
        .from("p2p_transfers")
        .select("id, sender_id, receiver_id, amount_cents, status, completed_at")
        .eq("id", transferId)
        .maybeSingle();
      if (cancelled) return;
      if (lErr) setError("Could not load transfer");
      else setRow(data as TransferRow);
    }
    load();

    const channelName = topicForGroupSync(transferId, "p2p");
    const channel = (supabase as any)
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "p2p_transfers", filter: `id=eq.${transferId}` },
        (payload: { new: TransferRow }) => setRow(payload.new),
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [transferId]);

  const handleAccept = async () => {
    setBusy("accept");
    setError(null);
    try {
      const { error: rpcErr } = await (supabase as any).rpc("accept_p2p_transfer", { p_transfer_id: transferId });
      if (rpcErr) {
        const code = (rpcErr as any).message || "";
        if (code.includes("insufficient_funds")) {
          toast.error("Not enough wallet balance to settle");
          setError("Sender has insufficient wallet balance");
        } else if (code.includes("not_pending")) {
          toast.error("Transfer is no longer pending");
        } else {
          toast.error("Could not accept transfer");
          setError("Settlement failed");
        }
      } else {
        toast.success("Transfer accepted");
      }
    } finally {
      setBusy(null);
    }
  };

  const handleDecline = async () => {
    setBusy("decline");
    try {
      const { error: rpcErr } = await (supabase as any).rpc("decline_p2p_transfer", { p_transfer_id: transferId });
      if (rpcErr) toast.error("Could not decline");
      else toast.success("Transfer declined");
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    setBusy("cancel");
    try {
      const { error: rpcErr } = await (supabase as any).rpc("cancel_p2p_transfer", { p_transfer_id: transferId });
      if (rpcErr) toast.error("Could not cancel");
      else toast.success("Transfer cancelled");
    } finally {
      setBusy(null);
    }
  };

  const isReceiver = !!row && row.receiver_id === currentUserId;
  const isSender = !!row && row.sender_id === currentUserId;
  const status = row?.status ?? "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}
    >
      <div className="max-w-[78%] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-3 pt-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            {mode === "request" ? <ArrowDownToLine className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
              {mode === "request" ? "Money request" : "Money transfer"}
            </p>
            <p className="text-lg font-bold tabular-nums">{fmtUsd(amountCents)}</p>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
              STATUS_TONE[status],
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>

        {note && (
          <p className="px-3 pt-1.5 text-[12px] text-muted-foreground line-clamp-2">"{note}"</p>
        )}

        {error && (
          <div className="mx-3 mt-2 flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {row && status === "pending" && (
          <div className="grid grid-cols-2 gap-2 px-3 pt-3 pb-3">
            {isReceiver && (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={!!busy}
                  className="flex items-center justify-center gap-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
                >
                  {busy === "accept" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Accept
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={!!busy}
                  className="flex items-center justify-center gap-1 py-2 rounded-lg bg-muted text-foreground text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
                >
                  {busy === "decline" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  Decline
                </button>
              </>
            )}
            {isSender && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={!!busy}
                className="col-span-2 flex items-center justify-center gap-1 py-2 rounded-lg bg-muted text-foreground text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {busy === "cancel" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Cancel transfer
              </button>
            )}
          </div>
        )}

        {row && status === "completed" && row.completed_at && (
          <p className="px-3 pb-3 pt-2 text-[10.5px] text-muted-foreground">
            Settled · {new Date(row.completed_at).toLocaleString()}
          </p>
        )}
        {row && (status === "declined" || status === "cancelled") && (
          <p className="px-3 pb-3 pt-2 text-[10.5px] text-muted-foreground">
            {status === "declined" ? "Recipient declined this transfer." : "Sender cancelled this transfer."}
          </p>
        )}

        <div className="px-3 pb-2 text-[10px] text-muted-foreground/80 text-right">{time}</div>
      </div>
    </motion.div>
  );
}
