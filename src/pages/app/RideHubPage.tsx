/**
 * RideHubPage - Central hub for ride features: history insights, ride pass, lost items
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Crown, Search, Receipt, Star, ChevronRight, Car } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import RideHistoryInsights from "@/components/rides/RideHistoryInsights";
import RidePassPlans from "@/components/rides/RidePassPlans";
import LostItemReport from "@/components/rides/LostItemReport";
import RideReceiptCard from "@/components/rides/RideReceiptCard";
import RateAndTipFlow from "@/components/rides/RateAndTipFlow";
import SplitFareSheet from "@/components/rides/SplitFareSheet";
import SurgePricingMap from "@/components/rides/SurgePricingMap";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tabs = [
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "surge", label: "Demand", icon: Car },
  { id: "pass", label: "Ride Pass", icon: Crown },
  { id: "receipt", label: "Receipt", icon: Receipt },
  { id: "rate", label: "Rate", icon: Star },
  { id: "lost", label: "Lost Item", icon: Search },
];

export default function RideHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("insights");

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
            {activeTab === "insights" && (
              <div className="pt-4">
                <RideHistoryInsights />
              </div>
            )}

            {activeTab === "surge" && (
              <div className="p-4">
                <SurgePricingMap />
              </div>
            )}

            {activeTab === "pass" && (
              <div className="pt-4">
                <RidePassPlans onSubscribe={(id) => toast.success(`Starting ${id} subscription...`)} />
              </div>
            )}

            {activeTab === "receipt" && (
              <div className="p-4">
                <RideReceiptCard />
              </div>
            )}

            {activeTab === "rate" && (
              <div className="p-4">
                <RateAndTipFlow
                  onSubmit={(data) => console.log("Rating submitted:", data)}
                  onSkip={() => toast.info("Skipped rating")}
                />
              </div>
            )}

            {activeTab === "lost" && (
              <div className="p-4">
                <LostItemReport
                  onSubmit={(data) => console.log("Lost item:", data)}
                  onContactDriver={() => toast.info("Calling driver...")}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
