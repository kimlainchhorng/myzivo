/**
 * ZIVO Eats — Restaurant Listing Page
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, MapPin, Clock, Star, Search, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useRestaurants } from "@/hooks/useEatsOrders";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { RestaurantAvailabilityBadge } from "@/components/eats/RestaurantAvailabilityBadge";
import { getRestaurantAvailability } from "@/hooks/useRestaurantAvailability";

function EatsRestaurantsContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const { data: restaurants, isLoading } = useRestaurants();
  const { deliveryAddress, setDeliveryAddress, getItemCount } = useCart();

  // Get unique cuisines
  const cuisines = [...new Set(restaurants?.map(r => r.cuisine_type).filter(Boolean))] as string[];

  // Filter restaurants
  const filteredRestaurants = restaurants?.filter(restaurant => {
    const matchesSearch = !searchQuery || 
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !selectedCuisine || restaurant.cuisine_type === selectedCuisine;
    return matchesSearch && matchesCuisine;
  }) || [];

  const cartCount = getItemCount();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Restaurants — ZIVO Eats"
        description="Browse local restaurants and order food delivery with ZIVO Eats."
      />
      
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back + Address Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/eats")} 
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex-1 flex items-center gap-3 max-w-md">
              <MapPin className="w-5 h-5 text-eats shrink-0" />
              <Input
                type="text"
                placeholder="Enter delivery address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="h-10 rounded-xl bg-muted/50 border-border/50"
              />
            </div>

            {cartCount > 0 && (
              <Button
                onClick={() => navigate("/eats/checkout")}
                className="gap-2 bg-gradient-to-r from-eats to-orange-500"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Cart ({cartCount})
              </Button>
            )}
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Browse{" "}
              <span className="bg-gradient-to-r from-eats to-orange-400 bg-clip-text text-transparent">
                Restaurants
              </span>
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : `${filteredRestaurants.length} restaurants available`}
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            {/* Cuisine Filters */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCuisine === null ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-1.5 rounded-full transition-all",
                  selectedCuisine === null && "bg-eats hover:bg-eats/90"
                )}
                onClick={() => setSelectedCuisine(null)}
              >
                All
              </Badge>
              {cuisines.slice(0, 5).map(cuisine => (
                <Badge
                  key={cuisine}
                  variant={selectedCuisine === cuisine ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-full transition-all",
                    selectedCuisine === cuisine && "bg-eats hover:bg-eats/90"
                  )}
                  onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>

          {/* Restaurant Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-eats" />
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-16">
              <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-bold text-xl mb-2">No restaurants found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCuisine(null); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-eats/30 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/eats/restaurant/${restaurant.id}`)}
                >
                  <div className="h-40 bg-gradient-to-br from-eats/20 to-orange-500/10 flex items-center justify-center relative">
                    {restaurant.cover_image_url ? (
                      <img
                        src={restaurant.cover_image_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed className="w-16 h-16 text-eats/30" />
                    )}
                    <div className="absolute top-3 right-3">
                      <RestaurantAvailabilityBadge restaurant={restaurant} size="sm" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                      {restaurant.cuisine_type || "Various cuisines"}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      {restaurant.rating && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{restaurant.rating}</span>
                        </div>
                      )}
                      {(() => {
                        const availability = getRestaurantAvailability(restaurant);
                        const prepTime = availability.adjustedPrepTime || restaurant.avg_prep_time;
                        return prepTime ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{prepTime} min</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <Button
                      className="w-full mt-4 rounded-xl bg-gradient-to-r from-eats to-orange-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/eats/restaurant/${restaurant.id}`);
                      }}
                    >
                      View Menu
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function EatsRestaurants() {
  return (
    <CartProvider>
      <EatsRestaurantsContent />
    </CartProvider>
  );
}
