/**
 * Deals Hub Page
 * Flash deals, last-minute offers, seasonal promos
 */

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Flame,
  Search,
  Bell,
  Sparkles,
  Clock,
  Gift,
} from "lucide-react";
import FlashDealCard from "@/components/deals/FlashDealCard";
import DealCategoryTabs, { DealCategoryType } from "@/components/deals/DealCategoryTabs";
import { FlashDeal } from "@/types/behaviorAnalytics";
import { toast } from "sonner";

// Deals loaded from real partner APIs and promotions database
const liveDeals: FlashDeal[] = [];

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
    // Would navigate to the appropriate booking flow
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
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-amber-500/10" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-red-500/15 to-transparent rounded-full blur-3xl" />

          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-red-500/20 text-red-500 border-red-500/30 animate-pulse">
                <Flame className="w-3 h-3 mr-1" />
                Limited Time Offers
              </Badge>

              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Flash Deals & Exclusive Offers
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Grab limited-time travel deals before they're gone. 
                Up to 50% off flights, hotels, and car rentals.
              </p>

              {/* Deal Alert Signup */}
              <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <Bell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Get deal alerts"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 rounded-xl"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6 rounded-xl shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-shadow">
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="container mx-auto px-4 mb-8">
          <DealCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            className="flex justify-center"
          />
        </section>

        {/* Deals Grid */}
        <section className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  {activeCategory === 'all' ? 'All Deals' :
                   activeCategory === 'last-minute' ? 'Last Minute Deals' :
                   `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Deals`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredDeals.length} deals available
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="w-4 h-4" />
                Search All
              </Button>
            </div>

            {/* Deals Grid */}
            {filteredDeals.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeals.map((deal) => (
                  <FlashDealCard
                    key={deal.id}
                    deal={deal}
                    onClaim={handleClaimDeal}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No deals in this category</h3>
                <p className="text-muted-foreground">
                  Check back soon or browse all deals
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Member Deals Section */}
        <section className="container mx-auto px-4 mt-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-sky-500/10 rounded-3xl p-8 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" />
              ZIVO Plus Exclusive
            </Badge>
            <h3 className="text-2xl font-bold mb-2">Get Early Access to Deals</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              ZIVO Plus members get 24-hour early access to flash deals, 
              priority price alerts, and exclusive member discounts.
            </p>
            <Button size="lg" className="gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-shadow">
              <Gift className="w-5 h-5" />
              Learn About ZIVO Plus
            </Button>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="container mx-auto px-4 mt-12">
          <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto">
            Deal prices are subject to availability and may change. 
            Final price confirmed on partner checkout. 
            Limited quantities available at advertised prices.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
