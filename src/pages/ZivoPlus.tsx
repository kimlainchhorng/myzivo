/**
 * ZIVO Plus - Premium subscription landing page
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Crown,
  Zap,
  Bell,
  Star,
  Shield,
  Headphones,
  Sparkles,
  Check,
  Gift,
  Plane,
  ArrowRight,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";

const benefits = [
  {
    icon: Zap,
    title: "Early Access to Deals",
    description: "Get exclusive flash deals 24 hours before they go public",
    highlight: true,
  },
  {
    icon: Bell,
    title: "Priority Price Alerts",
    description: "Instant notifications when prices drop on your saved routes",
  },
  {
    icon: Star,
    title: "2x ZIVO Miles",
    description: "Earn double miles on every booking you make",
    highlight: true,
  },
  {
    icon: Shield,
    title: "Ad-Free Experience",
    description: "Browse and book without any promotional interruptions",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Priority access to our travel concierge team",
  },
  {
    icon: Percent,
    title: "Member Discounts",
    description: "5% off on select hotels and car rentals",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Frequent Traveler",
    content: "The early access to deals alone has saved me over $500 this year!",
    avatar: "SM",
  },
  {
    name: "James K.",
    role: "Business Traveler",
    content: "Priority support is a game-changer when you need quick rebooking.",
    avatar: "JK",
  },
  {
    name: "Emily R.",
    role: "Family Vacation Planner",
    content: "Double miles add up fast. Already redeemed a free hotel night!",
    avatar: "ER",
  },
];

const ZivoPlus = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const monthlyPrice = 9.99;
  const annualPrice = 79.99;
  const annualSavings = Math.round((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12) * 100);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-400">Premium Membership</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              ZIVO Plus
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Travel smarter with exclusive perks
            </p>
            <p className="text-lg text-amber-400 font-semibold">
              Get exclusive deals, priority support, and more miles on every trip.
            </p>
          </motion.div>
        </section>

        {/* Pricing Toggle */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-md mx-auto">
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
              <CardContent className="p-8">
                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <span className={cn("text-sm font-medium", !isAnnual && "text-foreground", isAnnual && "text-muted-foreground")}>
                    Monthly
                  </span>
                  <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                  <span className={cn("text-sm font-medium flex items-center gap-2", isAnnual && "text-foreground", !isAnnual && "text-muted-foreground")}>
                    Annual
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                      Save {annualSavings}%
                    </Badge>
                  </span>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">
                      ${isAnnual ? annualPrice : monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">
                      /{isAnnual ? "year" : "month"}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-muted-foreground mt-2">
                      That's just ${(annualPrice / 12).toFixed(2)}/month
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2 shadow-[0_0_20px_hsl(38_92%_50%/0.3)] hover:shadow-[0_0_30px_hsl(38_92%_50%/0.4)] transition-shadow">
                  <Crown className="w-5 h-5" />
                  Join ZIVO Plus
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Cancel anytime. No commitment required.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="container mx-auto px-4 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Member Benefits</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "h-full transition-all duration-200 hover:border-amber-500/30 hover:shadow-md hover:-translate-y-1.5",
                  benefit.highlight && "border-amber-500/20 bg-amber-500/5"
                )}>
                  <CardContent className="p-5">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                      benefit.highlight 
                        ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                        : "bg-muted"
                    )}>
                      <benefit.icon className={cn(
                        "w-5 h-5",
                        benefit.highlight ? "text-amber-500" : "text-muted-foreground"
                      )} />
                    </div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
            
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-border">
                  <div className="font-medium">Feature</div>
                  <div className="text-center text-muted-foreground">Free</div>
                  <div className="text-center text-amber-500 font-medium">Plus</div>
                </div>
                
                {[
                  ["Search & Compare", true, true],
                  ["Basic Price Alerts", true, true],
                  ["Early Deal Access", false, true],
                  ["Priority Alerts", false, true],
                  ["2x Miles Earning", false, true],
                  ["Ad-Free Experience", false, true],
                  ["Dedicated Support", false, true],
                  ["Member Discounts", false, true],
                ].map(([feature, free, plus], index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b border-border/50 last:border-0">
                    <div className="text-sm">{feature}</div>
                    <div className="text-center">
                      {free ? (
                        <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="text-center">
                      {plus ? (
                        <Check className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">What Members Say</h2>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-amber-500/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-sm font-bold text-amber-500">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* === WAVE 13: Rich ZivoPlus Content === */}

        {/* Member Savings Calculator */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">How Much Can You Save?</h2>
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-4 text-center">
                  {[
                    { trips: "2 trips/mo", monthly: "$18", yearly: "$216", emoji: "🧳" },
                    { trips: "4 trips/mo", monthly: "$42", yearly: "$504", emoji: "✈️" },
                    { trips: "8+ trips/mo", monthly: "$95", yearly: "$1,140", emoji: "🌍" },
                  ].map(s => (
                    <div key={s.trips} className="p-4 rounded-xl border border-amber-500/20 bg-card/80">
                      <span className="text-2xl">{s.emoji}</span>
                      <p className="text-xs font-bold mt-2">{s.trips}</p>
                      <p className="text-lg font-bold text-amber-500 mt-1">{s.monthly}/mo</p>
                      <p className="text-[10px] text-muted-foreground">{s.yearly}/year saved</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Plus Exclusive Deals */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">This Week's Plus Exclusives</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { deal: "35% off Miami flights", normal: "$289", plus: "$188", tag: "Flights", emoji: "🏖️" },
                { deal: "Free room upgrade — Hilton", normal: "N/A", plus: "Free", tag: "Hotels", emoji: "🏨" },
                { deal: "Extra driver free on rentals", normal: "$15/day", plus: "$0", tag: "Cars", emoji: "🚗" },
                { deal: "3x miles on Tokyo routes", normal: "1x", plus: "3x miles", tag: "Miles", emoji: "🎌" },
              ].map(d => (
                <Card key={d.deal} className="border-amber-500/15 hover:border-amber-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{d.emoji}</span>
                      <span className="text-xs font-bold">{d.deal}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px]">
                        <span className="text-muted-foreground line-through mr-2">{d.normal}</span>
                        <span className="text-amber-500 font-bold">{d.plus}</span>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-500 border-0 text-[8px]">{d.tag}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Plus FAQ */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {[
                { q: "Can I cancel anytime?", a: "Yes. Cancel with one click. No cancellation fees, ever." },
                { q: "Do my miles expire?", a: "No. ZIVO miles never expire as long as your account is active." },
                { q: "Is Plus available worldwide?", a: "Yes. Benefits apply to all bookings globally." },
                { q: "Can I share with family?", a: "Currently per-account. Family plans coming Q3 2025." },
              ].map(f => (
                <Card key={f.q} className="border-border/50 hover:border-amber-500/20 transition-all">
                  <CardContent className="p-4">
                    <p className="text-sm font-bold">{f.q}</p>
                    <p className="text-xs text-muted-foreground mt-1">{f.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <CardContent className="p-8 text-center">
              <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ready to travel smarter?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of members saving more on every trip.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2 shadow-[0_0_20px_hsl(38_92%_50%/0.3)] hover:shadow-[0_0_30px_hsl(38_92%_50%/0.4)] transition-shadow">
                Get ZIVO Plus Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ZivoPlus;
