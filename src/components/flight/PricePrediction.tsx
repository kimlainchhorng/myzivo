import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
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
  Target,
  Plane,
  Users,
  CalendarDays,
  Fuel,
  TrendingUpIcon,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Timer,
  CircleDollarSign,
  Lightbulb
} from "lucide-react";
import { format, addDays, subDays, differenceInDays, isSameDay } from "date-fns";
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

interface PriceFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number;
  icon: typeof Plane;
}

const PRICE_FACTORS: PriceFactor[] = [
  { name: 'Seasonality', impact: 'negative', description: 'Peak travel season increases demand', weight: 25, icon: CalendarDays },
  { name: 'Fuel Prices', impact: 'neutral', description: 'Fuel costs are currently stable', weight: 15, icon: Fuel },
  { name: 'Demand', impact: 'negative', description: 'High demand on this route', weight: 30, icon: Users },
  { name: 'Advance Purchase', impact: 'positive', description: 'Booking 3+ weeks out saves money', weight: 20, icon: Clock },
  { name: 'Competition', impact: 'positive', description: 'Multiple carriers on this route', weight: 10, icon: Plane },
];

const BOOKING_WINDOWS = [
  { label: '0-7 days', priceMultiplier: 1.4, color: 'bg-red-500' },
  { label: '8-14 days', priceMultiplier: 1.2, color: 'bg-amber-500' },
  { label: '15-30 days', priceMultiplier: 1.0, color: 'bg-emerald-500' },
  { label: '31-60 days', priceMultiplier: 0.9, color: 'bg-sky-500' },
  { label: '60+ days', priceMultiplier: 0.85, color: 'bg-violet-500' },
];

const generatePriceHistory = (basePrice: number): PricePoint[] => {
  const history: PricePoint[] = [];
  const today = new Date();
  
  for (let i = 30; i >= 1; i--) {
    const dayOfWeek = subDays(today, i).getDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.05 : 0;
    const variation = (Math.random() - 0.5) * 0.12 + weekendBoost;
    history.push({
      date: subDays(today, i),
      price: Math.round(basePrice * (1 + variation))
    });
  }
  
  history.push({ date: today, price: basePrice });
  
  let trend = Math.random() > 0.4 ? 1 : -1;
  let lastPrice = basePrice;
  
  for (let i = 1; i <= 21; i++) {
    const trendStrength = i / 21 * 0.12;
    const dailyVariation = (Math.random() - 0.45) * 0.06;
    lastPrice = lastPrice * (1 + dailyVariation + (trend * trendStrength));
    
    history.push({
      date: addDays(today, i),
      price: Math.round(lastPrice),
      prediction: true
    });
  }
  
  return history;
};

const generateDayOfWeekPrices = (basePrice: number): Record<string, number> => {
  return {
    'Sunday': Math.round(basePrice * 1.08),
    'Monday': Math.round(basePrice * 0.95),
    'Tuesday': Math.round(basePrice * 0.92),
    'Wednesday': Math.round(basePrice * 0.94),
    'Thursday': Math.round(basePrice * 0.98),
    'Friday': Math.round(basePrice * 1.12),
    'Saturday': Math.round(basePrice * 1.15),
  };
};

