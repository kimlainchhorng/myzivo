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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import CustomerOverview from "@/components/customer/CustomerOverview";
import CustomerRides from "@/components/customer/CustomerRides";
import CustomerFoodOrders from "@/components/customer/CustomerFoodOrders";
import CustomerCarRentals from "@/components/customer/CustomerCarRentals";
import CustomerFlights from "@/components/customer/CustomerFlights";
import CustomerHotels from "@/components/customer/CustomerHotels";

import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import { cn } from "@/lib/utils";
import ZivoLogo from "@/components/ZivoLogo";

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
          <div className="hover:scale-110 transition-transform duration-200">
            <ZivoLogo size="sm" />
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
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
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
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group touch-manipulation active:scale-[0.98] animate-in fade-in slide-in-from-left-2",
                isActive
                  ? "bg-primary/10 text-primary"
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
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </button>
          );
        })}

        <Separator className="my-4" />
        
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Account</p>
        
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:bg-muted/50 text-muted-foreground hover:text-foreground group touch-manipulation active:scale-[0.98]"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted/50 group-hover:bg-muted flex items-center justify-center">
            <Settings className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm sm:text-base">Settings</span>
        </button>
        
        <button
          onClick={() => navigate("/help")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:bg-muted/50 text-muted-foreground hover:text-foreground group touch-manipulation active:scale-[0.98]"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted/50 group-hover:bg-muted flex items-center justify-center">
            <HelpCircle className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm sm:text-base">Help Center</span>
        </button>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left hover:bg-destructive/10 text-destructive group touch-manipulation active:scale-[0.98]"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 flex items-center justify-center">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm sm:text-base">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background effects - simplified for mobile */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/6 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-primary/10 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[180px] h-[180px] bg-gradient-to-tr from-eats/8 to-orange-500/4 rounded-full blur-3xl pointer-events-none" />
      
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-3 py-2.5 border-b border-white/10 bg-card/80 backdrop-blur-xl safe-area-inset-top">
        <div className="flex items-center gap-2">
          <ZivoLogo size="sm" />
          <div>
            <span className="font-bold text-sm">ZIVO</span>
            <span className="text-[10px] text-muted-foreground block leading-tight">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <NotificationCenter />
          <CrossAppNavigation currentApp="main" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10 touch-manipulation">
                <Menu className="h-4 w-4" />
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
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <span className="text-2xl sm:text-3xl">👋</span>
                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold">
                  Welcome back{user?.email?.split('@')[0] ? `, ${user.email.split('@')[0]}` : ''}!
                </h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Here's an overview of your bookings and activity
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="hidden">
                {navItems.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="animate-in fade-in duration-200">
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
              </div>
            </Tabs>
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default CustomerDashboard;
