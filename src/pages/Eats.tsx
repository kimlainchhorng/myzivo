/**
 * ZIVO Eats — Responsive Landing Page
 * 
 * Desktop: Marketing landing page
 * Mobile: Premium "Curated Dining" visual experience with real data
 */
import { lazy, Suspense } from "react";
import { ArrowRight, UtensilsCrossed, Clock, Star, MapPin, CheckCircle, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import heroEats from "@/assets/hero-eats.jpg";
import serviceEats from "@/assets/service-eats.jpg";
import { MobilityFeaturesGrid, MobilityComplianceFooter } from "@/components/mobility";
import { useIsMobile } from "@/hooks/use-mobile";
import { CartProvider } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

// Lazy load mobile premium component
const MobileEatsPremium = lazy(() => import("@/components/eats/MobileEatsPremium"));

const features = [
  {
    icon: UtensilsCrossed,
    title: "Local Restaurants",
    description: "Discover food from restaurants in your area",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Get your food delivered quickly",
  },
  {
    icon: Star,
    title: "Top-Rated",
    description: "Order from highly-rated restaurants",
  },
  {
    icon: Truck,
    title: "Real-Time Tracking",
    description: "Track your order from restaurant to door",
  },
];

const benefits = [
  "Wide restaurant selection",
  "Real-time order tracking",
  "Easy payment options",
  "Quality food delivery",
  "Special offers & deals",
  "Reliable couriers",
];

const cuisineTypes = [
  {
    name: "American",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    name: "Italian",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    name: "Asian",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    name: "Mexican",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&q=75&fm=webp",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Browse Restaurants",
    description: "Explore local restaurants and their menus",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    step: 2,
    title: "Place Your Order",
    description: "Add your favorite items to your cart",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    step: 3,
    title: "Enjoy Your Meal",
    description: "Track delivery and enjoy your food",
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&h=300&fit=crop&q=75&fm=webp",
  },
];

export default function Eats() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Mobile: Premium visual experience with real data
  if (isMobile) {
    return (
      <CartProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        }>
          <MobileEatsPremium />
        </Suspense>
      </CartProvider>
    );
  }

  // Desktop: Marketing landing page
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="ZIVO Eats — Food Delivery"
        description="Order food from local restaurants with ZIVO Eats. Fast delivery, wide selection, and real-time tracking."
      />

      <Header />

      <main className="pt-16">
        {/* Live Order Counter */}
        <div className="bg-eats/5 border-b border-eats/10 py-2">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-eats font-medium">
              🔥 <span className="font-bold">1,247</span> orders placed today
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroEats}
              alt="ZIVO Eats - Food delivery"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eats/10 border border-eats/20 mb-6">
                <UtensilsCrossed className="w-4 h-4 text-eats" />
                <span className="text-sm font-medium text-eats">ZIVO Eats</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Food Delivered.
                <br />
                <span className="text-eats">Fast.</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Discover local restaurants and get your favorite meals delivered 
                straight to your door. Quick, easy, and delicious.
              </p>

              {/* CTA Button */}
              <Button
                onClick={() => navigate("/eats/restaurants")}
                size="lg"
                className="h-14 px-8 text-lg rounded-2xl font-bold gap-3 bg-eats hover:bg-eats/90 shadow-lg"
              >
                Browse Restaurants
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="mt-4 text-sm text-muted-foreground">
                Order from local restaurants with fast delivery
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Choose <span className="text-eats">ZIVO Eats</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Great food delivered to your door
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature) => (
                <Card 
                  key={feature.title}
                  className="border-2 hover:border-eats/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-eats/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-eats" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cuisine Types */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Explore <span className="text-eats">Cuisines</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From comfort food to international flavors
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {cuisineTypes.map((cuisine) => (
                <Card 
                  key={cuisine.name}
                  className="overflow-hidden border-2 hover:border-eats/30 transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate("/eats/restaurants")}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cuisine.image}
                      alt={cuisine.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-xl">{cuisine.name}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Image + Benefits */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={serviceEats}
                  alt="ZIVO Eats food delivery"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>

              {/* Benefits */}
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Delivery Made <span className="text-eats">Delicious</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Craving your favorite meal? ZIVO Eats connects you with 
                  local restaurants and delivers fresh food right to your door. 
                  Fast, reliable, and always delicious.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-eats/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-eats" />
                      </div>
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate("/eats/restaurants")}
                  size="lg"
                  className="rounded-2xl font-bold gap-2 bg-eats hover:bg-eats/90"
                >
                  Order Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                How It <span className="text-eats">Works</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ordering food is easy
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorks.map((item) => (
                <div key={item.step} className="group">
                  {/* Step Photo */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-border shadow-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-eats flex items-center justify-center text-white font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobility Services Grid */}
        <MobilityFeaturesGrid className="bg-muted/20" showDriverCTA={true} />

        {/* CTA Section */}
        <section className="py-20 bg-eats/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <UtensilsCrossed className="w-16 h-16 text-eats mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Hungry?
              </h2>
              <p className="text-muted-foreground mb-8">
                Browse restaurants and order food. 
                Fast delivery, great selection.
              </p>
              <Button
                onClick={() => navigate("/eats/restaurants")}
                size="lg"
                className="h-14 px-10 text-lg rounded-2xl font-bold gap-3 bg-eats hover:bg-eats/90 shadow-lg"
              >
                Browse Restaurants
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Compliance Footer */}
        <MobilityComplianceFooter />
      </main>

      <Footer />
    </div>
  );
}
