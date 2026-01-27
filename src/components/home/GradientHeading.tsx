import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientHeadingProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  animate?: boolean;
}

const sizeClasses = {
  sm: "text-2xl sm:text-3xl",
  md: "text-3xl sm:text-4xl md:text-5xl",
  lg: "text-4xl sm:text-5xl md:text-6xl",
  xl: "text-5xl sm:text-6xl md:text-7xl",
  hero: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl",
};

export const GradientHeading = ({ 
  children, 
  className, 
  size = "lg",
  animate = true 
}: GradientHeadingProps) => {
  return (
    <motion.h2
      initial={animate ? { opacity: 0, y: 30 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={cn(
        "font-display font-bold tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </motion.h2>
  );
};

interface GradientTextProps {
  children: React.ReactNode;
  gradient?: "primary" | "eats" | "sky" | "violet" | "amber";
  animate?: boolean;
  className?: string;
}

const gradientClasses = {
  primary: "from-primary via-teal-400 to-primary",
  eats: "from-eats via-orange-500 to-eats",
  sky: "from-sky-500 via-blue-500 to-sky-500",
  violet: "from-violet-500 via-purple-500 to-violet-500",
  amber: "from-amber-500 via-orange-500 to-amber-500",
};

export const GradientText = ({ 
  children, 
  gradient = "primary",
  animate = true,
  className 
}: GradientTextProps) => {
  return (
    <span className={cn(
      "bg-gradient-to-r bg-clip-text text-transparent",
      gradientClasses[gradient],
      animate && "bg-[length:200%_auto] animate-gradient",
      className
    )}>
      {children}
    </span>
  );
};

interface SectionHeadingProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  className?: string;
}

export const SectionHeading = ({ 
  badge, 
  title, 
  description,
  className 
}: SectionHeadingProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("text-center mb-12 sm:mb-16", className)}
    >
      {badge && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          {badge}
        </motion.div>
      )}
      <GradientHeading size="lg">
        {title}
      </GradientHeading>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
};
