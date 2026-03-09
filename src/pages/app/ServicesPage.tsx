/**
 * ServicesPage - Full directory of all ZIVO services
 * Grid-based layout with category sections, super-app style
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Car, Shield, MapPin, Sparkles, Package, Gift, Crown, Users, Wine, ShoppingCart, Pill, Ship, FileCheck, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import zivoRideIcon from "@/assets/zivo-ride-icon.png";
import zivoEatsIcon from "@/assets/zivo-eats-icon.png";
import zivoFlightsIcon from "@/assets/zivo-flights-icon.png";
import zivoHotelsIcon from "@/assets/zivo-hotels-icon.png";
import zivoRentalCarIcon from "@/assets/zivo-rental-car.png";
import zivoReserveIcon from "@/assets/zivo-reserve-car.png";
import zivoShoppingIcon from "@/assets/zivo-shopping.png";
import zivoDeliveryBanner from "@/assets/zivo-delivery-banner.png";
import zivoReserveBanner from "@/assets/zivo-reserve-banner.png";
import zivoTravelBanner from "@/assets/zivo-travel-banner.png";

interface ServiceItem {
  label: string;
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
    title: "Your ride, your way",
    services: [
      { label: "Ride", href: "/rides", image: zivoRideIcon, badge: "10% Off", badgeVariant: "discount" },
      { label: "Package", href: "/delivery", icon: Package },
      { label: "Travel", href: "/flights", image: zivoFlightsIcon, badge: "Promo", badgeVariant: "promo" },
      { label: "Reserve", href: "/rides?tab=reserve", image: zivoReserveIcon, badge: "Promo", badgeVariant: "promo" },
      { label: "Rental Cars", href: "/rent-car", image: zivoRentalCarIcon },
      { label: "Group Ride", href: "/rides", icon: Users },
    ],
  },
  {
    title: "Food & more, fast",
    services: [
      { label: "Food", href: "/eats", image: zivoEatsIcon, badge: "Promo", badgeVariant: "promo" },
      { label: "Grocery", href: "/rides", image: zivoShoppingIcon, badge: "Promo", badgeVariant: "promo" },
      { label: "Alcohol", href: "/eats", icon: Wine },
      { label: "Pharmacy", href: "/eats", icon: Pill },
      { label: "Shopping", href: "/rides", icon: ShoppingCart },
    ],
  },
  {
    title: "Plan your trip",
    services: [
      { label: "Flights", href: "/flights", image: zivoFlightsIcon },
      { label: "Hotels", href: "/hotels", image: zivoHotelsIcon },
      { label: "Car Rental", href: "/rent-car", image: zivoRentalCarIcon },
      { label: "Insurance", href: "/travel-insurance", icon: Shield },
      { label: "Things to Do", href: "/things-to-do", icon: MapPin },
      { label: "AI Planner", href: "/ai-trip-planner", icon: Sparkles, badge: "New", badgeVariant: "new" },
      { label: "Visa Help", href: "/support", icon: FileCheck, badge: "New", badgeVariant: "new" },
      { label: "Cruise", href: "/flights", icon: Ship },
    ],
  },
  {
    title: "More from ZIVO",
    services: [
      { label: "Drive", href: "/drive", icon: Car },
      { label: "ZIVO+", href: "/zivo-plus", icon: Crown, badge: "New", badgeVariant: "new" },
      { label: "Rewards", href: "/rewards", icon: Gift },
      { label: "Deals", href: "/deals", icon: Sparkles },
    ],
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
        </div>
        <h1 className="text-[28px] font-black text-foreground mt-2">Everything ZIVO</h1>
      </div>

      {/* Premium Reserve banner at top */}
      <div className="px-5 pt-2">
        <motion.button
          onClick={() => navigate("/rides?tab=reserve")}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full rounded-2xl overflow-hidden border border-border/30 shadow-sm hover:shadow-lg transition-all duration-200 touch-manipulation"
        >
          <div className="relative">
            <img src={zivoReserveBanner} alt="ZIVO Reserve - Premium Airport Rides" className="w-full h-[140px] object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-transparent flex flex-col justify-center px-5">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">ZIVO Reserve</span>
              <span className="text-sm font-black text-background leading-tight mt-0.5">Premium Airport Rides</span>
              <span className="text-[11px] text-background/80 mt-1">VIP pickup · Meet & greet · Luxury fleet</span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Service Categories */}
      <div className="px-5 space-y-8 pt-6">
        {serviceCategories.map((category, catIdx) => (
          <div key={category.title}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.07 }}
            >
              <h2 className="text-lg font-bold text-foreground mb-4">
                {category.title}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {category.services.map((service, idx) => (
                  <motion.button
                    key={service.label}
                    onClick={() => navigate(service.href)}
                    whileTap={{ scale: 0.94 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIdx * 0.07 + idx * 0.03 }}
                    className="flex flex-col items-center gap-2 touch-manipulation relative group"
                  >
                    {service.badge && (
                      <div className={cn(
                        "absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 text-[8px] font-bold px-2.5 py-[2px] rounded-full whitespace-nowrap shadow-sm",
                        service.badgeVariant === "discount"
                          ? "bg-primary text-primary-foreground"
                          : service.badgeVariant === "new"
                          ? "bg-foreground text-background"
                          : "bg-primary text-primary-foreground"
                      )}>
                        {service.badge}
                      </div>
                    )}
                    <div className="w-[72px] h-[72px] rounded-2xl bg-muted/30 border border-border/30 flex items-center justify-center group-active:bg-muted/50 group-hover:border-primary/20 group-hover:shadow-md transition-all duration-200">
                      {service.image ? (
                        <img src={service.image} alt={service.label} className="w-9 h-9 object-contain" />
                      ) : service.icon ? (
                        <service.icon className="w-6 h-6 text-muted-foreground" />
                      ) : null}
                    </div>
                    <span className="text-xs font-semibold text-foreground text-center leading-tight">
                      {service.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Promo banner after first category */}
            {catIdx === 0 && (
              <motion.button
                onClick={() => navigate("/drive")}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="w-full rounded-2xl overflow-hidden border border-border/30 shadow-sm hover:shadow-lg transition-all duration-200 touch-manipulation mt-6"
              >
                <div className="relative">
                  <img src={zivoDeliveryBanner} alt="Deliver with ZIVO" className="w-full h-[140px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent flex flex-col justify-center px-5">
                    <span className="text-sm font-black text-background leading-tight">Deliver with ZIVO</span>
                    <span className="text-[11px] text-background/80 mt-1">Earn on your schedule</span>
                  </div>
                </div>
              </motion.button>
            )}

            {/* Travel lifestyle banner before "Plan your trip" */}
            {catIdx === 1 && (
              <motion.button
                onClick={() => navigate("/flights")}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full rounded-2xl overflow-hidden border border-border/30 shadow-sm hover:shadow-lg transition-all duration-200 touch-manipulation mt-6"
              >
                <div className="relative">
                  <img src={zivoTravelBanner} alt="Plan your trip with ZIVO" className="w-full h-[140px] object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent flex flex-col justify-center px-5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Plan Your Trip</span>
                    <span className="text-sm font-black text-background leading-tight mt-0.5">Your Next Adventure Awaits</span>
                    <span className="text-[11px] text-background/80 mt-1">Flights · Hotels · Cars · All in one place</span>
                  </div>
                </div>
              </motion.button>
            )}

          </div>
        ))}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
