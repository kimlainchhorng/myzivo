import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, Search, Sparkles, ChevronDown, Car, ShieldCheck, Plane, Hotel, Globe, Check } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileNavMenu from "./navigation/MobileNavMenu";
import { cn } from "@/lib/utils";
import ZivoLogo from "./ZivoLogo";
import CurrencySelector from "./shared/CurrencySelector";
import BetaBadge from "./shared/BetaBadge";

import svcFlights from "@/assets/svc-flights-premium.jpg";
import svcHotels from "@/assets/svc-hotels-premium.jpg";
import svcCars from "@/assets/svc-cars-premium.jpg";
import bgLang from "@/assets/bg-language-selector.jpg";

import { NotificationBell } from "./notifications/NotificationBell";
import { PremiumSearchOverlay } from "@/components/search";
import { useI18n } from "@/hooks/useI18n";
import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ─── 3D Nav Button with photographic background ─── */
interface Nav3DItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  gradient: string;
  shadow: string;
  ring: string;
}

function Nav3DButton({ item }: { item: Nav3DItem }) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(500px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.06,1.06,1.06)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(500px) rotateY(0) rotateX(0) scale3d(1,1,1)";
  }, []);

  const Icon = item.icon;

  return (
    <Link
      ref={ref}
      to={item.href}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white overflow-hidden",
        "transition-all duration-300 ease-out will-change-transform",
        `shadow-lg ${item.shadow} hover:shadow-xl ring-1 ${item.ring}`
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Photo background */}
      <img
        src={item.bg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Gradient overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-r", item.gradient)} />
      {/* Content */}
      <Icon className="w-4 h-4 relative z-10 drop-shadow-md" />
      <span className="relative z-10 drop-shadow-md">{item.label}</span>
    </Link>
  );
}

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { currentLanguage, changeLanguage } = useI18n();
  const { data: supportedLanguages } = useSupportedLanguages(true);
  const activeLanguages = (supportedLanguages || []).filter(l => l.is_active);
  const currentLangData = activeLanguages.find(l => l.code === currentLanguage);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 safe-area-top">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div 
                className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]" 
                onClick={() => navigate("/")}
              >
                <ZivoLogo size="md" />
              </div>
              <BetaBadge variant="compact" className="hidden sm:flex" />
            </div>

            {/* Desktop Navigation - Simple Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {([
                { label: "Flights", href: "/flights", icon: Plane, bg: svcFlights, gradient: "from-sky-600/80 to-sky-400/60", shadow: "shadow-sky-500/30", ring: "ring-sky-400/40" },
                { label: "Hotels", href: "/hotels", icon: Hotel, bg: svcHotels, gradient: "from-amber-600/80 to-amber-400/60", shadow: "shadow-amber-500/30", ring: "ring-amber-400/40" },
                { label: "Car Rental", href: "/car-rental", icon: Car, bg: svcCars, gradient: "from-emerald-600/80 to-emerald-400/60", shadow: "shadow-emerald-500/30", ring: "ring-emerald-400/40" },
              ] as const).map((item) => (
                <Nav3DButton key={item.href} item={item} />
              ))}
            </nav>

            {/* Desktop Actions - Enhanced */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Language Selector */}
              <Popover open={isLangOpen} onOpenChange={setIsLangOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative gap-1.5 px-3 h-9 text-white font-bold rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/30 transition-all duration-300 hover:scale-[1.06] hover:shadow-xl active:scale-[0.97]"
                  >
                    <img src={bgLang} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/60 to-violet-600/50" />
                    <Globe className="w-3.5 h-3.5 relative z-10 drop-shadow-md" />
                    {currentLangData?.flag_svg ? (
                      <img src={currentLangData.flag_svg} alt="" className="w-5 h-3.5 rounded-[2px] object-cover relative z-10 shadow-sm border border-white/20" />
                    ) : (
                      <span className="text-xs relative z-10">{currentLangData?.flag_emoji || "🌐"}</span>
                    )}
                    <span className="text-xs font-bold relative z-10 drop-shadow-md">{currentLanguage.toUpperCase()}</span>
                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-200 relative z-10 drop-shadow-md", isLangOpen && "rotate-180")} />
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

              {/* Currency Selector */}
              <CurrencySelector variant="compact" />


              {user ? (
                <>
                  {/* Notifications - Real-time */}
                  <NotificationBell />

                  {/* User Menu - Enhanced */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 ml-1.5 rounded-xl hover:bg-muted/50 pr-3 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center ring-2 ring-primary/20">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="hidden lg:flex flex-col items-start">
                          <span className="text-sm font-semibold">Account</span>
                          <span className="text-[10px] text-muted-foreground">Menu</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl p-2">
                      <div className="px-3 py-3 mb-2 rounded-xl bg-gradient-to-br from-primary/10 to-teal-400/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
                            <User className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">Welcome back!</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer rounded-xl py-2.5 font-medium">
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/app")} className="cursor-pointer rounded-xl py-2.5 font-medium">
                        My Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/trips")} className="cursor-pointer rounded-xl py-2.5 font-medium">
                        Trip History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/promotions")} className="cursor-pointer rounded-xl py-2.5 font-medium">
                        <Sparkles className="w-4 h-4 mr-2 text-eats" />
                        Rewards & Promotions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem 
                        onClick={() => navigate("/drive")} 
                        className="cursor-pointer rounded-xl py-2.5 font-medium"
                      >
                        <Car className="w-4 h-4 mr-2 text-rides" />
                        Become a Driver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/eats")} className="cursor-pointer rounded-xl py-2.5 font-medium">
                        Restaurant Partner
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem onClick={() => navigate("/help")} className="cursor-pointer rounded-xl py-2.5 font-medium">
                        Help Center
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer rounded-xl py-2.5 font-medium">
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate("/drive")}
                    className="rounded-xl font-semibold text-rides hover:text-rides/80 gap-1.5"
                  >
                    <Car className="w-4 h-4" />
                    Drive with us
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-xl font-semibold">
                    Log in
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => navigate("/signup")}
                    className="rounded-xl font-bold bg-gradient-to-r from-primary to-teal-400 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    Sign up free
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <button
              className="lg:hidden p-2.5 -mr-2 text-foreground hover:bg-muted/50 rounded-xl transition-all duration-150 hover:scale-110 active:scale-95"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Premium Search Overlay */}
        <PremiumSearchOverlay 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />
      </header>

      {/* Mobile Navigation Menu */}
      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        signOut={signOut}
      />
    </>
  );
};

export default Header;
