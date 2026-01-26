import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, MoreHorizontal, Bell, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MegaMenuDropdown from "./navigation/MegaMenuDropdown";
import MobileNavMenu from "./navigation/MobileNavMenu";
import { megaMenuData, moreServicesData } from "./navigation/megaMenuData";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="w-10 h-10 rounded-xl gradient-rides flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="font-display font-bold text-xl text-primary-foreground">Z</span>
              </div>
              <span className="font-display font-bold text-2xl text-foreground">ZIVO</span>
            </div>

            {/* Desktop Navigation - Mega Menus */}
            <nav className="hidden lg:flex items-center gap-1">
              {megaMenuData.map((menu) => (
                <MegaMenuDropdown key={menu.id} data={menu} />
              ))}
              <MegaMenuDropdown data={moreServicesData} />
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search Button */}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="h-5 w-5" />
              </Button>

              {user ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-eats">
                      3
                    </Badge>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 ml-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="hidden lg:inline">Account</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="font-medium text-foreground">Welcome back!</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                        My Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/trips")} className="cursor-pointer">
                        Trip History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/promotions")} className="cursor-pointer">
                        Rewards & Promotions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/driver")} className="cursor-pointer">
                        Driver App
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/restaurant")} className="cursor-pointer">
                        Restaurant Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/help")} className="cursor-pointer">
                        Help Center
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                  <Button variant="hero" size="sm" onClick={() => navigate("/signup")}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
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
