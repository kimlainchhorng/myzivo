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
import RideMapPreview from "@/components/rides/RideMapPreview";
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

export default function RideHubPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const tabs = [
    { id: "book", label: t("ride.tab_book"), icon: Zap },
    { id: "reserve", label: t("ride.tab_reserve"), icon: CalendarDays },
    { id: "map", label: t("ride.tab_map"), icon: MapIcon },
    { id: "history", label: t("ride.tab_history"), icon: History },
    { id: "calendar", label: t("ride.tab_reserve"), icon: CalendarDays },
    { id: "insights", label: t("ride.tab_insights"), icon: BarChart3 },
    { id: "tracking", label: t("ride.tab_live"), icon: Navigation },
    { id: "match", label: "Match", icon: Car },
    { id: "confirm", label: t("ride.confirm"), icon: Star },
    { id: "wallet", label: t("ride.tab_wallet"), icon: Wallet },
    { id: "loyalty", label: "Loyalty", icon: Award },
    { id: "spending", label: "Spending", icon: PieChart },
    { id: "social", label: "Social", icon: Share2 },
    { id: "driver", label: "Driver", icon: User },
    { id: "surge", label: "Demand", icon: Car },
    { id: "compare", label: "Compare", icon: DollarSign },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "multi", label: "Multi-Stop", icon: Route },
    { id: "group", label: "Group", icon: Users },
    { id: "places", label: "Places", icon: MapPin },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "safety", label: t("ride.tab_safety"), icon: Shield },
    { id: "alerts", label: t("ride.tab_alerts"), icon: Bell },
    { id: "pass", label: t("ride.tab_pass"), icon: Crown },
    { id: "receipt", label: "Receipt", icon: Receipt },
    { id: "rate", label: "Rate", icon: Star },
    { id: "lost", label: "Lost Item", icon: Search },
    { id: "a11y", label: t("ride.accessible"), icon: Accessibility },
    { id: "prefs", label: "Prefs", icon: Settings },
    { id: "eco", label: "Eco", icon: Leaf },
    { id: "business", label: "Business", icon: Briefcase },
    { id: "feedback", label: "Feedback", icon: ThumbsUp },
    { id: "specialty", label: "Special", icon: Dog },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "entertain", label: "Music", icon: Music },
    { id: "gifting", label: "Gifting", icon: Gift },
    { id: "rewards", label: "Rewards", icon: Trophy },
    { id: "corporate", label: "Corporate", icon: Building2 },
    { id: "inclusive", label: "Inclusive", icon: Heart },
    { id: "routes", label: "Routes", icon: Brain },
    { id: "adv-safety", label: t("ride.tab_safety") + "+", icon: ShieldCheck },
    { id: "travel", label: "Travel", icon: Plane },
    { id: "family", label: "Family", icon: UserPlus },
    { id: "subscribe", label: "Subscribe", icon: Gem },
    { id: "smart-price", label: "Pricing", icon: DollarSign },
    { id: "driver-comm", label: "Comms", icon: MessageSquare },
    { id: "social-feat", label: "Community", icon: Users },
    { id: "ride-analytics", label: "Dashboard", icon: PieChart },
    { id: "marketplace", label: "Marketplace", icon: Gavel },
    { id: "wellness", label: "Wellness", icon: Heart },
    { id: "pay-adv", label: "Pay+", icon: Wallet },
    { id: "ai-assist", label: "AI", icon: Brain },
    { id: "scheduling", label: "Scheduling", icon: CalendarDays },
    { id: "safety-adv2", label: "Dashcam", icon: Camera },
    { id: "loyalty-rwd", label: "Loyalty+", icon: Trophy },
    { id: "a11y-adv", label: "A11y+", icon: Accessibility },
  ];
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "reserve" ? "reserve" : "book";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookWithSchedule, setBookWithSchedule] = useState(false);

  useEffect(() => {
    const nextTab = searchParams.get("tab") === "reserve" ? "reserve" : "book";
    setActiveTab(nextTab);
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeTab]);

  const isFullScreen = activeTab === "book" || activeTab === "reserve";

  return (
    <AppLayout
      title="Zivo Ride"
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
          <div className="flex overflow-x-auto gap-1 px-4 py-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
            {activeTab === "book" && <RideBookingHome initialSchedule={bookWithSchedule} />}
            {activeTab === "reserve" && <div className="flex-1 min-h-0 overflow-hidden"><ZivoReserve onReserve={() => { setBookWithSchedule(true); setActiveTab("book"); }} /></div>}
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
