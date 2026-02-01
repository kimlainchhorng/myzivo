import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Menu, X, User, ChevronDown } from "lucide-react";
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
];

export default function NavBar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                    "text-muted-foreground hover:text-foreground hover:bg-muted",
                    "transition-colors duration-150"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
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
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard")}
                      className="cursor-pointer"
                    >
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/trips")}
                      className="cursor-pointer"
                    >
                      My Trips
                    </DropdownMenuItem>
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
                    className="rounded-lg font-medium"
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="rounded-lg font-semibold"
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
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
