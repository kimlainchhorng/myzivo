/**
 * RideWallet — Payment methods with real card management, promo codes, wallet credits
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Tag, Gift, DollarSign, Wallet, CheckCircle, Percent, Trash2, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocalPaymentMethods, formatCardNumber, formatExpiry, parseExpiry, detectCardBrand, validateCardNumber, validateExpiry, validateCVV, type CardInput } from "@/hooks/useLocalPaymentMethods";
import { useCustomerWallet } from "@/hooks/useCustomerWallet";

const promoHistory = [
  { code: "WELCOME20", discount: "20% off", status: "active", expires: "Mar 15" },
  { code: "ZIVO10", discount: "$10 credit", status: "used", expires: "Feb 28" },
];

export default function RideWallet() {
  const [activeTab, setActiveTab] = useState<"methods" | "promos" | "wallet">("methods");

  const tabs = [
    { id: "methods" as const, label: "Payment", icon: CreditCard },
    { id: "promos" as const, label: "Promos", icon: Tag },
    { id: "wallet" as const, label: "Wallet", icon: Wallet },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-xl bg-muted/30">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all", activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {activeTab === "methods" && <PaymentMethodsTab />}
          {activeTab === "promos" && <PromosTab />}
          {activeTab === "wallet" && <WalletTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Payment methods tab with real card management */
