import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, 
  Menu,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Warehouse,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import CarRentalOverview from "@/components/carRental/CarRentalOverview";
import CarRentalBookings from "@/components/carRental/CarRentalBookings";
import CarRentalInventory from "@/components/carRental/CarRentalInventory";
import CarRentalAnalytics from "@/components/carRental/CarRentalAnalytics";
import CarRentalSettings from "@/components/carRental/CarRentalSettings";
import AdminFloatingButton from "@/components/admin/AdminFloatingButton";
import { useUserAccess } from "@/hooks/useUserAccess";
import AccessDenied from "@/components/auth/AccessDenied";
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";

const CarRentalDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { data: access, isLoading: accessLoading } = useUserAccess(user?.id);
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { value: "overview", label: "Overview", icon: Car },
    { value: "bookings", label: "Bookings", icon: ClipboardList },
    { value: "inventory", label: "Fleet", icon: Warehouse },
    { value: "analytics", label: "Analytics", icon: BarChart3 },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <div className="relative hover:scale-105 transition-transform">
          <ZivoLogo size="sm" />
        </div>
        <div>
          <span className="font-bold text-lg block">Car Rental</span>
          <span className="text-xs text-muted-foreground">Fleet Management</span>
        </div>
      </div>
      <nav className="px-3 py-4 space-y-1.5 flex-1">
        {navItems.map((item, index) => {
          const isActive = activeTab === item.value;
          return (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 sm:py-3 rounded-xl transition-all text-left group touch-manipulation active:scale-[0.98] animate-in fade-in slide-in-from-left-2",
                isActive
                  ? "bg-gradient-to-r from-primary to-teal-500 text-white shadow-lg shadow-primary/25"
                  : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive ? "bg-white/20" : "bg-muted/50 group-hover:bg-primary/10"
              )}>
                <item.icon className={cn(
                  "h-4 w-4",
                  isActive ? "text-white" : "group-hover:text-primary"
                )} />
              </div>
              <span className="font-medium text-sm sm:text-base">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Quick Stats in Sidebar */}
      <div className="px-3 py-4 border-t border-border/50">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-teal-500/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Quick Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-lg font-bold text-primary">24</p>
              <p className="text-[10px] text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-lg font-bold text-emerald-500">78%</p>
              <p className="text-[10px] text-muted-foreground">Utilization</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email?.split("@")[0]}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left hover:bg-destructive/10 text-destructive group"
        >
          <div className="p-1.5 rounded-lg bg-destructive/10 group-hover:bg-destructive/20">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Loading state
  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Access check - allow car rental owners and admins
  if (!access?.isCarRentalOwner && !access?.isAdmin) {
    return (
      <AccessDenied 
        title="Car Rental Access Required"
        message="You need to be a registered car rental owner to access this dashboard."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-3/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-tl from-emerald-500/8 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Decorative Elements - CSS only */}
      <div className="fixed top-20 right-20 pointer-events-none hidden lg:block animate-float-delayed opacity-30">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
          <Car className="w-6 h-6 text-primary/50" />
        </div>
      </div>
      <div className="fixed bottom-40 right-40 pointer-events-none hidden lg:block animate-pulse-slow opacity-25">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/15 to-yellow-400/15 flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-amber-400/50" />
        </div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 flex items-center justify-between p-3 sm:p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl z-50 safe-area-inset-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hover:scale-105 transition-transform">
            <ZivoLogo size="sm" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg block">Car Rental</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Fleet Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationCenter />
          <CrossAppNavigation currentApp="main" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl touch-manipulation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-72 p-0 border-r border-border/50">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 min-h-screen border-r border-border/50 bg-card/80 backdrop-blur-xl relative z-10">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 relative z-10">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">Live Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <CrossAppNavigation currentApp="main" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              {navItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <CarRentalOverview />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <CarRentalBookings />
            </TabsContent>

            <TabsContent value="inventory" className="mt-0">
              <CarRentalInventory />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <CarRentalAnalytics />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <CarRentalSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <AdminFloatingButton />
    </div>
  );
};

export default CarRentalDashboard;
