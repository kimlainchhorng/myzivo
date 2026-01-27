import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Car, 
  MapPin, 
  Settings2, 
  TrendingUp,
  Percent,
  Banknote,
  UserPlus,
  DollarSign,
  Calendar
} from "lucide-react";
import AdminLiveDriverMap from "./AdminLiveDriverMap";
import AdminDriverOnboardingQueue from "./AdminDriverOnboardingQueue";
import AdminDriverPerformance from "./AdminDriverPerformance";
import AdminCommissionSettings from "./AdminCommissionSettings";
import AdminCashCollection from "./AdminCashCollection";
import AdminDriverControl from "./AdminDriverControl";
import AdminDriverEarnings from "./AdminDriverEarnings";
import AdminDriverSchedules from "./AdminDriverSchedules";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const AdminDriverManagement = () => {
  const [activeTab, setActiveTab] = useState("tracking");

  const tabs = [
    { value: "tracking", label: "Live Tracking", icon: MapPin },
    { value: "onboarding", label: "Onboarding", icon: UserPlus },
    { value: "performance", label: "Performance", icon: TrendingUp },
    { value: "control", label: "Control Panel", icon: Settings2 },
    { value: "earnings", label: "Earnings", icon: DollarSign },
    { value: "schedules", label: "Schedules", icon: Calendar },
    { value: "commissions", label: "Commissions", icon: Percent },
    { value: "cash", label: "Cash Collection", icon: Banknote },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10">
            <Car className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Driver Management</h1>
            <p className="text-muted-foreground">
              Complete driver operations hub with tracking, payments, and controls
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 p-1 h-auto flex-wrap gap-1">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="tracking" className="mt-0">
            <AdminLiveDriverMap />
          </TabsContent>

          <TabsContent value="onboarding" className="mt-0">
            <AdminDriverOnboardingQueue />
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <AdminDriverPerformance />
          </TabsContent>

          <TabsContent value="control" className="mt-0">
            <AdminDriverControl />
          </TabsContent>

          <TabsContent value="earnings" className="mt-0">
            <AdminDriverEarnings />
          </TabsContent>

          <TabsContent value="schedules" className="mt-0">
            <AdminDriverSchedules />
          </TabsContent>

          <TabsContent value="commissions" className="mt-0">
            <AdminCommissionSettings />
          </TabsContent>

          <TabsContent value="cash" className="mt-0">
            <AdminCashCollection />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default AdminDriverManagement;
