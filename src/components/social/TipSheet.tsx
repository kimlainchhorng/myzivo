/**
 * TipSheet — Send a tip/gift to a creator
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Heart, Sparkles, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TipSheetProps {
  open: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string | null;
}

const TIP_AMOUNTS = [100, 200, 500, 1000, 2500, 5000]; // cents

export default function TipSheet({ open, onClose, creatorId, creatorName, creatorAvatar }: TipSheetProps) {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const finalAmount = showCustom ? Math.round(parseFloat(customAmount || "0") * 100) : selectedAmount;

  const handleSend = async () => {
    if (!user || finalAmount < 100) {
      toast.error("Minimum tip is $1.00");
      return;
    }
    setSending(true);
    try {
      const { error } = await (supabase as any).from("creator_tips").insert({
        tipper_id: user.id,
        creator_id: creatorId,
        amount_cents: finalAmount,
        message: message || null,
        is_anonymous: isAnonymous,
        currency: "USD",
      });
      if (error) throw error;
      toast.success(`Sent $${(finalAmount / 100).toFixed(2)} tip to ${creatorName}!`);
      onClose();
    } catch (err) {
      toast.error("Failed to send tip");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-background rounded-t-3xl pb-8"
          >
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Send a Tip</h3>
                    <p className="text-xs text-muted-foreground">to {creatorName}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Amount Grid */}
              {!showCustom ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {TIP_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setSelectedAmount(amt)}
                      className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                        selectedAmount === amt
                          ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                          : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                    >
                      ${(amt / 100).toFixed(0)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mb-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border/40 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowCustom(!showCustom)}
                className="text-xs text-primary font-medium mb-4"
              >
                {showCustom ? "← Choose preset amount" : "Enter custom amount →"}
              </button>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message (optional)"
                rows={2}
                maxLength={200}
                className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
              />

              {/* Anonymous toggle */}
              <label className="flex items-center gap-2 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm text-muted-foreground">Send anonymously</span>
              </label>

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={sending || finalAmount < 100}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {sending ? (
                  <Sparkles className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send ${(finalAmount / 100).toFixed(2)} Tip
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
