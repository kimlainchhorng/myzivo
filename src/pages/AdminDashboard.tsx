import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  BarChart3, 
  Shield,
  Menu,
  LogOut,
  FileCheck,
  Store,
  Plane,
  Building2,
  ExternalLink,
  User,
  Utensils,
  Hotel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminDriverVerification from "@/components/admin/AdminDriverVerification";
import AdminTripMonitoring from "@/components/admin/AdminTripMonitoring";
import AdminPricingControls from "@/components/admin/AdminPricingControls";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminDocumentReview from "@/components/admin/AdminDocumentReview";
import AdminRestaurantManagement from "@/components/admin/AdminRestaurantManagement";
import AdminCarRentalManagement from "@/components/admin/AdminCarRentalManagement";
import AdminFlightManagement from "@/components/admin/AdminFlightManagement";
import AdminHotelManagement from "@/components/admin/AdminHotelManagement";
import CrossAppNavigation from "@/components/CrossAppNavigation";

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");

  const navItems = [
    { value: "analytics", label: "Analytics", icon: BarChart3 },
    { value: "users", label: "Users", icon: Users },
    { value: "drivers", label: "Drivers", icon: Car },
    { value: "documents", label: "Documents", icon: FileCheck },
    { value: "trips", label: "Trips", icon: MapPin },
    { value: "pricing", label: "Pricing", icon: DollarSign },
    { value: "restaurants", label: "Restaurants", icon: Store },
    { value: "car-rentals", label: "Car Rentals", icon: Car },
    { value: "flights", label: "Flights", icon: Plane },
    { value: "hotels", label: "Hotels", icon: Building2 },
  ];

  const dashboardLinks = [
    { label: "Customer Dashboard", path: "/dashboard", icon: User },
    { label: "Driver App", path: "/driver", icon: Car },
    { label: "Restaurant Dashboard", path: "/restaurant", icon: Utensils },
    { label: "Car Rental Dashboard", path: "/car-rental", icon: Car },
    { label: "Flight Dashboard", path: "/flights", icon: Plane },
    { label: "Hotel Dashboard", path: "/hotels", icon: Hotel },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-4 border-b border-border">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Zivo Admin</span>
      </div>
      
      {/* Dashboard Switcher */}
      <div className="px-2 py-3 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Switch Dashboard
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Go to Dashboard</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dashboardLinks.map((link) => (
              <DropdownMenuItem
                key={link.path}
                onClick={() => navigate(link.path)}
                className="cursor-pointer"
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="px-2 py-4 space-y-1 flex-1 overflow-auto">
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
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Zivo Admin</span>
        </div>
        <div className="flex items-center gap-2">
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

            <TabsContent value="analytics" className="mt-0">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <AdminUserManagement />
            </TabsContent>

            <TabsContent value="drivers" className="mt-0">
              <AdminDriverVerification />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <AdminDocumentReview />
            </TabsContent>

            <TabsContent value="trips" className="mt-0">
              <AdminTripMonitoring />
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <AdminPricingControls />
            </TabsContent>

            <TabsContent value="restaurants" className="mt-0">
              <AdminRestaurantManagement />
            </TabsContent>

            <TabsContent value="car-rentals" className="mt-0">
              <AdminCarRentalManagement />
            </TabsContent>

            <TabsContent value="flights" className="mt-0">
              <AdminFlightManagement />
            </TabsContent>

            <TabsContent value="hotels" className="mt-0">
              <AdminHotelManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
