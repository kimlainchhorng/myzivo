import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Gift, Clock, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  icon: typeof Sparkles;
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
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, type: "spring", stiffness: 200 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate(promo.href)}
              className={cn(
                "relative p-7 sm:p-9 rounded-3xl cursor-pointer group overflow-hidden shadow-2xl hover:shadow-3xl transition-all",
                promo.glowColor
              )}
            >
              {/* Background gradient with enhanced vibrancy */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br",
                promo.gradient
              )} />
              
              {/* Animated decorative elements */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-0 right-0 w-72 h-72 bg-white/15 rounded-full blur-3xl" 
              />
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute bottom-0 left-0 w-56 h-56 bg-black/15 rounded-full blur-3xl" 
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/8 rounded-full blur-2xl" />
              
              {/* Shine sweep effect */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                whileHover={{ x: "200%", opacity: 0.15 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
              />
              
              {/* Hot badge */}
              {promo.badge && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  className="absolute -top-1 -right-1 px-3 py-1.5 bg-white text-foreground rounded-full text-xs font-black flex items-center gap-1 shadow-xl z-20"
                >
                  <Flame className="w-3 h-3 text-red-500" />
                  {promo.badge}
                </motion.div>
              )}
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    >
                      <promo.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-1.5 rounded-full bg-white/25 backdrop-blur-sm text-white text-sm font-black shadow-lg"
                    >
                      {promo.discount}
                    </motion.span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                    {promo.title}
                  </h3>
                  <p className="text-white/85 text-sm sm:text-base mb-4 font-medium">{promo.subtitle}</p>
                  <div className="flex items-center gap-4">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-xl bg-white/25 backdrop-blur-sm text-white font-mono font-black text-sm shadow-lg border border-white/20"
                    >
                      {promo.code}
                    </motion.span>
                    <span className="flex items-center gap-1.5 text-white/75 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      {promo.validUntil}
                    </span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 8, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-white/20"
                >
                  <ArrowRight className="w-7 h-7 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
