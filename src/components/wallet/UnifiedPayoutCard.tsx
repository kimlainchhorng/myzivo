/**
 * UnifiedPayoutCard — Lets creators choose between Stripe (instant card) and PayPal.
 * Default tab is region-aware: KH/VN/LA/MM see PayPal first since Stripe Connect doesn't support them.
 */
import { useState, useEffect } from "react";
import { Zap, Mail } from "lucide-react";
import StripeConnectPayoutCard from "./StripeConnectPayoutCard";
import PayPalPayoutCard from "./PayPalPayoutCard";

interface Props {
  balanceDollars: number;
}

const STRIPE_UNSUPPORTED = ["KH", "VN", "LA", "MM"];

function detectCountry(): string | null {
  try {
    const stored = localStorage.getItem("zivo_country") || localStorage.getItem("user_country");
    if (stored) return stored.toUpperCase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Phnom_Penh")) return "KH";
    if (tz.includes("Ho_Chi_Minh") || tz.includes("Hanoi")) return "VN";
    if (tz.includes("Vientiane")) return "LA";
    if (tz.includes("Yangon") || tz.includes("Rangoon")) return "MM";
  } catch (_) {}
  return null;
}

export default function UnifiedPayoutCard({ balanceDollars }: Props) {
  const [provider, setProvider] = useState<"stripe" | "paypal">("stripe");

  useEffect(() => {
    const country = detectCountry();
    if (country && STRIPE_UNSUPPORTED.includes(country)) {
      setProvider("paypal");
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setProvider("stripe")}
          className={`p-3 rounded-2xl border-2 transition-all text-left ${
            provider === "stripe" ? "border-[#635bff] bg-[#635bff]/5" : "border-border/40 bg-card opacity-70"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Zap className="w-3.5 h-3.5 text-[#635bff]" />
            <span className="text-[12px] font-bold">Stripe</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Debit card · Minutes</p>
        </button>
        <button
          onClick={() => setProvider("paypal")}
          className={`p-3 rounded-2xl border-2 transition-all text-left ${
            provider === "paypal" ? "border-[#003087] bg-[#003087]/5" : "border-border/40 bg-card opacity-70"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Mail className="w-3.5 h-3.5 text-[#003087]" />
            <span className="text-[12px] font-bold">PayPal</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Email · Global</p>
        </button>
      </div>

      {provider === "stripe" ? (
        <StripeConnectPayoutCard balanceDollars={balanceDollars} />
      ) : (
        <PayPalPayoutCard balanceDollars={balanceDollars} />
      )}
    </div>
  );
}
