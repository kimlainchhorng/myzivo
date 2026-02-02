/**
 * ZIVO Admin Panel
 * Streamlined admin dashboard for managing operations
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Car, UtensilsCrossed, Users, Store, MousePointerClick, 
  Settings, UserCircle, LogOut, Menu, X, ChevronRight, Bell, DollarSign, Calculator, CarFront
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";

// Admin modules
import AdminOverview from "./modules/AdminOverview";
import AdminRidesModule from "./modules/AdminRidesModule";
import AdminEatsModule from "./modules/AdminEatsModule";
import AdminDriversModule from "./modules/AdminDriversModule";
import AdminRestaurantsModule from "./modules/AdminRestaurantsModule";
import AdminClicksModule from "./modules/AdminClicksModule";
import AdminCustomersModule from "./modules/AdminCustomersModule";
import AdminSettingsModule from "./modules/AdminSettingsModule";
import AdminFinanceModule from "./modules/AdminFinanceModule";
import AdminRevenueAssumptionsModule from "./modules/AdminRevenueAssumptionsModule";
import AdminP2POwnersModule from "./modules/AdminP2POwnersModule";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "rides", label: "Rides", icon: Car },
  { id: "eats", label: "Eats Orders", icon: UtensilsCrossed },
  { id: "p2p-owners", label: "P2P Owners", icon: CarFront },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "revenue-assumptions", label: "Revenue Assumptions", icon: Calculator },
  { id: "drivers", label: "Drivers", icon: Users },
  { id: "restaurants", label: "Restaurants", icon: Store },
  { id: "clicks", label: "Clicks", icon: MousePointerClick },
  { id: "customers", label: "Customers", icon: UserCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminPanel() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <ZivoLogo size="sm" />
        <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
      </div>

      {/* Nav Items */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeModule === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <AdminOverview />;
      case "rides":
        return <AdminRidesModule />;
      case "eats":
        return <AdminEatsModule />;
      case "p2p-owners":
        return <AdminP2POwnersModule />;
      case "finance":
        return <AdminFinanceModule />;
      case "revenue-assumptions":
        return <AdminRevenueAssumptionsModule />;
      case "drivers":
        return <AdminDriversModule />;
      case "restaurants":
        return <AdminRestaurantsModule />;
      case "clicks":
        return <AdminClicksModule />;
      case "customers":
        return <AdminCustomersModule />;
      case "settings":
        return <AdminSettingsModule />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border/50 bg-card flex-col">
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <ZivoLogo size="sm" />
            <Badge variant="outline" className="text-[10px]">Admin</Badge>
          </div>

          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
