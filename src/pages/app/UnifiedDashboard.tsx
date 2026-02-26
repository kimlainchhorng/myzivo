/**
 * Unified ZIVO Dashboard — Premium 2026
 * Super-App home with access to all services
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plane, Car, UtensilsCrossed, Package, MapPin, Hotel,
  Wallet, Clock, ChevronRight, HelpCircle, User, Settings, Shield, Star,
  CarFront, CarTaxiFront, Building2, CreditCard, type LucideIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentActivity, useActiveTrips, type UnifiedTrip } from "@/hooks/useUnifiedTrips";
import { useWalletSummary, getServiceMeta } from "@/hooks/useZivoWallet";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { format } from "date-fns";

const services = [
  { id: "ride", name: "Ride", icon: Car, gradient: "from-emerald-500 to-green-600", link: "/rides" },
  { id: "eats", name: "Eats", icon: UtensilsCrossed, gradient: "from-orange-500 to-red-500", link: "/eats" },
  { id: "delivery", name: "Delivery", icon: Package, gradient: "from-violet-500 to-purple-600", link: "/delivery" },
  { id: "flights", name: "Flights", icon: Plane, gradient: "from-sky-500 to-blue-600", link: "/flights" },
  { id: "hotels", name: "Hotels", icon: Hotel, gradient: "from-amber-500 to-orange-500", link: "/hotels" },
  { id: "rentals", name: "Rentals", icon: Car, gradient: "from-teal-500 to-cyan-600", link: "/rent-car" },
];

// Map trip.icon string to Lucide icon component
const tripIconMap: Record<string, LucideIcon> = {
  "plane": Plane,
  "car": Car,
  "car-front": CarFront,
  "car-taxi-front": CarTaxiFront,
  "utensils-crossed": UtensilsCrossed,
  "package": Package,
  "building-2": Building2,
  "target": MapPin,
  "credit-card": CreditCard,
};

function TripCard({ trip, index }: { trip: UnifiedTrip; index: number }) {
  const meta = getServiceMeta(trip.service);
  const TripIcon = tripIconMap[trip.icon] || Plane;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-border/40 hover:border-primary/15 group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TripIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{trip.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{trip.subtitle}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="outline" className="text-[9px] font-bold">{trip.status}</Badge>
                <span className="text-[10px] text-muted-foreground font-medium">${trip.amount.toFixed(2)}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const { data: recentActivity, isLoading: loadingRecent } = useRecentActivity();
  const { data: activeTrips } = useActiveTrips();
  const { data: walletSummary } = useWalletSummary();
  const firstName = user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{format(new Date(), "EEEE, MMMM d")}</p>
              <h1 className="text-xl font-bold">Hello, {firstName}</h1>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" asChild className="rounded-xl">
                <Link to="/support"><HelpCircle className="w-5 h-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="rounded-xl">
                <Link to="/profile"><User className="w-5 h-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Wallet */}
        <Link to="/wallet">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-emerald-500 text-primary-foreground p-5 relative overflow-hidden shadow-xl shadow-primary/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs opacity-80">ZIVO Wallet</p>
                  <p className="text-2xl font-bold">${walletSummary?.availableCredits?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-60">Total Spent</p>
                <p className="font-bold">${walletSummary?.totalSpent?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Services Grid */}
        <div>
          <h2 className="font-bold text-sm mb-3">Services</h2>
          <div className="grid grid-cols-3 gap-3">
            {services.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={service.link}>
                  <Card className="hover:shadow-lg transition-all duration-300 active:scale-95 border-border/40 hover:border-primary/15">
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-md`}>
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-bold">{service.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Trips */}
        {activeTrips && activeTrips.length > 0 && (
          <div>
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />Active Now
            </h2>
            <div className="space-y-2">
              {activeTrips.slice(0, 3).map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} />)}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">Recent Activity</h2>
            <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-primary">
              <Link to="/my-trips">View All</Link>
            </Button>
          </div>
          {loadingRecent ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-2xl" />)}
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} />)}
            </div>
          ) : (
            <Card className="border-border/30">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-sm">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">Book a service to get started!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="font-bold text-sm mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: "/my-trips", icon: Clock, label: "My Trips" },
              { to: "/wallet", icon: Wallet, label: "Wallet" },
              { to: "/support", icon: HelpCircle, label: "Support" },
              { to: "/profile/settings", icon: Settings, label: "Settings" },
            ].map((link) => (
              <Button key={link.to} variant="outline" asChild className="justify-start rounded-xl border-border/40 hover:border-primary/15 font-bold">
                <Link to={link.to}>
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
