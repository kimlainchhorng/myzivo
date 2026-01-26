import { Button } from "@/components/ui/button";
import { Car, UtensilsCrossed, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-rides flex items-center justify-center">
              <span className="font-display font-bold text-xl text-primary-foreground">Z</span>
            </div>
            <span className="font-display font-bold text-2xl text-foreground">ZIVO</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#rides" className="flex items-center gap-2 text-muted-foreground hover:text-rides transition-colors">
              <Car className="w-4 h-4" />
              <span className="font-medium">Rides</span>
            </a>
            <a href="#eats" className="flex items-center gap-2 text-muted-foreground hover:text-eats transition-colors">
              <UtensilsCrossed className="w-4 h-4" />
              <span className="font-medium">Eats</span>
            </a>
            <a href="#driver" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Drive
            </a>
            <a href="#business" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Business
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">Log in</Button>
            <Button variant="hero" size="sm">Sign up</Button>
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
            <a href="#rides" className="flex items-center gap-3 text-foreground py-2">
              <Car className="w-5 h-5 text-rides" />
              <span className="font-medium">Rides</span>
            </a>
            <a href="#eats" className="flex items-center gap-3 text-foreground py-2">
              <UtensilsCrossed className="w-5 h-5 text-eats" />
              <span className="font-medium">Eats</span>
            </a>
            <a href="#driver" className="text-foreground py-2 font-medium">Drive with ZIVO</a>
            <a href="#business" className="text-foreground py-2 font-medium">Business</a>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1">Log in</Button>
              <Button variant="hero" className="flex-1">Sign up</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
