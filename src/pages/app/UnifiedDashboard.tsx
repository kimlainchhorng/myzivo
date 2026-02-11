/**
 * Unified ZIVO Dashboard
 * Super-App home with access to all services
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plane, Car, UtensilsCrossed, Package, MapPin, Hotel,
  Wallet, Clock, ChevronRight, HelpCircle, User, Settings
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
  { id: "flights", name: "Flights", icon: Plane, color: "bg-blue-500", link: "/flights" },
  { id: "hotels", name: "Hotels", icon: Hotel, color: "bg-teal-500", link: "/hotels" },
  { id: "cars", name: "Cars", icon: Car, color: "bg-orange-500", link: "/cars" },
  { id: "rides", name: "Rides", icon: MapPin, color: "bg-yellow-500", link: "/rides" },
  { id: "eats", name: "Eats", icon: UtensilsCrossed, color: "bg-red-500", link: "/eats" },
  { id: "move", name: "Move", icon: Package, color: "bg-purple-500", link: "/move" },
];

function TripCard({ trip }: { trip: UnifiedTrip }) {
  const meta = getServiceMeta(trip.service);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{trip.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{trip.title}</p>
            <p className="text-sm text-muted-foreground truncate">{trip.subtitle}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {trip.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ${trip.amount.toFixed(2)}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
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
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d")}
              </p>
              <h1 className="text-xl font-bold">Hello, {firstName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/support">
                  <HelpCircle className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Wallet Summary */}
        <Link to="/wallet">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">ZIVO Wallet</p>
                    <p className="text-2xl font-bold">
                      ${walletSummary?.availableCredits?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Total Spent</p>
                  <p className="font-semibold">
                    ${walletSummary?.totalSpent?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Services Grid */}
        <div>
          <h2 className="font-semibold mb-3">Services</h2>
          <div className="grid grid-cols-3 gap-3">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={service.link}>
                  <Card className="hover:shadow-md transition-all hover:scale-[1.02] active:scale-95">
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center`}>
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium">{service.name}</span>
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Active Now
              </h2>
            </div>
            <div className="space-y-2">
              {activeTrips.slice(0, 3).map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-trips">View All</Link>
            </Button>
          </div>
          
          {loadingRecent ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Book a flight, car, or ride to get started!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="font-semibold mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link to="/my-trips">
                <Clock className="w-4 h-4 mr-2" />
                My Trips
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/wallet">
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/support">
                <HelpCircle className="w-4 h-4 mr-2" />
                Support
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/profile/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