export const PricePrediction = ({
  route,
  departureDate = addDays(new Date(), 21),
  currentPrice = 450,
  className
}: PricePredictionProps) => {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertPrice, setAlertPrice] = useState(Math.round(currentPrice * 0.9));
  const [activeTab, setActiveTab] = useState('overview');
  const [showFactors, setShowFactors] = useState(false);

  useEffect(() => {
    setPriceHistory(generatePriceHistory(currentPrice));
  }, [currentPrice]);

  const dayOfWeekPrices = useMemo(() => generateDayOfWeekPrices(currentPrice), [currentPrice]);

  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const avgPrice = Math.round(priceHistory.reduce((a, b) => a + b.price, 0) / priceHistory.length);
  
  const historicalPrices = priceHistory.filter(p => !p.prediction);
  const futurePrices = priceHistory.filter(p => p.prediction);
  
  const historicalLow = historicalPrices.length > 0 ? Math.min(...historicalPrices.map(p => p.price)) : currentPrice;
  const historicalHigh = historicalPrices.length > 0 ? Math.max(...historicalPrices.map(p => p.price)) : currentPrice;
  
  const predictedMinPrice = futurePrices.length > 0 ? Math.min(...futurePrices.map(p => p.price)) : currentPrice;
  const predictedMinDate = futurePrices.find(p => p.price === predictedMinPrice)?.date;
  
  const predictedTrend = futurePrices.length > 0 
    ? ((futurePrices[futurePrices.length - 1].price - currentPrice) / currentPrice) * 100
    : 0;
  
  const daysUntilDeparture = differenceInDays(departureDate, new Date());
  
  const recommendation = predictedTrend > 8 
    ? 'buy' 
    : predictedTrend < -8 
    ? 'wait' 
    : 'neutral';

  // TODO: Get real confidence score from prediction model
  const confidenceScore = 0;
  
  const priceVsAverage = ((currentPrice - avgPrice) / avgPrice) * 100;

  const toggleAlert = () => {
    setAlertEnabled(!alertEnabled);
    if (!alertEnabled) {
      toast.success(`Price alert set for $${alertPrice}`);
    }
  };

  const cheapestDay = Object.entries(dayOfWeekPrices).reduce((a, b) => a[1] < b[1] ? a : b);

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
                  <Zap className="w-3 h-3 mr-1" />
                  ML Forecast
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {route.originCode} → {route.destCode} • {format(departureDate, 'MMM d, yyyy')}
                <span className="ml-2 text-xs">({daysUntilDeparture} days away)</span>
              </p>
            </div>
          </div>

          <Button
            variant={alertEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleAlert}
            className={cn(
              "gap-2",
              alertEnabled && "bg-emerald-500 hover:bg-emerald-600"
            )}
          >
            {alertEnabled ? (
              <><Bell className="w-4 h-4" /> Alert: ${alertPrice}</>
            ) : (
              <><BellOff className="w-4 h-4" /> Set Alert</>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/50 px-4">
            <TabsList className="bg-transparent h-auto p-0">
              {[
                { value: 'overview', label: 'Overview' },
                { value: 'factors', label: 'Price Factors' },
                { value: 'timing', label: 'Best Time' },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-4 space-y-6">
            <TabsContent value="overview" className="m-0 space-y-6">
              {/* Current Price & Recommendation */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                  <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                  <p className="text-2xl font-bold">${currentPrice}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    priceVsAverage < 0 ? "text-emerald-400" : priceVsAverage > 0 ? "text-red-400" : "text-muted-foreground"
                  )}>
                    {priceVsAverage < 0 ? '↓' : priceVsAverage > 0 ? '↑' : ''} 
                    {Math.abs(priceVsAverage).toFixed(0)}% vs avg
                  </p>
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
                  <p className="text-xs text-muted-foreground mt-1">{confidenceScore}% confidence</p>
                </div>
                
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                  <p className="text-xs text-muted-foreground mb-1">21-Day Forecast</p>
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
                  <span className="text-sm font-medium">30-Day History + 21-Day Forecast</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      Historical
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                      Predicted
                    </span>
                  </div>
                </div>

                <div className="h-40 flex items-end gap-[2px]">
                  {priceHistory.map((point, i) => {
                    const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100 || 10;
                    const isToday = isSameDay(point.date, new Date());
                    const isLowest = point.price === predictedMinPrice && point.prediction;
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.015 }}
                        className={cn(
                          "flex-1 rounded-t transition-colors cursor-pointer group relative",
                          point.prediction 
                            ? "bg-emerald-500/40 hover:bg-emerald-500/60" 
                            : "bg-primary/60 hover:bg-primary/80",
                          isToday && "bg-amber-500 hover:bg-amber-400",
                          isLowest && "bg-emerald-400 ring-2 ring-emerald-400/50"
                        )}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover border border-border text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <p className="font-medium">${point.price}</p>
                          <p className="text-muted-foreground">{format(point.date, 'MMM d')}</p>
                          {isLowest && <p className="text-emerald-400 text-[10px]">Predicted low</p>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>-30 days</span>
                  <span className="text-amber-400 font-medium">Today</span>
                  <span>+21 days</span>
                </div>
              </div>

              {/* Price Range & Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">30-Day Low</p>
                  <p className="text-lg font-bold text-emerald-400">${historicalLow}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">30-Day High</p>
                  <p className="text-lg font-bold text-red-400">${historicalHigh}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Average</p>
                  <p className="text-lg font-bold">${avgPrice}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center">
                  <p className="text-[10px] text-emerald-400 uppercase">Best Predicted</p>
                  <p className="text-lg font-bold text-emerald-400">${predictedMinPrice}</p>
                  {predictedMinDate && (
                    <p className="text-[10px] text-muted-foreground">{format(predictedMinDate, 'MMM d')}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="factors" className="m-0 space-y-4">
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <span className="font-medium">What's affecting this price?</span>
                </div>

                <div className="space-y-3">
                  {PRICE_FACTORS.map((factor, i) => (
                    <motion.div
                      key={factor.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        factor.impact === 'positive' && "bg-emerald-500/20 text-emerald-400",
                        factor.impact === 'negative' && "bg-red-500/20 text-red-400",
                        factor.impact === 'neutral' && "bg-sky-500/20 text-sky-400",
                      )}>
                        <factor.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{factor.name}</span>
                          <Badge className={cn(
                            "text-xs",
                            factor.impact === 'positive' && "bg-emerald-500/20 text-emerald-400",
                            factor.impact === 'negative' && "bg-red-500/20 text-red-400",
                            factor.impact === 'neutral' && "bg-sky-500/20 text-sky-400",
                          )}>
                            {factor.impact === 'positive' ? '↓ Lower' : factor.impact === 'negative' ? '↑ Higher' : '— Stable'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
                        <div className="mt-2">
                          <Progress value={factor.weight} className="h-1" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Booking Window Analysis */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Timer className="w-5 h-5 text-violet-400" />
                  <span className="font-medium">Booking Window Impact</span>
                </div>

                <div className="space-y-2">
                  {BOOKING_WINDOWS.map((window, i) => {
                    const estimatedPrice = Math.round(currentPrice * window.priceMultiplier);
                    const isCurrent = daysUntilDeparture >= (i === 0 ? 0 : i === 1 ? 8 : i === 2 ? 15 : i === 3 ? 31 : 60) &&
                                     daysUntilDeparture < (i === 0 ? 8 : i === 1 ? 15 : i === 2 ? 31 : i === 3 ? 60 : 999);
                    
                    return (
                      <div
                        key={window.label}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-xl transition-colors",
                          isCurrent && "bg-primary/10 ring-1 ring-primary/40"
                        )}
                      >
                        <div className={cn("w-3 h-3 rounded-full", window.color)} />
                        <span className="text-sm flex-1">{window.label}</span>
                        <span className="text-sm font-medium">${estimatedPrice}</span>
                        {window.priceMultiplier < 1 && (
                          <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400">
                            Save {Math.round((1 - window.priceMultiplier) * 100)}%
                          </Badge>
                        )}
                        {window.priceMultiplier > 1 && (
                          <Badge className="text-[10px] bg-red-500/20 text-red-400">
                            +{Math.round((window.priceMultiplier - 1) * 100)}%
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="m-0 space-y-4">
              {/* Day of Week Analysis */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-sky-400" />
                  <span className="font-medium">Best Day to Fly</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(dayOfWeekPrices).map(([day, price]) => {
                    const isCheapest = day === cheapestDay[0];
                    const isExpensive = price > currentPrice * 1.08;
                    
                    return (
                      <div
                        key={day}
                        className={cn(
                          "p-3 rounded-xl text-center transition-all",
                          isCheapest && "bg-emerald-500/20 border border-emerald-500/40",
                          isExpensive && !isCheapest && "bg-red-500/10 border border-red-500/30",
                          !isCheapest && !isExpensive && "bg-muted/30 border border-border/50"
                        )}
                      >
                        <p className="text-xs text-muted-foreground">{day.slice(0, 3)}</p>
                        <p className={cn(
                          "text-sm font-bold mt-1",
                          isCheapest && "text-emerald-400",
                          isExpensive && !isCheapest && "text-red-400"
                        )}>
                          ${price}
                        </p>
                        {isCheapest && (
                          <Badge className="text-[8px] mt-1 bg-emerald-500/20 text-emerald-300">BEST</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {cheapestDay[0]} is typically the cheapest day for this route
                </p>
              </div>

              {/* Time of Day */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="font-medium">Optimal Departure Time</span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { time: 'Early AM', range: '5-8am', savings: '-12%', best: true },
                    { time: 'Morning', range: '9am-12pm', savings: '-5%', best: false },
                    { time: 'Afternoon', range: '1-5pm', savings: '+3%', best: false },
                    { time: 'Evening', range: '6-10pm', savings: '+8%', best: false },
                  ].map(slot => (
                    <div
                      key={slot.time}
                      className={cn(
                        "p-3 rounded-xl text-center",
                        slot.best ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-muted/30 border border-border/50"
                      )}
                    >
                      <p className="text-xs text-muted-foreground">{slot.time}</p>
                      <p className="text-sm font-medium mt-1">{slot.range}</p>
                      <p className={cn(
                        "text-xs mt-1 font-medium",
                        slot.savings.startsWith('-') ? "text-emerald-400" : "text-red-400"
                      )}>
                        {slot.savings}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

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
                          ? 'Prices expected to rise. Book within 24-48 hours for best value!'
                          : recommendation === 'wait'
                          ? `Wait until ${predictedMinDate ? format(predictedMinDate, 'MMM d') : 'next week'} for potential ${Math.abs(predictedTrend).toFixed(0)}% savings.`
                          : 'Current price is fair and within normal range for this route.'
                        }
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <span>
                        {cheapestDay[0]} departures are {Math.round((1 - cheapestDay[1] / currentPrice) * 100)}% cheaper on average.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PricePrediction;
