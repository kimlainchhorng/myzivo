/**
 * EatsLanding - Food delivery hub page with full ordering flow
 * Premium glassmorphism style matching the ZIVO super-app
 */
import { useState } from "react";
import { Star, Clock, ArrowRight, Truck, ShoppingCart, Search, MapPin, UtensilsCrossed, Plus, Minus, ArrowLeft, CheckCircle, CreditCard, Package, Timer, Heart, MessageSquare, Gift, PartyPopper, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";

const categories = ["All", "American", "Italian", "Asian", "Mexican", "Healthy", "Desserts"];

const restaurants = [
  { id: "joes-grill", name: "Joe's Grill", cuisine: "American", price: "$", rating: 4.7, time: "20-30 min", freeDelivery: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400", featured: "Classic Burger · $12.99",
    menu: [
      { id: "m1", name: "Classic Burger", price: 12.99, description: "Angus beef, lettuce, tomato, special sauce" },
      { id: "m2", name: "Double Stack", price: 16.99, description: "Double patty with cheese and bacon" },
      { id: "m3", name: "Crispy Fries", price: 4.99, description: "Golden fries with sea salt" },
      { id: "m4", name: "Milkshake", price: 6.99, description: "Vanilla, chocolate, or strawberry" },
    ]
  },
  { id: "bella-napoli", name: "Bella Napoli", cuisine: "Italian", price: "$$", rating: 4.9, time: "25-35 min", freeDelivery: false, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400", featured: "Margherita Pizza · $14.99",
    menu: [
      { id: "m5", name: "Margherita Pizza", price: 14.99, description: "Fresh mozzarella, basil, San Marzano" },
      { id: "m6", name: "Pasta Carbonara", price: 16.99, description: "Guanciale, egg, pecorino" },
      { id: "m7", name: "Bruschetta", price: 8.99, description: "Tomato, garlic, fresh basil" },
      { id: "m8", name: "Tiramisu", price: 9.99, description: "Classic Italian dessert" },
    ]
  },
  { id: "thai-palace", name: "Thai Palace", cuisine: "Asian", price: "$$", rating: 4.6, time: "20-30 min", freeDelivery: true, image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=400", featured: "Pad Thai · $13.50",
    menu: [
      { id: "m9", name: "Pad Thai", price: 13.50, description: "Rice noodles, shrimp, peanuts" },
      { id: "m10", name: "Green Curry", price: 14.99, description: "Coconut milk, Thai basil, vegetables" },
      { id: "m11", name: "Spring Rolls", price: 7.99, description: "Crispy rolls with dipping sauce" },
      { id: "m12", name: "Mango Sticky Rice", price: 8.99, description: "Sweet coconut sticky rice" },
    ]
  },
  { id: "el-azteca", name: "El Azteca", cuisine: "Mexican", price: "$", rating: 4.8, time: "15-25 min", freeDelivery: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400", featured: "Chicken Tacos · $10.99",
    menu: [
      { id: "m13", name: "Chicken Tacos", price: 10.99, description: "Three tacos with salsa verde" },
      { id: "m14", name: "Burrito Bowl", price: 12.99, description: "Rice, beans, guac, and protein" },
      { id: "m15", name: "Chips & Guac", price: 6.99, description: "Fresh guacamole with tortilla chips" },
      { id: "m16", name: "Churros", price: 5.99, description: "Cinnamon sugar with chocolate sauce" },
    ]
  },
  { id: "green-bowl", name: "Green Bowl", cuisine: "Healthy", price: "$$", rating: 4.5, time: "15-25 min", freeDelivery: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400", featured: "Acai Bowl · $11.99",
    menu: [
      { id: "m17", name: "Acai Bowl", price: 11.99, description: "Acai, granola, banana, berries" },
      { id: "m18", name: "Quinoa Salad", price: 13.99, description: "Mixed greens, avocado, feta" },
      { id: "m19", name: "Green Smoothie", price: 8.99, description: "Spinach, banana, mango" },
      { id: "m20", name: "Protein Wrap", price: 12.99, description: "Grilled chicken, hummus, veggies" },
    ]
  },
  { id: "sakura-sushi", name: "Sakura Sushi", cuisine: "Asian", price: "$$$", rating: 4.9, time: "30-40 min", freeDelivery: false, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400", featured: "Dragon Roll · $16.99",
    menu: [
      { id: "m21", name: "Dragon Roll", price: 16.99, description: "Shrimp tempura, avocado, eel sauce" },
      { id: "m22", name: "Salmon Sashimi", price: 18.99, description: "8 pieces of fresh salmon" },
      { id: "m23", name: "Miso Soup", price: 4.99, description: "Tofu, seaweed, green onion" },
      { id: "m24", name: "Edamame", price: 5.99, description: "Steamed with sea salt" },
    ]
  },
];

interface CartItem {
  menuItemId: string; name: string; price: number; quantity: number; restaurantId: string;
  specialInstructions?: string;
}

const tipOptions = [
  { id: "none", label: "No tip", pct: 0 },
  { id: "15", label: "15%", pct: 0.15 },
  { id: "20", label: "20%", pct: 0.20 },
  { id: "25", label: "25%", pct: 0.25 },
];

// Step indicator for the checkout flow
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
          <span className={cn("text-[10px] font-bold hidden sm:inline", i <= idx ? "text-primary" : "text-muted-foreground/50")}>{s.label}</span>
          {i < steps.length - 1 && <div className={cn("w-4 sm:w-8 h-[2px] rounded-full", i < idx ? "bg-primary" : "bg-border/40")} />}
        </div>
      ))}
    </div>
  );
}

