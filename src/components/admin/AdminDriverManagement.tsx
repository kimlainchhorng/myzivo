import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Car, 
  MapPin, 
  Settings2, 
  TrendingUp,
  Percent,
  Banknote,
  UserPlus,
  DollarSign,
  Calendar,
  Wallet,
  Navigation,
  FileText,
  MessageSquare,
  Star,
  Shield,
  BarChart3,
  CreditCard
} from "lucide-react";
import AdminLiveDriverMap from "./AdminLiveDriverMap";
import AdminDriverOnboardingQueue from "./AdminDriverOnboardingQueue";
import AdminDriverPerformance from "./AdminDriverPerformance";
import AdminCommissionSettings from "./AdminCommissionSettings";
import AdminCashCollection from "./AdminCashCollection";
import AdminDriverControl from "./AdminDriverControl";
import AdminDriverEarnings from "./AdminDriverEarnings";
import AdminDriverSchedules from "./AdminDriverSchedules";
import AdminPayouts from "./AdminPayouts";
import AdminTripAssignment from "./AdminTripAssignment";
import AdminDocumentReview from "./AdminDocumentReview";
import AdminDriverMessaging from "./AdminDriverMessaging";
import AdminDriverScoring from "./AdminDriverScoring";
import AdminDriverVerification from "./AdminDriverVerification";
import AdminCommissionAnalytics from "./AdminCommissionAnalytics";
import AdminPayoutProcessing from "./AdminPayoutProcessing";

const AdminDriverManagement = () => {
  const [activeTab, setActiveTab] = useState("tracking");

  const tabs = [
    { value: "tracking", label: "Live Tracking", icon: MapPin },
    { value: "trips", label: "Trip Assignment", icon: Navigation },
    { value: "onboarding", label: "Onboarding", icon: UserPlus },
    { value: "documents", label: "Documents", icon: FileText },
    { value: "verification", label: "Verification", icon: Shield },
    { value: "performance", label: "Performance", icon: TrendingUp },
    { value: "scoring", label: "Scoring", icon: Star },
    { value: "control", label: "Control Panel", icon: Settings2 },
    { value: "messaging", label: "Messaging", icon: MessageSquare },
    { value: "payout-processing", label: "Payout Queue", icon: CreditCard },
    { value: "payouts", label: "Payouts", icon: Wallet },
    { value: "earnings", label: "Earnings", icon: DollarSign },
    { value: "schedules", label: "Schedules", icon: Calendar },
    { value: "commission-analytics", label: "Commission Stats", icon: BarChart3 },
    { value: "commissions", label: "Commission Config", icon: Percent },
    { value: "cash", label: "Cash Collection", icon: Banknote },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10">
            <Car className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Driver Management Hub</h1>
            <p className="text-muted-foreground">
              Complete driver operations with tracking, verification, payments, and controls
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "100ms" }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 p-1 h-auto flex-wrap gap-1">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="tracking" className="mt-0">
            <AdminLiveDriverMap />
          </TabsContent>

          <TabsContent value="trips" className="mt-0">
            <AdminTripAssignment />
          </TabsContent>

          <TabsContent value="onboarding" className="mt-0">
            <AdminDriverOnboardingQueue />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <AdminDocumentReview />
          </TabsContent>

          <TabsContent value="verification" className="mt-0">
            <AdminDriverVerification />
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <AdminDriverPerformance />
          </TabsContent>

          <TabsContent value="scoring" className="mt-0">
            <AdminDriverScoring />
          </TabsContent>

          <TabsContent value="control" className="mt-0">
            <AdminDriverControl />
          </TabsContent>

          <TabsContent value="messaging" className="mt-0">
            <AdminDriverMessaging />
          </TabsContent>

          <TabsContent value="payout-processing" className="mt-0">
            <AdminPayoutProcessing />
          </TabsContent>

          <TabsContent value="payouts" className="mt-0">
            <AdminPayouts />
          </TabsContent>

          <TabsContent value="earnings" className="mt-0">
            <AdminDriverEarnings />
          </TabsContent>

          <TabsContent value="schedules" className="mt-0">
            <AdminDriverSchedules />
          </TabsContent>

          <TabsContent value="commission-analytics" className="mt-0">
            <AdminCommissionAnalytics />
          </TabsContent>

          <TabsContent value="commissions" className="mt-0">
            <AdminCommissionSettings />
          </TabsContent>

          <TabsContent value="cash" className="mt-0">
            <AdminCashCollection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDriverManagement;
