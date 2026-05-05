/**
 * P2PTransferSheet — Venmo/Cash App-style "send money to a friend" UI.
 *
 * Opens via a global event so any chat can request it. Inserts a row into
 * p2p_transfers and an optional companion direct_messages row to render
 * the request as a message in the conversation thread.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import X from "lucide-react/dist/esm/icons/x";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Send from "lucide-react/dist/esm/icons/send";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";

export const P2P_TRANSFER_EVENT = "zivo:p2p-transfer-open";

export interface P2PTransferDetail {
  receiverId: string;
  receiverName: string;
  /** "send" creates a transfer; "request" flips it into an ask. */
  mode?: "send" | "request";
}

export function openP2PTransfer(detail: P2PTransferDetail) {
  window.dispatchEvent(new CustomEvent<P2PTransferDetail>(P2P_TRANSFER_EVENT, { detail }));
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

const dbFrom = (table: string): unknown =>
  (supabase as unknown as { from: (t: string) => unknown }).from(table);

export default function P2PTransferSheet() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<P2PTransferDetail | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<P2PTransferDetail>).detail;
      if (!d) return;
      setDetail(d);
      setOpen(true);
    };
    window.addEventListener(P2P_TRANSFER_EVENT, handler as EventListener);
    return () => window.removeEventListener(P2P_TRANSFER_EVENT, handler as EventListener);
  }, []);

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
    setSending(true);
    const isRequest = detail.mode === "request";
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
                <p className="text-[11px] text-muted-foreground">{detail.mode === "request" ? "They'll get a notification to pay you." : "Funds settle instantly."}</p>
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

              <div className="flex gap-2 justify-center mb-4">
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
              <button
                onClick={() => void send()}
                disabled={sending || !amount}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base active:opacity-80 transition disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> {detail.mode === "request" ? "Request" : "Send"}</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
