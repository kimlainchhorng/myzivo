/**
 * ServicesPage - Full directory of all ZIVO services
 * Premium super-app style with glassmorphism, layered banners, staggered animations
 */
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft, Car, Shield, MapPin, Sparkles, Package, Gift, Crown,
  Users, Wine, ShoppingCart, Pill, Ship, FileCheck, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useI18n } from "@/hooks/useI18n";
import { useCountry } from "@/hooks/useCountry";
import zivoRideIcon from "@/assets/zivo-ride-icon.webp";
import zivoEatsIcon from "@/assets/zivo-eats-icon.webp";
import zivoFlightsIcon from "@/assets/zivo-flights-icon.webp";
import zivoHotelsIcon from "@/assets/zivo-hotels-icon.webp";
import zivoRentalCarIcon from "@/assets/zivo-rental-car.webp";
import zivoReserveIcon from "@/assets/zivo-reserve-car.webp";
import zivoShoppingIcon from "@/assets/zivo-shopping.webp";
import zivoDeliveryBanner from "@/assets/zivo-delivery-banner.webp";
import zivoPackageIcon from "@/assets/service-package.png";
import zivoReserveBanner from "@/assets/zivo-reserve-banner.webp";
import zivoTravelBanner from "@/assets/zivo-travel-banner.webp";
import zivoGroupRideIcon from "@/assets/service-group-ride.png";
import zivoAlcoholIcon from "@/assets/service-alcohol.png";
import zivoPharmacyIcon from "@/assets/service-pharmacy.png";
import zivoShoppingCartIcon from "@/assets/service-shopping.png";

/* ── Types ── */
interface ServiceItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  badge?: string;
  badgeVariant?: "discount" | "promo" | "new" | "coming_soon";
  animClass?: string;
  comingSoon?: boolean;
}

interface ServiceCategory {
  title: string;
  subtitle?: string;
  services: ServiceItem[];
}

