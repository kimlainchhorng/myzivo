import React, { useState } from "react";
import { Loader2, User, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UtensilsCrossed, 
  Menu as MenuIcon,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import RestaurantOverview from "@/components/restaurant/RestaurantOverview";
import RestaurantOrders from "@/components/restaurant/RestaurantOrders";
import RestaurantMenu from "@/components/restaurant/RestaurantMenu";
import RestaurantAnalytics from "@/components/restaurant/RestaurantAnalytics";
import RestaurantSettings from "@/components/restaurant/RestaurantSettings";
import AdminFloatingButton from "@/components/admin/AdminFloatingButton";
import { useUserAccess } from "@/hooks/useUserAccess";
import AccessDenied from "@/components/auth/AccessDenied";
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import { motion } from "framer-motion";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";

const RestaurantDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { data: access, isLoading: accessLoading } = useUserAccess(user?.id);
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { value: "overview", label: "Overview", icon: Store, gradient: "from-eats to-red-500" },
    { value: "orders", label: "Orders", icon: ClipboardList, gradient: "from-amber-500 to-orange-500" },
    { value: "menu", label: "Menu", icon: UtensilsCrossed, gradient: "from-emerald-500 to-green-500" },
    { value: "analytics", label: "Analytics", icon: BarChart3, gradient: "from-sky-500 to-blue-500" },
    { value: "settings", label: "Settings", icon: Settings, gradient: "from-violet-500 to-purple-500" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Header with Logo */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }}>
            <ZivoLogo size="sm" />
          </motion.div>
          <div>
            <span className="font-bold text-lg block">Restaurant</span>
            <span className="text-xs text-muted-foreground">Partner Hub</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-eats/5 border border-eats/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eats/20 to-eats/10 flex items-center justify-center">
            <User className="h-5 w-5 text-eats" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-eats/10 to-orange-500/5 border border-eats/20">
            <p className="text-lg font-bold text-eats">24</p>
            <p className="text-[10px] text-muted-foreground">Today's Orders</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20">
            <p className="text-lg font-bold text-emerald-500">$1,842</p>
            <p className="text-[10px] text-muted-foreground">Revenue</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Management</p>
        {navItems.map((item, index) => {
          const isActive = activeTab === item.value;
          return (
            <motion.button
              key={item.value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setActiveTab(item.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
                isActive
                  ? "bg-eats/10 text-eats"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                isActive 
                  ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                  : "bg-muted/50 group-hover:bg-muted"
              )}>
                <item.icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>
              <span className="font-medium flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-eats" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left hover:bg-destructive/10 text-destructive group"
        >
          <div className="w-9 h-9 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 flex items-center justify-center">
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

  // Access check - allow restaurant owners and admins
  if (!access?.isRestaurantOwner && !access?.isAdmin) {
    const isRestaurantDomain = window.location.hostname.includes('restaurant') || 
                                window.location.pathname === '/restaurant';
    
    if (isRestaurantDomain) {
      const RestaurantRegistration = React.lazy(() => import("./RestaurantRegistration"));
      return (
        <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-eats" /></div>}>
          <RestaurantRegistration />
        </React.Suspense>
      );
    }
    
    return (
      <AccessDenied 
        title="Restaurant Access Required"
        message="You need to be a registered restaurant owner to access this dashboard."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 bg-gradient-radial from-eats/8 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/15 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/3 w-[300px] h-[300px] bg-gradient-radial from-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="fixed top-32 right-[10%] text-4xl pointer-events-none opacity-30 hidden lg:block"
      >
        🍔
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        className="fixed bottom-32 right-[15%] text-3xl pointer-events-none opacity-25 hidden lg:block"
      >
        🍕
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        className="fixed top-1/2 right-[5%] text-2xl pointer-events-none opacity-20 hidden lg:block"
      >
        🍜
      </motion.div>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }}>
            <ZivoLogo size="sm" />
          </motion.div>
          <div>
            <span className="font-bold text-lg">Restaurant</span>
            <span className="text-xs text-muted-foreground block">Partner Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <CrossAppNavigation currentApp="restaurant" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r-0">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 min-h-screen border-r border-border/50 bg-card/50 backdrop-blur-sm sticky top-0">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              {navItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <RestaurantOverview />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <RestaurantOrders />
            </TabsContent>

            <TabsContent value="menu" className="mt-0">
              <RestaurantMenu />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <RestaurantAnalytics />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <RestaurantSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <AdminFloatingButton />
    </div>
  );
};

export default RestaurantDashboard;
