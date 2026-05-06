/**
 * P2PTransferSheet — Venmo/Cash App-style "send money to a friend" UI.
 *
 * Opens via a global event so any chat can request it. Inserts a row into
 * p2p_transfers and an optional companion direct_messages row to render
 * the request as a message in the conversation thread.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import X from "lucide-react/dist/esm/icons/x";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Send from "lucide-react/dist/esm/icons/send";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Wallet from "lucide-react/dist/esm/icons/wallet";

export const P2P_TRANSFER_EVENT = "zivo:p2p-transfer-open";

export interface P2PTransferDetail {
  receiverId: string;
  receiverName: string;
  /** "send" creates a transfer; "request" flips it into an ask. */
  mode?: "send" | "request";
}

// The sheet is lazy-loaded inside a Suspense boundary in App.tsx, so on the
// very first tap the window event listener may not be attached yet — the
// CustomEvent fires into the void and "nothing happens". To avoid that, we
// also stash the latest open-request at module scope and have the listener
// drain it on mount.
let pendingOpen: P2PTransferDetail | null = null;
const liveSubscribers = new Set<(d: P2PTransferDetail) => void>();

export function openP2PTransfer(detail: P2PTransferDetail) {
  if (liveSubscribers.size > 0) {
    for (const cb of liveSubscribers) cb(detail);
  } else {
    pendingOpen = detail;
  }
  // Keep dispatching the window event for any other listeners (analytics, etc.)
  try {
    window.dispatchEvent(new CustomEvent<P2PTransferDetail>(P2P_TRANSFER_EVENT, { detail }));
  } catch { /* environments without DOM */ }
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

const dbFrom = (table: string): unknown =>
  (supabase as unknown as { from: (t: string) => unknown }).from(table);

export default function P2PTransferSheet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<P2PTransferDetail | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  // Sender's available balance from user_wallets — same table the
  // accept_p2p_transfer RPC debits from. Shown inline so users don't blindly
  // submit an amount they can't cover.
  const [availableCents, setAvailableCents] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    const subscribe = (d: P2PTransferDetail) => {
      setDetail(d);
      setOpen(true);
    };
    liveSubscribers.add(subscribe);
    // Drain any open-request that fired before this component mounted.
    if (pendingOpen) {
      subscribe(pendingOpen);
      pendingOpen = null;
    }
    // Belt-and-braces: still listen on the window event in case the function
    // import path was mocked or hot-replaced.
    const winHandler = (e: Event) => {
      const d = (e as CustomEvent<P2PTransferDetail>).detail;
      if (d) subscribe(d);
    };
    window.addEventListener(P2P_TRANSFER_EVENT, winHandler as EventListener);
    return () => {
      liveSubscribers.delete(subscribe);
      window.removeEventListener(P2P_TRANSFER_EVENT, winHandler as EventListener);
    };
  }, []);

  // Refresh balance every time the sheet opens.
  useEffect(() => {
    if (!open || !user?.id) { setAvailableCents(null); return; }
    let cancelled = false;
    setBalanceLoading(true);
    (async () => {
      const { data } = await (supabase as any)
        .from("user_wallets")
        .select("available_cents")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setAvailableCents(typeof data?.available_cents === "number" ? data.available_cents : 0);
      setBalanceLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, user?.id]);

  const close = () => {
    setOpen(false);
    setDetail(null);
    setAmount("");
    setNote("");
  };

  const send = async () => {
    if (!user?.id || !detail) return;
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents <= 0) { toast.error("Enter an amount"); return; }
    const isRequest = detail.mode === "request";
    // Pre-check sender's wallet so we fail fast in the composer instead of
    // letting the recipient hit "insufficient_funds" on accept.
    if (!isRequest && availableCents != null && cents > availableCents) {
      toast.error(`Not enough balance — you have ${(availableCents / 100).toFixed(2)} available`);
      return;
    }
    setSending(true);
    try {
      const { data: transfer, error } = await (dbFrom("p2p_transfers") as { insert: (p: unknown) => { select: (s: string) => { single: () => Promise<{ data: { id: string } | null; error: unknown }> } } })
        .insert({
          sender_id: isRequest ? detail.receiverId : user.id,
          receiver_id: isRequest ? user.id : detail.receiverId,
          amount_cents: cents,
          note,
          status: "pending",
        })
        .select("id")
        .single();
      if (error || !transfer) throw error || new Error("Failed");

      // Companion message in DM thread for visibility
      await supabase.from("direct_messages").insert({
        sender_id: user.id,
        receiver_id: detail.receiverId,
        message: isRequest
          ? `Requested $${(cents / 100).toFixed(2)}${note ? ` for "${note}"` : ""}`
          : `Sent $${(cents / 100).toFixed(2)}${note ? ` for "${note}"` : ""}`,
        message_type: "p2p_transfer",
        file_payload: { transferId: transfer.id, amount_cents: cents, note, mode: isRequest ? "request" : "send" } as never,
      });

      toast.success(isRequest ? `Requested from ${detail.receiverName}` : `Sent to ${detail.receiverName}`);
      close();
    } catch {
      toast.error("Couldn't complete transfer");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && detail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border/30">
              <div>
                <h3 className="text-base font-bold">{detail.mode === "request" ? "Request from" : "Send to"} {detail.receiverName}</h3>
                <p className="text-[11px] text-muted-foreground">
                  {detail.mode === "request"
                    ? "They'll get a notification and can accept in chat."
                    : "They'll see it in chat and accept to settle."}
                </p>
              </div>
              <button onClick={close} aria-label="Close" className="h-9 w-9 -mr-1.5 flex items-center justify-center rounded-full hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-end justify-center gap-1 mb-4">
                <DollarSign className="w-7 h-7 text-muted-foreground mb-1.5" />
                <input
                  autoFocus
                  inputMode="decimal"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="0"
                  className="w-32 text-5xl font-bold text-center bg-transparent outline-none placeholder:text-muted-foreground/40 tabular-nums"
                />
              </div>

              <div className="flex gap-2 justify-center mb-3">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-sm font-semibold text-foreground active:scale-95 transition"
                  >
                    ${v}
                  </button>
                ))}
              </div>

              {detail.mode !== "request" && (
                <div className="flex items-center justify-center gap-1.5 mb-4 text-[12px]">
                  <span className="text-muted-foreground">Available:</span>
                  <span className={`font-semibold tabular-nums ${availableCents != null && parseFloat(amount || "0") * 100 > availableCents ? "text-rose-500" : "text-foreground"}`}>
                    {balanceLoading
                      ? "…"
                      : availableCents == null
                        ? "—"
                        : `$${(availableCents / 100).toFixed(2)}`}
                  </span>
                  {availableCents != null && availableCents > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount((availableCents / 100).toFixed(2))}
                      className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-primary hover:bg-primary/10"
                    >
                      Max
                    </button>
                  )}
                </div>
              )}

              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's it for?"
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="px-4 pb-1">
              {(() => {
                const cents = Math.round((parseFloat(amount) || 0) * 100);
                const overBalance = detail.mode !== "request" && availableCents != null && cents > availableCents;
                return (
                  <>
                    <button
                      onClick={() => void send()}
                      disabled={sending || !amount || overBalance}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base active:opacity-80 transition disabled:opacity-50"
                    >
                      {sending
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <><Send className="w-4 h-4" /> {overBalance ? "Insufficient balance" : (detail.mode === "request" ? "Request" : "Send")}</>}
                    </button>
                    {overBalance && (
                      <button
                        type="button"
                        onClick={() => { close(); navigate("/wallet"); }}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground font-semibold text-sm active:scale-[0.99] transition"
                      >
                        <Wallet className="w-4 h-4" />
                        Top up wallet
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