export default function EatsLanding() {
  const navigate = useNavigate();
  const [active, setActive] = useState("All");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<"browse" | "restaurant" | "cart" | "checkout" | "confirmation">("browse");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState<Record<string, string>>({});
  const [selectedTip, setSelectedTip] = useState("20");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isFavorite, setIsFavorite] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = restaurants.filter(r => {
    const matchesCategory = active === "All" || r.cuisine === active;
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) || r.menu.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  const orderNumber = `ZE-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const currentRestaurant = restaurants.find(r => r.id === selectedRestaurant);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = currentRestaurant?.freeDelivery ? 0 : 3.99;
  const serviceFee = Math.round(cartTotal * 0.05 * 100) / 100;
  const tipPct = tipOptions.find(t => t.id === selectedTip)?.pct ?? 0;
  const tipAmount = Math.round(cartTotal * tipPct * 100) / 100;
  const promoDiscount = promoApplied ? Math.round(cartTotal * 0.1 * 100) / 100 : 0;
  const grandTotal = Math.round((cartTotal + deliveryFee + serviceFee + tipAmount - promoDiscount) * 100) / 100;

  const addToCart = (item: { id: string; name: string; price: number }, restaurantId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, restaurantId }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItemId === menuItemId) { const newQty = c.quantity + delta; return newQty <= 0 ? null! : { ...c, quantity: newQty }; }
      return c;
    }).filter(Boolean));
  };

  const handleBack = () => {
    if (step === "confirmation") { setStep("browse"); setCart([]); setSelectedRestaurant(null); }
    else if (step === "checkout") setStep("cart");
    else if (step === "cart") setStep(selectedRestaurant ? "restaurant" : "browse");
    else if (step === "restaurant") { setStep("browse"); setSelectedRestaurant(null); }
    else navigate(-1);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "EATS10") { setPromoApplied(true); toast.success("10% off applied!"); }
    else toast.error("Invalid promo code");
  };

  const toggleFavorite = (id: string) => {
    setIsFavorite(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(isFavorite[id] ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <div className="min-h-screen bg-background">
      {step === "browse" && <NavBar />}

      <AnimatePresence mode="wait">
        {/* BROWSE */}
        {step === "browse" && (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="relative pt-24 pb-16 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent" />
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
              <div className="container mx-auto px-4 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
                    <UtensilsCrossed className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">ZIVO <span className="text-primary">Eats</span></h1>
                  <p className="text-muted-foreground text-lg">Delicious food from local restaurants, delivered fast.</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl mx-auto space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search restaurants or dishes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 rounded-xl bg-card border-border/50" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Enter your delivery address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="pl-10 h-12 rounded-xl bg-card border-border/50" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="py-12 sm:py-16">
              <div className="container mx-auto px-4">
                <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
                  {categories.map((c) => (
                    <button key={c} onClick={() => setActive(c)} className={cn(
                      "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all touch-manipulation active:scale-95",
                      active === c ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40 hover:bg-muted"
                    )}>{c}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.length === 0 && (
                    <div className="col-span-full text-center py-16">
                      <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No restaurants found</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or category</p>
                    </div>
                  )}
                  {filtered.map((restaurant, i) => (
                    <motion.div key={restaurant.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                      <div className="group relative rounded-2xl bg-card border border-border/40 overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-200">
                        <button onClick={() => { setSelectedRestaurant(restaurant.id); setStep("restaurant"); }} className="block w-full text-left touch-manipulation active:scale-[0.99]">
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50" />
                            {restaurant.freeDelivery && (
                              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Free Delivery
                              </span>
                            )}
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-base">{restaurant.name}</h3>
                              <span className="text-xs text-muted-foreground">{restaurant.price}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{restaurant.cuisine} · {restaurant.featured}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {restaurant.rating}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {restaurant.time}</span>
                              </div>
                              <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">Order <ArrowRight className="w-3.5 h-3.5" /></span>
                            </div>
                          </div>
                        </button>
                        {/* Favorite button */}
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(restaurant.id); }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center touch-manipulation active:scale-90 shadow-sm">
                          <Heart className={cn("w-4 h-4 transition-all", isFavorite[restaurant.id] ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
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

        {/* RESTAURANT DETAIL */}
        {step === "restaurant" && currentRestaurant && (
          <motion.div key="restaurant" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
              <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
                <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack} className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </motion.button>
                <div className="flex-1">
                  <h1 className="text-base font-bold text-foreground">{currentRestaurant.name}</h1>
                  <p className="text-[10px] text-muted-foreground">{currentRestaurant.cuisine} · {currentRestaurant.time} · {currentRestaurant.price}</p>
                </div>
                <button onClick={() => toggleFavorite(currentRestaurant.id)}
                  className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <Heart className={cn("w-5 h-5", isFavorite[currentRestaurant.id] ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                </button>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {currentRestaurant.rating}
                </div>
              </div>
              <EatsStepIndicator currentStep="restaurant" />
            </div>

            <div className="relative h-48 overflow-hidden">
              <img src={currentRestaurant.image} alt={currentRestaurant.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {currentRestaurant.freeDelivery && <Badge className="bg-primary text-primary-foreground text-[10px] font-bold gap-1"><Truck className="w-3 h-3" /> Free Delivery</Badge>}
                <Badge variant="outline" className="bg-card/80 backdrop-blur text-[10px] font-bold gap-1"><Timer className="w-3 h-3" /> {currentRestaurant.time}</Badge>
              </div>
            </div>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-3">
              <h2 className="text-lg font-bold text-foreground mb-4">Menu</h2>
              {currentRestaurant.menu.map((item, i) => {
                const inCart = cart.find(c => c.menuItemId === item.id);
                const instrKey = item.id;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 transition-all space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        <p className="text-sm font-bold text-primary mt-1.5">${item.price.toFixed(2)}</p>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 touch-manipulation active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 touch-manipulation active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => addToCart(item, currentRestaurant.id)} className="rounded-xl h-9 px-4 gap-1.5 font-bold text-xs border-primary/30 text-primary hover:bg-primary/5">
                          <Plus className="w-3.5 h-3.5" /> Add
                        </Button>
                      )}
                    </div>
                    {/* Special instructions per item */}
                    {inCart && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input placeholder="Special instructions (e.g., no onions)" value={specialInstructions[instrKey] || ""}
                          onChange={(e) => setSpecialInstructions(prev => ({ ...prev, [instrKey]: e.target.value }))}
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

        {/* CART */}
        {step === "cart" && (
          <motion.div key="cart" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
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
                  {cart.map(item => (
                    <div key={item.menuItemId} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">${item.price.toFixed(2)} each</p>
                        {specialInstructions[item.menuItemId] && (
                          <p className="text-[10px] text-primary mt-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {specialInstructions[item.menuItemId]}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.menuItemId, -1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-manipulation active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.menuItemId, 1)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center touch-manipulation active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <span className="font-bold text-sm text-foreground w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

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

        {/* CHECKOUT */}
        {step === "checkout" && (
          <motion.div key="checkout" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
              <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
                <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack} className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </motion.button>
                <h1 className="text-base font-bold text-foreground">Checkout</h1>
              </div>
              <EatsStepIndicator currentStep="checkout" />
            </div>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
              {/* Delivery address */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Delivery Address</h3>
                <Input placeholder="Enter delivery address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="h-12 rounded-xl" />
              </div>

              {/* Order summary */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-primary" /> Order Summary</h3>
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Tip for driver */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Heart className="w-3 h-3" /> Tip Your Driver
                </h3>
                <div className="flex gap-2">
                  {tipOptions.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedTip(opt.id)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95",
                        selectedTip === opt.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40 hover:bg-muted"
                      )}>{opt.label}</button>
                  ))}
                </div>
                {tipAmount > 0 && <p className="text-xs text-primary font-medium mt-2">Tip: ${tipAmount.toFixed(2)}</p>}
              </div>

              {/* Promo code */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Gift className="w-3 h-3" /> Promo Code
                </h3>
                <div className="flex gap-2">
                  <Input placeholder="Enter code (try EATS10)" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied} className="h-10 rounded-xl flex-1 text-sm" />
                  <Button variant={promoApplied ? "outline" : "default"} size="sm" onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode.trim()} className="rounded-xl h-10 px-4 text-xs font-bold">
                    {promoApplied ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Applied</> : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Final total */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-bold">{deliveryFee === 0 ? <span className="text-primary">Free</span> : `$${deliveryFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span className="font-bold">${serviceFee.toFixed(2)}</span></div>
                {tipAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Driver tip</span><span className="font-bold">${tipAmount.toFixed(2)}</span></div>}
                {promoDiscount > 0 && <div className="flex justify-between text-primary"><span className="font-bold">Promo discount</span><span className="font-bold">-${promoDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between pt-3 border-t border-border/30">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-xl text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* ETA */}
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
                <Timer className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">Estimated delivery: 25-35 min</p>
                  <p className="text-xs text-muted-foreground">Your order will be prepared fresh</p>
                </div>
              </div>

              <Button onClick={() => setStep("confirmation")} className="w-full h-14 text-base font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]" disabled={!deliveryAddress.trim()}>
                <CheckCircle className="w-5 h-5" /> Place Order · ${grandTotal.toFixed(2)}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ORDER CONFIRMATION */}
        {step === "confirmation" && (
          <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
                <PartyPopper className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h1 className="text-2xl font-bold text-foreground mb-2">Order Confirmed! 🎉</h1>
                <p className="text-muted-foreground">Your food is being prepared and will arrive in 25-35 minutes.</p>
                <p className="text-xs font-mono text-primary/80 mt-2 bg-primary/5 px-3 py-1.5 rounded-full inline-block">Order #{orderNumber}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="rounded-2xl bg-card border border-border/40 p-5 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Navigation className="w-5 h-5 text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground">Delivering to</p><p className="text-sm font-bold text-foreground">{deliveryAddress}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center"><Timer className="w-5 h-5 text-orange-500" /></div>
                  <div><p className="text-xs text-muted-foreground">Estimated arrival</p><p className="text-sm font-bold text-foreground">25-35 minutes</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-emerald-500" /></div>
                  <div><p className="text-xs text-muted-foreground">Total charged</p><p className="text-sm font-bold text-primary">${grandTotal.toFixed(2)}</p></div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3">
                <Button variant="outline" onClick={() => { setCart([]); setStep("browse"); setSelectedRestaurant(null); }} className="flex-1 h-12 rounded-xl font-bold">
                  Back to Home
                </Button>
                <Button onClick={() => navigate("/")} className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground">
                  Track Order
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
