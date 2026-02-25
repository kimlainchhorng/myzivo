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
  TrendingUp,
  Sparkles,
  ChevronRight,
  Percent
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
  variant?: "default" | "compact" | "featured" | "minimal";
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
  const [imageLoaded, setImageLoaded] = useState(true);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "fast-food": return <Flame className="w-3 h-3" />;
      case "healthy": return <Leaf className="w-3 h-3" />;
      default: return null;
    }
  };

  const isFreeDelivery = restaurant.deliveryFee === "Free" || restaurant.deliveryFee === "0";

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className="cursor-pointer"
      >
        <Card className={cn(
          "overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-lg transition-all duration-300 h-full group",
          isHovered && "shadow-xl shadow-eats/10 -translate-y-1 ring-1 ring-eats/20"
        )}>
          <div className="relative h-44 bg-gradient-to-br from-eats/10 via-orange-500/10 to-red-500/10 flex items-center justify-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute w-32 h-32 -top-10 -right-10 bg-eats/20 rounded-full blur-2xl" />
              <div className="absolute w-24 h-24 -bottom-8 -left-8 bg-orange-500/20 rounded-full blur-xl" />
            </div>
            
            <motion.span 
              className="text-7xl relative z-10 drop-shadow-lg"
              animate={{ 
                scale: isHovered ? 1.15 : 1, 
                rotate: isHovered ? [0, -5, 5, 0] : 0 
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {restaurant.image}
            </motion.span>
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {restaurant.discount && (
                <Badge className="bg-gradient-to-r from-eats to-orange-500 text-white border-0 shadow-lg font-bold">
                  <Percent className="w-3 h-3 mr-1" />
                  {restaurant.discount}
                </Badge>
              )}
              {restaurant.isNew && (
                <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New
                </Badge>
              )}
              {restaurant.promoted && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-[10px]">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Promoted
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            {onFavorite && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(restaurant.id);
                }}
                className={cn(
                  "absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg",
                  isFavorited 
                    ? "bg-red-500 text-white" 
                    : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:text-red-500"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
              </motion.button>
            )}

            {/* Bottom Info Pills */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg"
              >
                <Timer className="w-3.5 h-3.5 text-eats" />
                {restaurant.deliveryTime} min
              </motion.div>
              {isFreeDelivery && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 bg-emerald-500 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-lg"
                >
                  <Bike className="w-3.5 h-3.5" />
                  Free Delivery
                </motion.div>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="font-bold text-lg leading-tight truncate group-hover:text-eats transition-colors">{restaurant.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{restaurant.cuisine}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-eats/10 px-2.5 py-1.5 rounded-xl shrink-0">
                <Star className="w-4 h-4 fill-eats text-eats" />
                <span className="font-bold">{restaurant.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium">({restaurant.reviews.toLocaleString()}+ reviews)</span>
              {restaurant.minOrder && (
                <>
                  <span>•</span>
                  <span>${restaurant.minOrder} min order</span>
                </>
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
        transition={{ delay: index * 0.04 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className={cn(
          "flex items-center gap-4 p-3 rounded-2xl transition-all duration-200",
          "bg-card border border-border/50 shadow-sm",
          isHovered && "border-eats/30 bg-eats/5 shadow-md"
        )}>
          <motion.div 
            className="w-16 h-16 rounded-xl bg-gradient-to-br from-eats/10 to-orange-500/10 flex items-center justify-center text-3xl shrink-0 shadow-inner"
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            {restaurant.image}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold truncate">{restaurant.name}</h4>
              {restaurant.promoted && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-0">Ad</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{restaurant.cuisine}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-eats text-eats" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {restaurant.deliveryTime} min
              </div>
              {isFreeDelivery && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-emerald-600 font-medium">Free Delivery</span>
                </>
              )}
            </div>
          </div>
          {restaurant.discount && (
            <Badge className="bg-gradient-to-r from-eats to-orange-500 text-white border-0 shrink-0 text-xs font-bold">
              {restaurant.discount}
            </Badge>
          )}
          <ChevronRight className={cn(
            "w-5 h-5 text-muted-foreground transition-all",
            isHovered && "text-eats translate-x-0.5"
          )} />
        </div>
      </motion.div>
    );
  }

  if (variant === "minimal") {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors text-center"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-eats/10 to-orange-500/10 flex items-center justify-center text-2xl">
          {restaurant.image}
        </div>
        <div>
          <p className="text-sm font-medium truncate max-w-[80px]">{restaurant.name}</p>
          <p className="text-xs text-muted-foreground">{restaurant.deliveryTime} min</p>
        </div>
      </motion.button>
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
        "overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-md transition-all duration-300 group",
        isHovered && "shadow-lg shadow-eats/10 ring-1 ring-eats/20"
      )}>
        <div className="relative h-32 bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
          <motion.span 
            className="text-5xl"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {restaurant.image}
          </motion.span>

          {isFreeDelivery && (
            <Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] border-0 shadow-md">
              <Bike className="w-3 h-3 mr-1" />
              Free
            </Badge>
          )}

          {restaurant.promoted && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] border-0 shadow-md">
              <TrendingUp className="w-3 h-3 mr-1" />
              Ad
            </Badge>
          )}

          {onFavorite && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(restaurant.id);
              }}
              className={cn(
                "absolute bottom-2 right-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md touch-manipulation",
                isFavorited 
                  ? "bg-red-500 text-white" 
                  : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:text-red-500"
              )}
            >
              <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
            </motion.button>
          )}

          {restaurant.discount && (
            <Badge className="absolute bottom-2 left-2 bg-gradient-to-r from-eats to-orange-500 text-white text-[10px] border-0 shadow-md font-bold">
              {restaurant.discount}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold truncate group-hover:text-eats transition-all duration-200">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground truncate mb-2">{restaurant.cuisine}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-eats text-eats" />
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-muted-foreground text-xs">({restaurant.reviews}+)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{restaurant.deliveryTime} min</span>
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
    <Card className="border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-eats to-orange-500" />
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-eats/10 to-orange-500/10 flex items-center justify-center text-3xl shadow-inner">
              {restaurantImage}
            </div>
            <div>
              <h3 className="font-bold text-lg">{restaurantName}</h3>
              <p className="text-xs text-muted-foreground">Order #{orderNumber}</p>
            </div>
          </div>
          {orderStatus.estimatedTime && (
            <div className="text-right">
              <motion.p 
                className="text-3xl font-bold text-eats"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
              >
                {orderStatus.estimatedTime}
              </motion.p>
              <p className="text-xs text-muted-foreground">min left</p>
            </div>
          )}
        </div>

        {/* Status Progress */}
        <div className="relative mb-5">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    scale: index === currentIndex ? 1.2 : 1,
                  }}
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-md transition-colors",
                    index <= currentIndex 
                      ? "bg-gradient-to-br from-eats to-orange-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.icon}
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-2 font-medium",
                  index <= currentIndex ? "text-eats" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Line */}
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-muted -z-0">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-eats to-orange-500 rounded-full"
            />
          </div>
        </div>

        {/* Driver Info */}
        {orderStatus.driverName && (orderStatus.status === "picked_up" || orderStatus.status === "on_way") && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-4 border border-border/50"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-eats/20 to-orange-500/20 flex items-center justify-center">
              <Bike className="w-5 h-5 text-eats" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{orderStatus.driverName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{orderStatus.driverRating}</span>
                <span>• Delivering your order</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              Contact
            </Button>
          </motion.div>
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
          <span className="font-bold text-xl">${totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumRestaurantCard;
