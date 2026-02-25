import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe,
  DollarSign,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  Check,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // Exchange rate to USD
}

interface MultiCurrencyProps {
  className?: string;
  basePrice?: number;
  baseCurrency?: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 149.50 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rate: 1.53 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', rate: 1.36 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', rate: 0.88 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', rate: 7.24 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 83.12 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽', rate: 17.15 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', rate: 1.34 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', rate: 3.67 },
];

export const MultiCurrency = ({ 
  className, 
  basePrice = 649,
  baseCurrency = 'USD'
}: MultiCurrencyProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState(baseCurrency);
  const [showAllRates, setShowAllRates] = useState(false);

  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency)!;
  const baseCurrencyData = CURRENCIES.find(c => c.code === baseCurrency)!;

  const convertedPrice = useMemo(() => {
    const usdPrice = basePrice / baseCurrencyData.rate;
    return Math.round(usdPrice * selectedCurrencyData.rate * 100) / 100;
  }, [basePrice, selectedCurrency, baseCurrency]);

  const formatPrice = (price: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
    }).format(price);
  };

  // Simulated rate change
  const rateChange = -0.5; // Percent change

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 border border-sky-500/40 flex items-center justify-center">
              <Globe className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Multi-Currency</CardTitle>
              <p className="text-sm text-muted-foreground">
                View & pay in your preferred currency
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Price Display */}
        <div className="p-6 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/5">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">Trip Total</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">{selectedCurrencyData.flag}</span>
              <span className="text-4xl font-bold">
                {formatPrice(convertedPrice, selectedCurrencyData)}
              </span>
            </div>
            {selectedCurrency !== baseCurrency && (
              <p className="text-sm text-muted-foreground mt-2">
                ≈ {formatPrice(basePrice, baseCurrencyData)} {baseCurrency}
              </p>
            )}
          </div>

          {/* Currency Selector */}
          <div className="max-w-xs mx-auto">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exchange Rate Info */}
        {selectedCurrency !== baseCurrency && (
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Exchange Rate</p>
                  <p className="text-xs text-muted-foreground">
                    1 {baseCurrency} = {(selectedCurrencyData.rate / baseCurrencyData.rate).toFixed(4)} {selectedCurrency}
                  </p>
                </div>
              </div>
              <Badge className={cn(
                rateChange < 0 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/20 text-rose-400"
              )}>
                {rateChange < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                {Math.abs(rateChange)}%
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Conversion Preview */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Quick Preview</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAllRates(!showAllRates)}
            >
              {showAllRates ? 'Show Less' : 'Show All'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CURRENCIES
              .filter(c => c.code !== selectedCurrency)
              .slice(0, showAllRates ? undefined : 6)
              .map((currency, i) => {
                const price = (basePrice / baseCurrencyData.rate) * currency.rate;
                return (
                  <motion.button
                    key={currency.code}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedCurrency(currency.code)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                      "border-border/50 hover:border-border bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-xl">{currency.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{currency.code}</p>
                      <p className="font-medium text-sm truncate">
                        {formatPrice(price, currency)}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
          </div>
        </div>

        {/* Info Notice */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Final charge will be in {selectedCurrency}. Your bank may apply additional 
              foreign transaction fees. Rates updated every 15 minutes.
            </p>
          </div>
        </div>

        {/* Payment Options */}
        <div className="p-4 border-t border-border/50">
          <h4 className="font-medium mb-3">Pay in {selectedCurrency}</h4>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Wallet className="w-4 h-4 mr-2" />
              Pay {formatPrice(convertedPrice, selectedCurrencyData)}
            </Button>
            {selectedCurrency !== baseCurrency && (
              <Button variant="outline" onClick={() => setSelectedCurrency(baseCurrency)}>
                Pay in {baseCurrency}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiCurrency;
