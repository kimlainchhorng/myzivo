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
  RefreshCcw,
  Plus,
  ArrowRight,
  Sparkles
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
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: React.ElementType;
  defaultTitle: string;
  defaultDescription: string;
  iconBg: string;
  iconColor: string;
  gradient: string;
}> = {
  search: {
    icon: Search,
    defaultTitle: "No results found",
    defaultDescription: "Try adjusting your search or filters",
    iconBg: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    gradient: "from-primary/10 to-teal-500/5",
  },
  location: {
    icon: MapPin,
    defaultTitle: "No locations found",
    defaultDescription: "We couldn't find any locations matching your criteria",
    iconBg: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    gradient: "from-emerald-500/10 to-green-500/5",
  },
  booking: {
    icon: Calendar,
    defaultTitle: "No bookings yet",
    defaultDescription: "Your bookings will appear here once you make a reservation",
    iconBg: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    gradient: "from-amber-500/10 to-orange-500/5",
  },
  orders: {
    icon: Package,
    defaultTitle: "No orders yet",
    defaultDescription: "Your orders will appear here",
    iconBg: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    gradient: "from-blue-500/10 to-indigo-500/5",
  },
  cart: {
    icon: ShoppingBag,
    defaultTitle: "Your cart is empty",
    defaultDescription: "Add items to get started",
    iconBg: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-500",
    gradient: "from-pink-500/10 to-rose-500/5",
  },
  flights: {
    icon: Plane,
    defaultTitle: "No flights found",
    defaultDescription: "Try adjusting your search dates or destinations",
    iconBg: "from-sky-500/20 to-sky-500/5",
    iconColor: "text-sky-500",
    gradient: "from-sky-500/10 to-blue-500/5",
  },
  cars: {
    icon: Car,
    defaultTitle: "No cars available",
    defaultDescription: "Try different dates or locations",
    iconBg: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    gradient: "from-primary/10 to-teal-500/5",
  },
  hotels: {
    icon: Hotel,
    defaultTitle: "No hotels found",
    defaultDescription: "Adjust your filters to see more options",
    iconBg: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    gradient: "from-amber-500/10 to-orange-500/5",
  },
  food: {
    icon: Utensils,
    defaultTitle: "No restaurants nearby",
    defaultDescription: "Check back later or try a different location",
    iconBg: "from-eats/20 to-eats/5",
    iconColor: "text-eats",
    gradient: "from-eats/10 to-orange-500/5",
  },
  error: {
    icon: AlertCircle,
    defaultTitle: "Something went wrong",
    defaultDescription: "We're having trouble loading this content",
    iconBg: "from-red-500/20 to-red-500/5",
    iconColor: "text-red-500",
    gradient: "from-red-500/10 to-rose-500/5",
  },
  inbox: {
    icon: Inbox,
    defaultTitle: "No messages",
    defaultDescription: "You're all caught up!",
    iconBg: "from-indigo-500/20 to-indigo-500/5",
    iconColor: "text-indigo-500",
    gradient: "from-indigo-500/10 to-violet-500/5",
  },
  default: {
    icon: FileQuestion,
    defaultTitle: "Nothing here yet",
    defaultDescription: "Content will appear here when available",
    iconBg: "from-muted to-muted/50",
    iconColor: "text-muted-foreground",
    gradient: "from-muted/30 to-muted/10",
  }
};

const sizeClasses = {
  sm: {
    container: "py-8 px-4",
    icon: "w-10 h-10",
    iconWrapper: "w-16 h-16",
    title: "text-base",
    description: "text-sm",
    button: "h-9 text-sm",
  },
  md: {
    container: "py-12 px-6",
    icon: "w-12 h-12",
    iconWrapper: "w-20 h-20",
    title: "text-lg",
    description: "text-sm",
    button: "h-10",
  },
  lg: {
    container: "py-16 px-8",
    icon: "w-14 h-14",
    iconWrapper: "w-24 h-24",
    title: "text-xl",
    description: "text-base",
    button: "h-12",
  },
};

export const EmptyState = ({
  variant = "default",
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
  animated = true,
}: EmptyStateProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const sizeConfig = sizeClasses[size];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const content = (
    <div className="relative">
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 rounded-3xl bg-gradient-to-br pointer-events-none",
        config.gradient
      )} />
      
      <div className={cn(
        "flex flex-col items-center justify-center text-center relative",
        sizeConfig.container,
        className
      )}>
        {/* Icon with floating animation */}
        <motion.div
          initial={animated ? { scale: 0, rotate: -180 } : false}
          animate={animated ? { scale: 1, rotate: 0 } : false}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative mb-6"
        >
          {/* Glow effect */}
          <div className={cn(
            "absolute inset-0 rounded-3xl blur-xl opacity-50 bg-gradient-to-br",
            config.iconBg
          )} />
          
          <motion.div
            animate={animated ? { 
              y: [0, -6, 0],
            } : false}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className={cn(
              "rounded-3xl flex items-center justify-center relative shadow-lg",
              "bg-gradient-to-br border border-border/30",
              sizeConfig.iconWrapper,
              config.iconBg
            )}
          >
            <Icon className={cn(sizeConfig.icon, config.iconColor)} />
            
            {/* Sparkle decoration */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className={cn("w-5 h-5 opacity-60", config.iconColor)} />
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Title */}
        <motion.h3
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.2 }}
          className={cn("font-bold mb-2", sizeConfig.title)}
        >
          {title || config.defaultTitle}
        </motion.h3>
        
        {/* Description */}
        <motion.p
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.25 }}
          className={cn("text-muted-foreground max-w-xs mb-6", sizeConfig.description)}
        >
          {description || config.defaultDescription}
        </motion.p>
        
        {/* Actions */}
        {(action || secondaryAction) && (
          <motion.div
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={animated ? { opacity: 1, y: 0 } : false}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            {action && (
              <Button 
                onClick={action.onClick} 
                className={cn(
                  "rounded-xl font-semibold gap-2 shadow-lg",
                  sizeConfig.button
                )}
              >
                {action.icon || <Plus className="w-4 h-4" />}
                {action.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {secondaryAction && (
              <Button 
                variant="outline"
                onClick={secondaryAction.onClick} 
                className={cn(
                  "rounded-xl font-medium gap-2",
                  sizeConfig.button
                )}
              >
                <RefreshCcw className="w-4 h-4" />
                {secondaryAction.label}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Inline Empty State for smaller contexts
interface InlineEmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const InlineEmptyState = ({
  icon,
  message,
  action,
  className,
}: InlineEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-center justify-center gap-3 py-6 px-4 text-muted-foreground",
        className
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="text-sm">{message}</span>
      {action && (
        <Button 
          variant="link" 
          size="sm" 
          onClick={action.onClick}
          className="text-primary font-medium p-0 h-auto"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
