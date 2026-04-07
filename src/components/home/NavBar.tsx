/**
 * NavBar - ZIVO Desktop Navigation
 * Premium 3D spatial header with glass depth + floating elevation
 */
import { useNavigate, Link, useLocation } from "react-router-dom";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Plane, Hotel, CarFront, Car, UtensilsCrossed, Package,
  Menu, X, User, ChevronDown, HelpCircle,
  Sparkles, Users, Award, Crown, LogOut, UserCircle, Briefcase, Globe, Check,
  Newspaper, Film, MapPin, MessageCircle, Rss,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMembership } from "@/hooks/useMembership";
import { ZivoPlusBadge } from "@/components/premium/ZivoPlusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { useI18n } from "@/hooks/useI18n";
import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";

import { withRedirectParam } from "@/lib/authRedirect";

const serviceNavItems = [
  { label: "Flights", href: "/flights", icon: Plane, cssVar: "var(--flights)" },
  { label: "Hotels", href: "/hotels", icon: Hotel, cssVar: "var(--hotels)" },
  { label: "Cars", href: "/rent-car", icon: CarFront, cssVar: "var(--cars)" },
];

const directNavItems = [
  { label: "Rides", href: "/rides", icon: Car, cssVar: "var(--rides)" },
  { label: "Eats", href: "/eats", icon: UtensilsCrossed, cssVar: "var(--eats)" },
  { label: "Feed", href: "/feed", icon: Newspaper, cssVar: "var(--flights)" },
  { label: "Reel", href: "/reels", icon: Film, cssVar: "var(--eats)" },
  { label: "Map", href: "/store-map", icon: MapPin, cssVar: "var(--hotels)" },
];

const communityNavItems = [
  { label: "Feed", description: "Posts & updates", href: "/feed", icon: Newspaper, color: "text-blue-500" },
  { label: "Reels", description: "Short videos", href: "/reels", icon: Film, color: "text-pink-500" },
  { label: "Chat", description: "Messages & conversations", href: "/chat", icon: MessageCircle, color: "text-emerald-500" },
  { label: "Map", description: "Explore nearby stores", href: "/store-map", icon: MapPin, color: "text-orange-500" },
];

const moreItems = [
  { label: "Delivery", description: "Send packages anywhere", href: "/delivery", icon: Package, color: "text-violet-500" },
  { label: "Extras", description: "Transfers, eSIM, Tours & more", href: "/extras", icon: Sparkles, color: "text-primary" },
  { label: "Partners", description: "Our travel partners", href: "/partners", icon: Users, color: "text-muted-foreground" },
  { label: "Creators", description: "Creator program", href: "/creators", icon: Award, color: "text-muted-foreground" },
];

const legalItems = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Partner Disclosure", href: "/partner-disclosure" },
  { label: "Cookies", href: "/cookies" },
];

