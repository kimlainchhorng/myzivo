import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Filter,
  ChevronRight,
  ChevronLeft,
  Flame,
  Leaf,
  Pizza,
  Coffee,
  Soup,
  IceCream,
  Sandwich,
  Fish,
  ShoppingCart,
  Plus,
  Minus,
  X,
  UtensilsCrossed,
  Bike,
  CreditCard,
  ArrowLeft
} from "lucide-react";
import { useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { BookingStepIndicator, CheckoutModal, BookingConfirmation } from "@/components/booking";
import { toast } from "sonner";

// Categories Scroll Section Component
interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

const CategoriesScrollSection = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: { 
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-6 sm:py-8 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Left scroll button */}
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/95 border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors touch-manipulation active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Right scroll button with "More" indicator */}
          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 sm:px-3 h-8 sm:h-10 rounded-full bg-eats text-white shadow-lg hover:bg-eats/90 transition-colors touch-manipulation active:scale-95"
                aria-label="Scroll right for more"
              >
                <span className="text-xs font-medium hidden sm:inline">More</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scrollable categories */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide px-1 sm:px-8 scroll-smooth"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full whitespace-nowrap transition-all touch-manipulation active:scale-95 shrink-0 ${
                  selectedCategory === category.id
                    ? "gradient-eats text-secondary-foreground shadow-lg"
                    : "glass-card hover:border-eats/50"
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span className="font-medium text-sm sm:text-base">{category.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCategory === category.id
                    ? "bg-white/20"
                    : "bg-muted"
                }`}>
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Scroll hint for mobile */}
          <div className="flex justify-center mt-3 sm:hidden">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-6 h-0.5 rounded-full bg-eats/50"></span>
              <span>Swipe for more</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Categories data
const categories = [
  { id: "all", name: "All", icon: UtensilsCrossed, count: 350 },
  { id: "fast-food", name: "Fast Food", icon: Flame, count: 150 },
  { id: "healthy", name: "Healthy", icon: Leaf, count: 89 },
  { id: "pizza", name: "Pizza", icon: Pizza, count: 67 },
  { id: "coffee", name: "Coffee & Cafe", icon: Coffee, count: 45 },
  { id: "asian", name: "Asian", icon: Soup, count: 78 },
  { id: "desserts", name: "Desserts", icon: IceCream, count: 56 },
  { id: "sandwiches", name: "Sandwiches", icon: Sandwich, count: 42 },
  { id: "seafood", name: "Seafood", icon: Fish, count: 34 },
];

// Featured restaurants
const featuredRestaurants = [
  {
    id: 1,
    name: "Burger Joint",
    cuisine: "American • Burgers",
    rating: 4.8,
    reviews: 2340,
    deliveryTime: "15-25",
    deliveryFee: "Free",
    minOrder: 15,
    image: "🍔",
    promoted: true,
    discount: "20% OFF",
    category: "fast-food",
  },
  {
    id: 2,
    name: "Sakura Sushi",
    cuisine: "Japanese • Sushi",
    rating: 4.9,
    reviews: 1890,
    deliveryTime: "25-35",
    deliveryFee: "$2.99",
    minOrder: 20,
    image: "🍣",
    promoted: false,
    category: "asian",
  },
  {
    id: 3,
    name: "Pizza Palace",
    cuisine: "Italian • Pizza",
    rating: 4.7,
    reviews: 3210,
    deliveryTime: "20-30",
    deliveryFee: "Free",
    minOrder: 12,
    image: "🍕",
    promoted: true,
    discount: "Buy 1 Get 1",
    category: "pizza",
  },
  {
    id: 4,
    name: "Taco Fiesta",
    cuisine: "Mexican • Tacos",
    rating: 4.6,
    reviews: 1560,
    deliveryTime: "15-20",
    deliveryFee: "$1.99",
    minOrder: 10,
    image: "🌮",
    promoted: false,
    category: "fast-food",
  },
  {
    id: 5,
    name: "Green Bowl",
    cuisine: "Healthy • Salads",
    rating: 4.8,
    reviews: 980,
    deliveryTime: "15-25",
    deliveryFee: "Free",
    minOrder: 15,
    image: "🥗",
    promoted: true,
    discount: "15% OFF",
    category: "healthy",
  },
  {
    id: 6,
    name: "Dragon Wok",
    cuisine: "Chinese • Noodles",
    rating: 4.5,
    reviews: 2100,
    deliveryTime: "20-30",
    deliveryFee: "$2.49",
    minOrder: 18,
    image: "🍜",
    promoted: false,
    category: "asian",
  },
  {
    id: 7,
    name: "The Coffee House",
    cuisine: "Cafe • Pastries",
    rating: 4.7,
    reviews: 1240,
    deliveryTime: "10-20",
    deliveryFee: "Free",
    minOrder: 8,
    image: "☕",
    promoted: false,
    category: "coffee",
  },
  {
    id: 8,
    name: "Sweet Dreams Bakery",
    cuisine: "Bakery • Desserts",
    rating: 4.9,
    reviews: 890,
    deliveryTime: "20-30",
    deliveryFee: "$1.99",
    minOrder: 12,
    image: "🧁",
    promoted: true,
    discount: "Free Delivery",
    category: "desserts",
  },
];

// Menu items for a sample restaurant
const menuItems = [
  { id: 1, name: "Classic Cheeseburger", price: 12.99, description: "Juicy beef patty with cheddar, lettuce, tomato", image: "🍔", popular: true },
  { id: 2, name: "Double Stack Burger", price: 16.99, description: "Two beef patties, double cheese, special sauce", image: "🍔", popular: true },
  { id: 3, name: "Crispy Chicken Sandwich", price: 11.99, description: "Breaded chicken, mayo, pickles on brioche", image: "🍗", popular: false },
  { id: 4, name: "Loaded Fries", price: 8.99, description: "Cheese, bacon, jalapeños, sour cream", image: "🍟", popular: true },
  { id: 5, name: "Onion Rings", price: 6.99, description: "Beer-battered, crispy golden rings", image: "🧅", popular: false },
  { id: 6, name: "Milkshake", price: 5.99, description: "Vanilla, chocolate, or strawberry", image: "🥤", popular: false },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

type CheckoutStep = "browse" | "cart" | "delivery" | "payment" | "confirmation";

const FoodOrdering = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof featuredRestaurants[0] | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("browse");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const filteredRestaurants = featuredRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || restaurant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = cartTotal >= 25 ? 0 : 2.99;
  const serviceFee = cartTotal * 0.05;
  const orderTotal = cartTotal + deliveryFee + serviceFee;

  const checkoutSteps = [
    { id: "cart", label: "Cart" },
    { id: "delivery", label: "Delivery" },
    { id: "payment", label: "Payment" },
  ];

  const getCurrentStepIndex = () => {
    switch (checkoutStep) {
      case "cart": return 0;
      case "delivery": return 1;
      case "payment": return 2;
      default: return 0;
    }
  };

  const handleProceedToDelivery = () => {
    setCheckoutStep("delivery");
  };

  const handleProceedToPayment = () => {
    if (!deliveryAddress) {
      toast.error("Please enter a delivery address");
      return;
    }
    setCheckoutStep("payment");
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setConfirmationNumber(`ZIVO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setCheckoutStep("confirmation");
    setIsCartOpen(false);
  };

  const handleResetOrder = () => {
    setCart([]);
    setCheckoutStep("browse");
    setSelectedRestaurant(null);
    setDeliveryAddress("");
    setDeliveryInstructions("");
    navigate("/food");
  };

  // Show confirmation screen
  if (checkoutStep === "confirmation") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BookingConfirmation
          confirmationNumber={confirmationNumber}
          title="Your order is on its way!"
          subtitle={selectedRestaurant?.name}
          details={[
            { label: "Delivery Address", value: deliveryAddress, icon: <MapPin className="w-4 h-4" /> },
            { label: "Estimated Delivery", value: "25-35 min", icon: <Clock className="w-4 h-4" /> },
            { label: "Items", value: `${cartCount} item${cartCount > 1 ? 's' : ''}`, icon: <ShoppingCart className="w-4 h-4" /> },
          ]}
          totalAmount={orderTotal}
          onGoHome={handleResetOrder}
          accentColor="eats"
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-24">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          {/* Enhanced background effects */}
          <div className="absolute inset-0 bg-gradient-radial from-eats/15 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-eats/20 to-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-eats to-orange-500 text-white text-sm font-semibold mb-6 shadow-lg shadow-eats/30"
              >
                <UtensilsCrossed className="w-4 h-4" />
                ZIVO Eats
              </motion.div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
                Delicious food,
                <br />
                <span className="bg-gradient-to-r from-eats to-orange-500 bg-clip-text text-transparent">delivered fast</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Discover the best restaurants near you. Order from thousands of local favorites.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-2xl flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 px-3 sm:px-4 text-muted-foreground">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eats/20 to-orange-500/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-eats" />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Current Location</span>
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search restaurants, cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-muted/30 border-border/50 h-14 text-base rounded-xl focus:border-eats/50"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="hidden sm:flex h-14 px-6 rounded-xl bg-gradient-to-r from-eats to-orange-500 text-white font-bold shadow-lg shadow-eats/30 hover:opacity-90 gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <CategoriesScrollSection 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Restaurant View or List */}
        {selectedRestaurant ? (
          <section className="py-8">
            <div className="container mx-auto px-4">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setSelectedRestaurant(null)}
                className="mb-6"
              >
                ← Back to restaurants
              </Button>

              {/* Restaurant Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 mb-8"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center text-5xl">
                    {selectedRestaurant.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="font-display text-2xl font-bold">{selectedRestaurant.name}</h2>
                      {selectedRestaurant.discount && (
                        <Badge className="gradient-eats">{selectedRestaurant.discount}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{selectedRestaurant.cuisine}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-eats text-eats" />
                        <span className="font-medium">{selectedRestaurant.rating}</span>
                        <span className="text-muted-foreground">({selectedRestaurant.reviews}+)</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{selectedRestaurant.deliveryTime} min</span>
                      </div>
                      <div className="text-muted-foreground">
                        {selectedRestaurant.deliveryFee} delivery
                      </div>
                      <div className="text-muted-foreground">
                        ${selectedRestaurant.minOrder} min order
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Menu */}
              <h3 className="font-display text-xl font-bold mb-4">Menu</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card hover:border-eats/50 transition-all h-full">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
                            {item.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium truncate">{item.name}</h4>
                                {item.popular && (
                                  <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>
                                )}
                              </div>
                              <span className="font-bold text-eats">${item.price}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4 hover:border-eats hover:text-eats"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Promoted Section */}
            <section className="py-8">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">Featured Deals</h2>
                  <Button variant="ghost" className="text-eats">
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredRestaurants.filter(r => r.promoted).map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      onClick={() => setSelectedRestaurant(restaurant)}
                      className="cursor-pointer"
                    >
                      <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all group">
                        <div className="relative h-36 bg-gradient-to-br from-eats/20 to-orange-500/10 flex items-center justify-center">
                          <motion.span 
                            className="text-6xl"
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {restaurant.image}
                          </motion.span>
                          {restaurant.discount && (
                            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-eats to-orange-500 text-white border-0 font-semibold shadow-lg">
                              {restaurant.discount}
                            </Badge>
                          )}
                          {/* Corner glow */}
                          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-eats to-orange-500 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity" />
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-display font-bold text-lg mb-1 group-hover:text-eats transition-colors">{restaurant.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{restaurant.cuisine}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-eats/10">
                              <Star className="w-4 h-4 fill-eats text-eats" />
                              <span className="font-semibold text-eats">{restaurant.rating}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{restaurant.deliveryTime} min</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* All Restaurants */}
            <section className="py-8">
              <div className="container mx-auto px-4">
                <h2 className="font-display text-2xl font-bold mb-6">All Restaurants</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredRestaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedRestaurant(restaurant)}
                      className="cursor-pointer"
                    >
                      <Card className="glass-card overflow-hidden hover:border-eats/50 transition-all group">
                        <div className="relative h-28 bg-muted flex items-center justify-center">
                          <span className="text-4xl group-hover:scale-110 transition-transform">
                            {restaurant.image}
                          </span>
                          {restaurant.deliveryFee === "Free" && (
                            <Badge className="absolute top-2 right-2 bg-success text-primary-foreground text-xs">
                              Free Delivery
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium">{restaurant.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{restaurant.cuisine}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-eats text-eats" />
                              <span>{restaurant.rating}</span>
                            </div>
                            <span className="text-muted-foreground">{restaurant.deliveryTime} min</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="fixed bottom-6 right-6 z-50 gradient-eats p-4 rounded-full shadow-lg flex items-center gap-3"
            >
              <ShoppingCart className="w-6 h-6 text-secondary-foreground" />
              <span className="font-bold text-secondary-foreground">${cartTotal.toFixed(2)}</span>
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full text-sm font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </motion.button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md flex flex-col">
            <SheetHeader>
              <div className="flex items-center gap-3">
                {checkoutStep !== "cart" && checkoutStep !== "browse" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCheckoutStep(checkoutStep === "delivery" ? "cart" : "delivery")}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  {checkoutStep === "delivery" ? "Delivery Details" : "Your Cart"}
                </SheetTitle>
              </div>
            </SheetHeader>

            {/* Step Indicator */}
            {(checkoutStep === "cart" || checkoutStep === "delivery" || checkoutStep === "payment") && (
              <div className="mt-4 px-2">
                <BookingStepIndicator
                  steps={checkoutSteps}
                  currentStep={getCurrentStepIndex()}
                  accentColor="eats"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto mt-6">
              <AnimatePresence mode="wait">
                {/* Cart Items View */}
                {(checkoutStep === "browse" || checkoutStep === "cart") && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 glass-card rounded-lg">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">${item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, description: "", image: item.image, popular: false })}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Delivery Details View */}
                {checkoutStep === "delivery" && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Delivery Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-eats" />
                        <Input
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter your delivery address"
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Delivery Instructions (optional)</label>
                      <Input
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="e.g., Ring doorbell, leave at door"
                      />
                    </div>
                    <Card className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-eats/20 flex items-center justify-center">
                            <Bike className="w-5 h-5 text-eats" />
                          </div>
                          <div>
                            <p className="font-medium">Standard Delivery</p>
                            <p className="text-sm text-muted-foreground">25-35 min</p>
                          </div>
                          <Badge className="ml-auto">{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary & CTA */}
            <div className="mt-auto pt-4 border-t border-border space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-green-500" : ""}>
                    {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-eats">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {(checkoutStep === "browse" || checkoutStep === "cart") && (
                <Button
                  variant="eats"
                  className="w-full h-12"
                  onClick={() => setCheckoutStep("delivery")}
                >
                  Continue to Delivery
                </Button>
              )}

              {checkoutStep === "delivery" && (
                <Button
                  variant="eats"
                  className="w-full h-12"
                  onClick={handleProceedToPayment}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Continue to Payment
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        amount={orderTotal}
        serviceName={`Order from ${selectedRestaurant?.name || "Restaurant"}`}
        serviceDetails={`${cartCount} item${cartCount > 1 ? 's' : ''} • Delivery to ${deliveryAddress}`}
        onConfirm={handleConfirmOrder}
        isProcessing={isProcessing}
        accentColor="eats"
      />

      <Footer />
    </div>
  );
};

export default FoodOrdering;
