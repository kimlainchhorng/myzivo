import { useState } from "react";
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

const RestaurantDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { data: access, isLoading: accessLoading } = useUserAccess(user?.id);
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { value: "overview", label: "Overview", icon: Store },
    { value: "orders", label: "Orders", icon: ClipboardList },
    { value: "menu", label: "Menu", icon: UtensilsCrossed },
    { value: "analytics", label: "Analytics", icon: BarChart3 },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-4 border-b border-border">
        <UtensilsCrossed className="h-6 w-6 text-eats" />
        <span className="font-bold text-lg">Restaurant Hub</span>
      </div>
      <nav className="px-2 py-4 space-y-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.value}
            onClick={() => setActiveTab(item.value)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
              activeTab === item.value
                ? "bg-eats text-white"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-2 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground px-3 mb-2 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="h-5 w-5" />
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
    return (
      <AccessDenied 
        title="Restaurant Access Required"
        message="You need to be a registered restaurant owner to access this dashboard."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-eats" />
          <span className="font-bold text-lg">Restaurant Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <CrossAppNavigation currentApp="restaurant" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 min-h-screen border-r border-border bg-card">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
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