function PaymentMethodsTab() {
  const { methods, addCard, deleteCard, setDefault, getDefault } = useLocalPaymentMethods();
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saving, setSaving] = useState(false);

  const defaultCard = getDefault();
  const brand = detectCardBrand(cardNumber);

  const handleAddCard = () => {
    // Validate
    if (!validateCardNumber(cardNumber.replace(/\s/g, ""))) {
      toast.error("Invalid card number"); return;
    }
    if (!validateExpiry(expiry)) {
      toast.error("Invalid or expired date"); return;
    }
    if (!validateCVV(cvv)) {
      toast.error("Invalid CVV"); return;
    }
    if (!cardName.trim()) {
      toast.error("Enter cardholder name"); return;
    }

    setSaving(true);
    const parsed = parseExpiry(expiry)!;
    const cleaned = cardNumber.replace(/\s/g, "");

    setTimeout(() => {
      const card: CardInput = {
        type: "card",
        brand,
        last4: cleaned.slice(-4),
        expMonth: parsed.month,
        expYear: parsed.year,
        cardholderName: cardName.trim(),
      };
      addCard(card);
      setCardNumber(""); setCardName(""); setExpiry(""); setCvv("");
      setShowAddForm(false);
      setSaving(false);
      toast.success(`${brand} •••• ${cleaned.slice(-4)} added!`);
    }, 800);
  };

  return (
    <div className="space-y-3">
      {methods.length === 0 && !showAddForm && (
        <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center">
          <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">No payment methods</p>
          <p className="text-xs text-muted-foreground mt-1">Add a card to pay for rides</p>
        </div>
      )}

      {methods.map(pm => (
        <div
          key={pm.id}
          className={cn(
            "flex items-center gap-3 p-3.5 rounded-2xl border transition-all",
            pm.isDefault ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border/40 bg-card"
          )}
        >
          <button
            onClick={() => { setDefault(pm.id); toast.success(`${pm.brand} set as default`); }}
            className="flex items-center gap-3 flex-1 text-left touch-manipulation"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", pm.isDefault ? "bg-primary/10" : "bg-muted/50")}>
              <CreditCard className={cn("w-5 h-5", pm.isDefault ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{pm.brand}</p>
              <p className="text-[10px] text-muted-foreground">•••• {pm.last4} · Exp {String(pm.expMonth).padStart(2, "0")}/{String(pm.expYear).slice(-2)}</p>
            </div>
          </button>
          {pm.isDefault && <Badge className="bg-primary/10 text-primary border-0 text-[9px] font-bold">Default</Badge>}
          <button
            onClick={() => { deleteCard(pm.id); toast.success("Card removed"); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            aria-label="Remove card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Add card form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-primary/20 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Add Card</h3>
                <button onClick={() => setShowAddForm(false)} className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className="h-11 rounded-xl text-sm font-mono pr-16"
                    maxLength={19}
                    inputMode="numeric"
                  />
                  {brand !== "Card" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary">{brand}</span>}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cardholder Name</label>
                <Input placeholder="John Doe" value={cardName} onChange={e => setCardName(e.target.value)} className="h-11 rounded-xl text-sm" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expiry</label>
                  <Input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} className="h-11 rounded-xl text-sm font-mono" maxLength={5} inputMode="numeric" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CVV</label>
                  <Input type="password" placeholder="•••" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} className="h-11 rounded-xl text-sm font-mono" maxLength={4} inputMode="numeric" />
                </div>
              </div>
              <Button onClick={handleAddCard} disabled={saving} className="w-full h-11 rounded-xl text-sm font-bold">
                {saving ? "Adding..." : "Add Card"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showAddForm && (
        <Button variant="outline" className="w-full h-12 rounded-2xl text-sm font-bold gap-2 border-dashed border-border/60" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4" /> Add Payment Method
        </Button>
      )}
    </div>
  );
}

/** Promos tab */
function PromosTab() {
  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    setTimeout(() => {
      setApplyingPromo(false);
      if (promoInput.toUpperCase() === "ZIVO50") {
        toast.success("Promo applied: 50% off your next ride!");
      } else {
        toast.error("Invalid or expired promo code");
      }
      setPromoInput("");
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" /> Apply Promo Code
        </h3>
        <div className="flex gap-2">
          <Input placeholder="Enter code" value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())} className="h-11 rounded-xl text-sm font-bold uppercase" />
          <Button onClick={handleApplyPromo} disabled={!promoInput.trim() || applyingPromo} className="h-11 px-5 rounded-xl font-bold">
            {applyingPromo ? "..." : "Apply"}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Your Promos</h3>
        {promoHistory.map(p => (
          <div key={p.code} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", p.status === "active" ? "bg-emerald-500/10" : "bg-muted/50")}>
              <Percent className={cn("w-4 h-4", p.status === "active" ? "text-emerald-500" : "text-muted-foreground")} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">{p.code}</p>
              <p className="text-[10px] text-muted-foreground">{p.discount} · Exp {p.expires}</p>
            </div>
            <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[9px] font-bold capitalize">
              {p.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Wallet tab */
function WalletTab() {
  const { balanceDollars } = useCustomerWallet();
  const walletBalance = balanceDollars || 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ZIVO Wallet</span>
        </div>
        <p className="text-3xl font-black text-foreground">${walletBalance.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">Available credit balance</p>
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="h-9 rounded-xl text-xs font-bold gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Funds
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-bold">History</Button>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/40 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Auto-apply credits</p>
          <p className="text-[10px] text-muted-foreground">Automatically use wallet balance on rides</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[9px] font-bold">ON</Badge>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Recent</h3>
        {walletBalance === 0 ? (
          <div className="rounded-xl border border-dashed border-border/40 p-4 text-center">
            <p className="text-xs text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          [
            { label: "Referral bonus", amount: "+$10.00", type: "credit" },
            { label: "Ride to Airport", amount: "-$5.50", type: "debit" },
            { label: "Welcome credit", amount: "+$15.00", type: "credit" },
          ].map((tx, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tx.type === "credit" ? "bg-emerald-500/10" : "bg-red-500/10")}>
                <DollarSign className={cn("w-4 h-4", tx.type === "credit" ? "text-emerald-500" : "text-red-500")} />
              </div>
              <span className="flex-1 text-xs font-medium text-foreground">{tx.label}</span>
              <span className={cn("text-xs font-bold", tx.type === "credit" ? "text-emerald-500" : "text-red-500")}>{tx.amount}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
