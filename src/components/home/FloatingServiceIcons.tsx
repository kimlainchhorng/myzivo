import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingIconProps {
  emoji: string;
  size?: "sm" | "md" | "lg";
  position: string;
  delay?: number;
  duration?: number;
}

export const FloatingIcon = ({ 
  emoji, 
  size = "md", 
  position, 
  delay = 0,
  duration = 5 
}: FloatingIconProps) => {
  const sizes = {
    sm: "text-2xl sm:text-3xl",
    md: "text-3xl sm:text-4xl",
    lg: "text-4xl sm:text-5xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3], 
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        delay,
        duration,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className={cn(
        "absolute pointer-events-none hidden md:block z-10 drop-shadow-lg",
        sizes[size],
        position
      )}
    >
      {emoji}
    </motion.div>
  );
};

interface FloatingOrbProps {
  gradient: string;
  position: string;
  size: string;
  delay?: number;
  duration?: number;
}

export const FloatingOrb = ({
  gradient,
  position,
  size,
  delay = 0,
  duration = 8,
}: FloatingOrbProps) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1], 
        opacity: [0.2, 0.4, 0.2] 
      }}
      transition={{ 
        duration, 
        repeat: Infinity,
        delay 
      }}
      className={cn(
        "absolute rounded-full blur-3xl",
        `bg-gradient-to-br ${gradient}`,
        size,
        position
      )}
    />
  );
};

export const defaultFloatingIcons = [
  { emoji: "🚗", delay: 0, position: "top-24 left-[8%]", size: "lg" as const },
  { emoji: "🍔", delay: 0.5, position: "top-36 right-[12%]", size: "md" as const },
  { emoji: "✈️", delay: 1, position: "bottom-36 left-[15%]", size: "lg" as const },
  { emoji: "🏨", delay: 1.5, position: "bottom-24 right-[8%]", size: "md" as const },
  { emoji: "🚕", delay: 2, position: "top-1/2 left-[5%]", size: "sm" as const },
  { emoji: "🍕", delay: 2.5, position: "top-1/3 right-[5%]", size: "sm" as const },
];

export const defaultFloatingOrbs = [
  { gradient: "from-primary/30 to-teal-400/20", position: "top-1/3 right-1/3", size: "w-32 h-32", delay: 0, duration: 8 },
  { gradient: "from-eats/25 to-orange-400/15", position: "bottom-1/4 left-1/3", size: "w-40 h-40", delay: 2, duration: 10 },
  { gradient: "from-violet-500/20 to-purple-400/10", position: "top-1/4 left-1/4", size: "w-36 h-36", delay: 4, duration: 12 },
];
