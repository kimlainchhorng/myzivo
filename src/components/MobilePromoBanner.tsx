// CSS animations used instead of framer-motion for mobile performance
import { ChevronRight, Sparkles, Percent, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Promo {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  icon: typeof Sparkles;
}

const promos: Promo[] = [
  {
    id: "1",
    title: "50% Off Your First Ride",
    subtitle: "Use code FIRST50",
    cta: "Book Now",
    href: "/ride",
    gradient: "bg-gradient-to-r from-primary to-teal-400",
    icon: Zap
  },
  {
    id: "2", 
    title: "Free Delivery Today",
    subtitle: "On orders over $25",
    cta: "Order Food",
    href: "/food",
    gradient: "bg-gradient-to-r from-eats to-orange-500",
    icon: Percent
  }
];

const MobilePromoBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0">
      <div className="flex gap-3 px-4 sm:px-0">
        {promos.map((promo, index) => (
          <button
            key={promo.id}
            onClick={() => navigate(promo.href)}
            className={cn(
              "flex-shrink-0 w-[280px] p-4 rounded-2xl text-left touch-manipulation active:scale-[0.97] hover:shadow-lg transition-all duration-200 relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300",
              promo.gradient
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/10 blur-xl" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <promo.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">{promo.title}</h3>
              <p className="text-white/80 text-sm mb-3">{promo.subtitle}</p>
              <div className="inline-flex items-center gap-1 text-white text-sm font-semibold">
                {promo.cta}
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobilePromoBanner;
