import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Clock,
  TrendingDown,
  AlertTriangle,
  Plane,
  Tag,
  Bell,
  ChevronRight,
  Star,
  Flame,
  Timer,
  Percent,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  type: 'flash' | 'error' | 'lastminute' | 'deal';
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
  price: number;
  originalPrice: number;
  savings: number;
  savingsPercent: number;
  airline: string;
  departDate: string;
  returnDate?: string;
  expiresIn?: string;
  seatsLeft?: number;
  isRoundTrip: boolean;
}

// TODO: Fetch real deals from API

interface DealFinderProps {
  className?: string;
}

export const DealFinder = ({ className }: DealFinderProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'savings' | 'price' | 'percent'>('savings');

  const getDealIcon = (type: Deal['type']) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'flash': return Zap;
      case 'lastminute': return Timer;
      default: return Tag;
    }
  };

  const getDealColor = (type: Deal['type']) => {
    switch (type) {
      case 'error': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'flash': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'lastminute': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getDealLabel = (type: Deal['type']) => {
    switch (type) {
      case 'error': return 'Error Fare';
      case 'flash': return 'Flash Sale';
      case 'lastminute': return 'Last Minute';
      default: return 'Deal';
    }
  };

  const deals: Deal[] = []; // TODO: Fetch from API
  const filteredDeals = activeTab === 'all' 
    ? deals 
    : deals.filter(d => d.type === activeTab);

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === 'savings') return b.savings - a.savings;
    if (sortBy === 'percent') return b.savingsPercent - a.savingsPercent;
    return a.price - b.price;
  });

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/10 border border-rose-500/40 flex items-center justify-center relative">
              <Zap className="w-6 h-6 text-rose-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                <Flame className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl">Deal Finder</CardTitle>
              <p className="text-sm text-muted-foreground">
                Flash sales, error fares & last-minute deals
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="w-4 h-4" />
            Set Alert
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Tabs */}
        <div className="p-4 border-b border-border/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="error" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Error
              </TabsTrigger>
              <TabsTrigger value="flash" className="gap-1">
                <Zap className="w-3 h-3" />
                Flash
              </TabsTrigger>
              <TabsTrigger value="lastminute" className="gap-1">
                <Timer className="w-3 h-3" />
                Last Min
              </TabsTrigger>
              <TabsTrigger value="deal" className="gap-1">
                <Tag className="w-3 h-3" />
                Deals
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2 mt-3">
            <Button
              variant={sortBy === 'savings' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('savings')}
            >
              $ Saved
            </Button>
            <Button
              variant={sortBy === 'percent' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('percent')}
            >
              % Off
            </Button>
            <Button
              variant={sortBy === 'price' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('price')}
            >
              Lowest
            </Button>
          </div>
        </div>

        {/* Deals List */}
        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {sortedDeals.map((deal, i) => {
            const DealIcon = getDealIcon(deal.type);
            
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "relative p-4 rounded-xl border transition-all cursor-pointer hover:border-primary/50",
                  "bg-gradient-to-r from-muted/30 to-transparent border-border/50"
                )}
              >
                {/* Urgency indicator */}
                {deal.expiresIn && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-rose-500 text-white gap-1 animate-pulse">
                      <Clock className="w-3 h-3" />
                      {deal.expiresIn}
                    </Badge>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Deal Type Badge */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    getDealColor(deal.type).split(' ')[0]
                  )}>
                    <DealIcon className={cn("w-6 h-6", getDealColor(deal.type).split(' ')[1])} />
                  </div>

                  {/* Route Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-xs", getDealColor(deal.type))}>
                        {getDealLabel(deal.type)}
                      </Badge>
                      {deal.seatsLeft && (
                        <Badge variant="outline" className="text-xs text-rose-400">
                          Only {deal.seatsLeft} left!
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-lg">
                      {deal.originCity} → {deal.destinationCity}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {deal.origin} → {deal.destination} • {deal.airline}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {deal.departDate}{deal.returnDate ? ` - ${deal.returnDate}` : ''} 
                      {deal.isRoundTrip ? ' (Round trip)' : ' (One way)'}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm text-muted-foreground line-through">
                        ${deal.originalPrice}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        -{deal.savingsPercent}%
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-primary">${deal.price}</p>
                    <p className="text-xs text-emerald-400">
                      Save ${deal.savings}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" size="sm">
                    <Plane className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="p-4 bg-muted/20 border-t border-border/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">About Error Fares</p>
              <p>Error fares are pricing mistakes that may be cancelled. Book at your own risk - we recommend travel insurance.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealFinder;
