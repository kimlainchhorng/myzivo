/**
 * App Eats Screen
 * MVP flow with pricing engine: Restaurants -> Menu -> Cart -> Checkout -> Success
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  UtensilsCrossed, Search, MapPin, Star, Clock, Plus, Minus, 
  ShoppingBag, ChevronRight, ChevronLeft, CheckCircle2, User, Phone, Mail, X, CreditCard, Loader2
} from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEatsZones } from "@/hooks/useZonePricing";
import { calculateEatsFare, formatCurrency, DEFAULT_EATS_ZONE, EatsPriceBreakdown as BreakdownType } from "@/lib/pricing";
import { EatsPriceBreakdown } from "@/components/pricing/EatsPriceBreakdown";

type EatsStep = "restaurants" | "menu" | "cart" | "checkout" | "processing" | "submitted";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Demo restaurants
const restaurants = [
  { id: "1", name: "Burger Joint", cuisine: "American", rating: 4.8, eta: "15-25", image: "🍔" },
  { id: "2", name: "Sakura Sushi", cuisine: "Japanese", rating: 4.9, eta: "25-35", image: "🍣" },
  { id: "3", name: "Pizza Palace", cuisine: "Italian", rating: 4.7, eta: "20-30", image: "🍕" },
  { id: "4", name: "Taco Fiesta", cuisine: "Mexican", rating: 4.6, eta: "15-20", image: "🌮" },
  { id: "5", name: "Thai Spice", cuisine: "Thai", rating: 4.8, eta: "25-35", image: "🍜" },
  { id: "6", name: "Garden Fresh", cuisine: "Healthy", rating: 4.5, eta: "20-30", image: "🥗" },
];

// Demo menu items
const menuCategories = [
  {
    name: "Popular",
    items: [
      { id: "p1", name: "Classic Burger", price: 12.99, description: "Beef patty, lettuce, tomato, cheese" },
      { id: "p2", name: "Chicken Wings", price: 10.99, description: "6 pieces with choice of sauce" },
    ]
  },
  {
    name: "Main Dishes",
    items: [
      { id: "m1", name: "Double Cheeseburger", price: 15.99, description: "Two patties, extra cheese" },
      { id: "m2", name: "Veggie Burger", price: 11.99, description: "Plant-based patty" },
      { id: "m3", name: "Fish & Chips", price: 14.99, description: "Crispy fish with fries" },
    ]
  },
  {
    name: "Sides",
    items: [
      { id: "s1", name: "French Fries", price: 4.99, description: "Crispy golden fries" },
      { id: "s2", name: "Onion Rings", price: 5.99, description: "Beer-battered rings" },
    ]
  },
];

const AppEats = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<EatsStep>("restaurants");
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof restaurants[0] | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [address, setAddress] = useState("");
  const [selectedZone, setSelectedZone] = useState("DEFAULT");
  const [tipAmount, setTipAmount] = useState(3);
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Fetch zones from database
  const { data: zones } = useEatsZones();

  // Check for success return from Stripe
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderIdParam = searchParams.get("order_id");
    if (sessionId && orderIdParam) {
      setOrderId(orderIdParam);
      setStep("submitted");
      setCart([]);
    }
    if (searchParams.get("cancelled")) {
      toast.error("Payment was cancelled");
    }
  }, [searchParams]);

  // Get current zone pricing
  const currentZone = useMemo(() => {
    if (!zones) return DEFAULT_EATS_ZONE;
    return zones.find(z => z.zone_code === selectedZone) || DEFAULT_EATS_ZONE;
  }, [zones, selectedZone]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate price breakdown using pricing engine
  const priceBreakdown = useMemo(() => {
    return calculateEatsFare(currentZone, cartTotal, 0, tipAmount);
  }, [currentZone, cartTotal, tipAmount]);

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.phone || !address || !selectedRestaurant) return;
    
    setStep("processing");
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-eats-checkout", {
        body: {
          customer_name: contactInfo.name,
          customer_phone: contactInfo.phone,
          customer_email: contactInfo.email || undefined,
          delivery_address: address,
          restaurant_id: selectedRestaurant.id,
          restaurant_name: selectedRestaurant.name,
          items: cart,
          subtotal: priceBreakdown.subtotal,
          delivery_fee: priceBreakdown.deliveryFee,
          service_fee: priceBreakdown.serviceFee,
          small_order_fee: priceBreakdown.smallOrderFee,
          tax: priceBreakdown.tax,
          tip: priceBreakdown.tip,
          total: priceBreakdown.total,
          zone_code: currentZone.zone_code,
          special_instructions: contactInfo.notes || undefined,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to start payment. Please try again.");
      setStep("checkout");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("restaurants");
    setSelectedRestaurant(null);
    setCart([]);
    setContactInfo({ name: "", phone: "", email: "", notes: "" });
    setAddress("");
    setTipAmount(3);
    setOrderId(null);
    navigate("/eats", { replace: true });
  };

  const getTitle = () => {
    if (step === "restaurants") return "Eats";
    if (step === "menu") return selectedRestaurant?.name || "Menu";
    if (step === "cart") return "Your Cart";
    if (step === "checkout") return "Checkout";
    return "Eats";
  };

  const handleBack = () => {
    if (step === "menu") setStep("restaurants");
    else if (step === "cart") setStep("menu");
    else if (step === "checkout") setStep("cart");
    else if (step === "processing") setStep("checkout");
    else if (step === "submitted") handleReset();
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout 
      title={getTitle()}
      showBack={step !== "restaurants"}
      onBack={handleBack}
      headerRightAction={
        cartCount > 0 && step !== "cart" && step !== "checkout" && step !== "submitted" && step !== "processing" ? (
          <button
            onClick={() => setStep("cart")}
            className="relative w-10 h-10 -mr-2 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-eats text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        ) : undefined
      }
    >
      {/* Step: Restaurants */}
      {step === "restaurants" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Address & Zone Input */}
          <div className="p-4 border-b border-border/50 space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eats" />
              <Input
                placeholder="Enter delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-9 h-11 rounded-xl"
              />
            </div>
            {zones && zones.length > 1 && (
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.zone_code} value={zone.zone_code}>
                      {zone.city_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Search */}
          <div className="px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants or cuisines"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-muted/50"
              />
            </div>
          </div>

          {/* Restaurant List */}
          <div className="px-4 space-y-3">
            {filteredRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => {
                  setSelectedRestaurant(restaurant);
                  setStep("menu");
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 text-left touch-manipulation active:scale-[0.99] transition-transform"
              >
                <div className="w-16 h-16 bg-muted/50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {restaurant.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{restaurant.name}</h3>
                  <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-eats text-eats" />
                      <span className="text-[11px] font-bold">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px]">{restaurant.eta} min</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Menu */}
      {step === "menu" && selectedRestaurant && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
          {/* Restaurant Header */}
          <div className="p-4 bg-gradient-to-r from-eats/10 to-orange-500/5 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-3xl">
                {selectedRestaurant.image}
              </div>
              <div>
                <h2 className="font-bold">{selectedRestaurant.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedRestaurant.cuisine} • {selectedRestaurant.eta} min</p>
              </div>
            </div>
          </div>

          {/* Menu Categories */}
          <div className="px-4 space-y-6 pb-24">
            {menuCategories.map((category) => (
              <div key={category.name}>
                <h3 className="font-bold text-lg mb-3">{category.name}</h3>
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const cartItem = cart.find(c => c.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          <p className="text-sm font-bold text-eats mt-1">{formatCurrency(item.price)}</p>
                        </div>
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-manipulation"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-bold">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-eats text-white flex items-center justify-center touch-manipulation"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-10 h-10 rounded-xl bg-eats/10 text-eats flex items-center justify-center touch-manipulation active:scale-95"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Cart Footer */}
          {cartCount > 0 && (
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border/50">
              <Button
                onClick={() => setStep("cart")}
                className="w-full h-12 rounded-xl font-bold gap-2 bg-eats hover:bg-eats/90"
              >
                <ShoppingBag className="w-5 h-5" />
                View Cart ({cartCount}) • {formatCurrency(cartTotal)}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step: Cart */}
      {step === "cart" && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right duration-200">
          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-bold text-lg mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground text-sm mb-4">Add some delicious items!</p>
              <Button variant="outline" onClick={() => setStep("restaurants")}>
                Browse Restaurants
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-sm text-eats font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-eats text-white flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <EatsPriceBreakdown
                breakdown={priceBreakdown}
                itemCount={cartCount}
                showTipSelector={true}
                onTipChange={setTipAmount}
              />

              <Button
                onClick={() => setStep("checkout")}
                className="w-full h-12 rounded-xl font-bold gap-2 bg-eats hover:bg-eats/90"
              >
                Proceed to Checkout
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Step: Checkout */}
      {step === "checkout" && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right duration-200">
          <div className="p-3 rounded-xl bg-eats/5 border border-eats/20">
            <p className="text-sm font-medium">Order from {selectedRestaurant?.name}</p>
            <p className="text-xs text-muted-foreground">{cartCount} items • {currentZone.city_name}</p>
          </div>

          {/* Price Breakdown (read-only) */}
          <EatsPriceBreakdown
            breakdown={priceBreakdown}
            itemCount={cartCount}
            showTipSelector={false}
          />

          <div className="space-y-3">
            <div>
              <Label htmlFor="address" className="text-sm">Delivery Address *</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm">Full Name *</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Your name"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm">Email (for receipt)</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm">Delivery Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Apartment number, gate code, etc."
                value={contactInfo.notes}
                onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!contactInfo.name || !contactInfo.phone || !address || isSubmitting}
            className="w-full h-12 rounded-xl font-bold gap-2 bg-eats hover:bg-eats/90"
          >
            <CreditCard className="w-5 h-5" />
            Pay {formatCurrency(priceBreakdown.total)} & Order
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment via Stripe. We don't store your card details.
          </p>
        </div>
      )}

      {/* Step: Processing */}
      {step === "processing" && (
        <div className="py-20 text-center space-y-6 animate-in fade-in duration-200">
          <Loader2 className="w-12 h-12 mx-auto text-eats animate-spin" />
          <div>
            <h2 className="font-display text-xl font-bold mb-2">Redirecting to Payment...</h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we set up your secure checkout.
            </p>
          </div>
        </div>
      )}

      {/* Step: Submitted */}
      {step === "submitted" && (
        <div className="p-4 py-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 mx-auto rounded-full bg-eats/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-eats" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">Payment Received!</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your order has been placed. The restaurant will confirm shortly.
            </p>
          </div>
          {orderId && (
            <div className="py-3 px-4 rounded-xl bg-muted/30 border border-border/50 inline-block">
              <p className="text-xs text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono font-bold text-sm">{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
          )}
          <div className="py-4 px-6 rounded-2xl bg-muted/30 border border-border/50 max-w-sm mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Status: <span className="text-eats font-semibold">Paid / Awaiting Confirmation</span></p>
            <ul className="text-sm text-left space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-eats rounded-full" />
                Restaurant will confirm your order
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-eats rounded-full" />
                You'll receive updates via text/email
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-eats rounded-full" />
                Delivery in {selectedRestaurant?.eta || "30-45"} minutes
              </li>
            </ul>
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-xl"
          >
            Order Again
          </Button>
        </div>
      )}
    </AppLayout>
  );
};

export default AppEats;
