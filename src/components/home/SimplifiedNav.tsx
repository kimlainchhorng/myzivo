import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Ticket, Headphones, Menu, X, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Flights", href: "/book-flight", icon: Plane },
  { label: "Hotels", href: "/book-hotel", icon: Hotel },
  { label: "Car Rental", href: "/rent-car", icon: CarFront },
  { label: "Things to Do", href: "/things-to-do", icon: Ticket },
  { label: "Support", href: "/help", icon: Headphones },
];

export default function SimplifiedNav() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div
              className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate("/")}
            >
              <ZivoLogo size="md" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    "transition-all duration-200"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-xl hover:bg-muted/50 pr-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center ring-2 ring-primary/20">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard")}
                      className="cursor-pointer rounded-xl py-2.5"
                    >
                      My Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/trips")}
                      className="cursor-pointer rounded-xl py-2.5"
                    >
                      My Trips
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate("/help")}
                      className="cursor-pointer rounded-xl py-2.5"
                    >
                      Help Center
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-destructive cursor-pointer rounded-xl py-2.5"
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
                    className="rounded-xl font-semibold"
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="rounded-xl font-bold bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30"
                  >
                    Sign up free
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2.5 -mr-2 text-foreground hover:bg-muted/50 rounded-xl"
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
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <ZivoLogo size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-muted rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-muted transition-all duration-200 active:scale-[0.98] touch-manipulation"
                >
                  <link.icon className="w-5 h-5 text-primary" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
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
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white"
                    onClick={() => {
                      navigate("/signup");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign up free
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
          </div>
        </div>
      )}
    </>
  );
}
