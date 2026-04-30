/**
 * RideHubPage - Central hub for all ride features
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Crown, Search, Receipt, Star, Car, Calendar, Route, MessageSquare, Shield, MapPin, Users, DollarSign, Accessibility, Navigation, Wallet, User, Share2, Award, PieChart, Zap, History, Map as MapIcon, CalendarDays, Bell, Settings, Leaf, Briefcase, ThumbsUp, Dog, Music, Gift, TrendingUp, Trophy, Building2, Heart, Brain, ShieldCheck, Plane, UserPlus, Gem, Gavel, Camera } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import RideHistoryInsights from "@/components/rides/RideHistoryInsights";
import RidePassPlans from "@/components/rides/RidePassPlans";
import LostItemReport from "@/components/rides/LostItemReport";
import RideReceiptCard from "@/components/rides/RideReceiptCard";
import RateAndTipFlow from "@/components/rides/RateAndTipFlow";
import SurgePricingMap from "@/components/rides/SurgePricingMap";
import ScheduleRideSheet from "@/components/rides/ScheduleRideSheet";
import MultiStopRoute from "@/components/rides/MultiStopRoute";
import InRideChat from "@/components/rides/InRideChat";
import SafetyModePanel from "@/components/rides/SafetyModePanel";
import SmartSavedPlaces from "@/components/rides/SmartSavedPlaces";
import GroupRidePlanner from "@/components/rides/GroupRidePlanner";
import FareComparisonTool from "@/components/rides/FareComparisonTool";
import AccessibilityHub from "@/components/rides/AccessibilityHub";
import RideBookingConfirmation from "@/components/rides/RideBookingConfirmation";
import LiveTripTracker from "@/components/rides/LiveTripTracker";
import RideWallet from "@/components/rides/RideWallet";
import DriverProfileCard from "@/components/rides/DriverProfileCard";
import RideSocialHub from "@/components/rides/RideSocialHub";
import RideLoyaltyCard from "@/components/rides/RideLoyaltyCard";
import RideSpendingAnalytics from "@/components/rides/RideSpendingAnalytics";
import RideQuickSearch from "@/components/rides/RideQuickSearch";
import RideTripHistory from "@/components/rides/RideTripHistory";

import RideScheduleCalendar from "@/components/rides/RideScheduleCalendar";
import RideDriverMatch from "@/components/rides/RideDriverMatch";
import RideSafetyCenter from "@/components/rides/RideSafetyCenter";
import RideNotificationCenter from "@/components/rides/RideNotificationCenter";
import RidePreferences from "@/components/rides/RidePreferences";
import RideEcoTracker from "@/components/rides/RideEcoTracker";
import RideBusinessManager from "@/components/rides/RideBusinessManager";
import RideFeedbackCenter from "@/components/rides/RideFeedbackCenter";
import RideSpecialtyModes from "@/components/rides/RideSpecialtyModes";
import RideSmartAnalytics from "@/components/rides/RideSmartAnalytics";
import RideEntertainment from "@/components/rides/RideEntertainment";
import RideGifting from "@/components/rides/RideGifting";
import RideRewardsGamification from "@/components/rides/RideRewardsGamification";
import RideCorporateFleet from "@/components/rides/RideCorporateFleet";
import RideAccessibilityPlus from "@/components/rides/RideAccessibilityPlus";
import RideRouteIntelligence from "@/components/rides/RideRouteIntelligence";
import RideAdvancedSafety from "@/components/rides/RideAdvancedSafety";
import RideTravelIntegration from "@/components/rides/RideTravelIntegration";
import RideFamilyAccounts from "@/components/rides/RideFamilyAccounts";
import RideSubscriptionHub from "@/components/rides/RideSubscriptionHub";
import RideSmartPricing from "@/components/rides/RideSmartPricing";
import RideDriverComm from "@/components/rides/RideDriverComm";
import RideSocialFeatures from "@/components/rides/RideSocialFeatures";
import RideAnalyticsDashboard from "@/components/rides/RideAnalyticsDashboard";
import RideMarketplace from "@/components/rides/RideMarketplace";
import RideWellnessComfort from "@/components/rides/RideWellnessComfort";
import RidePaymentsAdvanced from "@/components/rides/RidePaymentsAdvanced";
import RideAIAssistant from "@/components/rides/RideAIAssistant";
import RideSchedulingRecurring from "@/components/rides/RideSchedulingRecurring";
import RideSafetyAdvanced from "@/components/rides/RideSafetyAdvanced";
import RideLoyaltyRewards from "@/components/rides/RideLoyaltyRewards";
import RideAccessibilityAdvanced from "@/components/rides/RideAccessibilityAdvanced";
import RideBookingHome from "@/components/rides/RideBookingHome";
import ZivoReserve from "@/components/rides/ZivoReserve";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";

// Tabs are built inside component for translation

type TabCategory = "book" | "trip" | "money" | "safety" | "comfort" | "rewards" | "business";

export default function RideHubPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const tabs: { id: string; label: string; icon: typeof Zap; category: TabCategory }[] = [
    { id: "book", label: t("ride.tab_book"), icon: Zap, category: "book" },
    { id: "reserve", label: t("ride.tab_reserve"), icon: CalendarDays, category: "book" },
    { id: "schedule", label: "Schedule", icon: Calendar, category: "book" },
    { id: "scheduling", label: "Scheduling", icon: CalendarDays, category: "book" },
    { id: "calendar", label: t("ride.tab_calendar"), icon: CalendarDays, category: "book" },
    { id: "multi", label: "Multi-Stop", icon: Route, category: "book" },
    { id: "group", label: "Group", icon: Users, category: "book" },
    { id: "places", label: "Places", icon: MapPin, category: "book" },
    { id: "search", label: t("ride.tab_search"), icon: Search, category: "book" },
    { id: "map", label: t("ride.tab_map"), icon: MapIcon, category: "trip" },
    { id: "tracking", label: t("ride.tab_live"), icon: Navigation, category: "trip" },
    { id: "match", label: "Match", icon: Car, category: "trip" },
    { id: "confirm", label: t("ride.confirm"), icon: Star, category: "trip" },
    { id: "history", label: t("ride.tab_history"), icon: History, category: "trip" },
    { id: "chat", label: "Chat", icon: MessageSquare, category: "trip" },
    { id: "driver", label: "Driver", icon: User, category: "trip" },
    { id: "driver-comm", label: "Comms", icon: MessageSquare, category: "trip" },
    { id: "routes", label: "Routes", icon: Brain, category: "trip" },
    { id: "rate", label: "Rate", icon: Star, category: "trip" },
    { id: "lost", label: "Lost Item", icon: Search, category: "trip" },
    { id: "feedback", label: "Feedback", icon: ThumbsUp, category: "trip" },
    { id: "wallet", label: t("ride.tab_wallet"), icon: Wallet, category: "money" },
    { id: "pay-adv", label: "Pay+", icon: Wallet, category: "money" },
    { id: "pass", label: t("ride.tab_pass"), icon: Crown, category: "money" },
    { id: "subscribe", label: "Subscribe", icon: Gem, category: "money" },
    { id: "spending", label: "Spending", icon: PieChart, category: "money" },
    { id: "receipt", label: "Receipt", icon: Receipt, category: "money" },
    { id: "compare", label: "Compare", icon: DollarSign, category: "money" },
    { id: "smart-price", label: "Pricing", icon: DollarSign, category: "money" },
    { id: "surge", label: "Demand", icon: Car, category: "money" },
    { id: "marketplace", label: "Marketplace", icon: Gavel, category: "money" },
    { id: "gifting", label: "Gifting", icon: Gift, category: "money" },
    { id: "safety", label: t("ride.tab_safety"), icon: Shield, category: "safety" },
    { id: "adv-safety", label: t("ride.tab_safety") + "+", icon: ShieldCheck, category: "safety" },
    { id: "safety-adv2", label: "Dashcam", icon: Camera, category: "safety" },
    { id: "alerts", label: t("ride.tab_alerts"), icon: Bell, category: "safety" },
    { id: "a11y", label: t("ride.accessible"), icon: Accessibility, category: "comfort" },
    { id: "a11y-adv", label: "A11y+", icon: Accessibility, category: "comfort" },
    { id: "inclusive", label: "Inclusive", icon: Heart, category: "comfort" },
    { id: "prefs", label: "Prefs", icon: Settings, category: "comfort" },
    { id: "eco", label: "Eco", icon: Leaf, category: "comfort" },
    { id: "specialty", label: "Special", icon: Dog, category: "comfort" },
    { id: "entertain", label: "Music", icon: Music, category: "comfort" },
    { id: "wellness", label: "Wellness", icon: Heart, category: "comfort" },
    { id: "ai-assist", label: "AI", icon: Brain, category: "comfort" },
    { id: "loyalty", label: "Loyalty", icon: Award, category: "rewards" },
    { id: "loyalty-rwd", label: "Loyalty+", icon: Trophy, category: "rewards" },
    { id: "rewards", label: "Rewards", icon: Trophy, category: "rewards" },
    { id: "social", label: "Social", icon: Share2, category: "rewards" },
    { id: "social-feat", label: "Community", icon: Users, category: "rewards" },
    { id: "insights", label: t("ride.tab_insights"), icon: BarChart3, category: "rewards" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, category: "rewards" },
    { id: "ride-analytics", label: "Dashboard", icon: PieChart, category: "rewards" },
    { id: "business", label: "Business", icon: Briefcase, category: "business" },
    { id: "corporate", label: "Corporate", icon: Building2, category: "business" },
    { id: "family", label: "Family", icon: UserPlus, category: "business" },
    { id: "travel", label: "Travel", icon: Plane, category: "business" },
  ];

  const categories: { id: TabCategory | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "book", label: "Book" },
    { id: "trip", label: "Trip" },
    { id: "money", label: "Money" },
    { id: "safety", label: "Safety" },
    { id: "comfort", label: "Comfort" },
    { id: "rewards", label: "Rewards" },
    { id: "business", label: "Business" },
  ];
  const [activeCategory, setActiveCategory] = useState<TabCategory | "all">("all");
  const [tabFilter, setTabFilter] = useState("");
  const visibleTabs = tabs.filter(tb => {
    if (activeCategory !== "all" && tb.category !== activeCategory) return false;
    if (tabFilter.trim() && !tb.label.toLowerCase().includes(tabFilter.trim().toLowerCase())) return false;
    return true;
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabIds = tabs.map(t => t.id);
  const requestedTab = searchParams.get("tab");
  const initialTab = requestedTab && validTabIds.includes(requestedTab) ? requestedTab : "book";
  const initialDestination = searchParams.get("destination") || undefined;
  const initialDestLat = searchParams.get("destLat") ? parseFloat(searchParams.get("destLat")!) : undefined;
  const initialDestLng = searchParams.get("destLng") ? parseFloat(searchParams.get("destLng")!) : undefined;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookWithSchedule, setBookWithSchedule] = useState(false);

  useEffect(() => {
    const next = searchParams.get("tab");
    if (next && validTabIds.includes(next) && next !== activeTab) setActiveTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectTab = (id: string) => {
    setActiveTab(id);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (id === "book") next.delete("tab");
      else next.set("tab", id);
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeTab]);

  const isFullScreen = activeTab === "book" || activeTab === "reserve";

  return (
    <AppLayout
      title={t("ride.title")}
      showBack
      onBack={() => navigate("/")}
      fixedHeight={isFullScreen}
      hideHeader={activeTab === "book"}
      hideNav={activeTab === "book"}
      className={activeTab === "book" ? "overflow-hidden !pb-0" : isFullScreen ? "overflow-hidden" : ""}
    >
      {/* Tab bar — hidden for "book" since RideBookingHome renders its own header + tabs */}
      {activeTab !== "book" && (
        <div className={cn("z-20 bg-background/95 backdrop-blur-lg border-b border-border/30 shrink-0", isFullScreen ? "" : "sticky top-14")}>
          {/* Category filter chips */}
          <div className="flex overflow-x-auto gap-1.5 px-4 pt-2 scrollbar-none">
            {categories.map(cat => {
              const isActive = activeCategory === cat.id;
              const count = cat.id === "all" ? tabs.length : tabs.filter(tb => tb.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all shrink-0",
                    isActive ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.label}
                  <span className={cn("text-[9px] px-1 rounded", isActive ? "bg-background/20" : "bg-muted/40")}>{count}</span>
                </button>
              );
            })}
          </div>
          {/* Filter search input */}
          <div className="px-4 pt-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={tabFilter}
                onChange={e => setTabFilter(e.target.value)}
                placeholder="Filter tabs…"
                className="w-full h-8 pl-8 pr-3 rounded-full bg-muted/30 border border-border/30 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          {/* Tab pills */}
          <div className="flex overflow-x-auto gap-1 px-4 py-2 scrollbar-none">
            {visibleTabs.length === 0 && (
              <p className="text-xs text-muted-foreground py-1.5">No tabs match.</p>
            )}
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => selectTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0",
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className={cn(isFullScreen ? "h-full min-h-0 flex flex-col" : "pb-6")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(isFullScreen && "h-full min-h-0 flex flex-col flex-1")}
          >
            {activeTab === "book" && <RideBookingHome initialSchedule={bookWithSchedule} initialDestinationAddress={initialDestination} initialDestLat={initialDestLat} initialDestLng={initialDestLng} />}
            {activeTab === "reserve" && <div className="flex-1 min-h-0 overflow-hidden"><ZivoReserve onReserve={() => { setBookWithSchedule(true); selectTab("book"); }} /></div>}
            {activeTab === "map" && <div className="p-4"><SurgePricingMap /></div>}
            {activeTab === "search" && <div className="p-4"><RideQuickSearch /></div>}
            {activeTab === "history" && <div className="p-4"><RideTripHistory /></div>}
            {activeTab === "calendar" && <div className="p-4"><RideScheduleCalendar /></div>}
            {activeTab === "insights" && <div className="pt-4"><RideHistoryInsights /></div>}
            {activeTab === "tracking" && <div className="p-4"><LiveTripTracker /></div>}
            {activeTab === "match" && <div className="p-4"><RideDriverMatch /></div>}
            {activeTab === "confirm" && <div className="p-4"><RideBookingConfirmation onTrackRide={() => setActiveTab("tracking")} onAddToCalendar={() => toast.success("Added to calendar!")} /></div>}
            {activeTab === "wallet" && <div className="p-4"><RideWallet /></div>}
            {activeTab === "loyalty" && <div className="p-4"><RideLoyaltyCard /></div>}
            {activeTab === "spending" && <div className="p-4"><RideSpendingAnalytics /></div>}
            {activeTab === "social" && <div className="p-4"><RideSocialHub /></div>}
            {activeTab === "driver" && <div className="p-4"><DriverProfileCard /></div>}
            {activeTab === "surge" && <div className="p-4"><SurgePricingMap /></div>}
            {activeTab === "compare" && <div className="p-4"><FareComparisonTool /></div>}
            {activeTab === "schedule" && <div className="p-4"><ScheduleRideSheet /></div>}
            {activeTab === "multi" && <div className="p-4"><MultiStopRoute /></div>}
            {activeTab === "group" && <div className="p-4"><GroupRidePlanner /></div>}
            {activeTab === "places" && <div className="p-4"><SmartSavedPlaces /></div>}
            {activeTab === "chat" && <div className="p-4"><InRideChat onCall={() => toast.info("Calling driver...")} /></div>}
            {activeTab === "safety" && <div className="p-4"><RideSafetyCenter /></div>}
            {activeTab === "alerts" && <div className="p-4"><RideNotificationCenter /></div>}
            {activeTab === "pass" && <div className="pt-4"><RidePassPlans onSubscribe={(id) => toast.success(`Starting ${id} subscription...`)} /></div>}
            {activeTab === "receipt" && <div className="p-4"><RideReceiptCard /></div>}
            {activeTab === "rate" && <div className="p-4"><RateAndTipFlow onSubmit={(d) => console.log(d)} onSkip={() => toast.info("Skipped")} /></div>}
            {activeTab === "lost" && <div className="p-4"><LostItemReport onSubmit={(d) => console.log(d)} onContactDriver={() => toast.info("Calling...")} /></div>}
            {activeTab === "a11y" && <div className="p-4"><AccessibilityHub /></div>}
            {activeTab === "prefs" && <div className="p-4"><RidePreferences /></div>}
            {activeTab === "eco" && <div className="p-4"><RideEcoTracker /></div>}
            {activeTab === "business" && <div className="p-4"><RideBusinessManager /></div>}
            {activeTab === "feedback" && <div className="p-4"><RideFeedbackCenter /></div>}
            {activeTab === "specialty" && <div className="p-4"><RideSpecialtyModes /></div>}
            {activeTab === "analytics" && <div className="p-4"><RideSmartAnalytics /></div>}
            {activeTab === "entertain" && <div className="p-4"><RideEntertainment /></div>}
            {activeTab === "gifting" && <div className="p-4"><RideGifting /></div>}
            {activeTab === "rewards" && <div className="p-4"><RideRewardsGamification /></div>}
            {activeTab === "corporate" && <div className="p-4"><RideCorporateFleet /></div>}
            {activeTab === "inclusive" && <div className="p-4"><RideAccessibilityPlus /></div>}
            {activeTab === "routes" && <div className="p-4"><RideRouteIntelligence /></div>}
            {activeTab === "adv-safety" && <div className="p-4"><RideAdvancedSafety /></div>}
            {activeTab === "travel" && <div className="p-4"><RideTravelIntegration /></div>}
            {activeTab === "family" && <div className="p-4"><RideFamilyAccounts /></div>}
            {activeTab === "subscribe" && <div className="p-4"><RideSubscriptionHub /></div>}
            {activeTab === "smart-price" && <div className="p-4"><RideSmartPricing /></div>}
            {activeTab === "driver-comm" && <div className="p-4"><RideDriverComm /></div>}
            {activeTab === "social-feat" && <div className="p-4"><RideSocialFeatures /></div>}
            {activeTab === "ride-analytics" && <div className="p-4"><RideAnalyticsDashboard /></div>}
            {activeTab === "marketplace" && <div className="p-4"><RideMarketplace /></div>}
            {activeTab === "wellness" && <div className="p-4"><RideWellnessComfort /></div>}
            {activeTab === "pay-adv" && <div className="p-4"><RidePaymentsAdvanced /></div>}
            {activeTab === "ai-assist" && <div className="p-4"><RideAIAssistant /></div>}
            {activeTab === "scheduling" && <div className="p-4"><RideSchedulingRecurring /></div>}
            {activeTab === "safety-adv2" && <div className="p-4"><RideSafetyAdvanced /></div>}
            {activeTab === "loyalty-rwd" && <div className="p-4"><RideLoyaltyRewards /></div>}
            {activeTab === "a11y-adv" && <div className="p-4"><RideAccessibilityAdvanced /></div>}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