/* ── Data ── */
const getServiceCategories = (t: (key: string) => string, isCambodia = false): ServiceCategory[] => [
  {
    title: t("services.category.ride"),
    subtitle: t("services.category.ride_sub"),
    services: [
      { label: t("services.ride"), href: "/rides", image: zivoRideIcon, badge: t("services.badge.off_10"), badgeVariant: "discount", animClass: "animate-car-run" },
      { label: t("services.package"), href: "/delivery", image: zivoPackageIcon, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true, animClass: "animate-pkg-bounce" },
      { label: t("services.travel"), href: "/flights", image: zivoFlightsIcon, badge: "Hot", badgeVariant: "promo", animClass: "animate-plane-fly" },
      { label: t("services.reserve"), href: "/rides?tab=reserve", image: zivoReserveIcon, badge: t("services.badge.promo"), badgeVariant: "promo", animClass: "animate-car-run" },
      { label: t("services.rental_cars"), href: "/rent-car", image: zivoRentalCarIcon, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true, animClass: "animate-car-run" },
      { label: t("services.group_ride"), href: "/rides", image: zivoGroupRideIcon, animClass: "animate-car-run" },
    ],
  },
  {
    title: t("services.category.food"),
    subtitle: t("services.category.food_sub"),
    services: [
      { label: t("services.food"), href: "/eats", image: zivoEatsIcon, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true, animClass: "animate-food-wiggle" },
      { label: t("services.grocery"), href: "/grocery", image: zivoShoppingIcon, animClass: "animate-food-wiggle", ...(isCambodia ? { badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon" as const, comingSoon: true } : {}) },
      { label: t("services.alcohol"), href: "/eats", image: zivoAlcoholIcon, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true, animClass: "animate-food-wiggle" },
      { label: t("services.pharmacy"), href: "/eats", image: zivoPharmacyIcon, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true, animClass: "animate-pkg-bounce" },
      { label: t("services.shopping"), href: "/grocery", image: zivoShoppingCartIcon, animClass: "animate-food-wiggle", ...(!isCambodia ? { badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon" as const, comingSoon: true } : {}) },
    ],
  },
  {
    title: t("services.category.trip"),
    subtitle: t("services.category.trip_sub"),
    services: [
      { label: t("services.flights"), href: "/flights", image: zivoFlightsIcon, badge: "Hot", badgeVariant: "promo", animClass: "animate-plane-fly" },
      { label: t("services.hotels"), href: "/hotels", image: zivoHotelsIcon, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true, animClass: "animate-pkg-bounce" },
      { label: t("services.car_rental"), href: "/rent-car", image: zivoRentalCarIcon, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true, animClass: "animate-car-run" },
      { label: t("services.insurance"), href: "/travel-insurance", icon: Shield, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true },
      { label: t("services.things_to_do"), href: "/things-to-do", icon: MapPin, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true },
      { label: t("services.ai_planner"), href: "/ai-trip-planner", icon: Sparkles, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true },
      { label: t("services.visa_help"), href: "/support", icon: FileCheck, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true },
      { label: t("services.cruise"), href: "/flights", icon: Ship, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true },
    ],
  },
  {
    title: t("services.category.more"),
    subtitle: t("services.category.more_sub"),
    services: [
      { label: t("services.drive"), href: "/drive", icon: Car },
      { label: "ZIVO+", href: "/zivo-plus", icon: Crown, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true },
      { label: t("services.rewards"), href: "/rewards", icon: Gift, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true },
      { label: t("services.deals"), href: "/deals", icon: Sparkles, badge: t("services.badge.coming_soon"), badgeVariant: "coming_soon", comingSoon: true },
    ],
  },
];

/* ── Promo Banner Component ── */
function PromoBanner({
  image,
  alt,
  label,
  title,
  subtitle,
  href,
  delay = 0.15,
  navigate,
  objectPosition = "center",
}: {
  image: string;
  alt: string;
  label?: string;
  title: string;
  subtitle: string;
  href: string;
  delay?: number;
  navigate: (path: string) => void;
  objectPosition?: string;
}) {
  return (
    <motion.button
      onClick={() => navigate(href)}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 30 }}
      className="w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation mt-5 relative group"
    >
      <div className="relative h-[150px]">
        <img
          src={image}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition }}
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-5">
          {label && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-1">
              {label}
            </span>
          )}
          <span className="text-[15px] font-black text-background leading-tight drop-shadow-md">
            {title}
          </span>
          <span className="text-[11px] text-background/80 mt-1 font-medium">
            {subtitle}
          </span>
        </div>

        {/* Arrow indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ChevronRight className="w-4 h-4 text-background" />
        </div>
      </div>
    </motion.button>
  );
}

/* ── Badge Variant Styles ── */
const badgeStyles = {
  discount: "bg-primary text-primary-foreground shadow-primary/30",
  promo: "bg-primary/90 text-primary-foreground shadow-primary/20",
  new: "bg-foreground text-background shadow-foreground/20",
  coming_soon: "bg-amber-500 text-white shadow-amber-500/30",
};

/* ── Page ── */
export default function ServicesPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isCambodia } = useCountry();
  const serviceCategories = getServiceCategories(t, isCambodia);
  const [runningLabel, setRunningLabel] = useState<string | null>(null);

  const handleServiceClick = (service: ServiceItem) => {
    if (service.comingSoon) {
      toast(`${service.label} ${t("services.toast.coming_soon_title")}`, {
        description: t("services.toast.coming_soon_desc"),
      });
      return;
    }
    if (service.animClass) {
      setRunningLabel(service.label);
      setTimeout(() => {
        setRunningLabel(null);
        navigate(service.href);
      }, 850);
    } else {
      navigate(service.href);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 relative overflow-x-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[400px] -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="px-5 pb-2 relative z-10 safe-area-top">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-1"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted/60 backdrop-blur-md border border-border/40 flex items-center justify-center active:scale-95 transition-all duration-200 hover:bg-muted"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-foreground" />
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
        >
          <h1 className="text-[28px] font-black text-foreground mt-3 tracking-tight">
            {t("services.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("services.subtitle")}</p>
        </motion.div>
      </div>

      {/* Hero Reserve Banner */}
      <div className="px-5 pt-3 relative z-10">
        <PromoBanner
          image={zivoReserveBanner}
          alt={t("services.banner.reserve_alt")}
          label={t("services.banner.reserve_label")}
          title={t("services.banner.reserve_title")}
          subtitle={t("services.banner.reserve_subtitle")}
          href="/rides?tab=reserve"
          delay={0.1}
          navigate={navigate}
          objectPosition="top"
        />
      </div>

      {/* Service Categories */}
      <div className="px-5 space-y-7 pt-7 relative z-10">
        {serviceCategories.map((category, catIdx) => (
          <div key={category.title}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + catIdx * 0.08, type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Section header */}
              <div className="mb-4">
                <h2 className="text-[17px] font-extrabold text-foreground tracking-tight">
                  {category.title}
                </h2>
                {category.subtitle && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {category.subtitle}
                  </p>
                )}
              </div>

              {/* Service grid */}
              <div className="grid grid-cols-3 gap-x-3 gap-y-4">
                {category.services.map((service, idx) => (
                  <motion.button
                    key={service.label}
                    onClick={() => handleServiceClick(service)}
                    whileTap={{ scale: 0.92 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.12 + catIdx * 0.08 + idx * 0.035,
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 touch-manipulation relative group",
                      service.comingSoon && "opacity-60"
                    )}
                  >
                    {/* Badge */}
                    {service.badge && (
                      <div
                        className={cn(
                          "absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-[8px] font-bold px-2.5 py-[3px] rounded-full whitespace-nowrap shadow-md",
                          badgeStyles[service.badgeVariant || "promo"]
                        )}
                      >
                        {service.badge}
                      </div>
                    )}

                    {/* Icon container */}
                    <div
                      className={cn(
                        "w-[68px] h-[68px] rounded-2xl flex items-center justify-center transition-all duration-200 overflow-visible",
                        "bg-card border border-border/40 shadow-sm",
                        "group-hover:shadow-md group-hover:border-primary/20 group-hover:-translate-y-0.5",
                        "group-active:bg-muted/60 group-active:shadow-none group-active:translate-y-0"
                      )}
                    >
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.label}
                          className={cn(
                            "w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-110",
                            runningLabel === service.label && service.animClass
                          )}
                        />
                      ) : service.icon ? (
                        <service.icon className="w-6 h-6 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
                      ) : null}
                    </div>

                    {/* Label */}
                    <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
                      {service.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Promo banner after "Your ride, your way" */}
            {catIdx === 0 && (
              <PromoBanner
                image={zivoDeliveryBanner}
                alt={t("services.banner.deliver_alt")}
                title={t("services.banner.deliver_title")}
                subtitle={t("services.banner.deliver_subtitle")}
                href="/drive"
                delay={0.2}
                navigate={navigate}
              />
            )}

            {/* Travel banner after "Food & more, fast" */}
            {catIdx === 1 && (
              <PromoBanner
                image={zivoTravelBanner}
                alt={t("services.banner.trip_alt")}
                label={t("services.banner.trip_label")}
                title={t("services.banner.trip_title")}
                subtitle={t("services.banner.trip_subtitle")}
                href="/flights"
                delay={0.25}
                navigate={navigate}
              />
            )}
          </div>
        ))}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
