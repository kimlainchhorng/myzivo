import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Filter,
  ChevronRight,
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
  UtensilsCrossed
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";

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

const FoodOrdering = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof featuredRestaurants[0] | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-24">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-eats/10 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-eats text-secondary-foreground text-sm font-medium mb-6">
                <UtensilsCrossed className="w-4 h-4" />
                ZIVO Eats
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Delicious food,
                <br />
                <span className="text-gradient-eats">delivered fast</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Discover the best restaurants near you. Order from thousands of local favorites.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card p-2 flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-eats" />
                  <span className="text-sm hidden sm:inline">Current Location</span>
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search restaurants, cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-none h-12"
                  />
                </div>
                <Button variant="eats" size="lg" className="hidden sm:flex">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? "gradient-eats text-secondary-foreground"
                      : "glass-card hover:border-eats/50"
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span className="font-medium">{category.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === category.id
                      ? "bg-white/20"
                      : "bg-muted"
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

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
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredRestaurants.filter(r => r.promoted).map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedRestaurant(restaurant)}
                      className="cursor-pointer"
                    >
                      <Card className="glass-card overflow-hidden hover:border-eats/50 transition-all group">
                        <div className="relative h-32 bg-gradient-to-br from-eats/20 to-transparent flex items-center justify-center">
                          <span className="text-5xl group-hover:scale-110 transition-transform">
                            {restaurant.image}
                          </span>
                          {restaurant.discount && (
                            <Badge className="absolute top-3 left-3 gradient-eats">
                              {restaurant.discount}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-display font-semibold text-lg">{restaurant.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{restaurant.cuisine}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-eats text-eats" />
                              <span className="font-medium">{restaurant.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{restaurant.deliveryTime} min</span>
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
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Cart
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
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
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span className="text-eats">${cartTotal.toFixed(2)}</span>
              </div>
              <Button variant="eats" className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <Footer />
    </div>
  );
};

export default FoodOrdering;
