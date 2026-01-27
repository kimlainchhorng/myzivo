import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, 
  UtensilsCrossed, 
  Plane, 
  Hotel, 
  MapPin,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Bell,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import CustomerOverview from "@/components/customer/CustomerOverview";
import CustomerRides from "@/components/customer/CustomerRides";
import CustomerFoodOrders from "@/components/customer/CustomerFoodOrders";
import CustomerCarRentals from "@/components/customer/CustomerCarRentals";
import CustomerFlights from "@/components/customer/CustomerFlights";
import CustomerHotels from "@/components/customer/CustomerHotels";
import AdminFloatingButton from "@/components/admin/AdminFloatingButton";
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CustomerDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { value: "overview", label: "Overview", icon: LayoutDashboard, gradient: "from-primary to-teal-400" },
    { value: "rides", label: "Rides", icon: MapPin, gradient: "from-rides to-green-500" },
    { value: "food", label: "Food Orders", icon: UtensilsCrossed, gradient: "from-eats to-red-500" },
    { value: "cars", label: "Car Rentals", icon: Car, gradient: "from-primary to-teal-400" },
    { value: "flights", label: "Flights", icon: Plane, gradient: "from-sky-500 to-blue-600" },
    { value: "hotels", label: "Hotels", icon: Hotel, gradient: "from-amber-500 to-orange-600" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg block">ZIVO</span>
            <span className="text-xs text-muted-foreground">My Dashboard</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Bookings</p>
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
                  ? "bg-primary/10 text-primary"
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
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </motion.button>
          );
        })}

        <Separator className="my-4" />
        
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Account</p>
        
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:bg-muted/50 text-muted-foreground hover:text-foreground group"
        >
          <div className="w-9 h-9 rounded-lg bg-muted/50 group-hover:bg-muted flex items-center justify-center">
            <Settings className="h-4 w-4" />
          </div>
          <span className="font-medium">Settings</span>
        </button>
        
        <button
          onClick={() => navigate("/help")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:bg-muted/50 text-muted-foreground hover:text-foreground group"
        >
          <div className="w-9 h-9 rounded-lg bg-muted/50 group-hover:bg-muted flex items-center justify-center">
            <HelpCircle className="h-4 w-4" />
          </div>
          <span className="font-medium">Help Center</span>
        </button>
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Background effects */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-eats/10 to-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/3 w-[300px] h-[300px] bg-gradient-radial from-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <span className="font-bold text-lg">ZIVO</span>
            <span className="text-xs text-muted-foreground block">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <CrossAppNavigation currentApp="main" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
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
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <span className="text-3xl">👋</span>
                </motion.div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold">
                  Welcome back{user?.email?.split('@')[0] ? `, ${user.email.split('@')[0]}` : ''}!
                </h1>
              </div>
              <p className="text-muted-foreground">
                Here's an overview of your bookings and activity
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="hidden">
                {navItems.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="overview" className="mt-0">
                    <CustomerOverview />
                  </TabsContent>

                  <TabsContent value="rides" className="mt-0">
                    <CustomerRides />
                  </TabsContent>

                  <TabsContent value="food" className="mt-0">
                    <CustomerFoodOrders />
                  </TabsContent>

                  <TabsContent value="cars" className="mt-0">
                    <CustomerCarRentals />
                  </TabsContent>

                  <TabsContent value="flights" className="mt-0">
                    <CustomerFlights />
                  </TabsContent>

                  <TabsContent value="hotels" className="mt-0">
                    <CustomerHotels />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </main>
      </div>
      <AdminFloatingButton />
    </div>
  );
};

export default CustomerDashboard;
