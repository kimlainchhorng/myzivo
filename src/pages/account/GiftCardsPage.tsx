/**
 * Gift Cards Page
 * Buy, send, and redeem ZIVO gift cards
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Send, Ticket, Copy, Check, Loader2, ShieldCheck, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGiftCards, type GiftCard } from "@/hooks/useGiftCards";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

const PRESET_AMOUNTS = [
  { cents: 1000, label: "$10" },
  { cents: 2500, label: "$25" },
  { cents: 5000, label: "$50" },
  { cents: 10000, label: "$100" },
];

export default function GiftCardsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myGiftCards, cardsLoading, purchaseGiftCard, redeemGiftCard } = useGiftCards();

  // Buy tab state
  const [selectedAmount, setSelectedAmount] = useState(2500);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  // Redeem tab state
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemResult, setRedeemResult] = useState<{
    credited: number;
    newBalance: number;
  } | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handlePurchase = async (requireRecipient: boolean) => {
    if (requireRecipient && !recipientEmail) {
      toast.error("Please enter the recipient's email");
      return;
    }

    const origin = window.location.origin;
    const result = await purchaseGiftCard.mutateAsync({
      amount_cents: selectedAmount,
      recipient_email: recipientEmail || undefined,
      recipient_name: recipientName || undefined,
      message: message || undefined,
      sender_name: user?.user_metadata?.full_name || undefined,
      success_url: `${origin}/account/gift-cards/success`,
      cancel_url: `${origin}/account/gift-cards`,
    });

    if (result.url) {
      window.location.href = result.url;
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error("Please enter a gift card code");
      return;
    }

    const result = await redeemGiftCard.mutateAsync(redeemCode.trim());
    if (result.success) {
      setRedeemResult({
        credited: result.credited_amount_dollars,
        newBalance: result.new_wallet_balance_dollars,
      });
      setRedeemCode("");
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCardStatus = (card: GiftCard): { label: string; color: string } => {
    if (card.current_balance <= 0) return { label: "Redeemed", color: "text-zinc-500" };
    if (card.expires_at && new Date(card.expires_at) < new Date()) return { label: "Expired", color: "text-red-400" };
    if (card.is_active) return { label: "Active", color: "text-emerald-400" };
    return { label: "Pending", color: "text-amber-400" };
  };

  const AmountSelector = () => (
    <div className="grid grid-cols-4 gap-3">
      {PRESET_AMOUNTS.map((amt) => (
        <button
          key={amt.cents}
          onClick={() => setSelectedAmount(amt.cents)}
          className={`py-3 rounded-xl font-bold text-lg transition-all ${
            selectedAmount === amt.cents
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          {amt.label}
        </button>
      ))}
    </div>
  );

  const RecipientFields = ({ required }: { required: boolean }) => (
    <div className="space-y-3">
      <Input
        placeholder="Recipient's name"
        value={recipientName}
        onChange={(e) => setRecipientName(e.target.value)}
        className="h-12 rounded-xl bg-zinc-800 border-zinc-700"
      />
      <Input
        placeholder={`Recipient's email${required ? " *" : " (optional)"}`}
        type="email"
        value={recipientEmail}
        onChange={(e) => setRecipientEmail(e.target.value)}
        className="h-12 rounded-xl bg-zinc-800 border-zinc-700"
      />
      <textarea
        placeholder="Add a personal message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <SEOHead title="Gift Cards — ZIVO" description="Buy, send, and redeem ZIVO gift cards" />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Gift Cards</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/20 to-zinc-900 border border-primary/30 rounded-3xl p-6 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-1">ZIVO Gift Cards</h2>
          <p className="text-sm text-zinc-400">Give the gift of travel. Redeemable for wallet credits.</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="buy" className="space-y-4">
          <TabsList className="w-full bg-zinc-900 border border-white/5 rounded-xl h-12 p-1">
            <TabsTrigger value="buy" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
              <CreditCard className="w-4 h-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="send" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
              <Send className="w-4 h-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="redeem" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
              <Ticket className="w-4 h-4" />
              Redeem
            </TabsTrigger>
          </TabsList>

          {/* Buy Tab */}
          <TabsContent value="buy" className="space-y-4">
            <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-5 space-y-5">
              <h3 className="font-bold">Select Amount</h3>
              <AmountSelector />
              <RecipientFields required={false} />
              <Button
                onClick={() => handlePurchase(false)}
                disabled={purchaseGiftCard.isPending}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white font-bold"
              >
                {purchaseGiftCard.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                Purchase ${(selectedAmount / 100).toFixed(0)} Gift Card
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="w-4 h-4" />
                Secure payment powered by Stripe
              </div>
            </div>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-4">
            <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-5 space-y-5">
              <h3 className="font-bold">Send a Gift Card</h3>
              <AmountSelector />
              <RecipientFields required={true} />

              {/* Preview */}
              {(recipientName || recipientEmail) && (
                <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-2">Preview</p>
                  <div className="bg-gradient-to-br from-primary/10 to-teal-500/10 rounded-xl p-4 border border-primary/20">
                    <Gift className="w-6 h-6 text-primary mb-2" />
                    <p className="font-bold">${(selectedAmount / 100).toFixed(0)} ZIVO Gift Card</p>
                    {recipientName && <p className="text-sm text-zinc-300">To: {recipientName}</p>}
                    {message && <p className="text-sm text-zinc-400 mt-2 italic">"{message}"</p>}
                  </div>
                </div>
              )}

              <Button
                onClick={() => handlePurchase(true)}
                disabled={purchaseGiftCard.isPending}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white font-bold"
              >
                {purchaseGiftCard.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                Send ${(selectedAmount / 100).toFixed(0)} Gift Card
              </Button>
            </div>
          </TabsContent>

          {/* Redeem Tab */}
          <TabsContent value="redeem" className="space-y-4">
            <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-5 space-y-5">
              <h3 className="font-bold">Redeem a Gift Card</h3>
              <Input
                placeholder="ZIVO-XXXX-XXXX"
                value={redeemCode}
                onChange={(e) => {
                  setRedeemCode(e.target.value.toUpperCase());
                  setRedeemResult(null);
                }}
                className="h-12 rounded-xl bg-zinc-800 border-zinc-700 text-center font-mono text-lg tracking-wider"
                maxLength={14}
              />
              <Button
                onClick={handleRedeem}
                disabled={redeemGiftCard.isPending || !redeemCode.trim()}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold"
              >
                {redeemGiftCard.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Ticket className="w-5 h-5 mr-2" />
                )}
                Redeem Gift Card
              </Button>

              {/* Success Result */}
              {redeemResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold text-emerald-400">
                    ${redeemResult.credited.toFixed(2)} Added!
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    New wallet balance: ${redeemResult.newBalance.toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/account/wallet")}
                    className="mt-3 text-primary"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    View Wallet
                  </Button>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* My Gift Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-bold text-lg mb-4">My Gift Cards</h2>
          {cardsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-zinc-900/80 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : myGiftCards.length === 0 ? (
            <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-8 text-center">
              <Gift className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No gift cards yet</p>
              <p className="text-sm text-zinc-600 mt-1">Buy or redeem a gift card to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myGiftCards.map((card) => {
                const status = getCardStatus(card);
                return (
                  <div
                    key={card.id}
                    className="bg-zinc-900/80 border border-white/5 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm">{card.code}</span>
                        <button
                          onClick={() => copyCode(card.code, card.id)}
                          className="p-1 rounded hover:bg-zinc-800"
                        >
                          {copiedId === card.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                        </button>
                      </div>
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">
                        ${card.initial_balance.toFixed(2)} card
                        {card.recipient_email ? ` → ${card.recipient_email}` : ""}
                      </span>
                      <span className="font-bold">
                        ${card.current_balance.toFixed(2)} left
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">
                      {format(new Date(card.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
