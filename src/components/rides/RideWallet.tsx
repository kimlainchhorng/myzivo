/**
 * RideWallet — Enhanced payment management with split fare, top-up, transaction history
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Tag, Gift, DollarSign, Wallet, Percent, Trash2, Zap, X, ArrowUpRight, ArrowDownLeft, Users, Send, Copy, CheckCircle, Clock, TrendingUp, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getPublicOrigin } from "@/lib/getPublicOrigin";
import { useLocalPaymentMethods, formatCardNumber, formatExpiry, parseExpiry, detectCardBrand, validateCardNumber, validateExpiry, validateCVV, type CardInput } from "@/hooks/useLocalPaymentMethods";
import { useCustomerWallet } from "@/hooks/useCustomerWallet";

export default function RideWallet() {
  const [activeTab, setActiveTab] = useState<"methods" | "promos" | "wallet" | "split">("methods");

  const tabs = [
    { id: "methods" as const, label: "Cards", icon: CreditCard },
    { id: "wallet" as const, label: "Wallet", icon: Wallet },
    { id: "promos" as const, label: "Promos", icon: Tag },
    { id: "split" as const, label: "Split", icon: Users },
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
          {activeTab === "wallet" && <WalletTab />}
          {activeTab === "promos" && <PromosTab />}
          {activeTab === "split" && <SplitFareTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PaymentMethodsTab() {
  const { methods, addCard, deleteCard, setDefault, getDefault } = useLocalPaymentMethods();
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saving, setSaving] = useState(false);

  const brand = detectCardBrand(cardNumber);

  const handleAddCard = () => {
    if (!validateCardNumber(cardNumber.replace(/\s/g, ""))) { toast.error("Invalid card number"); return; }
    if (!validateExpiry(expiry)) { toast.error("Invalid or expired date"); return; }
    if (!validateCVV(cvv)) { toast.error("Invalid CVV"); return; }
    if (!cardName.trim()) { toast.error("Enter cardholder name"); return; }

    setSaving(true);
    const parsed = parseExpiry(expiry)!;
    const cleaned = cardNumber.replace(/\s/g, "");

    setTimeout(() => {
      const card: CardInput = { type: "card", brand, last4: cleaned.slice(-4), expMonth: parsed.month, expYear: parsed.year, cardholderName: cardName.trim() };
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
        <motion.div
          key={pm.id}
          layout
          className={cn("flex items-center gap-3 p-3.5 rounded-2xl border transition-all", pm.isDefault ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border/40 bg-card")}
        >
          <button onClick={() => { setDefault(pm.id); toast.success(`${pm.brand} set as default`); }} className="flex items-center gap-3 flex-1 text-left touch-manipulation">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", pm.isDefault ? "bg-primary/10" : "bg-muted/50")}>
              <CreditCard className={cn("w-5 h-5", pm.isDefault ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{pm.brand}</p>
              <p className="text-[10px] text-muted-foreground">•••• {pm.last4} · Exp {String(pm.expMonth).padStart(2, "0")}/{String(pm.expYear).slice(-2)}</p>
            </div>
          </button>
          {pm.isDefault && <Badge className="bg-primary/10 text-primary border-0 text-[9px] font-bold">Default</Badge>}
          <button onClick={() => { deleteCard(pm.id); toast.success("Card removed"); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" aria-label="Remove card">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ))}

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-primary/20 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Add Card</h3>
                <button onClick={() => setShowAddForm(false)} className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center"><X className="w-3 h-3 text-muted-foreground" /></button>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} className="h-11 rounded-xl text-sm font-mono pr-16" maxLength={19} inputMode="numeric" />
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

function WalletTab() {
  const { balanceDollars } = useCustomerWallet();
  const walletBalance = balanceDollars || 0;
  const [topUpAmount, setTopUpAmount] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const transactions = [
    { label: "Referral bonus", amount: 10, type: "credit", date: "Today", icon: Gift },
    { label: "Ride to Airport", amount: -5.50, type: "debit", date: "Yesterday", icon: ArrowUpRight },
    { label: "Welcome credit", amount: 15, type: "credit", date: "Mar 1", icon: Zap },
    { label: "Downtown ride", amount: -12.30, type: "debit", date: "Feb 28", icon: ArrowUpRight },
    { label: "Promo credit", amount: 5, type: "credit", date: "Feb 25", icon: Percent },
  ];

  const topUpPresets = [10, 25, 50, 100];

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20 p-5 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-bl from-emerald-500/15 to-transparent rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ZIVO Wallet</span>
          </div>
          <p className="text-3xl font-black text-foreground">${walletBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Available credit balance</p>
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="h-9 rounded-xl text-xs font-bold gap-1.5" onClick={() => setShowTopUp(!showTopUp)}>
              <Plus className="w-3.5 h-3.5" /> Top Up
            </Button>
            <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-bold" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? "Hide" : "History"}
            </Button>
          </div>
        </div>
      </div>

      {/* Top-up section */}
      <AnimatePresence>
        {showTopUp && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-primary/20 bg-card p-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary" /> Add Funds
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {topUpPresets.map(amt => (
                  <button key={amt} onClick={() => setTopUpAmount(String(amt))} className={cn("py-2.5 rounded-xl text-sm font-bold border transition-all", topUpAmount === String(amt) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/20 text-foreground border-border/40 hover:border-primary/30")}>
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Custom amount" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value.replace(/[^\d.]/g, ""))} className="h-11 rounded-xl text-sm font-mono" inputMode="decimal" />
                <Button className="h-11 px-5 rounded-xl font-bold" disabled={!topUpAmount || parseFloat(topUpAmount) <= 0} onClick={() => { toast.success(`$${topUpAmount} added to wallet!`); setTopUpAmount(""); setShowTopUp(false); }}>
                  Add
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-apply */}
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

      {/* Transaction history */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          {showHistory ? "All Transactions" : "Recent"}
        </h3>
        {walletBalance === 0 && !showHistory ? (
          <div className="rounded-xl border border-dashed border-border/40 p-4 text-center">
            <p className="text-xs text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          (showHistory ? transactions : transactions.slice(0, 3)).map((tx, i) => {
            const Icon = tx.icon;
            const isCredit = tx.amount > 0;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isCredit ? "bg-emerald-500/10" : "bg-red-500/10")}>
                  <Icon className={cn("w-4 h-4", isCredit ? "text-emerald-500" : "text-red-500")} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-foreground">{tx.label}</span>
                  <p className="text-[9px] text-muted-foreground">{tx.date}</p>
                </div>
                <span className={cn("text-xs font-bold", isCredit ? "text-emerald-500" : "text-red-500")}>
                  {isCredit ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PromosTab() {
  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromos, setAppliedPromos] = useState<Array<{ code: string; discount: string; status: string; expires: string }>>([
    { code: "WELCOME20", discount: "20% off", status: "active", expires: "Mar 15" },
    { code: "ZIVO10", discount: "$10 credit", status: "used", expires: "Feb 28" },
  ]);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    setTimeout(() => {
      setApplyingPromo(false);
      const code = promoInput.toUpperCase();
      if (appliedPromos.some(p => p.code === code)) {
        toast.error("Promo already applied");
      } else if (code === "ZIVO50" || code === "RIDE25" || code === "FIRST10") {
        const newPromo = { code, discount: code === "ZIVO50" ? "50% off" : code === "RIDE25" ? "$25 credit" : "$10 off", status: "active", expires: "Apr 30" };
        setAppliedPromos(prev => [newPromo, ...prev]);
        toast.success(`Promo applied: ${newPromo.discount}!`);
      } else {
        toast.error("Invalid or expired promo code");
      }
      setPromoInput("");
    }, 1200);
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
            {applyingPromo ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : "Apply"}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">Try: ZIVO50, RIDE25, FIRST10</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Your Promos</h3>
        {appliedPromos.map(p => (
          <div key={p.code} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", p.status === "active" ? "bg-emerald-500/10" : "bg-muted/50")}>
              <Percent className={cn("w-4 h-4", p.status === "active" ? "text-emerald-500" : "text-muted-foreground")} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">{p.code}</p>
              <p className="text-[10px] text-muted-foreground">{p.discount} · Exp {p.expires}</p>
            </div>
            <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[9px] font-bold capitalize">{p.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function SplitFareTab() {
  const [contacts, setContacts] = useState([
    { id: "1", name: "Alex M.", share: 50, status: "pending" },
  ]);
  const [newName, setNewName] = useState("");
  const [splitLink, setSplitLink] = useState("");

  const myShare = 100 - contacts.reduce((sum, c) => sum + c.share, 0);

  const addSplitter = () => {
    if (!newName.trim()) return;
    const evenShare = Math.floor(100 / (contacts.length + 2));
    const updated = contacts.map(c => ({ ...c, share: evenShare }));
    updated.push({ id: Date.now().toString(), name: newName.trim(), share: evenShare, status: "pending" });
    setContacts(updated);
    setNewName("");
    toast.success(`${newName.trim()} added to split`);
  };

  const generateLink = () => {
    const link = `${getPublicOrigin()}/split/${Date.now().toString(36)}`;
    setSplitLink(link);
    navigator.clipboard.writeText(link);
    toast.success("Split link copied!");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-primary/5 border border-violet-500/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-violet-500" />
          <h3 className="text-sm font-bold text-foreground">Split This Fare</h3>
        </div>

        {/* Share visualization */}
        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
          <motion.div className="bg-primary rounded-l-full" style={{ width: `${myShare}%` }} layout />
          {contacts.map((c, i) => (
            <motion.div key={c.id} className={cn("rounded-none", i === contacts.length - 1 ? "rounded-r-full" : "", ["bg-violet-500", "bg-emerald-500", "bg-amber-500"][i % 3])} style={{ width: `${c.share}%` }} layout />
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card/60">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">You</span>
            </div>
            <span className="flex-1 text-xs font-bold text-foreground">Your share</span>
            <span className="text-sm font-black text-primary">{myShare}%</span>
          </div>

          {contacts.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-card/60">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", ["bg-violet-500/10", "bg-emerald-500/10", "bg-amber-500/10"][i % 3])}>
                <span className={cn("text-xs font-bold", ["text-violet-500", "text-emerald-500", "text-amber-500"][i % 3])}>{c.name[0]}</span>
              </div>
              <span className="flex-1 text-xs font-medium text-foreground">{c.name}</span>
              <Badge variant="outline" className={cn("text-[8px] font-bold", c.status === "accepted" ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20")}>
                {c.status}
              </Badge>
              <span className="text-sm font-black text-foreground">{c.share}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add person */}
      <div className="flex gap-2">
        <Input placeholder="Add person's name" value={newName} onChange={e => setNewName(e.target.value)} className="h-11 rounded-xl text-sm" />
        <Button onClick={addSplitter} disabled={!newName.trim() || contacts.length >= 4} className="h-11 px-4 rounded-xl font-bold">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Share link */}
      <Button variant="outline" className="w-full h-12 rounded-2xl text-sm font-bold gap-2" onClick={generateLink}>
        <Send className="w-4 h-4" /> {splitLink ? "Link Copied!" : "Generate Split Link"}
      </Button>

      {splitLink && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/30">
          <span className="text-[10px] text-muted-foreground flex-1 font-mono truncate">{splitLink}</span>
          <button onClick={() => { navigator.clipboard.writeText(`https://${splitLink}`); toast.success("Copied!"); }}>
            <Copy className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      )}
    </div>
  );
}
