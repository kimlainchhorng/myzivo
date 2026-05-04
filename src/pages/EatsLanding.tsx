/**
 * EatsLanding - Food delivery hub page with full ordering flow
 * Connected to Supabase: restaurants, menu_items, food_orders
 */
import { useState, useMemo, useEffect } from "react";
import { Star, Clock, Truck, ShoppingCart, Search, MapPin, UtensilsCrossed, Plus, Minus, ArrowLeft, CheckCircle, CreditCard, Package, Timer, Heart, Sparkles, MessageSquare, Percent, Leaf, Award, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEatsRestaurants, useEatsMenu, type EatsCartItem } from "@/hooks/useEatsData";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { useEatsOrder } from "@/hooks/useEatsOrder";
import { getWalletBalance } from "@/hooks/useWalletPayment";
import { useAuth } from "@/contexts/AuthContext";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import PartnerBadge from "@/components/shared/PartnerBadge";
import NativeBackButton from "@/components/shared/NativeBackButton";
import { useNetworkFavorites } from "@/hooks/useNetworkFavorites";

// ─── Types ───────────────────────────────────────────────────────────
type Step = "browse" | "restaurant" | "cart" | "checkout";

// Canonicalize merchant-typed cuisine labels so common typos / aliases
// collapse into one chip (e.g. "Asain food" + "Asian" → "Asian"). The DB
// keeps the original value; this only affects the display label.
const CUISINE_ALIASES: Record<string, string> = {
  "asain": "Asian",
  "asain food": "Asian",
  "asian food": "Asian",
  "italan": "Italian",
  "itialian": "Italian",
  "japenese": "Japanese",
  "chineese": "Chinese",
  "mexican food": "Mexican",
  "thai food": "Thai",
  "indian food": "Indian",
};
function canonicalCuisine(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  const key = trimmed.toLowerCase();
  if (CUISINE_ALIASES[key]) return CUISINE_ALIASES[key];
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

// Cuisine emoji for empty-image fallbacks so cards look intentional
// rather than broken when a merchant hasn't uploaded a cover photo.
const CUISINE_EMOJI: Record<string, string> = {
  asian: "🥢", chinese: "🥡", japanese: "🍱", thai: "🍜", korean: "🍲",
  indian: "🍛", italian: "🍝", mexican: "🌮", american: "🍔", french: "🥖",
  greek: "🥙", mediterranean: "🥗", vietnamese: "🍲", pizza: "🍕",
  burger: "🍔", coffee: "☕", dessert: "🍰", bakery: "🥐", seafood: "🦐",
  vegan: "🥗", vegetarian: "🥗", bbq: "🍖", breakfast: "🥞", sushi: "🍣",
};
function cuisineEmoji(raw: string): string {
  const key = (raw || "").toLowerCase().trim();
  for (const k of Object.keys(CUISINE_EMOJI)) {
    if (key.includes(k)) return CUISINE_EMOJI[k];
  }
  return "🍽️";
}

const tipOptions = [
  { id: "none", label: "No tip", pct: 0 },
  { id: "15", label: "15%", pct: 0.15 },
  { id: "20", label: "20%", pct: 0.20 },
  { id: "25", label: "25%", pct: 0.25 },
];

const deliverySpeedOptions = [
  { id: "standard", label: "Standard", time: "25-40 min", extraCost: 0 },
  { id: "priority", label: "Priority", time: "15-25 min", extraCost: 2.99, badge: "Faster" },
];

// ─── Sub-components ──────────────────────────────────────────────────
function EatsStepIndicator({ currentStep }: { currentStep: string }) {
  const steps = [
    { id: "browse", label: "Browse" },
    { id: "restaurant", label: "Menu" },
    { id: "cart", label: "Cart" },
    { id: "checkout", label: "Pay" },
  ];
  const idx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1.5">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
            i <= idx ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground border border-border/40"
          )}>
            {i < idx ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < steps.length - 1 && <div className={cn("w-4 sm:w-8 h-[2px] rounded-full", i < idx ? "bg-primary" : "bg-border/40")} />}
        </div>
      ))}
    </div>
  );
}


