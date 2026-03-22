/**
 * NavBar - ZIVO Desktop Navigation
 * Premium transparent header with glass effect on scroll
 */
import { useNavigate, Link, useLocation } from "react-router-dom";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Plane, Hotel, CarFront, Car, UtensilsCrossed, Package,
  Menu, X, User, ChevronDown, HelpCircle,
  Sparkles, Users, Award, Crown, LogOut, UserCircle, Briefcase
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
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const serviceNavItems = [
  { label: "Flights", href: "/flights", icon: Plane },
  { label: "Hotels", href: "/hotels", icon: Hotel },
  { label: "Cars", href: "/rent-car", icon: CarFront },
  { label: "Rides", href: "/rides", icon: Car },
  { label: "Eats", href: "/eats", icon: UtensilsCrossed },
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
  const [scrolled, setScrolled] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHomePage = location.pathname === "/";

  return (
    <>
      <header
        ref={ref}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/80 backdrop-blur-2xl shadow-[0_1px_30px_hsl(var(--foreground)/0.06)] border-b border-border/30"
            : isHomePage
              ? "bg-transparent"
              : "bg-background/95 backdrop-blur-xl border-b border-border/20"
        )}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <motion.div
              className="cursor-pointer shrink-0"
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ZivoLogo size="md" />
            </motion.div>

            {/* Center: Service Tabs */}
            <nav className="hidden lg:flex items-center gap-0.5" role="tablist" aria-label="Travel services">
              {serviceNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 group",
                      isActive
                        ? "text-primary bg-primary/8"
                        : scrolled || !isHomePage
                          ? "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-[15px] h-[15px] transition-all duration-300",
                        isActive
                          ? "text-primary"
                          : "opacity-60 group-hover:opacity-100 group-hover:text-primary"
                      )}
                    />
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300",
                    moreOpen
                      ? "text-foreground bg-muted/60"
                      : scrolled || !isHomePage
                        ? "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  More
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", moreOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-3 w-[280px] bg-card/95 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-[0_20px_60px_-15px_hsl(var(--foreground)/0.15)] p-2 overflow-hidden"
                    >
                      {moreItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
                        >
                          <div className={cn("w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-200", item.color)}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-[13px]">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground">{item.description}</p>
                          </div>
                        </Link>
                      ))}

                      <div className="border-t border-border/40 my-1.5" />

                      <Link
                        to="/help"
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 transition-all duration-200"
                      >
                        <div className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-[13px]">Help Center</p>
                          <p className="text-[11px] text-muted-foreground">FAQs & support</p>
                        </div>
                      </Link>

                      <div className="border-t border-border/40 my-1.5" />

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

            {/* Right: Auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-muted/50 transition-all duration-200 group">
                      <div className="relative">
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                          isMember
                            ? "bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-2 border-amber-400/40"
                            : "bg-primary/10 border-2 border-primary/20 group-hover:border-primary/40"
                        )}>
                          <User className={cn("h-4 w-4", isMember ? "text-amber-600" : "text-primary")} />
                        </div>
                        {isMember && (
                          <div className="absolute -top-1 -right-1">
                            <ZivoPlusBadge variant="small" className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-[0_20px_60px_-15px_hsl(var(--foreground)/0.15)]">
                    {/* User info header */}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className={cn(
                      "rounded-full font-semibold text-[13px] px-5 h-9 transition-all duration-300",
                      scrolled || !isHomePage
                        ? "text-foreground hover:bg-muted/60"
                        : "text-foreground/90 hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="rounded-full font-bold text-[13px] px-6 h-9 shadow-[0_2px_20px_hsl(var(--primary)/0.35)] hover:shadow-[0_4px_30px_hsl(var(--primary)/0.45)] hover:scale-[1.02] transition-all duration-300"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2 text-foreground hover:bg-muted rounded-xl transition-all touch-manipulation active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

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
              className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-card border-l border-border/30 shadow-2xl safe-area-top safe-area-bottom"
            >
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
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

                <div className="border-t border-border/30 my-3" />

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

                <div className="border-t border-border/30 my-3" />

                <Link
                  to="/help"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-muted transition-all touch-manipulation active:scale-[0.98] active:bg-muted min-h-[48px]"
                >
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  Help Center
                </Link>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30 bg-card">
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
                        navigate("/login");
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
