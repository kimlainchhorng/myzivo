/**
 * ServicesPage - Full directory of all ZIVO services
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plane, Car, BedDouble, UtensilsCrossed, Package, Shield, Globe, Calendar, Sparkles, MapPin, Gift, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import zivoRideIcon from "@/assets/zivo-ride-icon.png";
import zivoEatsIcon from "@/assets/zivo-eats-icon.png";
import zivoFlightsIcon from "@/assets/zivo-flights-icon.png";
import zivoHotelsIcon from "@/assets/zivo-hotels-icon.png";
import zivoRentalCarIcon from "@/assets/zivo-rental-car.png";
import zivoReserveIcon from "@/assets/zivo-reserve-car.png";
import zivoShoppingIcon from "@/assets/zivo-shopping.png";

interface ServiceItem {
  label: string;
  description: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  badge?: string;
  badgeVariant?: "discount" | "promo" | "new";
}

interface ServiceCategory {
  title: string;
  services: ServiceItem[];
}

const serviceCategories: ServiceCategory[] = [
  {
    title: "Mobility",
    services: [
      { label: "Ride", description: "On-demand rides nearby", href: "/rides", image: zivoRideIcon, badge: "10% Off", badgeVariant: "discount" },
      { label: "Reserve", description: "Schedule rides in advance", href: "/rides?tab=reserve", image: zivoReserveIcon, badge: "Promo", badgeVariant: "promo" },
      { label: "Rental Cars", description: "Rent cars for any trip", href: "/rent-car", image: zivoRentalCarIcon, badge: "Promo", badgeVariant: "promo" },
    ],
  },
  {
    title: "Travel",
    services: [
      { label: "Flights", description: "Search & compare flights", href: "/flights", image: zivoFlightsIcon },
      { label: "Hotels", description: "Find stays worldwide", href: "/hotels", image: zivoHotelsIcon },
      { label: "Travel Insurance", description: "Protect your trip", href: "/travel-insurance", icon: Shield },
      { label: "Things to Do", description: "Activities & experiences", href: "/things-to-do", icon: MapPin },
      { label: "AI Trip Planner", description: "Plan with AI assistance", href: "/ai-trip-planner", icon: Sparkles, badge: "New", badgeVariant: "new" },
    ],
  },
  {
    title: "Food & Delivery",
    services: [
      { label: "Eats", description: "Food delivery & pickup", href: "/eats", image: zivoEatsIcon },
      { label: "Shopping", description: "Groceries & essentials", href: "/rides", image: zivoShoppingIcon },
      { label: "Package Delivery", description: "Send packages quickly", href: "/delivery", icon: Package },
    ],
  },
  {
    title: "More",
    services: [
      { label: "Drive with ZIVO", description: "Earn on your schedule", href: "/drive", icon: Car },
      { label: "ZIVO+", description: "Exclusive member perks", href: "/zivo-plus", icon: Crown, badge: "New", badgeVariant: "new" },
      { label: "Rewards", description: "Earn & redeem points", href: "/rewards", icon: Gift },
      { label: "Deals", description: "Today's top offers", href: "/deals", icon: Sparkles },
    ],
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-5 py-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">All Services</h1>
        </div>
      </div>

      {/* Service Categories */}
      <div className="px-5 pt-5 space-y-7">
        {serviceCategories.map((category, catIdx) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.08 }}
          >
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              {category.title}
            </h2>
            <div className="space-y-2">
              {category.services.map((service, idx) => (
                <motion.button
                  key={service.label}
                  onClick={() => navigate(service.href)}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: catIdx * 0.08 + idx * 0.04 }}
                  className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-card border border-border/30 hover:border-primary/20 hover:shadow-md active:bg-muted/40 transition-all duration-200 touch-manipulation text-left group relative overflow-hidden"
                >
                  {/* Badge */}
                  {service.badge && (
                    <div className={cn(
                      "absolute top-2.5 right-3 text-[9px] font-bold px-2 py-[2px] rounded-full",
                      service.badgeVariant === "discount"
                        ? "bg-primary text-primary-foreground"
                        : service.badgeVariant === "new"
                        ? "bg-foreground text-background"
                        : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    )}>
                      {service.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-muted/40 border border-border/20 flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-colors">
                    {service.image ? (
                      <img src={service.image} alt={service.label} className="w-7 h-7 object-contain" />
                    ) : service.icon ? (
                      <service.icon className="w-5.5 h-5.5 text-foreground" />
                    ) : null}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{service.label}</p>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">{service.description}</p>
                  </div>

                  {/* Arrow */}
                  <ArrowLeft className="w-4 h-4 text-muted-foreground/40 rotate-180 shrink-0 group-hover:text-primary/60 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
