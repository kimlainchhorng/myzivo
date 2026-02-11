// CSS animations used instead of framer-motion for performance
import { cn } from "@/lib/utils";
import { Car, UtensilsCrossed, Plane, Building2, CarTaxiFront, Pizza, type LucideIcon } from "lucide-react";

interface FloatingIconProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  size?: "sm" | "md" | "lg";
  position: string;
  delay?: number;
  duration?: number;
}

export const FloatingIcon = ({ 
  icon: Icon, 
  iconColor = "text-primary/50",
  iconBg = "from-primary/15 to-teal-400/15",
  size = "md", 
  position, 
  delay = 0,
  duration = 5 
}: FloatingIconProps) => {
  const sizes = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <div
      className={cn(
        "absolute pointer-events-none hidden md:block z-10 animate-float-icon opacity-30",
        position
      )}
      style={{ 
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`
      }}
    >
      <div className={cn("rounded-2xl bg-gradient-to-br flex items-center justify-center backdrop-blur-sm", sizes[size], iconBg)}>
        <Icon className={cn(iconSizes[size], iconColor)} />
      </div>
    </div>
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
    <div
      className={cn(
        "absolute rounded-full blur-3xl animate-orb-pulse",
        `bg-gradient-to-br ${gradient}`,
        size,
        position
      )}
      style={{ 
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`
      }}
    />
  );
};

export const defaultFloatingIcons = [
  { icon: Car, iconColor: "text-emerald-400/60", iconBg: "from-emerald-500/20 to-teal-500/20", delay: 0, position: "top-24 left-[8%]", size: "lg" as const },
  { icon: UtensilsCrossed, iconColor: "text-orange-400/60", iconBg: "from-orange-500/20 to-amber-500/20", delay: 0.5, position: "top-36 right-[12%]", size: "md" as const },
  { icon: Plane, iconColor: "text-sky-400/60", iconBg: "from-sky-500/20 to-blue-500/20", delay: 1, position: "bottom-36 left-[15%]", size: "lg" as const },
  { icon: Building2, iconColor: "text-violet-400/60", iconBg: "from-violet-500/20 to-purple-500/20", delay: 1.5, position: "bottom-24 right-[8%]", size: "md" as const },
  { icon: CarTaxiFront, iconColor: "text-yellow-400/60", iconBg: "from-yellow-500/20 to-amber-500/20", delay: 2, position: "top-1/2 left-[5%]", size: "sm" as const },
  { icon: Pizza, iconColor: "text-red-400/60", iconBg: "from-red-500/20 to-orange-500/20", delay: 2.5, position: "top-1/3 right-[5%]", size: "sm" as const },
];

export const defaultFloatingOrbs = [
  { gradient: "from-primary/30 to-teal-400/20", position: "top-1/3 right-1/3", size: "w-32 h-32", delay: 0, duration: 8 },
  { gradient: "from-eats/25 to-orange-400/15", position: "bottom-1/4 left-1/3", size: "w-40 h-40", delay: 2, duration: 10 },
  { gradient: "from-violet-500/20 to-purple-400/10", position: "top-1/4 left-1/4", size: "w-36 h-36", delay: 4, duration: 12 },
];
