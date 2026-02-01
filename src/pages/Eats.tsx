/**
 * ZIVO Eats — Food Ordering Landing Page
 * 
 * MVP: Browse restaurants and submit food order requests.
 * No payment processing — orders are handled manually.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, MapPin, Clock, Truck, Star, ArrowRight, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import UserTestimonials from "@/components/shared/UserTestimonials";
import CuisinePhotoGrid from "@/components/shared/CuisinePhotoGrid";
import { useRestaurants } from "@/hooks/useEatsOrders";
import { cn } from "@/lib/utils";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { heroPhotos, serviceOverlays } from "@/config/photos";
import { getRestaurantPhoto } from "@/config/restaurantPhotos";

function EatsContent() {
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const { data: restaurants, isLoading } = useRestaurants();
  const { setDeliveryAddress: saveAddress } = useCart();

  const handleFindRestaurants = () => {
    if (deliveryAddress.trim()) {
      saveAddress(deliveryAddress.trim());
      navigate("/eats/restaurants");
    }
  };

  const popularRestaurants = restaurants?.slice(0, 4) || [];
  const heroImage = heroPhotos.eats;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ZIVO Eats — Order Food Delivery"
        description="Discover and order from local restaurants. ZIVO Eats connects you with the best food in your area."
      />
      
      <Header />
      
      <main className="pt-16">
        {/* Hero Section with Photo Background */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            {/* Gradient Overlay */}
            <div className={cn("absolute inset-0 bg-gradient-to-b", serviceOverlays.eats)} />
            {/* Additional depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-semibold mb-6 text-white">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Food Delivery
              </div>

              {/* Icon */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-eats to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-eats/30">
                <UtensilsCrossed className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
                ZIVO{" "}
                <span className="bg-gradient-to-r from-eats to-orange-400 bg-clip-text text-transparent">
                  Eats
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto">
                Discover delicious food from local restaurants. Order now and we'll connect you with the best eats in your area.
              </p>

              {/* Address Input */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eats" />
                  <Input
                    type="text"
                    placeholder="Enter your delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="pl-12 h-14 text-base rounded-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-eats/50"
                    onKeyDown={(e) => e.key === "Enter" && handleFindRestaurants()}
                  />
                </div>
                <Button
                  onClick={handleFindRestaurants}
                  size="lg"
                  className="h-14 px-8 rounded-2xl font-bold gap-2 bg-gradient-to-r from-eats to-orange-500 shadow-lg shadow-eats/30 hover:shadow-eats/50"
                >
                  <Search className="w-5 h-5" />
                  Find Restaurants
                </Button>
              </div>

              <p className="text-sm text-white/60">
                Or{" "}
                <button
                  onClick={() => navigate("/eats/restaurants")}
                  className="text-eats hover:underline font-medium"
                >
                  browse all restaurants
                </button>
              </p>
            </div>
          </div>
        </section>

        {/* Cuisine Photo Grid */}
        <CuisinePhotoGrid
          title="Explore by Cuisine"
          subtitle="Find your favorite food"
        />

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
              How{" "}
              <span className="bg-gradient-to-r from-eats to-orange-400 bg-clip-text text-transparent">
                It Works
              </span>
            </h2>

            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  step: 1,
                  icon: Search,
                  title: "Browse Restaurants",
                  description: "Explore local restaurants and their menus",
                  image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=75&fm=webp",
                },
                {
                  step: 2,
                  icon: UtensilsCrossed,
                  title: "Select Your Food",
                  description: "Add your favorite items to your cart",
                  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&q=75&fm=webp",
                },
                {
                  step: 3,
                  icon: Truck,
                  title: "Submit Your Order",
                  description: "We'll confirm and arrange delivery",
                  image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&h=300&fit=crop&q=75&fm=webp",
                },
              ].map((item, index) => (
                <Card
                  key={item.step}
                  className="overflow-hidden border-2 border-transparent hover:border-eats/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Step Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-eats to-orange-500 flex items-center justify-center shadow-lg">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-5 text-center">
                    <div className="text-xs text-eats font-bold mb-2">STEP {item.step}</div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Restaurants Preview */}
        {popularRestaurants.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  Popular{" "}
                  <span className="bg-gradient-to-r from-eats to-orange-400 bg-clip-text text-transparent">
                    Restaurants
                  </span>
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/eats/restaurants")}
                  className="gap-2 text-eats hover:text-eats"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularRestaurants.map((restaurant, index) => {
                  const photo = getRestaurantPhoto(restaurant.id);
                  return (
                    <Card
                      key={restaurant.id}
                      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-eats/30 animate-in fade-in slide-in-from-bottom-4 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => navigate(`/eats/restaurant/${restaurant.id}`)}
                    >
                      <div className="h-32 relative overflow-hidden">
                        <img
                          src={restaurant.cover_image_url || photo.src}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {restaurant.cuisine_type || "Various cuisines"}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          {restaurant.rating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium">{restaurant.rating}</span>
                            </div>
                          )}
                          {restaurant.avg_prep_time && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{restaurant.avg_prep_time} min</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        <UserTestimonials />

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-eats/10 to-orange-500/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              Ready to Order?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse our selection of restaurants and find your next favorite meal.
            </p>
            <Button
              onClick={() => navigate("/eats/restaurants")}
              size="lg"
              className="rounded-2xl font-bold gap-2 bg-gradient-to-r from-eats to-orange-500 shadow-lg shadow-eats/30"
            >
              Browse Restaurants
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function Eats() {
  return (
    <CartProvider>
      <EatsContent />
    </CartProvider>
  );
}
