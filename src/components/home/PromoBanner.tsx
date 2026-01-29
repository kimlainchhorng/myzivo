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
    <section className="py-10 sm:py-14 relative overflow-hidden">
      {/* Subtle background effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {promos.map((promo, index) => (
            <button
              key={promo.id}
              onClick={() => navigate(promo.href)}
              className={cn(
                "relative p-7 sm:p-9 rounded-3xl cursor-pointer group overflow-hidden shadow-2xl text-left",
                "transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98]",
                "animate-in fade-in slide-in-from-bottom-4",
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
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/15 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/15 rounded-full blur-3xl animate-pulse-slower" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/8 rounded-full blur-2xl" />
              
              {/* Shine sweep effect - CSS animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
              
              {/* Hot badge */}
              {promo.badge && (
                <div
                  className="absolute -top-1 -right-1 px-3 py-1.5 bg-white text-foreground rounded-full text-xs font-black flex items-center gap-1 shadow-xl z-20 animate-in zoom-in duration-300"
                  style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'both' }}
                >
                  <Flame className="w-3 h-3 text-red-500" />
                  {promo.badge}
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
                      <promo.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-white/25 backdrop-blur-sm text-white text-sm font-black shadow-lg transition-transform duration-200 hover:scale-105">
                      {promo.discount}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                    {promo.title}
                  </h3>
                  <p className="text-white/85 text-sm sm:text-base mb-4 font-medium">{promo.subtitle}</p>
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-2 rounded-xl bg-white/25 backdrop-blur-sm text-white font-mono font-black text-sm shadow-lg border border-white/20 transition-transform duration-200 hover:scale-105">
                      {promo.code}
                    </span>
                    <span className="flex items-center gap-1.5 text-white/75 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      {promo.validUntil}
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg border border-white/20 group-hover:translate-x-1">
                  <ArrowRight className="w-7 h-7 text-white" />
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
