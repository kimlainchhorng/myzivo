/**
 * RideHubPage - Central hub for all ride features
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Crown, Search, Receipt, Star, Car, Calendar, Route, MessageSquare, Shield, MapPin, Users, DollarSign, Accessibility, Navigation, Wallet, User, Share2, Award, PieChart, Zap, History, Map as MapIcon, CalendarDays } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tabs = [
  { id: "search", label: "Search", icon: Zap },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "history", label: "History", icon: History },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "tracking", label: "Live Trip", icon: Navigation },
  { id: "confirm", label: "Confirm", icon: Star },
  { id: "wallet", label: "Wallet", icon: Wallet },
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
  { id: "safety", label: "Safety", icon: Shield },
  { id: "pass", label: "Ride Pass", icon: Crown },
  { id: "receipt", label: "Receipt", icon: Receipt },
  { id: "rate", label: "Rate", icon: Star },
  { id: "lost", label: "Lost Item", icon: Search },
  { id: "a11y", label: "Access", icon: Accessibility },
];

export default function RideHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");

  return (
    <AppLayout title="Ride Hub" showBack onBack={() => navigate("/rides")}>
      {/* Tab bar */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-lg border-b border-border/30">
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

      {/* Tab content */}
      <div className="pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "search" && <div className="p-4"><RideQuickSearch /></div>}
            {activeTab === "map" && <div className="p-4"><RideMapPreview /></div>}
            {activeTab === "history" && <div className="p-4"><RideTripHistory /></div>}
            {activeTab === "calendar" && <div className="p-4"><RideScheduleCalendar /></div>}
            {activeTab === "insights" && <div className="pt-4"><RideHistoryInsights /></div>}
            {activeTab === "tracking" && <div className="p-4"><LiveTripTracker /></div>}
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
            {activeTab === "safety" && <div className="p-4"><SafetyModePanel /></div>}
            {activeTab === "pass" && <div className="pt-4"><RidePassPlans onSubscribe={(id) => toast.success(`Starting ${id} subscription...`)} /></div>}
            {activeTab === "receipt" && <div className="p-4"><RideReceiptCard /></div>}
            {activeTab === "rate" && <div className="p-4"><RateAndTipFlow onSubmit={(d) => console.log(d)} onSkip={() => toast.info("Skipped")} /></div>}
            {activeTab === "lost" && <div className="p-4"><LostItemReport onSubmit={(d) => console.log(d)} onContactDriver={() => toast.info("Calling...")} /></div>}
            {activeTab === "a11y" && <div className="p-4"><AccessibilityHub /></div>}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
