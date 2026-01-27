import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Gift, Clock } from "lucide-react";
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
  icon: typeof Sparkles;
  href: string;
}

const promos: Promo[] = [
  {
    id: "rides",
    title: "First Ride Free",
    subtitle: "Up to $15 off your first ride",
    code: "NEWRIDER",
    discount: "$15 OFF",
    validUntil: "Limited time",
    gradient: "from-primary to-teal-400",
    icon: Zap,
    href: "/ride",
  },
  {
    id: "eats",
    title: "Free Delivery Week",
    subtitle: "No delivery fees on all orders",
    code: "FREEDEL",
    discount: "FREE",
    validUntil: "Ends Sunday",
    gradient: "from-eats to-orange-500",
    icon: Gift,
    href: "/food",
  },
];

const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-4">
          {promos.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => navigate(promo.href)}
              className="relative p-6 rounded-3xl cursor-pointer group overflow-hidden"
            >
              {/* Background gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-90",
                promo.gradient
              )} />
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
                    >
                      <promo.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                      {promo.discount}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {promo.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-3">{promo.subtitle}</p>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white font-mono font-bold text-sm">
                      {promo.code}
                    </span>
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Clock className="w-3 h-3" />
                      {promo.validUntil}
                    </span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="w-6 h-6 text-white" />
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
