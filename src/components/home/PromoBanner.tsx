// CSS animations used instead of framer-motion for performance
import { ArrowRight, Zap, Gift, Clock, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Promo {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discount: string;
  validUntil: string;
  gradient: string;
  glowColor: string;
  icon: typeof Zap;
  href: string;
  badge?: string;
}

const promos: Promo[] = [
  {
    id: "rides",
    title: "First Ride Free",
    subtitle: "Up to $15 off your first ride",
    code: "NEWRIDER",
    discount: "$15 OFF",
    validUntil: "Limited time",
    gradient: "from-primary via-primary to-teal-400",
    glowColor: "shadow-primary/40",
    icon: Zap,
    href: "/ride",
    badge: "HOT",
  },
  {
    id: "eats",
    title: "Free Delivery Week",
    subtitle: "No delivery fees on all orders",
    code: "FREEDEL",
    discount: "FREE",
    validUntil: "Ends Sunday",
    gradient: "from-eats via-eats to-orange-500",
    glowColor: "shadow-eats/40",
    icon: Gift,
    href: "/food",
  },
];

const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 sm:py-10 lg:py-14 relative overflow-hidden">
      {/* Subtle background effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {promos.map((promo, index) => (
            <button
              key={promo.id}
              onClick={() => navigate(promo.href)}
              className={cn(
                "relative p-5 sm:p-7 lg:p-9 rounded-2xl sm:rounded-3xl cursor-pointer group overflow-hidden shadow-xl sm:shadow-2xl text-left",
                "transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98]",
                "animate-in fade-in slide-in-from-bottom-4 touch-manipulation",
                promo.glowColor
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              {/* Background gradient with enhanced vibrancy */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br",
                promo.gradient
              )} />
              
              {/* Decorative elements - CSS animated */}
              <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/15 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-0 left-0 w-40 sm:w-56 h-40 sm:h-56 bg-black/15 rounded-full blur-3xl animate-pulse-slower" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-40 h-28 sm:h-40 bg-white/8 rounded-full blur-2xl" />
              
              {/* Shine sweep effect - CSS animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
              
              {/* Hot badge */}
              {promo.badge && (
                <div
                  className="absolute -top-1 -right-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-foreground rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-xl z-20 animate-in zoom-in duration-300"
                  style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'both' }}
                >
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
                  {promo.badge}
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
                      <promo.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs sm:text-sm font-black shadow-lg transition-transform duration-200 hover:scale-105">
                      {promo.discount}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">
                    {promo.title}
                  </h3>
                  <p className="text-white/85 text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 font-medium">{promo.subtitle}</p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-xl bg-white/25 backdrop-blur-sm text-white font-mono font-black text-xs sm:text-sm shadow-lg border border-white/20 transition-transform duration-200 hover:scale-105">
                      {promo.code}
                    </span>
                    <span className="flex items-center gap-1 sm:gap-1.5 text-white/75 text-xs sm:text-sm font-medium">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {promo.validUntil}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg border border-white/20 group-hover:translate-x-1 hidden sm:flex">
                  <ArrowRight className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
