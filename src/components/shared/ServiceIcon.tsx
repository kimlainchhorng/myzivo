import { LucideIcon, Plane, Hotel, Car, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ZIVO SERVICE ICON
 * Consistent icon styling across all products
 * Use for service identification and branding
 */

export type ServiceType = "flights" | "hotels" | "cars";

const serviceConfig: Record<ServiceType, {
  icon: LucideIcon;
  bgClass: string;
  iconClass: string;
  gradient: string;
}> = {
  flights: {
    icon: Plane,
    bgClass: "bg-sky-500/10",
    iconClass: "text-sky-500",
    gradient: "from-sky-500 to-blue-600",
  },
  hotels: {
    icon: Hotel,
    bgClass: "bg-amber-500/10",
    iconClass: "text-amber-500",
    gradient: "from-amber-500 to-orange-600",
  },
  cars: {
    icon: Car,
    bgClass: "bg-violet-500/10",
    iconClass: "text-violet-500",
    gradient: "from-violet-500 to-purple-600",
  },
};

interface ServiceIconProps {
  service: ServiceType;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "gradient" | "outline";
  className?: string;
}

const sizeClasses = {
  sm: { container: "w-8 h-8 rounded-xl", icon: "w-4 h-4" },
  md: { container: "w-10 h-10 rounded-xl", icon: "w-5 h-5" },
  lg: { container: "w-12 h-12 rounded-xl", icon: "w-6 h-6" },
  xl: { container: "w-16 h-16 rounded-2xl", icon: "w-8 h-8" },
};

export function ServiceIcon({ 
  service, 
  size = "md", 
  variant = "default",
  className 
}: ServiceIconProps) {
  const config = serviceConfig[service];
  const sizes = sizeClasses[size];
  const Icon = config.icon;

  const containerClasses = cn(
    "flex items-center justify-center transition-all",
    sizes.container,
    variant === "default" && config.bgClass,
    variant === "gradient" && `bg-gradient-to-br ${config.gradient}`,
    variant === "outline" && `border-2 ${config.iconClass.replace("text-", "border-")} bg-transparent`,
    className
  );

  const iconClasses = cn(
    sizes.icon,
    variant === "gradient" ? "text-white" : config.iconClass
  );

  return (
    <div className={containerClasses}>
      <Icon className={iconClasses} />
    </div>
  );
}

// Simple icon component without container
interface SimpleServiceIconProps {
  service: ServiceType;
  className?: string;
}

export function SimpleServiceIcon({ service, className }: SimpleServiceIconProps) {
  const config = serviceConfig[service];
  const Icon = config.icon;
  
  return <Icon className={cn("w-5 h-5", config.iconClass, className)} />;
}
