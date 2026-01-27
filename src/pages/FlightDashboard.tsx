import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Menu,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Calendar
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
import AdminFloatingButton from "@/components/admin/AdminFloatingButton";
import { useUserAccess } from "@/hooks/useUserAccess";
import AccessDenied from "@/components/auth/AccessDenied";
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import { motion } from "framer-motion";
import ZivoLogo from "@/components/ZivoLogo";

const FlightDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { data: access, isLoading: accessLoading } = useUserAccess(user?.id);
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { value: "overview", label: "Overview", icon: Plane },
    { value: "search", label: "Search Flights", icon: Search },
    { value: "bookings", label: "My Bookings", icon: ClipboardList },
    { value: "schedules", label: "Schedules", icon: Calendar },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 py-4 border-b border-border/50">
        <motion.div whileHover={{ scale: 1.05 }}>
          <ZivoLogo size="sm" />
        </motion.div>
        <span className="font-bold text-lg">Flights</span>
      </div>
      <nav className="px-2 py-4 space-y-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.value}
            onClick={() => setActiveTab(item.value)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
              activeTab === item.value
                ? "bg-sky-500 text-white"
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
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-radial from-sky-500/10 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-sky-500/15 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }}>
            <ZivoLogo size="sm" />
          </motion.div>
          <span className="font-bold text-lg">Flights</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <CrossAppNavigation currentApp="main" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
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
      <AdminFloatingButton />
    </div>
  );
};

export default FlightDashboard;
