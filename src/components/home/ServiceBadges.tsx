import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceBadgeProps {
  icon: LucideIcon;
  label: string;
  value: string;
  gradient: string;
  delay?: number;
}

export const ServiceBadge = ({ icon: Icon, label, value, gradient, delay = 0 }: ServiceBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl flex items-center gap-3"
    >
      <div className={cn(
        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
        gradient
      )}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
};

interface FeaturePillProps {
  icon: LucideIcon;
  text: string;
  gradient: string;
  delay?: number;
}

export const FeaturePill = ({ icon: Icon, text, gradient, delay = 0 }: FeaturePillProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring" }}
      whileHover={{ scale: 1.08, y: -3 }}
      className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all backdrop-blur-sm"
    >
      <div className={cn(
        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg",
        gradient
      )}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-semibold text-foreground">{text}</span>
    </motion.div>
  );
};

interface StatBadgeProps {
  value: string;
  label: string;
  icon: LucideIcon;
  delay?: number;
}

export const StatBadge = ({ value, label, icon: Icon, delay = 0 }: StatBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/30"
    >
      <Icon className="w-5 h-5 text-primary" />
      <div>
        <p className="font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
};

interface AnimatedBadgeProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const AnimatedBadge = ({ children, className, animate = true }: AnimatedBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring" }}
      whileHover={animate ? { scale: 1.05 } : undefined}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold shadow-lg shadow-primary/10 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
