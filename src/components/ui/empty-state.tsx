import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  ShoppingBag, 
  Plane, 
  Car, 
  Hotel, 
  Utensils,
  AlertCircle,
  Inbox,
  FileQuestion,
  RefreshCcw
} from "lucide-react";

type EmptyStateVariant = 
  | "search" 
  | "location" 
  | "booking" 
  | "orders" 
  | "cart"
  | "flights"
  | "cars"
  | "hotels"
  | "food"
  | "error"
  | "inbox"
  | "default";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const variantConfig: Record<EmptyStateVariant, {
  icon: React.ElementType;
  defaultTitle: string;
  defaultDescription: string;
  iconBg: string;
  iconColor: string;
}> = {
  search: {
    icon: Search,
    defaultTitle: "No results found",
    defaultDescription: "Try adjusting your search or filters",
    iconBg: "from-primary/20 to-primary/5",
    iconColor: "text-primary"
  },
  location: {
    icon: MapPin,
    defaultTitle: "No locations found",
    defaultDescription: "We couldn't find any locations matching your criteria",
    iconBg: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500"
  },
  booking: {
    icon: Calendar,
    defaultTitle: "No bookings yet",
    defaultDescription: "Your bookings will appear here once you make a reservation",
    iconBg: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500"
  },
  orders: {
    icon: Package,
    defaultTitle: "No orders yet",
    defaultDescription: "Your orders will appear here",
    iconBg: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500"
  },
  cart: {
    icon: ShoppingBag,
    defaultTitle: "Your cart is empty",
    defaultDescription: "Add items to get started",
    iconBg: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-500"
  },
  flights: {
    icon: Plane,
    defaultTitle: "No flights found",
    defaultDescription: "Try adjusting your search dates or destinations",
    iconBg: "from-sky-500/20 to-sky-500/5",
    iconColor: "text-sky-500"
  },
  cars: {
    icon: Car,
    defaultTitle: "No cars available",
    defaultDescription: "Try different dates or locations",
    iconBg: "from-primary/20 to-primary/5",
    iconColor: "text-primary"
  },
  hotels: {
    icon: Hotel,
    defaultTitle: "No hotels found",
    defaultDescription: "Adjust your filters to see more options",
    iconBg: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500"
  },
  food: {
    icon: Utensils,
    defaultTitle: "No restaurants nearby",
    defaultDescription: "Check back later or try a different location",
    iconBg: "from-eats/20 to-eats/5",
    iconColor: "text-eats"
  },
  error: {
    icon: AlertCircle,
    defaultTitle: "Something went wrong",
    defaultDescription: "We're having trouble loading this content",
    iconBg: "from-red-500/20 to-red-500/5",
    iconColor: "text-red-500"
  },
  inbox: {
    icon: Inbox,
    defaultTitle: "No messages",
    defaultDescription: "You're all caught up!",
    iconBg: "from-indigo-500/20 to-indigo-500/5",
    iconColor: "text-indigo-500"
  },
  default: {
    icon: FileQuestion,
    defaultTitle: "Nothing here yet",
    defaultDescription: "Content will appear here when available",
    iconBg: "from-muted to-muted/50",
    iconColor: "text-muted-foreground"
  }
};

const sizeClasses = {
  sm: {
    container: "py-8 px-4",
    icon: "w-12 h-12",
    iconWrapper: "w-16 h-16",
    title: "text-base",
    description: "text-sm",
  },
  md: {
    container: "py-12 px-6",
    icon: "w-14 h-14",
    iconWrapper: "w-20 h-20",
    title: "text-lg",
    description: "text-sm",
  },
  lg: {
    container: "py-16 px-8",
    icon: "w-16 h-16",
    iconWrapper: "w-24 h-24",
    title: "text-xl",
    description: "text-base",
  },
};

export const EmptyState = ({
  variant = "default",
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const sizeConfig = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeConfig.container,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className={cn(
          "rounded-3xl flex items-center justify-center mb-5",
          "bg-gradient-to-br",
          sizeConfig.iconWrapper,
          config.iconBg
        )}
      >
        <Icon className={cn(sizeConfig.icon, config.iconColor)} />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn("font-bold mb-2", sizeConfig.title)}
      >
        {title || config.defaultTitle}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={cn("text-muted-foreground max-w-sm mb-5", sizeConfig.description)}
      >
        {description || config.defaultDescription}
      </motion.p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button onClick={action.onClick} className="rounded-xl">
            <RefreshCcw className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
