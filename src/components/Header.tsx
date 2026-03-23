import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, Search, Sparkles, ChevronDown, Car, ShieldCheck, Plane, Hotel, Globe, Check } from "lucide-react";
import { useState } from "react";
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
import { NotificationBell } from "./notifications/NotificationBell";
import { PremiumSearchOverlay } from "@/components/search";
import { useI18n } from "@/hooks/useI18n";
import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
              {[
                { label: "Flights", href: "/flights", icon: Plane, color: "text-sky-500" },
                { label: "Hotels", href: "/hotels", icon: Hotel, color: "text-amber-500" },
                { label: "Car Rental", href: "/car-rental", icon: Car, color: "text-emerald-500" },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                >
                  <item.icon className={cn("w-4 h-4", item.color)} />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions - Enhanced */}
            <div className="hidden md:flex items-center gap-1.5">
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