const NavBar = forwardRef<HTMLDivElement>(function NavBar(_, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isActive: isMember } = useMembership();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { currentLanguage, changeLanguage, t } = useI18n();
  const { data: supportedLanguages } = useSupportedLanguages(true);
  const activeLanguages = (supportedLanguages || []).filter((l) => l.is_active);
  const currentLangData = activeLanguages.find((l) => l.code === currentLanguage);

  const moreRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
      if (socialRef.current && !socialRef.current.contains(event.target as Node)) {
        setSocialOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* 3D Perspective wrapper */}
      <div className="fixed top-0 left-0 right-0 z-50 overflow-x-clip" style={{ perspective: "1200px" }}>
        <motion.header
          ref={ref}
          initial={{ rotateX: -3, y: -10, opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
          className={cn(
            "transition-all duration-500 origin-top",
            scrolled
              ? [
                  "bg-background/70 backdrop-blur-3xl",
                  "shadow-[0_8px_40px_-8px_hsl(var(--foreground)/0.08),0_2px_12px_-2px_hsl(var(--primary)/0.06)]",
                  "border-b border-border/20",
                ].join(" ")
              : isHomePage
                ? "bg-transparent"
                : "bg-background/90 backdrop-blur-2xl border-b border-border/15 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.04)]"
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Holographic rainbow accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] opacity-60"
            style={{
              background: "linear-gradient(90deg, hsl(var(--flights)), hsl(var(--hotels)), hsl(var(--cars)), hsl(var(--rides)), hsl(var(--eats)), hsl(var(--flights)))",
              backgroundSize: "200% 100%",
              animation: "shimmer 4s linear infinite",
            }}
          />
          <div className="mx-auto px-2 sm:px-4 max-w-[1400px]">
            <div className="flex items-center justify-between h-[72px]">
              {/* Logo — 3D float */}
              <motion.div
                className="cursor-pointer shrink-0"
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.05, z: 20, rotateY: 3 }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <ZivoLogo size="md" />
              </motion.div>

              {/* Center: Grouped nav buttons */}
              <nav
                className="hidden lg:flex items-center gap-2 px-1 py-1"
                role="tablist"
                aria-label="Navigation"
              >
                {/* Services Button */}
                <div ref={servicesRef} className="relative">
                  <motion.button
                    onClick={() => { setServicesOpen(!servicesOpen); setSocialOpen(false); }}
                    whileHover={{ y: -2, scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300"
                    )}
                    style={{
                      border: `1.5px solid hsl(var(--primary) / ${servicesOpen ? "0.3" : "0.12"})`,
                      background: servicesOpen ? "hsl(var(--primary) / 0.06)" : "transparent",
                      color: servicesOpen ? "hsl(var(--primary))" : undefined,
                    }}
                  >
                    <Plane className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                    <span className={servicesOpen ? "text-primary" : "text-foreground/80"}>Services</span>
                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-300 text-muted-foreground", servicesOpen && "rotate-180")} />
                  </motion.button>

                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-1.5 rounded-2xl"
                        style={{
                          background: "hsl(var(--card) / 0.9)",
                          backdropFilter: "blur(24px)",
                          border: "1px solid hsl(var(--border) / 0.25)",
                          boxShadow: "0 12px 40px -8px hsl(var(--foreground) / 0.1)",
                        }}
                      >
                        <div className="flex gap-1">
                          {serviceNavItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            return (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setServicesOpen(false)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-200 whitespace-nowrap"
                                style={{
                                  background: isActive
                                    ? `linear-gradient(135deg, hsl(${item.cssVar} / 0.15), hsl(${item.cssVar} / 0.08))`
                                    : "transparent",
                                  border: `1.5px solid hsl(${item.cssVar} / ${isActive ? "0.3" : "0.1"})`,
                                  color: `hsl(${item.cssVar})`,
                                }}
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Direct nav pills: Rides, Eats, Feed, Reel, Map */}
                {directNavItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      whileHover={{ y: -2, scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      <Link
                        to={item.href}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 whitespace-nowrap"
                        style={{
                          background: isActive
                            ? `linear-gradient(135deg, hsl(${item.cssVar} / 0.15), hsl(${item.cssVar} / 0.08))`
                            : "transparent",
                          border: `1.5px solid hsl(${item.cssVar} / ${isActive ? "0.3" : "0.12"})`,
                          boxShadow: isActive
                            ? `0 2px 12px -3px hsl(${item.cssVar} / 0.25)`
                            : "none",
                          color: `hsl(${item.cssVar})`,
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
                {/* More Dropdown */}
                <div ref={moreRef} className="relative">
                  <motion.button
                    onClick={() => setMoreOpen(!moreOpen)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300",
                      moreOpen
                        ? "text-foreground"
                        : scrolled || !isHomePage
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    More
                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", moreOpen && "rotate-180")} />
                  </motion.button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, rotateX: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, rotateX: -8, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full right-0 mt-3 w-[300px] max-h-[70vh] overflow-y-auto p-2 overflow-hidden rounded-2xl"
                        style={{
                          background: "hsl(var(--card) / 0.85)",
                          backdropFilter: "blur(40px) saturate(1.5)",
                          border: "1px solid hsl(var(--border) / 0.25)",
                          boxShadow: [
                            "0 24px 80px -12px hsl(var(--foreground) / 0.12)",
                            "0 8px 24px -4px hsl(var(--primary) / 0.06)",
                            "inset 0 1px 1px hsl(var(--background) / 0.5)",
                          ].join(", "),
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <p className="px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 font-medium">Community</p>
                        {communityNavItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200",
                                item.color
                              )}
                              style={{
                                background: "hsl(var(--muted) / 0.6)",
                                boxShadow: "0 2px 8px -2px hsl(var(--foreground) / 0.06), inset 0 1px 1px hsl(var(--background) / 0.4)",
                              }}
                            >
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-[13px]">{item.label}</p>
                              <p className="text-[11px] text-muted-foreground">{item.description}</p>
                            </div>
                          </Link>
                        ))}

                        <div className="border-t border-border/30 my-1.5" />

                        <p className="px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 font-medium">Services</p>
                        {moreItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200",
                                item.color
                              )}
                              style={{
                                background: "hsl(var(--muted) / 0.6)",
                                boxShadow: "0 2px 8px -2px hsl(var(--foreground) / 0.06), inset 0 1px 1px hsl(var(--background) / 0.4)",
                              }}
                            >
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-[13px]">{item.label}</p>
                              <p className="text-[11px] text-muted-foreground">{item.description}</p>
                            </div>
                          </Link>
                        ))}

                        <div className="border-t border-border/30 my-1.5" />

                        <Link
                          to="/help"
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 transition-all duration-200"
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              background: "hsl(var(--muted) / 0.6)",
                              boxShadow: "0 2px 8px -2px hsl(var(--foreground) / 0.06)",
                            }}
                          >
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-[13px]">Help Center</p>
                            <p className="text-[11px] text-muted-foreground">FAQs & support</p>
                          </div>
                        </Link>

                        <div className="border-t border-border/30 my-1.5" />

                        <div className="px-3 py-2">
                          <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2 font-medium">Legal</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {legalItems.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMoreOpen(false)}
                                className="text-[11px] text-muted-foreground hover:text-primary transition-all duration-200"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* Right: Language, Currency, Auth */}
              <div className="hidden md:flex items-center gap-2" style={{ transformStyle: "preserve-3d" }}>
                <Popover open={isLangOpen} onOpenChange={setIsLangOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-1.5 px-2 h-8 rounded-full transition-all duration-200",
                        scrolled || !isHomePage
                          ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          : "text-foreground/85 hover:text-foreground hover:bg-foreground/5"
                      )}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {currentLangData?.flag_svg ? (
                        <img src={currentLangData.flag_svg} alt="" className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm border border-foreground/10" />
                      ) : (
                        <span className="text-xs">{currentLangData?.flag_emoji || "🌐"}</span>
                      )}
                      <span className="text-xs font-medium">{currentLanguage.toUpperCase()}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isLangOpen && "rotate-180")} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0 bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl rounded-2xl overflow-hidden" align="end" sideOffset={8}>
                    {/* Header with background flag watermark */}
                    <div className="relative p-3 border-b border-border/50 bg-muted/30 overflow-hidden">
                      {currentLangData?.flag_svg && (
                        <img src={currentLangData.flag_svg} alt="" className="absolute -right-4 -top-4 w-32 h-32 opacity-[0.07] pointer-events-none blur-[1px]" style={{ transform: "rotate(-12deg) scale(1.3)" }} />
                      )}
                      <div className="flex items-center gap-2 relative z-10">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{t("lang.select")}</p>
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[360px] p-1">
                      {activeLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { changeLanguage(lang.code); setIsLangOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden group",
                            currentLanguage === lang.code ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "hover:bg-muted/60"
                          )}
                        >
                          {/* Hover background flag watermark */}
                          {lang.flag_svg && (
                            <img src={lang.flag_svg} alt="" className="absolute right-1 top-1/2 -translate-y-1/2 w-16 h-16 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none blur-[0.5px]" style={{ transform: "translateY(-50%) rotate(-8deg)" }} />
                          )}
                          {lang.flag_svg ? (
                            <img src={lang.flag_svg} alt={lang.name} className="w-6 h-[17px] rounded-[3px] object-cover shadow-sm border border-black/10 shrink-0 relative z-10" />
                          ) : (
                            <span className="text-lg">{lang.flag_emoji}</span>
                          )}
                          <div className="flex-1 text-left relative z-10">
                            <p className="font-medium text-sm">{lang.name}</p>
                            <p className="text-xs text-muted-foreground">{lang.native_name}</p>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground/70 uppercase relative z-10">{lang.code}</span>
                          {currentLanguage === lang.code && <Check className="w-4 h-4 text-primary relative z-10" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <CurrencySelector
                  variant="compact"
                  className={cn(
                    "rounded-full transition-all duration-200",
                    scrolled || !isHomePage
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      : "text-foreground/85 hover:text-foreground hover:bg-foreground/5"
                  )}
                />

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05, z: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-full transition-all duration-200 group"
                        style={{
                          background: "hsl(var(--muted) / 0.3)",
                          boxShadow: "0 2px 10px -2px hsl(var(--foreground) / 0.06), inset 0 1px 1px hsl(var(--background) / 0.4)",
                        }}
                      >
                        <div className="relative">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                            isMember
                              ? "bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-2 border-amber-400/40"
                              : "bg-primary/10 border-2 border-primary/20 group-hover:border-primary/40"
                          )}
                            style={{ boxShadow: isMember ? "0 0 12px hsl(45 90% 50% / 0.15)" : "0 0 8px hsl(var(--primary) / 0.1)" }}
                          >
                            <User className={cn("h-4 w-4", isMember ? "text-amber-600" : "text-primary")} />
                          </div>
                          {isMember && (
                            <div className="absolute -top-1 -right-1">
                              <ZivoPlusBadge variant="small" className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 rounded-2xl p-1.5"
                      style={{
                        boxShadow: [
                          "0 24px 80px -12px hsl(var(--foreground) / 0.12)",
                          "0 8px 24px -4px hsl(var(--primary) / 0.06)",
                          "inset 0 1px 1px hsl(var(--background) / 0.5)",
                        ].join(", "),
                        backdropFilter: "blur(40px)",
                        background: "hsl(var(--card) / 0.9)",
                      }}
                    >
                      <div className="px-3 py-2.5 mb-1">
                        <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                        {isMember && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                            <Crown className="w-3 h-3" /> ZIVO+ Member
                          </span>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer rounded-lg py-2.5 gap-2.5">
                        <UserCircle className="w-4 h-4 text-muted-foreground" /> My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/trips")} className="cursor-pointer rounded-lg py-2.5 gap-2.5">
                        <Briefcase className="w-4 h-4 text-muted-foreground" /> My Trips
                      </DropdownMenuItem>
                      {!isMember && (
                        <DropdownMenuItem onClick={() => navigate("/membership")} className="cursor-pointer rounded-lg py-2.5 gap-2.5 text-amber-600">
                          <Crown className="w-4 h-4" /> Join ZIVO+
                        </DropdownMenuItem>
                      )}
                      {isMember && (
                        <DropdownMenuItem onClick={() => navigate("/account/membership")} className="cursor-pointer rounded-lg py-2.5 gap-2.5">
                          <Crown className="w-4 h-4 text-amber-500" /> Membership
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="cursor-pointer rounded-lg py-2.5 gap-2.5 text-destructive focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(withRedirectParam("/login", location.pathname === "/" ? null : `${location.pathname}${location.search ?? ""}`))}
                        className={cn(
                          "rounded-full font-semibold text-[13px] px-5 h-9 transition-all duration-300",
                          scrolled || !isHomePage
                            ? "text-foreground hover:bg-muted/60"
                            : "text-foreground/90 hover:text-foreground hover:bg-foreground/5"
                        )}
                      >
                        Log in
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Button
                        size="sm"
                        onClick={() => navigate("/signup")}
                        className="rounded-full font-bold text-[13px] px-6 h-9 transition-all duration-300"
                        style={{
                          boxShadow: "0 4px 20px -4px hsl(var(--primary) / 0.4), 0 1px 3px hsl(var(--primary) / 0.2), inset 0 1px 1px hsl(var(--background) / 0.15)",
                        }}
                      >
                        Sign up
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="md:hidden p-2 -mr-2 text-foreground hover:bg-muted rounded-xl transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.header>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-72 max-w-[85vw] border-l border-border/20 safe-area-top safe-area-bottom"
              style={{
                background: "hsl(var(--card) / 0.9)",
                backdropFilter: "blur(40px) saturate(1.4)",
                boxShadow: "-20px 0 80px -20px hsl(var(--foreground) / 0.1)",
              }}
            >
              <div className="p-4 border-b border-border/20 flex items-center justify-between">
                <ZivoLogo size="sm" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-all touch-manipulation active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-medium px-4 py-2">Services</p>
                {serviceNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-muted transition-all touch-manipulation active:scale-[0.98] active:bg-muted min-h-[48px]"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}

                <div className="border-t border-border/20 my-3" />

                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-medium px-4 py-2">More</p>
                {moreItems.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-muted transition-all touch-manipulation active:scale-[0.98] active:bg-muted min-h-[48px]"
                  >
                    <link.icon className="w-5 h-5 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-border/20 my-3" />

                <Link
                  to="/help"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-muted transition-all touch-manipulation active:scale-[0.98] active:bg-muted min-h-[48px]"
                >
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  Help Center
                </Link>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/20 bg-card/80 backdrop-blur-xl">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign out
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full rounded-xl font-bold"
                      style={{ boxShadow: "0 4px 14px -2px hsl(var(--primary) / 0.35)" }}
                      onClick={() => {
                        navigate("/signup");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => {
                        navigate(withRedirectParam("/login", location.pathname === "/" ? null : `${location.pathname}${location.search ?? ""}`));
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Log in
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

NavBar.displayName = "NavBar";

export default NavBar;
