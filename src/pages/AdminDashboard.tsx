import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Car, MapPin, DollarSign, BarChart3, Shield, Menu, LogOut, FileCheck, Store, Plane, Building2, Clock,
  ExternalLink, User, Utensils, Hotel, ChevronRight, Wallet, Settings, History, Megaphone, Headphones, Ticket, Crown,
  Activity, FileText, Zap, TrendingUp, Trophy, Scale, Percent, UserPlus, ClipboardCheck, Plug, Radio,
  Navigation, Bike, UserCog, ShieldCheck, Package, CreditCard, Key, Bell, Globe, Database, 
  ArrowUp, Heart, PieChart, Server, Gift, Sparkles, Download, Truck, Banknote, Calendar, MessageSquare, Send, Flag, Briefcase, Target,
  Brain, ShieldAlert, Coins, Rocket, Search, Image, Gauge, Lock, Cpu, LayoutDashboard, Workflow, LineChart, GitCompare, ListFilter,
  Share2, XCircle, Wrench, Star
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
import AdminCustomerDirectory from "@/components/admin/AdminCustomerDirectory";
import AdminGoalsTracker from "@/components/admin/AdminGoalsTracker";
import AdminProjectsOverview from "@/components/admin/AdminProjectsOverview";
import AdminFeatureFlags from "@/components/admin/AdminFeatureFlags";
import AdminAIInsights from "@/components/admin/AdminAIInsights";
import AdminFraudDetection from "@/components/admin/AdminFraudDetection";
import AdminLoyaltyProgram from "@/components/admin/AdminLoyaltyProgram";
import AdminApiUsage from "@/components/admin/AdminApiUsage";
import AdminUserActivityTimeline from "@/components/admin/AdminUserActivityTimeline";
import AdminTicketQueue from "@/components/admin/AdminTicketQueue";
import AdminContentModeration from "@/components/admin/AdminContentModeration";
import AdminGlobalSearch from "@/components/admin/AdminGlobalSearch";
import AdminMarketingCampaigns from "@/components/admin/AdminMarketingCampaigns";
import AdminInventoryManagement from "@/components/admin/AdminInventoryManagement";
import AdminSecurityDashboard from "@/components/admin/AdminSecurityDashboard";
import AdminPerformanceDashboard from "@/components/admin/AdminPerformanceDashboard";
import AdminNotificationManager from "@/components/admin/AdminNotificationManager";
import AdminTopPerformers from "@/components/admin/AdminTopPerformers";
import AdminServiceOverview from "@/components/admin/AdminServiceOverview";
import AdminGeographicInsights from "@/components/admin/AdminGeographicInsights";
import AdminGrowthMetrics from "@/components/admin/AdminGrowthMetrics";
import AdminSystemStatus from "@/components/admin/AdminSystemStatus";
import AdminRealtimeAlerts from "@/components/admin/AdminRealtimeAlerts";
import AdminComparisonDashboard from "@/components/admin/AdminComparisonDashboard";
import AdminPlatformHealth from "@/components/admin/AdminPlatformHealth";
import AdminEventLog from "@/components/admin/AdminEventLog";
import AdminRevenueDashboard from "@/components/admin/AdminRevenueDashboard";
import AdminExecutiveDashboard from "@/components/admin/AdminExecutiveDashboard";
import AdminAutomationCenter from "@/components/admin/AdminAutomationCenter";
import AdminPredictiveAnalytics from "@/components/admin/AdminPredictiveAnalytics";
import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import AdminOnboardingMetrics from "@/components/admin/AdminOnboardingMetrics";
import AdminReferralTracking from "@/components/admin/AdminReferralTracking";
import AdminSLAMonitoring from "@/components/admin/AdminSLAMonitoring";
import AdminCancellationAnalysis from "@/components/admin/AdminCancellationAnalysis";
import AdminPaymentMethods from "@/components/admin/AdminPaymentMethods";
import AdminRatingOverview from "@/components/admin/AdminRatingOverview";
import AdminNotificationTemplates from "@/components/admin/AdminNotificationTemplates";
import AdminMaintenanceMode from "@/components/admin/AdminMaintenanceMode";
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";
import { useAdminStats } from "@/hooks/useAdminStats";

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
  const { data: stats } = useAdminStats();

  // Map stats to nav items for badges
  const statsBadges: Record<string, number | undefined> = useMemo(() => ({
    "drivers": stats?.totalDrivers,
    "driver-map": stats?.onlineDrivers,
    "documents": stats?.pendingDocuments,
    "trips": stats?.totalTrips,
    "rides": stats?.activeTrips,
    "eats": stats?.activeFoodOrders,
    "restaurants": stats?.totalRestaurants,
    "car-rentals": stats?.totalCarRentals,
    "support": stats?.openTickets,
    "ticket-queue": stats?.openTickets,
    "announcements": stats?.activeAnnouncements,
    "promotions": stats?.activePromotions,
    "audit": stats?.totalAuditLogs,
    "users": stats?.totalUsers,
    "accounts": stats?.totalUsers,
    "referrals": stats?.pendingReferrals,
    "security": stats?.unresolvedAlerts,
    "fraud": stats?.unresolvedAlerts,
  }), [stats]);

  const navSections = [
    { title: "Overview", items: [
      { value: "executive", label: "Executive", icon: LayoutDashboard, gradient: "from-primary to-teal-400" },
      { value: "analytics", label: "Analytics", icon: BarChart3, gradient: "from-primary to-teal-400" },
      { value: "services", label: "Services", icon: Activity, gradient: "from-cyan-500 to-blue-500" },
      { value: "activity", label: "Activity Feed", icon: Activity, gradient: "from-cyan-500 to-blue-500" },
      { value: "realtime", label: "Real-time", icon: Radio, gradient: "from-violet-500 to-purple-500" },
      { value: "health", label: "Service Health", icon: Server, gradient: "from-emerald-500 to-green-500" },
      { value: "platform-health", label: "Platform Health", icon: Heart, gradient: "from-rose-500 to-pink-500" },
      { value: "growth", label: "Growth Metrics", icon: TrendingUp, gradient: "from-green-500 to-emerald-500" },
      { value: "system-status", label: "System Status", icon: Activity, gradient: "from-blue-500 to-cyan-500" },
      { value: "predictive", label: "Predictive", icon: LineChart, gradient: "from-violet-500 to-purple-500" },
      { value: "comparison", label: "Comparison", icon: GitCompare, gradient: "from-amber-500 to-orange-500" },
      { value: "geographic", label: "Geographic", icon: Globe, gradient: "from-blue-500 to-cyan-500" },
      { value: "ai-insights", label: "AI Insights", icon: Brain, gradient: "from-violet-500 to-pink-500" },
      { value: "global-search", label: "Global Search", icon: Search, gradient: "from-violet-500 to-purple-500" },
    ]},
    { title: "Accounts", items: [
      { value: "accounts", label: "All Accounts", icon: Users, gradient: "from-violet-500 to-purple-500" },
      { value: "users", label: "Customers", icon: User, gradient: "from-blue-500 to-cyan-500" },
      { value: "directory", label: "Directory", icon: Users, gradient: "from-blue-500 to-cyan-500" },
      { value: "insights", label: "Insights", icon: Heart, gradient: "from-rose-500 to-pink-500" },
      { value: "segments", label: "Segments", icon: PieChart, gradient: "from-violet-500 to-purple-500" },
      { value: "performers", label: "Top Performers", icon: Trophy, gradient: "from-amber-500 to-yellow-500" },
      { value: "roles", label: "Roles", icon: Crown, gradient: "from-amber-500 to-orange-500" },
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
      { value: "inventory", label: "Inventory", icon: Package, gradient: "from-violet-500 to-purple-500" },
    ]},
    { title: "Financial", items: [
      { value: "revenue", label: "Revenue", icon: DollarSign, gradient: "from-green-500 to-emerald-500" },
      { value: "payouts", label: "Payouts", icon: Wallet, gradient: "from-green-500 to-emerald-500" },
      { value: "processing", label: "Processing", icon: Zap, gradient: "from-amber-500 to-orange-500" },
      { value: "commissions", label: "Commission", icon: Percent, gradient: "from-violet-500 to-purple-500" },
      { value: "reconciliation", label: "Reconcile", icon: Scale, gradient: "from-blue-500 to-cyan-500" },
      { value: "goals", label: "Goals", icon: Target, gradient: "from-green-500 to-emerald-500" },
    ]},
    { title: "Engagement", items: [
      { value: "campaigns", label: "Campaigns", icon: Megaphone, gradient: "from-violet-500 to-purple-500" },
      { value: "promotions", label: "Promotions", icon: Ticket, gradient: "from-violet-500 to-purple-500" },
      { value: "notification-mgr", label: "Notifications", icon: Bell, gradient: "from-rose-500 to-pink-500" },
      { value: "announcements", label: "Announcements", icon: Megaphone, gradient: "from-rose-500 to-pink-500" },
      { value: "support", label: "Support Tickets", icon: Headphones, gradient: "from-cyan-500 to-teal-500" },
      { value: "ticket-queue", label: "Ticket Queue", icon: Ticket, gradient: "from-amber-500 to-orange-500" },
      { value: "escalations", label: "Escalations", icon: ArrowUp, gradient: "from-red-500 to-orange-500" },
      { value: "moderation", label: "Moderation", icon: Image, gradient: "from-rose-500 to-pink-500" },
    ]},
    { title: "System", items: [
      { value: "automation", label: "Automation", icon: Workflow, gradient: "from-violet-500 to-purple-500" },
      { value: "integrations", label: "Integrations", icon: Plug, gradient: "from-cyan-500 to-blue-500" },
      { value: "api-usage", label: "API Usage", icon: Activity, gradient: "from-cyan-500 to-blue-500" },
      { value: "feature-flags", label: "Feature Flags", icon: Flag, gradient: "from-cyan-500 to-blue-500" },
      { value: "security", label: "Security", icon: Lock, gradient: "from-red-500 to-orange-500" },
      { value: "fraud", label: "Fraud Detection", icon: ShieldAlert, gradient: "from-red-500 to-orange-500" },
      { value: "compliance", label: "Compliance", icon: ShieldCheck, gradient: "from-emerald-500 to-green-500" },
      { value: "sla", label: "SLA Monitor", icon: Target, gradient: "from-blue-500 to-cyan-500" },
      { value: "maintenance", label: "Maintenance", icon: Wrench, gradient: "from-amber-500 to-orange-500" },
      { value: "event-log", label: "Event Log", icon: ListFilter, gradient: "from-slate-500 to-zinc-500" },
      { value: "export", label: "Data Export", icon: Download, gradient: "from-teal-500 to-cyan-500" },
      { value: "reports", label: "Reports", icon: FileText, gradient: "from-emerald-500 to-teal-500" },
      { value: "settings", label: "Settings", icon: Settings, gradient: "from-slate-500 to-zinc-500" },
      { value: "audit", label: "Audit Logs", icon: History, gradient: "from-indigo-500 to-purple-500" },
    ]},
    { title: "Analytics", items: [
      { value: "loyalty", label: "Loyalty Program", icon: Coins, gradient: "from-amber-500 to-yellow-500" },
      { value: "onboarding-metrics", label: "Onboarding", icon: UserPlus, gradient: "from-cyan-500 to-blue-500" },
      { value: "referrals", label: "Referrals", icon: Share2, gradient: "from-purple-500 to-pink-500" },
      { value: "cancellations", label: "Cancellations", icon: XCircle, gradient: "from-red-500 to-orange-500" },
      { value: "payments", label: "Payment Methods", icon: CreditCard, gradient: "from-blue-500 to-cyan-500" },
      { value: "ratings", label: "Ratings", icon: Star, gradient: "from-amber-500 to-yellow-500" },
      { value: "templates", label: "Templates", icon: Bell, gradient: "from-rose-500 to-pink-500" },
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
                const badgeCount = statsBadges[item.value];
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
                    {badgeCount !== undefined && badgeCount > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px] font-semibold bg-primary/10 text-primary border-0">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </Badge>
                    )}
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

            <TabsContent value="executive" className="mt-0"><AdminExecutiveDashboard /></TabsContent>
            <TabsContent value="analytics" className="mt-0"><AdminAnalytics /></TabsContent>
            <TabsContent value="services" className="mt-0"><AdminServiceOverview /></TabsContent>
            <TabsContent value="activity" className="mt-0"><AdminActivityFeed /></TabsContent>
            <TabsContent value="realtime" className="mt-0"><AdminRealtimeDashboard /></TabsContent>
            <TabsContent value="health" className="mt-0"><AdminServiceHealth /></TabsContent>
            <TabsContent value="platform-health" className="mt-0"><AdminPlatformHealth /></TabsContent>
            <TabsContent value="growth" className="mt-0"><AdminGrowthMetrics /></TabsContent>
            <TabsContent value="system-status" className="mt-0"><AdminSystemStatus /></TabsContent>
            <TabsContent value="predictive" className="mt-0"><AdminPredictiveAnalytics /></TabsContent>
            <TabsContent value="comparison" className="mt-0"><AdminComparisonDashboard /></TabsContent>
            <TabsContent value="performance" className="mt-0"><AdminPerformanceDashboard /></TabsContent>
            <TabsContent value="forecasting" className="mt-0"><AdminRevenueForecasting /></TabsContent>
            <TabsContent value="geographic" className="mt-0"><AdminGeographicInsights /></TabsContent>
            <TabsContent value="accounts" className="mt-0"><AdminAccountsManagement /></TabsContent>
            <TabsContent value="users" className="mt-0"><AdminUserManagement /></TabsContent>
            <TabsContent value="insights" className="mt-0"><AdminCustomerInsights /></TabsContent>
            <TabsContent value="segments" className="mt-0"><AdminUserSegments /></TabsContent>
            <TabsContent value="performers" className="mt-0"><AdminTopPerformers /></TabsContent>
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
            <TabsContent value="inventory" className="mt-0"><AdminInventoryManagement /></TabsContent>
            <TabsContent value="revenue" className="mt-0"><AdminRevenueDashboard /></TabsContent>
            <TabsContent value="payouts" className="mt-0"><AdminPayouts /></TabsContent>
            <TabsContent value="processing" className="mt-0"><AdminPayoutProcessing /></TabsContent>
            <TabsContent value="commissions" className="mt-0"><AdminCommissionAnalytics /></TabsContent>
            <TabsContent value="reconciliation" className="mt-0"><AdminRevenueReconciliation /></TabsContent>
            <TabsContent value="goals" className="mt-0"><AdminGoalsTracker /></TabsContent>
            <TabsContent value="campaigns" className="mt-0"><AdminMarketingCampaigns /></TabsContent>
            <TabsContent value="promotions" className="mt-0"><AdminPromotions /></TabsContent>
            <TabsContent value="notification-mgr" className="mt-0"><AdminNotificationManager /></TabsContent>
            <TabsContent value="notifications" className="mt-0"><AdminNotificationHub /></TabsContent>
            <TabsContent value="announcements" className="mt-0"><AdminAnnouncements /></TabsContent>
            <TabsContent value="support" className="mt-0"><AdminSupportTickets /></TabsContent>
            <TabsContent value="escalations" className="mt-0"><AdminEscalationManager /></TabsContent>
            <TabsContent value="automation" className="mt-0"><AdminAutomationCenter /></TabsContent>
            <TabsContent value="integrations" className="mt-0"><AdminIntegrationManager /></TabsContent>
            <TabsContent value="security" className="mt-0"><AdminSecurityDashboard /></TabsContent>
            <TabsContent value="compliance" className="mt-0"><AdminComplianceCenter /></TabsContent>
            <TabsContent value="event-log" className="mt-0"><AdminEventLog /></TabsContent>
            <TabsContent value="export" className="mt-0"><AdminDataExport /></TabsContent>
            <TabsContent value="reports" className="mt-0"><AdminReports /></TabsContent>
            <TabsContent value="settings" className="mt-0"><AdminSystemSettings /></TabsContent>
            <TabsContent value="audit" className="mt-0"><AdminAuditLogs /></TabsContent>
            <TabsContent value="ai-insights" className="mt-0"><AdminAIInsights /></TabsContent>
            <TabsContent value="fraud" className="mt-0"><AdminFraudDetection /></TabsContent>
            <TabsContent value="loyalty" className="mt-0"><AdminLoyaltyProgram /></TabsContent>
            <TabsContent value="api-usage" className="mt-0"><AdminApiUsage /></TabsContent>
            <TabsContent value="feature-flags" className="mt-0"><AdminFeatureFlags /></TabsContent>
            <TabsContent value="activity-timeline" className="mt-0"><AdminUserActivityTimeline /></TabsContent>
            <TabsContent value="global-search" className="mt-0"><AdminGlobalSearch /></TabsContent>
            <TabsContent value="directory" className="mt-0"><AdminCustomerDirectory /></TabsContent>
            <TabsContent value="ticket-queue" className="mt-0"><AdminTicketQueue /></TabsContent>
            <TabsContent value="moderation" className="mt-0"><AdminContentModeration /></TabsContent>
            <TabsContent value="sla" className="mt-0"><AdminSLAMonitoring /></TabsContent>
            <TabsContent value="maintenance" className="mt-0"><AdminMaintenanceMode /></TabsContent>
            <TabsContent value="onboarding-metrics" className="mt-0"><AdminOnboardingMetrics /></TabsContent>
            <TabsContent value="referrals" className="mt-0"><AdminReferralTracking /></TabsContent>
            <TabsContent value="cancellations" className="mt-0"><AdminCancellationAnalysis /></TabsContent>
            <TabsContent value="payments" className="mt-0"><AdminPaymentMethods /></TabsContent>
            <TabsContent value="ratings" className="mt-0"><AdminRatingOverview /></TabsContent>
            <TabsContent value="templates" className="mt-0"><AdminNotificationTemplates /></TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
