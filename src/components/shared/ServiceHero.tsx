import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type ServiceType = "flights" | "hotels" | "cars" | "rides" | "eats" | "extras";

interface ServiceHeroProps {
  service: ServiceType;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  image?: string;
  children?: ReactNode;
  compact?: boolean;
}

const serviceColors: Record<ServiceType, { 
  gradient: string; 
  iconBg: string; 
  iconColor: string;
}> = {
  flights: {
    gradient: "from-slate-950/90 via-blue-950/80 to-slate-950/70",
    iconBg: "bg-sky-500/30 shadow-sky-500/30",
    iconColor: "text-sky-300",
  },
  hotels: {
    gradient: "from-slate-950/90 via-amber-950/70 to-slate-950/60",
    iconBg: "bg-amber-500/30 shadow-amber-500/30",
    iconColor: "text-amber-300",
  },
  cars: {
    gradient: "from-slate-950/90 via-violet-950/70 to-slate-950/60",
    iconBg: "bg-violet-500/30 shadow-violet-500/30",
    iconColor: "text-violet-300",
  },
  rides: {
    gradient: "from-slate-950/90 via-emerald-950/70 to-slate-950/60",
    iconBg: "bg-emerald-500/30 shadow-emerald-500/30",
    iconColor: "text-emerald-300",
  },
  eats: {
    gradient: "from-slate-950/90 via-orange-950/70 to-slate-950/60",
    iconBg: "bg-orange-500/30 shadow-orange-500/30",
    iconColor: "text-orange-300",
  },
  extras: {
    gradient: "from-slate-950/90 via-pink-950/70 to-slate-950/60",
    iconBg: "bg-pink-500/30 shadow-pink-500/30",
    iconColor: "text-pink-300",
  },
};

/**
 * ServiceHero - Compact hero section for service pages with image background.
 * Used for Rides, Eats, and other service pages that need a visual header.
 * 
 * @example
 * <ServiceHero
 *   service="rides"
 *   title="Request a Ride"
 *   subtitle="Book your ride with trusted drivers"
 *   icon={Car}
 *   image={ridesHeroImage}
 * />
 */
export function ServiceHero({
  service,
  title,
  subtitle,
  icon: Icon,
  image,
  children,
  compact = false,
}: ServiceHeroProps) {
  const colors = serviceColors[service];

  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlay */}
          <div className={cn("absolute inset-0 bg-gradient-to-b", colors.gradient)} />
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "relative z-10 container mx-auto px-4",
          compact ? "py-8 sm:py-12" : "py-12 sm:py-16"
        )}
      >
        <div className="text-center">
          {/* Icon Badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-xl border border-white/20",
                colors.iconBg
              )}
            >
              <Icon className={cn("w-6 h-6", colors.iconColor)} />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-white/80 text-sm sm:text-base max-w-lg mx-auto drop-shadow-md">
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional children (search form, etc.) */}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

export default ServiceHero;
