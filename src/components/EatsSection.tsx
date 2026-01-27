import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Clock, Star, ChevronRight, Flame, Leaf, Pizza, Coffee } from "lucide-react";

const categories = [
  { name: "Fast Food", icon: Flame, count: 150 },
  { name: "Healthy", icon: Leaf, count: 89 },
  { name: "Pizza", icon: Pizza, count: 67 },
  { name: "Coffee", icon: Coffee, count: 45 },
];

const restaurants = [
  {
    id: 1,
    name: "Burger Joint",
    cuisine: "American • Burgers",
    rating: 4.8,
    deliveryTime: "15-25",
    deliveryFee: "Free",
    image: "🍔",
    promoted: true,
  },
  {
    id: 2,
    name: "Sakura Sushi",
    cuisine: "Japanese • Sushi",
    rating: 4.9,
    deliveryTime: "25-35",
    deliveryFee: "$2.99",
    image: "🍣",
    promoted: false,
  },
  {
    id: 3,
    name: "Pizza Palace",
    cuisine: "Italian • Pizza",
    rating: 4.7,
    deliveryTime: "20-30",
    deliveryFee: "Free",
    image: "🍕",
    promoted: true,
  },
  {
    id: 4,
    name: "Taco Fiesta",
    cuisine: "Mexican • Tacos",
    rating: 4.6,
    deliveryTime: "15-20",
    deliveryFee: "$1.99",
    image: "🌮",
    promoted: false,
  },
];

const EatsSection = () => {
  return (
    <section id="eats" className="py-20 lg:py-32 relative bg-gradient-to-b from-background via-card/50 to-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-eats/10 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 rounded-full blur-3xl" />
      
      {/* Floating food emojis */}
      <div className="absolute top-32 left-[8%] text-5xl hidden lg:block opacity-40 animate-float">🍕</div>
      <div className="absolute top-48 right-[10%] text-4xl hidden lg:block opacity-30 animate-float" style={{ animationDelay: '1s' }}>🍜</div>
      <div className="absolute bottom-32 right-[15%] text-4xl hidden lg:block opacity-30 animate-float" style={{ animationDelay: '2s' }}>🍔</div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-eats to-orange-500 text-white text-sm font-bold mb-6 shadow-xl shadow-eats/40">
            <UtensilsCrossed className="w-4 h-4" />
            ZIVO Eats
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            Hungry? We've got
            <br />
            <span className="bg-gradient-to-r from-eats via-orange-500 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">you covered</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <span className="text-foreground font-medium">Thousands of restaurants</span> at your fingertips. Order now and get it delivered in minutes.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {categories.map((category) => (
            <button
              key={category.name}
              className="flex items-center gap-3 px-5 py-3 glass-card hover:border-eats/50 transition-all group"
            >
              <category.icon className="w-5 h-5 text-eats" />
              <span className="font-medium text-foreground">{category.name}</span>
              <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Restaurant Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="glass-card overflow-hidden hover:border-eats/50 transition-all duration-300 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {/* Image Area */}
              <div className="relative h-32 bg-muted flex items-center justify-center">
                <span className="text-5xl group-hover:scale-110 transition-transform">
                  {restaurant.image}
                </span>
                {restaurant.promoted && (
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium gradient-eats text-secondary-foreground rounded-full">
                    Promoted
                  </span>
                )}
                {restaurant.deliveryFee === "Free" && (
                  <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-success text-primary-foreground rounded-full">
                    Free Delivery
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">{restaurant.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{restaurant.cuisine}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-eats text-eats" />
                    <span className="font-medium text-foreground">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.deliveryTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button variant="eats" size="lg">
            View all restaurants
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EatsSection;
