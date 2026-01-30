import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Clock,
  Calendar,
  DollarSign,
  Bell,
  BellOff,
  BarChart3,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface PricePredictionProps {
  route: {
    origin: string;
    originCode: string;
    destination: string;
    destCode: string;
  };
  departureDate?: Date;
  currentPrice?: number;
  className?: string;
}

interface PricePoint {
  date: Date;
  price: number;
  prediction?: boolean;
}

const generatePriceHistory = (basePrice: number): PricePoint[] => {
  const history: PricePoint[] = [];
  const today = new Date();
  
  // Historical prices (last 14 days)
  for (let i = 14; i >= 1; i--) {
    const variation = (Math.random() - 0.5) * 0.15;
    history.push({
      date: subDays(today, i),
      price: Math.round(basePrice * (1 + variation))
    });
  }
  
  // Today's price
  history.push({ date: today, price: basePrice });
  
  // Predicted prices (next 14 days)
  let trend = Math.random() > 0.5 ? 1 : -1;
  let lastPrice = basePrice;
  
  for (let i = 1; i <= 14; i++) {
    // Prices generally increase closer to departure
    const trendStrength = i / 14 * 0.1;
    const dailyVariation = (Math.random() - 0.4) * 0.08;
    lastPrice = lastPrice * (1 + dailyVariation + (trend * trendStrength));
    
    history.push({
      date: addDays(today, i),
      price: Math.round(lastPrice),
      prediction: true
    });
  }
  
  return history;
};

export const PricePrediction = ({
  route,
  departureDate = addDays(new Date(), 21),
  currentPrice = 450,
  className
}: PricePredictionProps) => {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setPriceHistory(generatePriceHistory(currentPrice));
  }, [currentPrice]);

  // Calculate prediction metrics
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const avgPrice = Math.round(priceHistory.reduce((a, b) => a + b.price, 0) / priceHistory.length);
  
  const futurePrices = priceHistory.filter(p => p.prediction);
  const predictedMinPrice = futurePrices.length > 0 ? Math.min(...futurePrices.map(p => p.price)) : currentPrice;
  const predictedTrend = futurePrices.length > 0 
    ? ((futurePrices[futurePrices.length - 1].price - currentPrice) / currentPrice) * 100
    : 0;
  
  const recommendation = predictedTrend > 5 
    ? 'buy' 
    : predictedTrend < -5 
    ? 'wait' 
    : 'neutral';

  const confidenceScore = Math.round(75 + Math.random() * 20);

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center relative">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Price Prediction
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                  AI Forecast
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {route.originCode} → {route.destCode} • {format(departureDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <Button
            variant={alertEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAlertEnabled(!alertEnabled)}
            className={cn(
              "gap-2",
              alertEnabled && "bg-emerald-500 hover:bg-emerald-600"
            )}
          >
            {alertEnabled ? (
              <><Bell className="w-4 h-4" /> Alert On</>
            ) : (
              <><BellOff className="w-4 h-4" /> Set Alert</>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* Current Price & Recommendation */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Current Price</p>
            <p className="text-2xl font-bold">${currentPrice}</p>
          </div>
          
          <div className={cn(
            "p-4 rounded-xl text-center",
            recommendation === 'buy' && "bg-emerald-500/10 border border-emerald-500/40",
            recommendation === 'wait' && "bg-amber-500/10 border border-amber-500/40",
            recommendation === 'neutral' && "bg-sky-500/10 border border-sky-500/40"
          )}>
            <p className="text-xs text-muted-foreground mb-1">AI Recommendation</p>
            <div className="flex items-center justify-center gap-2">
              {recommendation === 'buy' && (
                <>
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-400">BUY NOW</span>
                </>
              )}
              {recommendation === 'wait' && (
                <>
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-lg font-bold text-amber-400">WAIT</span>
                </>
              )}
              {recommendation === 'neutral' && (
                <>
                  <Target className="w-5 h-5 text-sky-400" />
                  <span className="text-lg font-bold text-sky-400">FAIR PRICE</span>
                </>
              )}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">14-Day Forecast</p>
            <div className="flex items-center justify-center gap-1">
              {predictedTrend > 0 ? (
                <TrendingUp className="w-5 h-5 text-red-400" />
              ) : predictedTrend < 0 ? (
                <TrendingDown className="w-5 h-5 text-emerald-400" />
              ) : (
                <Minus className="w-5 h-5 text-muted-foreground" />
              )}
              <span className={cn(
                "text-lg font-bold",
                predictedTrend > 0 && "text-red-400",
                predictedTrend < 0 && "text-emerald-400",
                predictedTrend === 0 && "text-muted-foreground"
              )}>
                {predictedTrend > 0 ? '+' : ''}{predictedTrend.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Price History & Forecast</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
                Historical
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-50" />
                Predicted
              </span>
            </div>
          </div>

          {/* Simple Chart Visualization */}
          <div className="h-32 flex items-end gap-[2px]">
            {priceHistory.map((point, i) => {
              const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100 || 10;
              const isToday = i === 14;
              
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    "flex-1 rounded-t transition-colors cursor-pointer group relative",
                    point.prediction 
                      ? "bg-emerald-500/40 hover:bg-emerald-500/60" 
                      : "bg-primary/60 hover:bg-primary/80",
                    isToday && "bg-amber-500 hover:bg-amber-400"
                  )}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover border border-border text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p className="font-medium">${point.price}</p>
                    <p className="text-muted-foreground">{format(point.date, 'MMM d')}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>-14 days</span>
            <span className="text-amber-400 font-medium">Today</span>
            <span>+14 days</span>
          </div>
        </div>

        {/* Confidence & Insights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Prediction Confidence</span>
              <span className="font-bold">{confidenceScore}%</span>
            </div>
            <Progress value={confidenceScore} className="h-2" />
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Best Price Found</span>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                ${predictedMinPrice}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {predictedMinPrice < currentPrice 
                ? `Wait ${Math.round(Math.random() * 7 + 3)} days for best rate`
                : 'Current price is near optimal'
              }
            </p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-emerald-400 mb-2">AI Insights</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    {recommendation === 'buy' 
                      ? 'Prices likely to increase as departure nears. Book soon!'
                      : recommendation === 'wait'
                      ? 'Price drop expected in the next few days. Consider waiting.'
                      : 'Price is stable and within historical average.'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>
                    Tuesday and Wednesday typically have the lowest fares on this route.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricePrediction;
