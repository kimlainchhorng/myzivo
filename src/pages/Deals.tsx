/**
 * Deals Hub Page — Premium 2026
 * Flash deals, last-minute offers, seasonal promos
 */

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Flame,
  Search,
  Bell,
  Sparkles,
  Clock,
  Gift,
  Plane,
  BedDouble,
  Car,
  Timer,
  ArrowRight,
  Crown,
  Zap,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

type DealCategoryType = 'all' | 'flights' | 'hotels' | 'cars' | 'last-minute';

interface FlashDeal {
  id: string;
  title: string;
  category: string;
  expiresAt: string;
}

const liveDeals: FlashDeal[] = [];

const categoryConfig: Record<DealCategoryType, { label: string; icon: typeof Plane; color: string }> = {
  all: { label: "All Deals", icon: Sparkles, color: "text-primary" },
  flights: { label: "Flights", icon: Plane, color: "text-sky-500" },
  hotels: { label: "Hotels", icon: BedDouble, color: "text-amber-500" },
  cars: { label: "Cars", icon: Car, color: "text-emerald-500" },
  "last-minute": { label: "Last Min", icon: Timer, color: "text-destructive" },
};

export default function Deals() {
  const [activeCategory, setActiveCategory] = useState<DealCategoryType>('all');
  const [email, setEmail] = useState("");

  const filteredDeals = activeCategory === 'all' 
    ? liveDeals 
    : activeCategory === 'last-minute'
      ? liveDeals.filter(d => new Date(d.expiresAt).getTime() - Date.now() < 4 * 60 * 60 * 1000)
      : liveDeals.filter(d => d.category === activeCategory);

  const handleClaimDeal = (deal: FlashDeal) => {
    toast.success(`Opening ${deal.title} deal...`);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("You'll be notified of new deals!");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Deals & Flash Sales – ZIVO"
        description="Discover limited-time travel deals on flights, hotels, and car rentals. Flash sales with up to 50% off."
        canonical="https://hizivo.com/deals"
      />
      <Header />

      <main className="pt-24 pb-20">
        {/* Hero Section — Premium */}
        <section className="relative overflow-hidden pb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/8 via-orange-500/5 to-amber-500/8" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-destructive/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-amber-500/8 to-transparent rounded-full blur-3xl" />

          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20 font-bold text-xs">
                  <Flame className="w-3 h-3 mr-1" />
                  Limited Time Offers
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.05 }}
                className="font-display text-4xl md:text-5xl font-bold mb-4"
              >
                Flash Deals & Exclusive Offers
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground mb-8"
              >
                Grab limited-time travel deals before they're gone. 
                Up to 50% off flights, hotels, and car rentals.
              </motion.p>

              {/* Deal Alert Signup */}
              <motion.form 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.15 }}
                onSubmit={handleSubscribe} 
                className="flex gap-3 max-w-md mx-auto"
              >
                <div className="flex-1 relative">
                  <Bell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Get deal alerts"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-13 rounded-2xl bg-card border-border/40 font-medium"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-13 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-primary-foreground active:scale-[0.98] transition-all"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me
                </Button>
              </motion.form>
            </div>
          </div>
        </section>

        {/* Category Tabs — Premium Chips */}
        <section className="container mx-auto px-4 mb-8">
          <div className="flex justify-center gap-2 flex-wrap">
            {(Object.entries(categoryConfig) as [DealCategoryType, typeof categoryConfig.all][]).map(([key, config]) => {
              const isActive = activeCategory === key;
              return (
                <Button 
                  key={key} 
                  variant={isActive ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setActiveCategory(key)} 
                  className={`rounded-2xl gap-1.5 font-bold text-xs h-10 px-5 transition-all duration-200 ${
                    isActive 
                      ? "shadow-md shadow-primary/20" 
                      : "border-border/40 hover:border-primary/20"
                  }`}
                >
                  <config.icon className={`w-3.5 h-3.5 ${!isActive ? config.color : ''}`} />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </section>

        {/* Deals Grid */}
        <section className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{categoryConfig[activeCategory].label}</h2>
                <p className="text-sm text-muted-foreground">{filteredDeals.length} deals available</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/40 font-bold">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>

            {filteredDeals.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDeals.map((deal, i) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-sm mb-2">{deal.title}</h3>
                        <p className="text-xs text-muted-foreground mb-4">{deal.title}</p>
                        <Button 
                          size="sm" 
                          onClick={() => handleClaimDeal(deal)}
                          className="rounded-xl font-bold gap-1 shadow-sm"
                        >
                          Claim Deal <ArrowRight className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border/30">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">No deals in this category</h3>
                    <p className="text-sm text-muted-foreground">Check back soon or browse all deals</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        {/* Member Deals Section — Premium */}
        <section className="container mx-auto px-4 mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-primary/8 border border-primary/15 p-8 md:p-10 text-center relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/8 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                <Crown className="w-3 h-3 mr-1" />
                ZIVO Plus Exclusive
              </Badge>
              <h3 className="text-2xl font-bold mb-2">Get Early Access to Deals</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm">
                ZIVO Plus members get 24-hour early access to flash deals, 
                priority price alerts, and exclusive member discounts.
              </p>
              <Button 
                size="lg" 
                className="gap-2 rounded-2xl font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-primary-foreground active:scale-[0.98] transition-all h-13 px-8"
              >
                <Gift className="w-5 h-5" />
                Learn About ZIVO Plus
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Disclaimer */}
        <section className="container mx-auto px-4 mt-12">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />
            <p className="text-center max-w-2xl">
              Deal prices are subject to availability and may change. 
              Final price confirmed on partner checkout. 
              Limited quantities available at advertised prices.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
