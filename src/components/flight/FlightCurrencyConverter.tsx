import { useState, useEffect } from "react";
import { ArrowRightLeft, TrendingUp, TrendingDown, RefreshCw, DollarSign } from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
];

const exchangeRates: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, AUD: 1.53, CAD: 1.36, USD: 1 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 162.88, AUD: 1.67, CAD: 1.48, EUR: 1 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.65, AUD: 1.94, CAD: 1.72, GBP: 1 },
  JPY: { USD: 0.0067, EUR: 0.0061, GBP: 0.0053, AUD: 0.010, CAD: 0.009, JPY: 1 },
  AUD: { USD: 0.65, EUR: 0.60, GBP: 0.52, JPY: 97.71, CAD: 0.89, AUD: 1 },
  CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 109.93, AUD: 1.13, CAD: 1 },
};

const FlightCurrencyConverter = () => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [converted, setConverted] = useState(0);

  useEffect(() => {
    const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
    setConverted(amount * rate);
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              <DollarSign className="w-4 h-4" />
              Travel Tools
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Currency <span className="text-primary">Converter</span>
            </h2>
            <p className="text-muted-foreground">
              Check exchange rates for your destination
            </p>
          </div>

          {/* Converter Card */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-end mb-6">
              {/* From */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">From</label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                  <span className="text-2xl">{fromCurrencyData?.flag}</span>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-medium"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full mt-2 p-3 rounded-xl bg-background border border-border text-2xl font-bold text-center"
                />
              </div>

              {/* Swap Button */}
              <button
                onClick={swapCurrencies}
                className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors mb-8"
              >
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </button>

              {/* To */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">To</label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                  <span className="text-2xl">{toCurrencyData?.flag}</span>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-medium"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full mt-2 p-3 rounded-xl bg-primary/10 border border-primary/30 text-2xl font-bold text-center text-primary">
                  {toCurrencyData?.symbol}{converted.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">+0.12% today</span>
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[50, 100, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    amount === amt
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fromCurrencyData?.symbol}{amt}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Rates are indicative and may vary. Check with your bank for exact rates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FlightCurrencyConverter;
