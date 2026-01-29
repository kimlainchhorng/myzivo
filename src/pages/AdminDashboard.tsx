import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Car, MapPin, DollarSign, BarChart3, Shield, Menu, LogOut, FileCheck, Store, Plane, Building2,
  ExternalLink, User, Utensils, Hotel, ChevronRight, Wallet, Settings, History, Megaphone, Headphones, Ticket, Crown,
  Activity, FileText, Zap, TrendingUp, Trophy, Scale, Percent, UserPlus, ClipboardCheck, Plug, Radio,
  Navigation, Bike, UserCog, ShieldCheck, Package, CreditCard, Key, Bell, Globe, Database, 
  ArrowUp, Heart, PieChart, Server, Gift, Sparkles, Download, Truck, Banknote, Calendar, MessageSquare, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminDriverManagement from "@/components/admin/AdminDriverManagement";
import AdminTripMonitoring from "@/components/admin/AdminTripMonitoring";
import AdminPricingControls from "@/components/admin/AdminPricingControls";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminDocumentReview from "@/components/admin/AdminDocumentReview";
import AdminRestaurantManagement from "@/components/admin/AdminRestaurantManagement";
import AdminCarRentalManagement from "@/components/admin/AdminCarRentalManagement";
import AdminFlightManagement from "@/components/admin/AdminFlightManagement";
import AdminHotelManagement from "@/components/admin/AdminHotelManagement";
import AdminRoleManagement from "@/components/admin/AdminRoleManagement";
import AdminPayouts from "@/components/admin/AdminPayouts";
import AdminSystemSettings from "@/components/admin/AdminSystemSettings";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminSupportTickets from "@/components/admin/AdminSupportTickets";
import AdminPromotions from "@/components/admin/AdminPromotions";
import AdminReports from "@/components/admin/AdminReports";
import AdminActivityFeed from "@/components/admin/AdminActivityFeed";
import AdminDriverPerformance from "@/components/admin/AdminDriverPerformance";
import AdminDriverEarnings from "@/components/admin/AdminDriverEarnings";
import AdminDriverScoring from "@/components/admin/AdminDriverScoring";
import AdminHeatmapView from "@/components/admin/AdminHeatmapView";
import AdminCommissionAnalytics from "@/components/admin/AdminCommissionAnalytics";
import AdminRevenueReconciliation from "@/components/admin/AdminRevenueReconciliation";
import AdminPayoutProcessing from "@/components/admin/AdminPayoutProcessing";
import AdminDriverOnboardingQueue from "@/components/admin/AdminDriverOnboardingQueue";
import AdminDriverVerification from "@/components/admin/AdminDriverVerification";
import AdminIntegrationManager from "@/components/admin/AdminIntegrationManager";
import AdminRealtimeDashboard from "@/components/admin/AdminRealtimeDashboard";
import AdminRidesManagement from "@/components/admin/AdminRidesManagement";
import AdminEatsManagement from "@/components/admin/AdminEatsManagement";
import AdminAccountsManagement from "@/components/admin/AdminAccountsManagement";
import AdminDeliveryManagement from "@/components/admin/AdminDeliveryManagement";
import AdminCustomerInsights from "@/components/admin/AdminCustomerInsights";
import AdminEscalationManager from "@/components/admin/AdminEscalationManager";
import AdminServiceHealth from "@/components/admin/AdminServiceHealth";
import AdminUserSegments from "@/components/admin/AdminUserSegments";
import AdminDriverIncentives from "@/components/admin/AdminDriverIncentives";
import AdminComplianceCenter from "@/components/admin/AdminComplianceCenter";
import AdminRevenueForecasting from "@/components/admin/AdminRevenueForecasting";
import AdminNotificationHub from "@/components/admin/AdminNotificationHub";
import AdminFleetManagement from "@/components/admin/AdminFleetManagement";
import AdminDataExport from "@/components/admin/AdminDataExport";
import AdminVehicleInspections from "@/components/admin/AdminVehicleInspections";
import AdminLiveDriverMap from "@/components/admin/AdminLiveDriverMap";
import AdminCashCollection from "@/components/admin/AdminCashCollection";
import AdminDriverSchedules from "@/components/admin/AdminDriverSchedules";
import AdminDriverMessaging from "@/components/admin/AdminDriverMessaging";
import AdminTripAssignment from "@/components/admin/AdminTripAssignment";
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");

  const navSections = [
    { title: "Overview", items: [
      { value: "analytics", label: "Analytics", icon: BarChart3, gradient: "from-primary to-teal-400" },
      { value: "activity", label: "Activity Feed", icon: Activity, gradient: "from-cyan-500 to-blue-500" },
      { value: "realtime", label: "Real-time", icon: Radio, gradient: "from-violet-500 to-purple-500" },
      { value: "health", label: "Service Health", icon: Server, gradient: "from-emerald-500 to-green-500" },
      { value: "forecasting", label: "Forecasting", icon: Sparkles, gradient: "from-violet-500 to-purple-500" },
    ]},
    { title: "Accounts", items: [
      { value: "accounts", label: "All Accounts", icon: Users, gradient: "from-violet-500 to-purple-500" },
      { value: "users", label: "Customers", icon: User, gradient: "from-blue-500 to-cyan-500" },
      { value: "insights", label: "Customer Insights", icon: Heart, gradient: "from-rose-500 to-pink-500" },
      { value: "segments", label: "User Segments", icon: PieChart, gradient: "from-violet-500 to-purple-500" },
      { value: "roles", label: "Roles & Permissions", icon: Crown, gradient: "from-amber-500 to-orange-500" },
    ]},
    { title: "Driver Control", items: [
      { value: "drivers", label: "Driver Hub", icon: Car, gradient: "from-emerald-500 to-green-500" },
      { value: "driver-map", label: "Live Map", icon: MapPin, gradient: "from-green-500 to-teal-500" },
      { value: "fleet", label: "Fleet", icon: Truck, gradient: "from-blue-500 to-cyan-500" },
      { value: "inspections", label: "Inspections", icon: ClipboardCheck, gradient: "from-sky-500 to-blue-500" },
      { value: "schedules", label: "Schedules", icon: Calendar, gradient: "from-indigo-500 to-violet-500" },
      { value: "messaging", label: "Messaging", icon: MessageSquare, gradient: "from-blue-500 to-cyan-500" },
      { value: "onboarding", label: "Onboarding", icon: UserPlus, gradient: "from-cyan-500 to-blue-500" },
      { value: "documents", label: "Documents", icon: FileCheck, gradient: "from-amber-500 to-orange-500" },
      { value: "verification", label: "Approval", icon: ClipboardCheck, gradient: "from-green-500 to-emerald-500" },
      { value: "incentives", label: "Incentives", icon: Gift, gradient: "from-amber-500 to-orange-500" },
      { value: "scoring", label: "Performance", icon: Trophy, gradient: "from-amber-500 to-yellow-500" },
      { value: "earnings", label: "Earnings", icon: DollarSign, gradient: "from-green-500 to-emerald-500" },
      { value: "cash", label: "Cash Collection", icon: Banknote, gradient: "from-green-500 to-emerald-500" },
    ]},
    { title: "Rides", items: [
      { value: "rides", label: "Rides Control", icon: Navigation, gradient: "from-sky-500 to-blue-500" },
      { value: "trips", label: "Trip Monitoring", icon: MapPin, gradient: "from-sky-500 to-blue-500" },
      { value: "assignment", label: "Trip Assignment", icon: Send, gradient: "from-violet-500 to-purple-500" },
      { value: "heatmap", label: "Demand Heatmap", icon: MapPin, gradient: "from-orange-500 to-red-500" },
      { value: "pricing", label: "Surge & Pricing", icon: DollarSign, gradient: "from-rose-500 to-pink-500" },
    ]},
    { title: "Eats", items: [
      { value: "eats", label: "Eats Control", icon: Utensils, gradient: "from-eats to-red-500" },
      { value: "restaurants", label: "Restaurants", icon: Store, gradient: "from-eats to-red-500" },
      { value: "delivery", label: "Delivery", icon: Bike, gradient: "from-cyan-500 to-blue-500" },
    ]},
    { title: "Travel Services", items: [
      { value: "car-rentals", label: "Car Rentals", icon: Car, gradient: "from-indigo-500 to-violet-500" },
      { value: "flights", label: "Flights", icon: Plane, gradient: "from-sky-500 to-cyan-500" },
      { value: "hotels", label: "Hotels", icon: Building2, gradient: "from-amber-500 to-yellow-500" },
    ]},
    { title: "Financial", items: [
      { value: "payouts", label: "Payouts", icon: Wallet, gradient: "from-green-500 to-emerald-500" },
      { value: "processing", label: "Processing", icon: Zap, gradient: "from-amber-500 to-orange-500" },
      { value: "commissions", label: "Commission", icon: Percent, gradient: "from-violet-500 to-purple-500" },
      { value: "reconciliation", label: "Reconcile", icon: Scale, gradient: "from-blue-500 to-cyan-500" },
    ]},
    { title: "Engagement", items: [
      { value: "promotions", label: "Promotions", icon: Ticket, gradient: "from-violet-500 to-purple-500" },
      { value: "notifications", label: "Notifications", icon: Bell, gradient: "from-rose-500 to-pink-500" },
      { value: "announcements", label: "Announcements", icon: Megaphone, gradient: "from-rose-500 to-pink-500" },
      { value: "support", label: "Support Tickets", icon: Headphones, gradient: "from-cyan-500 to-teal-500" },
      { value: "escalations", label: "Escalations", icon: ArrowUp, gradient: "from-red-500 to-orange-500" },
    ]},
    { title: "System", items: [
      { value: "integrations", label: "Integrations", icon: Plug, gradient: "from-cyan-500 to-blue-500" },
      { value: "compliance", label: "Compliance", icon: ShieldCheck, gradient: "from-emerald-500 to-green-500" },
      { value: "export", label: "Data Export", icon: Download, gradient: "from-teal-500 to-cyan-500" },
      { value: "reports", label: "Reports", icon: FileText, gradient: "from-emerald-500 to-teal-500" },
      { value: "settings", label: "Settings", icon: Settings, gradient: "from-slate-500 to-zinc-500" },
      { value: "audit", label: "Audit Logs", icon: History, gradient: "from-indigo-500 to-purple-500" },
    ]},
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
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <ZivoLogo size="sm" />
          <div>
            <span className="font-bold text-lg block">Admin</span>
            <span className="text-xs text-muted-foreground">Control Center</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between rounded-xl bg-muted/30 border-border/50">
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
              <DropdownMenuItem key={link.path} onClick={() => navigate(link.path)} className="cursor-pointer">
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left group touch-manipulation active:scale-[0.98]",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all",
                      isActive ? `bg-gradient-to-br ${item.gradient} shadow-lg` : "bg-muted/50 group-hover:bg-muted"
                    )}>
                      <item.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                    </div>
                    <span className="font-medium text-xs sm:text-sm flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left hover:bg-destructive/10 text-destructive group touch-manipulation active:scale-[0.98]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 flex items-center justify-center">
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl safe-area-inset-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <ZivoLogo size="sm" />
          <div>
            <span className="font-bold text-base sm:text-lg">Admin</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground block">Control Center</span>
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
        <aside className="hidden lg:block w-72 min-h-screen border-r border-border/50 bg-card/50 backdrop-blur-sm sticky top-0">
          <NavContent />
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">{navSections.flatMap(s => s.items).map((item) => (<TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>))}</TabsList>

            <TabsContent value="analytics" className="mt-0"><AdminAnalytics /></TabsContent>
            <TabsContent value="activity" className="mt-0"><AdminActivityFeed /></TabsContent>
            <TabsContent value="realtime" className="mt-0"><AdminRealtimeDashboard /></TabsContent>
            <TabsContent value="health" className="mt-0"><AdminServiceHealth /></TabsContent>
            <TabsContent value="forecasting" className="mt-0"><AdminRevenueForecasting /></TabsContent>
            <TabsContent value="accounts" className="mt-0"><AdminAccountsManagement /></TabsContent>
            <TabsContent value="users" className="mt-0"><AdminUserManagement /></TabsContent>
            <TabsContent value="insights" className="mt-0"><AdminCustomerInsights /></TabsContent>
            <TabsContent value="segments" className="mt-0"><AdminUserSegments /></TabsContent>
            <TabsContent value="roles" className="mt-0"><AdminRoleManagement /></TabsContent>
            <TabsContent value="drivers" className="mt-0"><AdminDriverManagement /></TabsContent>
            <TabsContent value="driver-map" className="mt-0"><AdminLiveDriverMap /></TabsContent>
            <TabsContent value="fleet" className="mt-0"><AdminFleetManagement /></TabsContent>
            <TabsContent value="inspections" className="mt-0"><AdminVehicleInspections /></TabsContent>
            <TabsContent value="schedules" className="mt-0"><AdminDriverSchedules /></TabsContent>
            <TabsContent value="messaging" className="mt-0"><AdminDriverMessaging /></TabsContent>
            <TabsContent value="onboarding" className="mt-0"><AdminDriverOnboardingQueue /></TabsContent>
            <TabsContent value="documents" className="mt-0"><AdminDocumentReview /></TabsContent>
            <TabsContent value="verification" className="mt-0"><AdminDriverVerification /></TabsContent>
            <TabsContent value="incentives" className="mt-0"><AdminDriverIncentives /></TabsContent>
            <TabsContent value="scoring" className="mt-0"><AdminDriverScoring /></TabsContent>
            <TabsContent value="earnings" className="mt-0"><AdminDriverEarnings /></TabsContent>
            <TabsContent value="cash" className="mt-0"><AdminCashCollection /></TabsContent>
            <TabsContent value="rides" className="mt-0"><AdminRidesManagement /></TabsContent>
            <TabsContent value="trips" className="mt-0"><AdminTripMonitoring /></TabsContent>
            <TabsContent value="assignment" className="mt-0"><AdminTripAssignment /></TabsContent>
            <TabsContent value="heatmap" className="mt-0"><AdminHeatmapView /></TabsContent>
            <TabsContent value="pricing" className="mt-0"><AdminPricingControls /></TabsContent>
            <TabsContent value="eats" className="mt-0"><AdminEatsManagement /></TabsContent>
            <TabsContent value="restaurants" className="mt-0"><AdminRestaurantManagement /></TabsContent>
            <TabsContent value="delivery" className="mt-0"><AdminDeliveryManagement /></TabsContent>
            <TabsContent value="car-rentals" className="mt-0"><AdminCarRentalManagement /></TabsContent>
            <TabsContent value="flights" className="mt-0"><AdminFlightManagement /></TabsContent>
            <TabsContent value="hotels" className="mt-0"><AdminHotelManagement /></TabsContent>
            <TabsContent value="payouts" className="mt-0"><AdminPayouts /></TabsContent>
            <TabsContent value="processing" className="mt-0"><AdminPayoutProcessing /></TabsContent>
            <TabsContent value="commissions" className="mt-0"><AdminCommissionAnalytics /></TabsContent>
            <TabsContent value="reconciliation" className="mt-0"><AdminRevenueReconciliation /></TabsContent>
            <TabsContent value="promotions" className="mt-0"><AdminPromotions /></TabsContent>
            <TabsContent value="notifications" className="mt-0"><AdminNotificationHub /></TabsContent>
            <TabsContent value="announcements" className="mt-0"><AdminAnnouncements /></TabsContent>
            <TabsContent value="support" className="mt-0"><AdminSupportTickets /></TabsContent>
            <TabsContent value="escalations" className="mt-0"><AdminEscalationManager /></TabsContent>
            <TabsContent value="integrations" className="mt-0"><AdminIntegrationManager /></TabsContent>
            <TabsContent value="compliance" className="mt-0"><AdminComplianceCenter /></TabsContent>
            <TabsContent value="export" className="mt-0"><AdminDataExport /></TabsContent>
            <TabsContent value="reports" className="mt-0"><AdminReports /></TabsContent>
            <TabsContent value="settings" className="mt-0"><AdminSystemSettings /></TabsContent>
            <TabsContent value="audit" className="mt-0"><AdminAuditLogs /></TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
