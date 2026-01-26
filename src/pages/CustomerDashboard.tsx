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
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

const CustomerDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { value: "overview", label: "Overview", icon: User },
    { value: "rides", label: "Rides", icon: MapPin },
    { value: "food", label: "Food Orders", icon: UtensilsCrossed },
    { value: "cars", label: "Car Rentals", icon: Car },
    { value: "flights", label: "Flights", icon: Plane },
    { value: "hotels", label: "Hotels", icon: Hotel },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-4 border-b border-border">
        <User className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">My Dashboard</span>
      </div>
      <nav className="px-2 py-4 space-y-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.value}
            onClick={() => setActiveTab(item.value)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
              activeTab === item.value
                ? "bg-primary text-primary-foreground"
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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">My Dashboard</span>
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
          </Tabs>
        </main>
      </div>
      <AdminFloatingButton />
    </div>
  );
};

export default CustomerDashboard;
