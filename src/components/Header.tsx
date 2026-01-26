import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, UtensilsCrossed, Menu, X, Plane, Hotel, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl gradient-rides flex items-center justify-center">
              <span className="font-display font-bold text-xl text-primary-foreground">Z</span>
            </div>
            <span className="font-display font-bold text-2xl text-foreground">ZIVO</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/ride")} className="flex items-center gap-2 text-muted-foreground hover:text-rides transition-colors">
              <Car className="w-4 h-4" />
              <span className="font-medium">Rides</span>
            </button>
            <button onClick={() => navigate("/restaurant")} className="flex items-center gap-2 text-muted-foreground hover:text-eats transition-colors">
              <UtensilsCrossed className="w-4 h-4" />
              <span className="font-medium">Eats</span>
            </button>
            <button onClick={() => navigate("/flights")} className="flex items-center gap-2 text-muted-foreground hover:text-sky-500 transition-colors">
              <Plane className="w-4 h-4" />
              <span className="font-medium">Flights</span>
            </button>
            <button onClick={() => navigate("/hotels")} className="flex items-center gap-2 text-muted-foreground hover:text-amber-500 transition-colors">
              <Hotel className="w-4 h-4" />
              <span className="font-medium">Hotels</span>
            </button>
            <button onClick={() => navigate("/car-rental")} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Car Rental
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/trips")}>
                    Trip History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/driver")}>
                    Driver App
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log in</Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/signup")}>Sign up</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-card border-t border-white/5 animate-slide-up">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <button onClick={() => { navigate("/ride"); setIsMenuOpen(false); }} className="flex items-center gap-3 text-foreground py-2 text-left">
              <Car className="w-5 h-5 text-rides" />
              <span className="font-medium">Rides</span>
            </button>
            <button onClick={() => { navigate("/restaurant"); setIsMenuOpen(false); }} className="flex items-center gap-3 text-foreground py-2 text-left">
              <UtensilsCrossed className="w-5 h-5 text-eats" />
              <span className="font-medium">Eats</span>
            </button>
            <button onClick={() => { navigate("/flights"); setIsMenuOpen(false); }} className="flex items-center gap-3 text-foreground py-2 text-left">
              <Plane className="w-5 h-5 text-sky-500" />
              <span className="font-medium">Flights</span>
            </button>
            <button onClick={() => { navigate("/hotels"); setIsMenuOpen(false); }} className="flex items-center gap-3 text-foreground py-2 text-left">
              <Hotel className="w-5 h-5 text-amber-500" />
              <span className="font-medium">Hotels</span>
            </button>
            <button onClick={() => { navigate("/car-rental"); setIsMenuOpen(false); }} className="text-foreground py-2 font-medium text-left">
              Car Rental
            </button>
            {user && (
              <>
                <button onClick={() => { navigate("/dashboard"); setIsMenuOpen(false); }} className="text-foreground py-2 font-medium text-left">
                  My Dashboard
                </button>
                <button onClick={() => { navigate("/driver"); setIsMenuOpen(false); }} className="text-foreground py-2 font-medium text-left">
                  Driver App
                </button>
              </>
            )}
            <div className="flex gap-3 pt-4 border-t border-border">
              {user ? (
                <Button variant="outline" className="flex-1" onClick={() => signOut()}>Sign out</Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/login")}>Log in</Button>
                  <Button variant="hero" className="flex-1" onClick={() => navigate("/signup")}>Sign up</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
