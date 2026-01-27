import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, Bell, Search, Sparkles, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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
import { cn } from "@/lib/utils";
import ZivoLogo from "./ZivoLogo";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 safe-area-top">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <motion.div 
              className="cursor-pointer" 
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ZivoLogo size="md" />
            </motion.div>

            {/* Desktop Navigation - Mega Menus */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {megaMenuData.map((menu) => (
                <MegaMenuDropdown key={menu.id} data={menu} />
              ))}
              <MegaMenuDropdown data={moreServicesData} />
            </nav>

            {/* Desktop Actions - Enhanced */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Search Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>

              {user ? (
                <>
                  {/* Notifications - Enhanced */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50">
                      <Bell className="h-5 w-5" />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5"
                      >
                        <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-eats to-orange-500 border-0 shadow-lg shadow-eats/30">
                          3
                        </Badge>
                      </motion.div>
                    </Button>
                  </motion.div>

                  {/* User Menu - Enhanced */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="ghost" size="sm" className="gap-2 ml-1.5 rounded-xl hover:bg-muted/50 pr-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center ring-2 ring-primary/20">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="hidden lg:flex flex-col items-start">
                            <span className="text-sm font-semibold">Account</span>
                            <span className="text-[10px] text-muted-foreground">Menu</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl p-2">
                      <div className="px-3 py-3 mb-2 rounded-xl bg-gradient-to-br from-primary/10 to-teal-400/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
                            <User className="h-5 w-5 text-white" />
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
                      <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer rounded-xl py-2.5 font-medium">
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
                      <DropdownMenuItem onClick={() => navigate("/driver")} className="cursor-pointer rounded-xl py-2.5 font-medium">
                        Driver App
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/restaurant")} className="cursor-pointer rounded-xl py-2.5 font-medium">
                        Restaurant Dashboard
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
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-xl font-semibold">
                    Log in
                  </Button>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      size="sm" 
                      onClick={() => navigate("/signup")}
                      className="rounded-xl font-bold bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
                    >
                      Sign up free
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2.5 -mr-2 text-foreground hover:bg-muted/50 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4"
            >
              <div className="container mx-auto flex items-center gap-3">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for rides, food, hotels, flights..."
                  className="flex-1 bg-transparent border-0 outline-none text-lg placeholder:text-muted-foreground"
                  autoFocus
                />
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
