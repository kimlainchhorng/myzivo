/**
 * ZIVO Eats — Restaurant Menu Page
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  UtensilsCrossed, MapPin, Clock, Star, Phone, ArrowLeft, 
  Plus, Minus, ShoppingCart, Loader2, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useRestaurant, useMenuItems, type MenuItem } from "@/hooks/useEatsOrders";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRestaurantAvailability } from "@/hooks/useRestaurantAvailability";
import { RestaurantAvailabilityBadge } from "@/components/eats/RestaurantAvailabilityBadge";
import { BusyRestaurantBanner } from "@/components/eats/BusyRestaurantBanner";
import { UnavailableBanner } from "@/components/eats/UnavailableBanner";
import { ItemAvailabilityBadge } from "@/components/eats/ItemAvailabilityBadge";
import { HighVolumeBanner } from "@/components/eats/HighVolumeBanner";
import { useRestaurantQueueLength } from "@/hooks/useRestaurantQueueLength";

function MenuItemCard({ item, restaurantId, restaurantName, canOrder = true }: { 
  item: MenuItem; 
  restaurantId: string;
  restaurantName: string;
  canOrder?: boolean;
}) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const cartItem = items.find(i => i.id === item.id);
  const quantity = cartItem?.quantity || 0;
  
  // Check if item is available (respect both item availability and restaurant availability)
  const isItemAvailable = item.is_available !== false;
  const canAdd = canOrder && isItemAvailable;

  const handleAdd = () => {
    if (!canAdd) return;
    addItem({
      id: item.id,
      restaurantId,
      restaurantName,
      name: item.name,
      price: item.price,
      imageUrl: item.image_url || undefined,
    });
    setAdded(true);
    toast.success(`${item.name} added to cart`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 border-2 border-transparent",
      canAdd ? "hover:shadow-lg hover:border-eats/30" : "opacity-60"
    )}>
      <div className="flex">
        {/* Image */}
        <div className="w-28 sm:w-36 h-28 sm:h-36 bg-gradient-to-br from-eats/10 to-orange-500/5 flex items-center justify-center shrink-0 relative">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className={cn("w-full h-full object-cover", !isItemAvailable && "grayscale")}
            />
          ) : (
            <UtensilsCrossed className="w-8 h-8 text-eats/30" />
          )}
          {/* Out of Stock Badge overlay */}
          {!isItemAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <ItemAvailabilityBadge isAvailable={false} size="sm" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn("font-bold text-base line-clamp-1", !isItemAvailable && "text-muted-foreground")}>{item.name}</h3>
              {item.is_featured && isItemAvailable && (
                <Badge className="bg-eats/10 text-eats text-[10px] shrink-0">Popular</Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className={cn("font-bold text-lg", !isItemAvailable && "text-muted-foreground")}>${item.price.toFixed(2)}</span>
            {!canAdd ? (
              <Button
                size="sm"
                disabled
                className="h-8 px-4 rounded-lg gap-1 opacity-50 cursor-not-allowed"
              >
                {!isItemAvailable ? "Out of Stock" : "Unavailable"}
              </Button>
            ) : quantity > 0 ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-eats text-white">{quantity} in cart</Badge>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  className="h-8 px-3 rounded-lg bg-gradient-to-r from-eats to-orange-500"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleAdd}
                className={cn(
                  "h-8 px-4 rounded-lg gap-1 transition-all",
                  added 
                    ? "bg-emerald-500 hover:bg-emerald-500" 
                    : "bg-gradient-to-r from-eats to-orange-500"
                )}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function CartDrawer() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCart();
  const subtotal = getSubtotal();
  const deliveryFee = 3.99;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="flex-1">
              <p className="font-medium text-sm line-clamp-1">{item.name}</p>
              <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 rounded-full"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-6 text-center font-medium">{item.quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 rounded-full"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button
          onClick={() => navigate("/eats/checkout")}
          className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-eats to-orange-500"
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}

function EatsRestaurantMenuContent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(id);
  const { data: menuItems, isLoading: menuLoading } = useMenuItems(id);
  const { getItemCount, getSubtotal } = useCart();
  
  // Get availability status
  const availability = useRestaurantAvailability(restaurant);
  
  // Get queue length for high volume banner
  const queue = useRestaurantQueueLength(id, restaurant?.avg_prep_time || 20);

  const isLoading = restaurantLoading || menuLoading;
  const cartCount = getItemCount();
  const subtotal = getSubtotal();

  // Group menu items by category
  const categories = menuItems?.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-eats" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h1 className="font-bold text-2xl mb-2">Restaurant not found</h1>
            <Button onClick={() => navigate("/eats/restaurants")} variant="outline">
              Browse Restaurants
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${restaurant.name} — ZIVO Eats`}
        description={restaurant.description || `Order from ${restaurant.name} on ZIVO Eats`}
      />
      
      <Header />
      
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/eats/restaurants")} 
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Restaurants
          </Button>

          {/* Restaurant Header */}
          <div className="mb-8">
            <div className="h-48 sm:h-64 rounded-2xl bg-gradient-to-br from-eats/20 to-orange-500/10 flex items-center justify-center overflow-hidden mb-6">
              {restaurant.cover_image_url ? (
                <img
                  src={restaurant.cover_image_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UtensilsCrossed className="w-20 h-20 text-eats/30" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                  {restaurant.name}
                </h1>
                <p className="text-muted-foreground mb-3">
                  {restaurant.cuisine_type || "Various cuisines"} • {restaurant.address || "Local restaurant"}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  {restaurant.rating && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                  )}
                  {(availability.adjustedPrepTime || restaurant.avg_prep_time) && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{availability.adjustedPrepTime || restaurant.avg_prep_time} min prep</span>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <RestaurantAvailabilityBadge restaurant={restaurant} className="self-start" />
            </div>
            
            {/* Availability Banners */}
            {availability.status === "busy" && (
              <BusyRestaurantBanner
                adjustedPrepTime={availability.adjustedPrepTime}
                bonusMinutes={availability.prepTimeBonus}
                className="mt-4"
              />
            )}
            {availability.status === "unavailable" && (
              <UnavailableBanner
                message={availability.detailMessage}
                className="mt-4"
              />
            )}
            
            {/* High Volume Banner - shows when queue is high but not in busy mode */}
            {availability.status !== "busy" && queue.isHighVolume && (
              <HighVolumeBanner
                queueLength={queue.queueLength}
                estimatedWait={queue.queueWaitMinutes}
                isVeryHigh={queue.isVeryHighVolume}
                className="mt-4"
              />
            )}
          </div>

          {/* Menu */}
          <div className="space-y-8">
            {Object.entries(categories).map(([category, items]) => (
              <div key={category}>
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-eats to-orange-500 rounded-full" />
                  {category}
                </h2>
                <div className="grid gap-4">
                  {items.map(item => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      restaurantId={restaurant.id}
                      restaurantName={restaurant.name}
                      canOrder={availability.canOrder}
                    />
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(categories).length === 0 && (
              <div className="text-center py-12">
                <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No menu items available</p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className="h-14 px-6 rounded-2xl font-bold gap-3 bg-gradient-to-r from-eats to-orange-500 shadow-2xl shadow-eats/40"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>View Cart ({cartCount})</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-eats" />
                    Your Cart
                  </SheetTitle>
                </SheetHeader>
                <CartDrawer />
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function EatsRestaurantMenu() {
  return (
    <CartProvider>
      <EatsRestaurantMenuContent />
    </CartProvider>
  );
}
