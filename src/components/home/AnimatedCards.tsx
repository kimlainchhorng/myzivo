import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: string;
  delay?: number;
}

export const PremiumCard = ({ 
  children, 
  className,
  hoverEffect = true,
  glowColor = "primary",
  delay = 0
}: PremiumCardProps) => {
  const glowClasses: Record<string, string> = {
    primary: "from-primary/20 to-teal-400/10",
    eats: "from-eats/20 to-orange-500/10",
    violet: "from-violet-500/20 to-purple-500/10",
    sky: "from-sky-500/20 to-blue-500/10",
    amber: "from-amber-500/20 to-orange-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={hoverEffect ? { y: -8, scale: 1.02 } : undefined}
      className={cn(
        "relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden",
        className
      )}
    >
      {/* Decorative glow */}
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        glowClasses[glowColor]
      )} />
      {children}
    </motion.div>
  );
};

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  shadowColor: string;
  isNew?: boolean;
  onClick?: () => void;
  delay?: number;
}

export const ServiceCard = ({
  icon: Icon,
  title,
  description,
  gradient,
  shadowColor,
  isNew,
  onClick,
  delay = 0
}: ServiceCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group text-left overflow-hidden"
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {isNew && (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-eats to-orange-500 text-white rounded-full shadow-lg"
        >
          New
        </motion.span>
      )}
      
      <motion.div 
        whileHover={{ scale: 1.15, rotate: 8 }}
        className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300",
          gradient,
          shadowColor
        )}
      >
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
      </motion.div>
      
      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </motion.button>
  );
};

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  stat?: string;
  gradient: string;
  shadowColor: string;
  delay?: number;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  stat,
  gradient,
  shadowColor,
  delay = 0
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-default"
    >
      {/* Corner glow */}
      <div className={cn(
        "absolute -top-10 -right-10 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
        `bg-gradient-to-br ${gradient}`
      )} />

      {/* Stat badge */}
      {stat && (
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
          <span className={cn(
            "text-sm font-bold px-3 py-1 rounded-full text-white shadow-lg",
            `bg-gradient-to-r ${gradient}`
          )}>
            {stat}
          </span>
        </div>
      )}

      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
        className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg",
          `bg-gradient-to-br ${gradient}`,
          shadowColor
        )}
      >
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
      </motion.div>
      
      <h3 className="font-display text-xl sm:text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};
