/**
 * ZIVO Eats — Responsive Landing Page
 * Desktop: Premium marketing landing + Mobile: Curated dining
 */
import { lazy, Suspense } from "react";
import { ArrowRight, UtensilsCrossed, Clock, Star, MapPin, CheckCircle, Truck, Loader2, Flame, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import heroEats from "@/assets/hero-eats.jpg";
import serviceEats from "@/assets/service-eats.jpg";
import { MobilityFeaturesGrid, MobilityComplianceFooter } from "@/components/mobility";
import { useIsMobile } from "@/hooks/use-mobile";
import { CartProvider } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

const MobileEatsPremium = lazy(() => import("@/components/eats/MobileEatsPremium"));

const FadeIn = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const features = [
  { icon: UtensilsCrossed, title: "Local Restaurants", description: "Discover food from restaurants in your area" },
  { icon: Clock, title: "Fast Delivery", description: "Get your food delivered quickly" },
  { icon: Star, title: "Top-Rated", description: "Order from highly-rated restaurants" },
  { icon: Truck, title: "Real-Time Tracking", description: "Track your order from restaurant to door" },
];

const benefits = ["Wide restaurant selection", "Real-time order tracking", "Easy payment options", "Quality food delivery", "Special offers & deals", "Reliable couriers"];

const cuisineTypes = [
  { name: "American", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=75&fm=webp" },
  { name: "Italian", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=75&fm=webp" },
  { name: "Asian", image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop&q=75&fm=webp" },
  { name: "Mexican", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&q=75&fm=webp" },
];

const howItWorks = [
  { step: 1, title: "Browse Restaurants", description: "Explore local restaurants and their menus", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=75&fm=webp" },
  { step: 2, title: "Place Your Order", description: "Add your favorite items to your cart", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&q=75&fm=webp" },
  { step: 3, title: "Enjoy Your Meal", description: "Track delivery and enjoy your food", image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&h=300&fit=crop&q=75&fm=webp" },
];

const eatsStats = [
  { icon: UtensilsCrossed, value: "5,000+", label: "Restaurants", borderColor: "border-t-[hsl(var(--eats))]", iconBg: "bg-[hsl(var(--eats-light))]", iconColor: "text-[hsl(var(--eats))]" },
  { icon: Users, value: "1M+", label: "Orders Delivered", borderColor: "border-t-primary", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { icon: Zap, value: "25 min", label: "Avg Delivery", borderColor: "border-t-amber-500", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
  { icon: Star, value: "4.9", label: "App Rating", borderColor: "border-t-emerald-500", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
];

export default function Eats() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <CartProvider>
        <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
          <MobileEatsPremium />
        </Suspense>
      </CartProvider>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="ZIVO Eats — Food Delivery" description="Order food from local restaurants with ZIVO Eats. Fast delivery, wide selection, and real-time tracking." />
      <Header />

      <main className="pt-16">
        {/* Live Order Counter */}
        <div className="bg-eats/5 border-b border-eats/10 py-2">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-eats font-medium"><Flame className="w-4 h-4 inline mr-1" /> <span className="font-bold">1,247</span> orders placed today</p>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center">
          <div className="absolute inset-0">
            <img src={heroEats} alt="ZIVO Eats - Food delivery" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          </div>
          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="max-w-2xl">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eats/10 border border-eats/20 mb-6">
                <UtensilsCrossed className="w-4 h-4 text-eats" />
                <span className="text-sm font-medium text-eats">ZIVO Eats</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Food Delivered.<br /><span className="text-eats">Fast.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-muted-foreground mb-8 max-w-lg">
                Discover local restaurants and get your favorite meals delivered straight to your door. Quick, easy, and delicious.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Button onClick={() => navigate("/eats/restaurants")} size="lg" className="h-14 px-8 text-lg rounded-2xl font-bold gap-3 bg-eats hover:bg-eats/90 shadow-lg hover:scale-[1.03] transition-all duration-200">
                  Browse Restaurants <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-sm text-muted-foreground">Order from local restaurants with fast delivery</motion.p>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-10 border-y border-border/30">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-medium text-muted-foreground mb-6">Delivering happiness every day</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {eatsStats.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="text-center">
                  <div className={`p-6 card-premium border-t-[3px] ${stat.borderColor}`}>
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <FadeIn>
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Why Choose <span className="text-eats">ZIVO Eats</span></h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Great food delivered to your door</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {features.map((feature, i) => (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <Card className="border-2 hover:border-eats/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg glow-border-hover h-full">
                      <CardContent className="p-6 text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-eats/10 flex items-center justify-center mb-4 float-gentle" style={{ animationDelay: `${i * 200}ms` }}>
                          <feature.icon className="w-7 h-7 text-eats" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Cuisine Types */}
        <FadeIn>
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Explore <span className="text-eats">Cuisines</span></h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">From comfort food to international flavors</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {cuisineTypes.map((cuisine, i) => (
                  <motion.div key={cuisine.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <Card className="overflow-hidden border-2 hover:border-eats/30 transition-all duration-300 group cursor-pointer glow-border-hover" onClick={() => navigate("/eats/restaurants")}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={cuisine.image} alt={cuisine.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {/* Eats brand overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-eats/20 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                          <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">Explore →</span>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-bold text-xl">{cuisine.name}</h3>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Service Image + Benefits */}
        <FadeIn>
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                  <img src={serviceEats} alt="ZIVO Eats food delivery" className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-6">Delivery Made <span className="text-eats">Delicious</span></h2>
                  <p className="text-muted-foreground mb-8">Craving your favorite meal? ZIVO Eats connects you with local restaurants and delivers fresh food right to your door.</p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-eats/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-eats" /></div>
                        <span className="text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => navigate("/eats/restaurants")} size="lg" className="rounded-2xl font-bold gap-2 bg-eats hover:bg-eats/90 hover:scale-[1.03] transition-all duration-200">
                    Order Now <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* How It Works */}
        <FadeIn>
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">How It <span className="text-eats">Works</span></h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Ordering food is easy</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {howItWorks.map((item, i) => (
                  <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }} className="group">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-border shadow-lg">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute inset-0 bg-eats/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-eats flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-eats/30">{item.step}</div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        <FadeIn><MobilityFeaturesGrid className="bg-muted/20" showDriverCTA={true} /></FadeIn>

        {/* CTA Section */}
        <FadeIn>
          <section className="py-20 bg-eats/5">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-2xl mx-auto">
                <UtensilsCrossed className="w-16 h-16 text-eats mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Hungry?</h2>
                <p className="text-muted-foreground mb-8">Browse restaurants and order food. Fast delivery, great selection.</p>
                <Button onClick={() => navigate("/eats/restaurants")} size="lg" className="h-14 px-10 text-lg rounded-2xl font-bold gap-3 bg-eats hover:bg-eats/90 shadow-lg hover:scale-[1.03] transition-all duration-200">
                  Browse Restaurants <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </section>
        </FadeIn>

        <MobilityComplianceFooter />
      </main>
      <Footer />
    </div>
  );
}
