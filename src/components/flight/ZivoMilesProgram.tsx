import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  Plane,
  Gift,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
  CreditCard,
  ShoppingBag,
  Utensils,
  Car,
  Hotel,
  Star,
  History,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MilesTransaction {
  id: string;
  type: 'earn' | 'redeem';
  amount: number;
  description: string;
  category: string;
  date: string;
  icon: typeof Plane;
}

interface RedemptionOption {
  id: string;
  title: string;
  description: string;
  milesRequired: number;
  value: string;
  category: string;
  icon: typeof Gift;
  popular?: boolean;
}

const MOCK_TRANSACTIONS: MilesTransaction[] = [
  { id: '1', type: 'earn', amount: 2450, description: 'JFK → LHR Flight', category: 'flights', date: '2024-01-15', icon: Plane },
  { id: '2', type: 'earn', amount: 150, description: 'Hotel Booking - Paris', category: 'hotels', date: '2024-01-14', icon: Hotel },
  { id: '3', type: 'redeem', amount: -5000, description: 'Lounge Access Voucher', category: 'rewards', date: '2024-01-10', icon: Gift },
  { id: '4', type: 'earn', amount: 320, description: 'Car Rental - Nice', category: 'cars', date: '2024-01-08', icon: Car },
  { id: '5', type: 'earn', amount: 85, description: 'Restaurant - Airport', category: 'dining', date: '2024-01-05', icon: Utensils },
];

const REDEMPTION_OPTIONS: RedemptionOption[] = [
  { id: '1', title: 'Flight Upgrade', description: 'Upgrade to Business Class', milesRequired: 25000, value: '$800', category: 'flights', icon: Plane, popular: true },
  { id: '2', title: 'Lounge Access', description: 'Priority Pass - 1 Visit', milesRequired: 5000, value: '$50', category: 'lounges', icon: Star },
  { id: '3', title: 'Free Night', description: 'Partner Hotel Voucher', milesRequired: 15000, value: '$200', category: 'hotels', icon: Hotel },
  { id: '4', title: 'Shopping Credit', description: 'Duty-Free Voucher', milesRequired: 10000, value: '$100', category: 'shopping', icon: ShoppingBag },
  { id: '5', title: 'Car Rental Day', description: 'Free Rental Day', milesRequired: 8000, value: '$75', category: 'cars', icon: Car },
  { id: '6', title: 'Gift Card', description: '$50 ZIVO Credit', milesRequired: 5000, value: '$50', category: 'credit', icon: CreditCard },
];

const EARN_RATES = [
  { category: 'Flights', rate: '10 miles per $1', multiplier: '2x on Business/First', icon: Plane, color: 'text-sky-400' },
  { category: 'Hotels', rate: '5 miles per $1', multiplier: '1.5x Partner Hotels', icon: Hotel, color: 'text-amber-400' },
  { category: 'Car Rentals', rate: '3 miles per $1', multiplier: '2x Weekend Rentals', icon: Car, color: 'text-emerald-400' },
  { category: 'Dining', rate: '2 miles per $1', multiplier: '3x Airport Dining', icon: Utensils, color: 'text-rose-400' },
];

interface ZivoMilesProgramProps {
  className?: string;
}

export const ZivoMilesProgram = ({ className }: ZivoMilesProgramProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const currentMiles = 45680;
  const lifetimeMiles = 125400;
  const pendingMiles = 2340;
  const expiringMiles = 5000;
  const expiryDate = 'Mar 31, 2025';

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                ZIVO Miles
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  Gold Member
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Earn & redeem across all ZIVO services</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Miles Summary */}
        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <p className="text-3xl font-bold text-amber-400">{currentMiles.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Available Miles</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <p className="text-2xl font-semibold text-emerald-400">+{pendingMiles.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <p className="text-2xl font-semibold text-rose-400">{expiringMiles.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Expiring {expiryDate}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <p className="text-2xl font-semibold">{lifetimeMiles.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Lifetime Earned</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earn">Earn</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <p className="text-lg font-semibold">+12%</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-sky-400" />
                <p className="text-lg font-semibold">8</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                <Gift className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <p className="text-lg font-semibold">3</p>
                <p className="text-xs text-muted-foreground">Rewards Used</p>
              </div>
            </div>

            {/* Next Reward Progress */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Next Reward: Flight Upgrade</span>
                <span className="text-sm text-muted-foreground">25,000 miles</span>
              </div>
              <Progress value={(currentMiles / 25000) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {(25000 - currentMiles).toLocaleString()} miles to go • Earn with your next booking!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="earn" className="space-y-3 mt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Earn miles on every purchase across the ZIVO ecosystem
            </p>
            {EARN_RATES.map((rate, i) => (
              <motion.div
                key={rate.category}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className={cn("w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center", rate.color)}>
                  <rate.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{rate.category}</h4>
                  <p className="text-sm text-muted-foreground">{rate.rate}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {rate.multiplier}
                </Badge>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="redeem" className="space-y-3 mt-0">
            <div className="grid gap-3">
              {REDEMPTION_OPTIONS.map((option, i) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:border-primary/50",
                    currentMiles >= option.milesRequired 
                      ? "bg-muted/30 border-border/50" 
                      : "bg-muted/10 border-border/30 opacity-60"
                  )}
                >
                  {option.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white">
                      Popular
                    </Badge>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <option.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{option.title}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-400">{option.milesRequired.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">≈ {option.value}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-2 mt-0">
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30"
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  tx.type === 'earn' ? "bg-emerald-500/20" : "bg-rose-500/20"
                )}>
                  <tx.icon className={cn(
                    "w-5 h-5",
                    tx.type === 'earn' ? "text-emerald-400" : "text-rose-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <span className={cn(
                  "font-semibold",
                  tx.type === 'earn' ? "text-emerald-400" : "text-rose-400"
                )}>
                  {tx.type === 'earn' ? '+' : ''}{tx.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
            <Button variant="ghost" className="w-full mt-2">
              <History className="w-4 h-4 mr-2" />
              View All Transactions
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ZivoMilesProgram;
