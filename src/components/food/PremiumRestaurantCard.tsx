import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Clock, 
  MapPin,
  Heart,
  Flame,
  Leaf,
  Award,
  Bike,
  Timer,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: string;
  minOrder?: number;
  image: string;
  promoted?: boolean;
  discount?: string;
  category?: string;
  distance?: string;
  isNew?: boolean;
  isFavorite?: boolean;
}

interface PremiumRestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
  onFavorite?: (id: number) => void;
  isFavorited?: boolean;
  variant?: "default" | "compact" | "featured";
  index?: number;
}

export const PremiumRestaurantCard = ({ 
  restaurant, 
  onClick, 
  onFavorite,
  isFavorited = false,
  variant = "default",
  index = 0
}: PremiumRestaurantCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "fast-food": return <Flame className="w-3 h-3" />;
      case "healthy": return <Leaf className="w-3 h-3" />;
      default: return null;
    }
  };

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className="cursor-pointer"
      >
        <Card className={cn(
          "glass-card overflow-hidden transition-all duration-300 h-full",
          isHovered && "border-eats/50 shadow-lg shadow-eats/10 -translate-y-1"
        )}>
          <div className="relative h-40 bg-gradient-to-br from-eats/20 to-orange-500/20 flex items-center justify-center">
            <motion.span 
              className="text-6xl"
              animate={{ scale: isHovered ? 1.15 : 1, rotate: isHovered ? 5 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {restaurant.image}
            </motion.span>
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {restaurant.discount && (
                <Badge className="gradient-eats shadow-lg">
                  {restaurant.discount}
                </Badge>
              )}
              {restaurant.isNew && (
                <Badge className="bg-purple-500 text-white shadow-lg">
                  <Award className="w-3 h-3 mr-1" />
                  New
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            {onFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(restaurant.id);
                }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <Heart className={cn(
                  "w-4 h-4 transition-colors",
                  isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )} />
              </button>
            )}

            {/* Delivery Info Pill */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between">
              <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium">
                <Timer className="w-3 h-3 text-eats" />
                {restaurant.deliveryTime} min
              </div>
              {restaurant.deliveryFee === "Free" && (
                <div className="flex items-center gap-1 bg-green-500/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white">
                  <Bike className="w-3 h-3" />
                  Free
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-display font-bold text-lg leading-tight">{restaurant.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{restaurant.cuisine}</p>
              </div>
              <div className="flex items-center gap-1 bg-eats/20 px-2 py-1 rounded-lg shrink-0">
                <Star className="w-3.5 h-3.5 fill-eats text-eats" />
                <span className="text-sm font-semibold">{restaurant.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>({restaurant.reviews}+ reviews)</span>
              {restaurant.minOrder && (
                <span>${restaurant.minOrder} min</span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className={cn(
          "flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
          "bg-card border border-border/50",
          isHovered && "border-eats/50 bg-eats/5"
        )}>
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
            {restaurant.image}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{restaurant.name}</h4>
              {restaurant.promoted && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Ad</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{restaurant.cuisine}</p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-eats text-eats" />
                <span className="font-medium">{restaurant.rating}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{restaurant.deliveryTime} min</span>
            </div>
          </div>
          {restaurant.discount && (
            <Badge className="gradient-eats shrink-0 text-xs">
              {restaurant.discount}
            </Badge>
          )}
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={cn(
        "glass-card overflow-hidden transition-all duration-300",
        isHovered && "border-eats/50 shadow-lg shadow-eats/10"
      )}>
        <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <motion.span 
            className="text-5xl"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {restaurant.image}
          </motion.span>

          {restaurant.deliveryFee === "Free" && (
            <Badge className="absolute top-2 right-2 bg-green-500/90 text-white text-[10px]">
              Free Delivery
            </Badge>
          )}

          {restaurant.promoted && (
            <Badge className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px]">
              <TrendingUp className="w-2.5 h-2.5 mr-1" />
              Promoted
            </Badge>
          )}

          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(restaurant.id);
              }}
              className={cn(
                "absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isFavorited 
                  ? "bg-red-500 text-white" 
                  : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
            </button>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground truncate mb-2">{restaurant.cuisine}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-eats text-eats" />
              <span className="font-medium">{restaurant.rating}</span>
              <span className="text-muted-foreground text-xs">({restaurant.reviews}+)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{restaurant.deliveryTime} min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Order Tracking Card Component
interface OrderStatus {
  step: number;
  status: "preparing" | "ready" | "picked_up" | "on_way" | "delivered";
  estimatedTime?: number;
  driverName?: string;
  driverRating?: number;
}

interface OrderTrackingCardProps {
  orderNumber: string;
  restaurantName: string;
  restaurantImage: string;
  orderStatus: OrderStatus;
  items: { name: string; quantity: number }[];
  totalAmount: number;
}

export const OrderTrackingCard = ({
  orderNumber,
  restaurantName,
  restaurantImage,
  orderStatus,
  items,
  totalAmount
}: OrderTrackingCardProps) => {
  const statusSteps = [
    { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
    { key: "ready", label: "Ready", icon: "✅" },
    { key: "picked_up", label: "Picked Up", icon: "🏍️" },
    { key: "on_way", label: "On the Way", icon: "🚴" },
    { key: "delivered", label: "Delivered", icon: "🎉" },
  ];

  const currentIndex = statusSteps.findIndex(s => s.key === orderStatus.status);

  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {restaurantImage}
            </div>
            <div>
              <h3 className="font-semibold">{restaurantName}</h3>
              <p className="text-xs text-muted-foreground">Order #{orderNumber}</p>
            </div>
          </div>
          {orderStatus.estimatedTime && (
            <div className="text-right">
              <p className="text-2xl font-bold text-eats">{orderStatus.estimatedTime}</p>
              <p className="text-xs text-muted-foreground">min left</p>
            </div>
          )}
        </div>

        {/* Status Progress */}
        <div className="relative mb-4">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    scale: index === currentIndex ? 1.2 : 1,
                    backgroundColor: index <= currentIndex ? "hsl(var(--eats))" : "hsl(var(--muted))"
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                    index <= currentIndex ? "text-white" : "text-muted-foreground"
                  )}
                >
                  {step.icon}
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-1.5 font-medium",
                  index <= currentIndex ? "text-eats" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-0">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-eats"
            />
          </div>
        </div>

        {/* Driver Info */}
        {orderStatus.driverName && (orderStatus.status === "picked_up" || orderStatus.status === "on_way") && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-eats/20 flex items-center justify-center">
              <Bike className="w-5 h-5 text-eats" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{orderStatus.driverName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{orderStatus.driverRating}</span>
                <span>• Delivering your order</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              Contact
            </Button>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-1.5 text-sm">
          {items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex justify-between text-muted-foreground">
              <span>{item.quantity}× {item.name}</span>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-xs text-muted-foreground">+{items.length - 3} more items</p>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumRestaurantCard;
