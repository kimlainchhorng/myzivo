/**
 * NavBar - Hizovo Travel Desktop Navigation
 * Clean OTA site map: Flights | Hotels | Cars | Help | Rides/Eats/Move (external)
 */
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Plane, Hotel, CarFront, 
  Menu, X, User, ChevronDown, HelpCircle, ExternalLink,
  Sparkles, Users, Award, Crown
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

// Main travel nav items (direct links, no dropdown)
const mainNavItems = [
  { label: "Flights", href: "/flights", icon: Plane, color: "text-sky-500" },
  { label: "Hotels", href: "/hotels", icon: Hotel, color: "text-amber-500" },
  { label: "Cars", href: "/rent-car", icon: CarFront, color: "text-violet-500" },
];

// More dropdown items
const moreItems = [
  { label: "Extras", description: "Transfers, eSIM, Tours & more", href: "/extras", icon: Sparkles, color: "text-primary" },
  { label: "Partners", description: "Our travel partners", href: "/partners", icon: Users, color: "text-muted-foreground" },
  { label: "Creators", description: "Creator program", href: "/creators", icon: Award, color: "text-muted-foreground" },
];

// Legal items for More dropdown
const legalItems = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Partner Disclosure", href: "/partner-disclosure" },
  { label: "Cookies", href: "/cookies" },
];

export default function NavBar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isActive: isMember } = useMembership();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const moreRef = useRef<HTMLDivElement>(null);

  // Track scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "bg-[hsl(222_47%_11%/0.95)] backdrop-blur-xl shadow-lg nav-glow-border border-primary/20"
          : "bg-[hsl(222_47%_11%/0.9)] backdrop-blur-md border-border/50"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="cursor-pointer"
              onClick={() => navigate("/")}
            >
              <ZivoLogo size="md" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Main Travel Links - Direct navigation */}
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <item.icon className={cn("w-4 h-4", item.color)} />
                  {item.label}
                </Link>
              ))}

              {/* Help - Direct link */}
              <Link
                to="/help"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </Link>

              {/* More Dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    moreOpen 
                      ? "text-white bg-white/10" 
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  More
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", moreOpen && "rotate-180")} />
                </button>
                
                {moreOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    {moreItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className={cn("w-9 h-9 rounded-lg bg-muted flex items-center justify-center", item.color)}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                    
                    <div className="border-t border-border my-2" />
                    
                    <div className="px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Legal</p>
                      <div className="flex flex-wrap gap-2">
                        {legalItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMoreOpen(false)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rides/Eats/Move - External link */}
              <a
                href="https://zivodriver.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Rides / Eats / Move
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-lg"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        {isMember && (
                          <div className="absolute -top-1 -right-1">
                            <ZivoPlusBadge variant="small" className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    {isMember && (
                      <>
                        <DropdownMenuItem
                          onClick={() => navigate("/account/membership")}
                          className="cursor-pointer text-amber-500"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          ZIVO+ Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer"
                    >
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/trips")}
                      className="cursor-pointer"
                    >
                      My Trips
                    </DropdownMenuItem>
                    {!isMember && (
                      <DropdownMenuItem
                        onClick={() => navigate("/membership")}
                        className="cursor-pointer text-amber-500"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Join ZIVO+
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-destructive cursor-pointer"
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="rounded-lg font-medium text-white/80 hover:text-white hover:bg-white/10"
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="rounded-lg font-semibold bg-primary text-primary-foreground glow-green-btn hover:bg-primary/90"
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2 text-foreground hover:bg-muted rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-card border-l border-border shadow-xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <ZivoLogo size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {/* Travel Section */}
              <p className="text-xs text-muted-foreground uppercase tracking-wider px-4 py-2">Travel</p>
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                >
                  <item.icon className={cn("w-5 h-5", item.color)} />
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-border my-3" />
              
              {/* Help */}
              <Link
                to="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                Help Center
              </Link>

              {/* External Services */}
              <a
                href="https://zivodriver.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
                Rides / Eats / Move
              </a>
              
              <div className="border-t border-border my-3" />
              
              {/* More */}
              <p className="text-xs text-muted-foreground uppercase tracking-wider px-4 py-2">More</p>
              {moreItems.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                >
                  <link.icon className="w-5 h-5 text-muted-foreground" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
              {user ? (
                <Button
                  variant="outline"
                  className="w-full rounded-lg"
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
                    className="w-full rounded-lg"
                    onClick={() => {
                      navigate("/signup");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg"
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
          </div>
        </div>
      )}
    </>
  );
}
