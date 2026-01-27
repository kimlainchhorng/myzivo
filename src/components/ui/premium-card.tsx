import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface PremiumCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: "glass" | "gradient" | "solid" | "outline";
  glowColor?: "rides" | "eats" | "sky" | "amber" | "primary";
  hover?: "lift" | "glow" | "scale" | "border" | "none";
  size?: "sm" | "md" | "lg";
}

const glowColors = {
  rides: "hover:shadow-[0_0_40px_-10px_hsl(var(--rides)/0.5)]",
  eats: "hover:shadow-[0_0_40px_-10px_hsl(var(--eats)/0.5)]",
  sky: "hover:shadow-[0_0_40px_-10px_rgb(56,189,248,0.5)]",
  amber: "hover:shadow-[0_0_40px_-10px_rgb(251,191,36,0.5)]",
  primary: "hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)]",
};

const borderColors = {
  rides: "hover:border-rides/50",
  eats: "hover:border-eats/50",
  sky: "hover:border-sky-400/50",
  amber: "hover:border-amber-400/50",
  primary: "hover:border-primary/50",
};

const sizes = {
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ 
    className, 
    children, 
    variant = "glass", 
    glowColor = "primary",
    hover = "lift",
    size = "md",
    ...props 
  }, ref) => {
    const baseStyles = "relative rounded-2xl overflow-hidden transition-all duration-300";
    
    const variantStyles = {
      glass: "glass-card backdrop-blur-xl border border-white/10",
      gradient: "bg-gradient-to-br from-card to-card/80 border border-white/5",
      solid: "bg-card border border-border",
      outline: "bg-transparent border-2 border-white/10",
    };

    const hoverStyles = {
      lift: "hover:-translate-y-1",
      glow: glowColors[glowColor],
      scale: "hover:scale-[1.02]",
      border: borderColors[glowColor],
      none: "",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          hoverStyles[hover],
          sizes[size],
          className
        )}
        whileHover={{ scale: hover === "scale" ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

// Animated Stat Card
interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  color?: "rides" | "eats" | "sky" | "amber" | "primary";
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  trend,
  color = "primary",
}) => {
  const colorClasses = {
    rides: "text-rides bg-rides/10",
    eats: "text-eats bg-eats/10",
    sky: "text-sky-400 bg-sky-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    primary: "text-primary bg-primary/10",
  };

  return (
    <PremiumCard hover="glow" glowColor={color} size="md">
      <div className="flex items-start justify-between">
        {icon && (
          <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
            {icon}
          </div>
        )}
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trend.positive 
              ? "text-green-400 bg-green-500/10" 
              : "text-red-400 bg-red-500/10"
          )}>
            {trend.positive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <motion.p 
          className="text-3xl sm:text-4xl font-bold font-display"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        >
          {value}
        </motion.p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </PremiumCard>
  );
};

// Quick Action Button
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  color?: "rides" | "eats" | "sky" | "amber" | "primary";
  badge?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  description,
  onClick,
  color = "primary",
  badge,
}) => {
  const gradientClasses = {
    rides: "from-rides to-rides/80",
    eats: "from-eats to-eats/80",
    sky: "from-sky-500 to-sky-600",
    amber: "from-amber-500 to-amber-600",
    primary: "from-primary to-accent",
  };

  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center gap-4 p-4 glass-card rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 w-full text-left group"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
        gradientClasses[color]
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {label}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {badge && (
        <span className="px-2 py-1 text-xs font-semibold bg-eats/10 text-eats rounded-full">
          {badge}
        </span>
      )}
    </motion.button>
  );
};
