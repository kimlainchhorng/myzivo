/**
 * RideWallet — Payment methods, promo codes, wallet credits, fare estimates
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Tag, Gift, DollarSign, Wallet, ChevronRight, CheckCircle, Percent, Trash2, Star, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const savedPaymentMethods = [
  { id: "visa", type: "Visa", last4: "4242", brand: "visa", isDefault: true, expiry: "12/27" },
  { id: "mc", type: "Mastercard", last4: "8888", brand: "mastercard", isDefault: false, expiry: "03/26" },
  { id: "apple", type: "Apple Pay", last4: "", brand: "apple", isDefault: false, expiry: "" },
];

const promoHistory = [
  { code: "WELCOME20", discount: "20% off", status: "active", expires: "Mar 15" },
  { code: "ZIVO10", discount: "$10 credit", status: "used", expires: "Feb 28" },
];

export default function RideWallet() {
  const [activeTab, setActiveTab] = useState<"methods" | "promos" | "wallet">("methods");
  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [walletBalance] = useState(25.50);
  const [defaultMethod, setDefaultMethod] = useState("visa");

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

  const tabs = [
    { id: "methods" as const, label: "Payment", icon: CreditCard },
    { id: "promos" as const, label: "Promos", icon: Tag },
    { id: "wallet" as const, label: "Wallet", icon: Wallet },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/30">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all",
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {activeTab === "methods" && (
            <div className="space-y-3">
              {savedPaymentMethods.map(pm => (
                <button
                  key={pm.id}
                  onClick={() => { setDefaultMethod(pm.id); toast.success(`${pm.type} set as default`); }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all touch-manipulation active:scale-[0.98]",
                    defaultMethod === pm.id
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-border/40 bg-card hover:border-primary/20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    defaultMethod === pm.id ? "bg-primary/10" : "bg-muted/50"
                  )}>
                    <CreditCard className={cn("w-5 h-5", defaultMethod === pm.id ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-foreground">{pm.type}</p>
                    {pm.last4 && <p className="text-[10px] text-muted-foreground">•••• {pm.last4} · Exp {pm.expiry}</p>}
                  </div>
                  {defaultMethod === pm.id && (
                    <Badge className="bg-primary/10 text-primary border-0 text-[9px] font-bold">Default</Badge>
                  )}
                </button>
              ))}
              <Button variant="outline" className="w-full h-12 rounded-2xl text-sm font-bold gap-2 border-dashed border-border/60">
                <Plus className="w-4 h-4" /> Add Payment Method
              </Button>
            </div>
          )}

          {activeTab === "promos" && (
            <div className="space-y-4">
              {/* Apply promo */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" /> Apply Promo Code
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    className="h-11 rounded-xl text-sm font-bold uppercase"
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim() || applyingPromo}
                    className="h-11 px-5 rounded-xl font-bold"
                  >
                    {applyingPromo ? "..." : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Promo history */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Your Promos</h3>
                {promoHistory.map(p => (
                  <div key={p.code} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      p.status === "active" ? "bg-emerald-500/10" : "bg-muted/50"
                    )}>
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
          )}

          {activeTab === "wallet" && (
            <div className="space-y-4">
              {/* Balance card */}
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
                  <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-bold">
                    History
                  </Button>
                </div>
              </div>

              {/* Auto-apply toggle */}
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

              {/* Recent transactions */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Recent</h3>
                {[
                  { label: "Referral bonus", amount: "+$10.00", type: "credit" },
                  { label: "Ride to Airport", amount: "-$5.50", type: "debit" },
                  { label: "Welcome credit", amount: "+$15.00", type: "credit" },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center",
                      tx.type === "credit" ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      <DollarSign className={cn("w-4 h-4", tx.type === "credit" ? "text-emerald-500" : "text-red-500")} />
                    </div>
                    <span className="flex-1 text-xs font-medium text-foreground">{tx.label}</span>
                    <span className={cn("text-xs font-bold", tx.type === "credit" ? "text-emerald-500" : "text-red-500")}>{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