// ─── Main Component ──────────────────────────────────────────────────
export default function EatsLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { placeOrder, placing: placingOrder } = useEatsOrder();

  // Wallet balance for checkout
  const [walletBalanceCents, setWalletBalanceCents] = useState<number>(0);
  useEffect(() => {
    if (user?.id) {
      getWalletBalance(user.id).then(setWalletBalanceCents);
    }
  }, [user?.id]);
  // Data from Supabase
  const { data: restaurants = [], isLoading: loadingRestaurants } = useEatsRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const { data: menuItems = [], isLoading: loadingMenu } = useEatsMenu(selectedRestaurantId);

  // UI State
  const [step, setStep] = useState<Step>("browse");
  const [cart, setCart] = useState<EatsCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"recommended" | "rating" | "time">("recommended");

  // Checkout state
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [contactlessDelivery, setContactlessDelivery] = useState(false);
  const [selectedTip, setSelectedTip] = useState("20");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState("standard");
  const [noUtensils, setNoUtensils] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState<Record<string, string>>({});
  const [paymentType, setPaymentType] = useState<"cash" | "card" | "wallet" | "paypal" | "square">("card");

  // Favorites — persisted via localStorage and shared across the app
  const { favorites, toggle: toggleFavoriteHook } = useNetworkFavorites("restaurant");

  // ─── Derived Data ────────────────────────────────────────────────
  const currentRestaurant = useMemo(
    () => restaurants.find(r => r.id === selectedRestaurantId) ?? null,
    [restaurants, selectedRestaurantId]
  );

  // Normalize cuisine types: canonicalize known aliases (Asain → Asian)
  // then dedupe by display label so each chip appears once.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const r of restaurants) {
      const display = canonicalCuisine(r.cuisine_type || "");
      if (display) seen.add(display);
    }
    return ["All", ...Array.from(seen).sort()];
  }, [restaurants]);

  const filtered = useMemo(() => {
    return restaurants
      .filter(r => {
        if (
          activeCategory !== "All" &&
          canonicalCuisine(r.cuisine_type || "") !== activeCategory
        ) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return r.name.toLowerCase().includes(q) || (r.cuisine_type || "").toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        if (sortBy === "time") return (a.avg_prep_time ?? 30) - (b.avg_prep_time ?? 30);
        return (b.rating ?? 0) - (a.rating ?? 0); // recommended = rating
      });
  }, [restaurants, activeCategory, searchQuery, sortBy]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = currentRestaurant?.delivery_fee_cents ? currentRestaurant.delivery_fee_cents / 100 : 3.99;
  const serviceFeeRate = currentRestaurant?.service_fee_percent ?? 5;
  const serviceFee = Math.round(cartTotal * (serviceFeeRate / 100) * 100) / 100;
  const tipPct = tipOptions.find(t => t.id === selectedTip)?.pct ?? 0;
  const tipAmount = Math.round(cartTotal * tipPct * 100) / 100;
  const speedExtra = deliverySpeedOptions.find(o => o.id === selectedSpeed)?.extraCost ?? 0;
  const promoDiscount = promoApplied ? Math.round(cartTotal * 0.1 * 100) / 100 : 0;
  const grandTotal = Math.round((cartTotal + deliveryFee + serviceFee + tipAmount + speedExtra - promoDiscount) * 100) / 100;

  // ─── Cart Actions ────────────────────────────────────────────────
  const addToCart = (item: { id: string; name: string; price: number; image_url?: string | null }, restaurantId: string) => {
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      toast.error("You can only order from one restaurant at a time. Clear your cart first.");
      return;
    }
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, restaurantId, imageUrl: item.image_url }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItemId === menuItemId) {
        const newQty = c.quantity + delta;
        return newQty <= 0 ? null! : { ...c, quantity: newQty };
      }
      return c;
    }).filter(Boolean));
  };

  // ─── Navigation ──────────────────────────────────────────────────
  const handleBack = () => {
    if (step === "checkout") setStep("cart");
    else if (step === "cart") setStep(selectedRestaurantId ? "restaurant" : "browse");
    else if (step === "restaurant") { setStep("browse"); setSelectedRestaurantId(null); }
    else navigate(-1);
  };

  // ─── Place Order ─────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) { toast.error("Please enter a delivery address"); return; }
    const result = await placeOrder({
      restaurantId: cart[0].restaurantId,
      items: cart,
      deliveryAddress,
      deliveryLat: 0,
      deliveryLng: 0,
      subtotal: cartTotal,
      deliveryFee,
      serviceFee,
      tipAmount,
      totalAmount: grandTotal,
      paymentType,
      specialInstructions: deliveryInstructions || undefined,
      isExpress: selectedSpeed === "priority",
      expressFee: speedExtra,
      promoCode: promoApplied ? promoCode : undefined,
      discountAmount: promoDiscount > 0 ? promoDiscount : undefined,
      restaurantName: currentRestaurant?.name,
      pickupLat: currentRestaurant?.lat ?? undefined,
      pickupLng: currentRestaurant?.lng ?? undefined,
    });
    if (result) {
      navigate(`/eats/track/${result.orderId}`);
    }
  };

  const toggleFavorite = (id: string) => toggleFavoriteHook(id);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="ZIVO Eats – Order Food Delivery from Local Restaurants"
        description="Order from your favorite local restaurants. Fast delivery, real-time tracking, and exclusive deals on ZIVO Eats."
        canonical="/eats"
      />
      {step === "browse" && !Capacitor.isNativePlatform() && <NavBar />}
      {step === "browse" && <NativeBackButton />}

      <AnimatePresence mode="wait">
        {/* ═══ BROWSE ═══ */}
        {step === "browse" && (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="relative pt-6 sm:pt-24 pb-6 sm:pb-12 overflow-hidden safe-area-top">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent" />
              <div className="container mx-auto px-4 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-2 sm:mb-6 shadow-lg shadow-orange-500/20">
                    <UtensilsCrossed className="w-5 h-5 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl sm:text-5xl font-bold tracking-tight mb-1 sm:mb-3">ZIVO <span className="text-primary">Eats</span></h1>
                  <p className="text-muted-foreground text-xs sm:text-lg">Delicious food from local restaurants, delivered fast.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl mx-auto space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search restaurants or dishes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 rounded-xl bg-card border-border/50" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Enter your delivery address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="pl-10 h-12 rounded-xl bg-card border-border/50" />
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="py-8">
              <div className="container mx-auto px-4">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
                  {categories.map(c => (
                    <button key={c} onClick={() => setActiveCategory(c)} className={cn(
                      "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all touch-manipulation active:scale-95",
                      activeCategory === c ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40"
                    )}>{c}</button>
                  ))}
                </div>

                {/* Sort */}
                <div className="flex gap-2 mb-6">
                  {(["recommended", "rating", "time"] as const).map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all touch-manipulation active:scale-95 capitalize",
                        sortBy === s ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
                      )}>{s === "recommended" ? "🔥 Recommended" : s === "rating" ? "⭐ Top Rated" : "⚡ Fastest"}</button>
                  ))}
                </div>

                {/* Loading */}
                {loadingRestaurants && (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}

                {/* Empty */}
                {!loadingRestaurants && filtered.length === 0 && (
                  <div className="text-center py-16">
                    <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No restaurants found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or category</p>
                  </div>
                )}

                {/* Restaurant Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((restaurant, i) => (
                    <motion.div key={restaurant.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                      <div className="group relative rounded-2xl bg-card border border-border/40 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                        <button onClick={() => { setSelectedRestaurantId(restaurant.id); setStep("restaurant"); }} className="block w-full text-left touch-manipulation active:scale-[0.99]">
                          <div className="relative aspect-[16/10] overflow-hidden bg-muted/20">
                            {restaurant.cover_image_url ? (
                              <img src={restaurant.cover_image_url} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-rose-500/15">
                                <span className="text-5xl">{cuisineEmoji(restaurant.cuisine_type)}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">{canonicalCuisine(restaurant.cuisine_type)}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50" />
                            {restaurant.delivery_fee_cents === 0 && (
                              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Free Delivery
                              </span>
                            )}
                            <PartnerBadge size="xs" className="absolute bottom-3 left-3 shadow-sm" />
                            {!restaurant.is_open && (
                              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">Closed</span>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-sm">{restaurant.name}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{canonicalCuisine(restaurant.cuisine_type)}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {restaurant.rating != null && restaurant.rating > 0 && (restaurant.rating_count ?? 0) > 0 ? (
                                <>
                                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {restaurant.rating.toFixed(1)}</span>
                                  <span className="text-muted-foreground/60">({restaurant.rating_count})</span>
                                </>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">New</span>
                              )}
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {restaurant.avg_prep_time ?? 25}-{(restaurant.avg_prep_time ?? 25) + 15} min</span>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/eats/reserve?restaurantId=${restaurant.id}&restaurantName=${encodeURIComponent(restaurant.name)}`);
                          }}
                          className="absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 active:scale-95 transition-all touch-manipulation flex items-center gap-1"
                        >
                          📅 Reserve table
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(restaurant.id); }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center touch-manipulation active:scale-90 shadow-sm">
                          <Heart className={cn("w-4 h-4 transition-all", favorites.has(restaurant.id) ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {cartCount > 0 && (
              <motion.button initial={{ y: 100 }} animate={{ y: 0 }} onClick={() => setStep("cart")}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-xl shadow-primary/30 font-bold text-sm touch-manipulation active:scale-[0.97]">
                <ShoppingCart className="w-5 h-5" /><span>View Cart · {cartCount} items</span><span className="font-bold">${cartTotal.toFixed(2)}</span>
              </motion.button>
            )}
            <Footer />
          </motion.div>
        )}

        {/* ═══ RESTAURANT DETAIL ═══ */}
        {step === "restaurant" && currentRestaurant && (
          <motion.div key="restaurant" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 safe-area-top z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
              <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
                <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack} className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </motion.button>
                <div className="flex-1">
                  <h1 className="text-base font-bold text-foreground">{currentRestaurant.name}</h1>
                  <p className="text-[10px] text-muted-foreground">{canonicalCuisine(currentRestaurant.cuisine_type)} · {currentRestaurant.avg_prep_time ?? 25}-{(currentRestaurant.avg_prep_time ?? 25) + 15} min</p>
                </div>
                <button onClick={() => toggleFavorite(currentRestaurant.id)}
                  className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <Heart className={cn("w-5 h-5", favorites.has(currentRestaurant.id) ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                </button>
                {currentRestaurant.rating != null && currentRestaurant.rating > 0 && (currentRestaurant.rating_count ?? 0) > 0 ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {currentRestaurant.rating.toFixed(1)}
                  </div>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">New</span>
                )}
              </div>
              <EatsStepIndicator currentStep="restaurant" />
            </div>

            {/* Cover image */}
            <div className="relative h-48 overflow-hidden bg-muted/20">
              {currentRestaurant.cover_image_url ? (
                <img src={currentRestaurant.cover_image_url} alt={currentRestaurant.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-orange-500/10">
                  <UtensilsCrossed className="w-16 h-16 text-muted-foreground/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {currentRestaurant.delivery_fee_cents === 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold gap-1"><Truck className="w-3 h-3" /> Free Delivery</Badge>
                )}
                <Badge variant="outline" className="bg-card/80 backdrop-blur text-[10px] font-bold gap-1"><Timer className="w-3 h-3" /> {currentRestaurant.avg_prep_time ?? 25}m prep</Badge>
              </div>
            </div>

            {/* Quick actions: Reserve · Ride · Save */}
            <div className="px-4 pt-4 max-w-lg mx-auto">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/eats/reserve?restaurantId=${currentRestaurant.id}&restaurantName=${encodeURIComponent(currentRestaurant.name)}`,
                    )
                  }
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border/50 bg-card hover:bg-muted/40 active:scale-[0.98] transition-all py-3 touch-manipulation"
                >
                  <span className="text-base">📅</span>
                  <span className="text-[11px] font-bold text-foreground">Reserve</span>
                </button>
                <button
                  onClick={() =>
                    navigate(
                      `/rides?dropoff=${encodeURIComponent(currentRestaurant.name)}`,
                    )
                  }
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border/50 bg-card hover:bg-muted/40 active:scale-[0.98] transition-all py-3 touch-manipulation"
                >
                  <span className="text-base">🚗</span>
                  <span className="text-[11px] font-bold text-foreground">Ride here</span>
                </button>
                <button
                  onClick={() => toggleFavorite(currentRestaurant.id)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border/50 bg-card hover:bg-muted/40 active:scale-[0.98] transition-all py-3 touch-manipulation"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 transition-all",
                      favorites.has(currentRestaurant.id)
                        ? "fill-red-500 text-red-500"
                        : "text-foreground",
                    )}
                  />
                  <span className="text-[11px] font-bold text-foreground">
                    {favorites.has(currentRestaurant.id) ? "Saved" : "Save"}
                  </span>
                </button>
              </div>
            </div>

            {/* Description */}
            {currentRestaurant.description && (
              <div className="px-4 pt-4 max-w-lg mx-auto">
                <p className="text-xs text-muted-foreground">{currentRestaurant.description}</p>
              </div>
            )}

            {/* Menu */}
            <div className="px-4 py-6 max-w-lg mx-auto space-y-3">
              <h2 className="text-lg font-bold text-foreground mb-4">Menu</h2>

              {loadingMenu && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {!loadingMenu && menuItems.length === 0 && (
                <div className="text-center py-12">
                  <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No menu items available</p>
                </div>
              )}

              {menuItems.map((item, i) => {
                const inCart = cart.find(c => c.menuItemId === item.id);
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 transition-all space-y-2">
                    <div className="flex items-center gap-4">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-foreground truncate">{item.name}</h3>
                          {item.is_featured && <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />}
                        </div>
                        {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                        <p className="text-sm font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button aria-label="Decrease" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-manipulation active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span>
                          <button aria-label="Increase" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center touch-manipulation active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => addToCart(item, currentRestaurant.id)} className="rounded-xl h-9 px-4 gap-1.5 font-bold text-xs border-primary/30 text-primary hover:bg-primary/5 shrink-0">
                          <Plus className="w-3.5 h-3.5" /> Add
                        </Button>
                      )}
                    </div>
                    {inCart && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input placeholder="Special instructions (e.g., no onions)" value={specialInstructions[item.id] || ""}
                          onChange={(e) => setSpecialInstructions(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="h-8 text-xs rounded-lg border-border/30 bg-muted/30" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {cartCount > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-2xl border-t border-border/30 safe-area-bottom">
                <Button onClick={() => setStep("cart")} className="w-full h-14 text-base font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]">
                  <ShoppingCart className="w-5 h-5" /> View Cart · {cartCount} items <span className="ml-auto">${cartTotal.toFixed(2)}</span>
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ CART ═══ */}
        {step === "cart" && (
          <motion.div key="cart" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 safe-area-top z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
              <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
                <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack} className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </motion.button>
                <h1 className="text-base font-bold text-foreground">Your Cart</h1>
                <Badge variant="outline" className="ml-auto text-xs font-bold">{cartCount} items</Badge>
              </div>
              <EatsStepIndicator currentStep="cart" />
            </div>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Your cart is empty</p>
                  <Button variant="outline" onClick={() => setStep("browse")} className="mt-4 rounded-xl">Browse Restaurants</Button>
                </div>
              ) : (
                <>
                  {currentRestaurant && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                      <UtensilsCrossed className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{currentRestaurant.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{currentRestaurant.avg_prep_time ?? 25}-{(currentRestaurant.avg_prep_time ?? 25) + 15} min</span>
                    </div>
                  )}

                  {cart.map(item => (
                    <div key={item.menuItemId} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button aria-label="Decrease" onClick={() => updateQuantity(item.menuItemId, -1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-manipulation active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button aria-label="Increase" onClick={() => updateQuantity(item.menuItemId, 1)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center touch-manipulation active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <span className="font-bold text-sm text-foreground w-16 text-right shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  <button onClick={() => setStep("restaurant")}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border/60 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all touch-manipulation active:scale-[0.98]">
                    <Plus className="w-3.5 h-3.5" /> Add more items
                  </button>

                  {/* Skip utensils */}
                  <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                    <button onClick={() => setNoUtensils(!noUtensils)}
                      className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", noUtensils ? "bg-emerald-500" : "bg-muted/60")}>
                      <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", noUtensils ? "left-[18px]" : "left-0.5")} />
                    </button>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-500" /> Skip utensils</p>
                      <p className="text-[10px] text-muted-foreground">Help reduce plastic waste 🌍</p>
                    </div>
                  </div>

                  {/* Fee Summary */}
                  <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Delivery fee</span><span className="font-bold">{deliveryFee === 0 ? <span className="text-primary">Free</span> : `$${deliveryFee.toFixed(2)}`}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span className="font-bold">${serviceFee.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-3 border-t border-border/30">
                      <span className="font-bold text-base">Total</span>
                      <span className="font-bold text-xl text-primary">${(cartTotal + deliveryFee + serviceFee).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-2xl border-t border-border/30 safe-area-bottom">
                <Button onClick={() => setStep("checkout")} className="w-full h-14 text-base font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]">
                  <CreditCard className="w-5 h-5" /> Checkout · ${(cartTotal + deliveryFee + serviceFee).toFixed(2)}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ CHECKOUT ═══ */}
        {step === "checkout" && (
          <motion.div key="checkout" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 safe-area-top z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
              <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
                <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack} className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </motion.button>
                <h1 className="text-base font-bold text-foreground">Checkout</h1>
              </div>
              <EatsStepIndicator currentStep="checkout" />
            </div>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
              {/* Delivery Address */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Delivery Address</h3>
                <Input placeholder="Enter delivery address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="h-12 rounded-xl" />
                <Input placeholder="Delivery instructions (e.g., buzz #204)" value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} className="h-10 rounded-xl text-sm" />
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setContactlessDelivery(!contactlessDelivery)}
                    className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", contactlessDelivery ? "bg-primary" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", contactlessDelivery ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <p className="text-xs font-medium text-foreground">Contactless delivery</p>
                </div>
              </div>

              {/* Delivery Speed */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Truck className="w-3 h-3" /> Delivery speed</h3>
                <div className="space-y-2">
                  {deliverySpeedOptions.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedSpeed(opt.id)}
                      className={cn("w-full flex items-center justify-between p-3 rounded-xl transition-all touch-manipulation active:scale-[0.98]",
                        selectedSpeed === opt.id ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-border/30")}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{opt.label}</span>
                        {opt.badge && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{opt.badge}</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">{opt.time}</span>
                        {opt.extraCost > 0 && <span className="text-[10px] text-primary font-bold block">+${opt.extraCost.toFixed(2)}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Payment method</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {([
                    { id: "card" as const, label: "💳 Card" },
                    { id: "cash" as const, label: "💵 Cash" },
                    { id: "wallet" as const, label: `👛 $${(walletBalanceCents / 100).toFixed(2)}` },
                    { id: "paypal" as const, label: "🅿️ PayPal" },
                    { id: "square" as const, label: "🟦 Square" },
                  ]).map(p => (
                    <button key={p.id} onClick={() => {
                      if (p.id === "wallet" && walletBalanceCents < Math.round(grandTotal * 100)) {
                        toast.error(`Insufficient wallet balance ($${(walletBalanceCents / 100).toFixed(2)})`);
                        return;
                      }
                      setPaymentType(p.id);
                    }}
                      className={cn("py-3 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95",
                        paymentType === p.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40",
                        p.id === "wallet" && walletBalanceCents < Math.round(grandTotal * 100) && "opacity-50")}>
                      {p.label}
                    </button>
                  ))}
                </div>
                {(paymentType === "paypal" || paymentType === "square") && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    You'll be redirected to {paymentType === "paypal" ? "PayPal" : "Square"} to confirm payment, then come right back to track your order.
                  </p>
                )}
              </div>

              {/* Tip */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Driver tip</h3>
                <div className="flex gap-2">
                  {tipOptions.map(t => (
                    <button key={t.id} onClick={() => setSelectedTip(t.id)}
                      className={cn("flex-1 py-2.5 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95",
                        selectedTip === t.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo Code */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Percent className="w-3 h-3" /> Promo code</h3>
                <div className="flex gap-2">
                  <Input placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied} className="h-10 rounded-xl flex-1 text-sm" />
                  <Button variant={promoApplied ? "outline" : "default"} size="sm"
                    onClick={async () => {
                      if (!promoCode.trim()) return;
                      // Validate promo code against DB
                      const { data: promo } = await (supabase as any)
                        .from("promo_codes")
                        .select("id, discount_percent, discount_amount_cents, is_active, min_order_cents, expires_at")
                        .eq("code", promoCode.trim().toUpperCase())
                        .eq("is_active", true)
                        .maybeSingle() as { data: any };
                      if (!promo) {
                        toast.error("Invalid or expired promo code");
                        return;
                      }
                      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
                        toast.error("This promo code has expired");
                        return;
                      }
                      if (promo.min_order_cents && cartTotal * 100 < promo.min_order_cents) {
                        toast.error(`Minimum order $${(promo.min_order_cents / 100).toFixed(2)} required`);
                        return;
                      }
                      setPromoApplied(true);
                      toast.success("Promo applied!");
                    }}
                    disabled={promoApplied || !promoCode.trim()} className="rounded-xl h-10 px-4 text-xs font-bold">
                    {promoApplied ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Applied</> : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Final Total */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-bold">{deliveryFee === 0 ? <span className="text-primary">Free</span> : `$${deliveryFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span className="font-bold">${serviceFee.toFixed(2)}</span></div>
                {speedExtra > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Priority fee</span><span className="font-bold">${speedExtra.toFixed(2)}</span></div>}
                {tipAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Driver tip</span><span className="font-bold">${tipAmount.toFixed(2)}</span></div>}
                {promoDiscount > 0 && <div className="flex justify-between text-primary"><span className="font-bold flex items-center gap-1"><Percent className="w-3 h-3" /> Promo</span><span className="font-bold">-${promoDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between pt-3 border-t border-border/30">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-xl text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* ETA */}
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
                <Timer className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Estimated delivery: {currentRestaurant ? `${(currentRestaurant.avg_prep_time ?? 25) + 10}-${(currentRestaurant.avg_prep_time ?? 25) + 20} min` : "25-35 min"}
                  </p>
                  <p className="text-xs text-muted-foreground">Your order will be prepared fresh</p>
                </div>
              </div>

              {/* Place Order Button */}
              <Button onClick={handlePlaceOrder} disabled={!deliveryAddress.trim() || placingOrder}
                className="w-full h-14 text-base font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]">
                {placingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {placingOrder ? "Placing order..." : `Place Order · $${grandTotal.toFixed(2)}`}
              </Button>
            </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
