import { motion } from "framer-motion";
import { Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ServiceStatusGrid from "@/components/admin/health/ServiceStatusGrid";
import UptimeChart from "@/components/admin/health/UptimeChart";
import SystemLogsViewer from "@/components/admin/health/SystemLogsViewer";
import HealthAlertRules from "@/components/admin/health/HealthAlertRules";
import {
  useServiceStatuses,
  useUptimeLogs,
  usePerformanceMetrics,
} from "@/hooks/useSystemHealthDashboard";

const SystemHealthDashboard = () => {
  const navigate = useNavigate();
  const { data: services = [], isLoading: servicesLoading } = useServiceStatuses();
  const { data: uptimeLogs = [], isLoading: uptimeLoading } = useUptimeLogs();
  const { data: perfMetrics = [] } = usePerformanceMetrics();

  const operationalCount = services.filter((s) => s.status === "operational").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const downCount = services.filter((s) => !["operational", "degraded", "maintenance"].includes(s.status)).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">System Health</h1>
              <p className="text-sm text-muted-foreground">Monitor all services in real-time</p>
            </div>
          </div>
        </motion.div>

        {/* Summary cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
            <p className="text-3xl font-black text-emerald-400">{operationalCount}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Operational</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
            <p className="text-3xl font-black text-amber-400">{degradedCount}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Degraded</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
            <p className="text-3xl font-black text-red-400">{downCount}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Down</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="uptime">Uptime</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ServiceStatusGrid services={services} isLoading={servicesLoading} />
          </TabsContent>

          <TabsContent value="uptime">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Status Changes (Last 7 Days)</h3>
              <UptimeChart logs={uptimeLogs} isLoading={uptimeLoading} />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <SystemLogsViewer />
          </TabsContent>

          <TabsContent value="alerts">
            <HealthAlertRules />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;
