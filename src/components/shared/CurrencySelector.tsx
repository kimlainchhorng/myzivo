import { useState } from "react";
import { DollarSign, ChevronDown, Check, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
];

interface CurrencySelectorProps {
  variant?: "dropdown" | "inline";
}

const CurrencySelector = ({ variant = "dropdown" }: CurrencySelectorProps) => {
  const [selected, setSelected] = useState(currencies[0]);
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {currencies.slice(0, 6).map((currency) => (
          <button
            key={currency.code}
            onClick={() => setSelected(currency)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selected.code === currency.code
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {currency.flag} {currency.code}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
      >
        <span className="text-lg">{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-border/50">
              <p className="text-xs text-muted-foreground px-2">Select Currency</p>
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    setSelected(currency);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selected.code === currency.code
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{currency.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{currency.code}</p>
                    <p className="text-xs text-muted-foreground">{currency.name}</p>
                  </div>
                  {selected.code === currency.code && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector;
