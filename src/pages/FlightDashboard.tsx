import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Menu,
  ClipboardList,
  Settings,
  LogOut,
  Search,
  Calendar,
  User,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import FlightOverview from "@/components/flight/FlightOverview";
import FlightSearch from "@/components/flight/FlightSearch";
import FlightBookings from "@/components/flight/FlightBookings";
import FlightSchedules from "@/components/flight/FlightSchedules";
import FlightSettings from "@/components/flight/FlightSettings";

import { useUserAccess } from "@/hooks/useUserAccess";
import AccessDenied from "@/components/auth/AccessDenied";
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";

const FlightDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { data: access, isLoading: accessLoading } = useUserAccess(user?.id);
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { value: "overview", label: "Overview", icon: Plane, gradient: "from-sky-500 to-blue-600" },
    { value: "search", label: "Search Flights", icon: Search, gradient: "from-cyan-500 to-teal-500" },
    { value: "bookings", label: "My Bookings", icon: ClipboardList, gradient: "from-violet-500 to-purple-500" },
    { value: "schedules", label: "Schedules", icon: Calendar, gradient: "from-amber-500 to-orange-500" },
    { value: "settings", label: "Settings", icon: Settings, gradient: "from-slate-500 to-gray-600" },
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
          <div className="hover:scale-105 transition-transform">
            <ZivoLogo size="sm" />
          </div>
          <div>
            <span className="font-bold text-lg block">Flights</span>
            <span className="text-xs text-muted-foreground">Travel Hub</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10 hover:border-sky-500/30 transition-all duration-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500" />
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
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20 hover:border-sky-500/40 hover:shadow-sm transition-all duration-200">
            <p className="text-base sm:text-lg font-bold text-sky-500">12</p>
            <p className="text-[10px] text-muted-foreground">Active Flights</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-sm transition-all duration-200">
            <p className="text-base sm:text-lg font-bold text-emerald-500">847</p>
            <p className="text-[10px] text-muted-foreground">Passengers</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Management</p>
        {navItems.map((item, index) => {
          const isActive = activeTab === item.value;
          return (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group touch-manipulation active:scale-[0.98] animate-in fade-in slide-in-from-left-2",
                isActive
                  ? "bg-sky-500/10 text-sky-500"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all",
                isActive 
                  ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                  : "bg-muted/50 group-hover:bg-muted"
              )}>
                <item.icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>
              <span className="font-medium flex-1 text-sm sm:text-base">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-sky-500" />
              )}
            </button>
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

  // Access check - only admins can manage flights for now
  if (!access?.isFlightManager && !access?.isAdmin) {
    return (
      <AccessDenied 
        title="Flight Manager Access Required"
        message="You need flight management permissions to access this dashboard."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 bg-gradient-radial from-sky-500/10 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-sky-500/15 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/3 w-[300px] h-[300px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating Decorative Elements - CSS only */}
      <div className="fixed top-32 right-[10%] text-5xl pointer-events-none opacity-25 hidden lg:block animate-float-delayed">
        ✈️
      </div>
      <div className="fixed bottom-32 right-[15%] text-3xl pointer-events-none opacity-20 hidden lg:block animate-pulse-slow">
        🌤️
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl safe-area-inset-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hover:scale-105 transition-transform">
            <ZivoLogo size="sm" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg">Flights</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground block">Travel Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationCenter />
          <CrossAppNavigation currentApp="main" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 touch-manipulation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-72 p-0 border-r-0">
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
              <FlightOverview />
            </TabsContent>

            <TabsContent value="search" className="mt-0">
              <FlightSearch />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <FlightBookings />
            </TabsContent>

            <TabsContent value="schedules" className="mt-0">
              <FlightSchedules />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <FlightSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
    </div>
  );
};

export default FlightDashboard;
