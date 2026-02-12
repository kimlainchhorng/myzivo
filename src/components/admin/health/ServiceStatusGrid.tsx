import { motion } from "framer-motion";
import { Activity, Database, CreditCard, Bell, Plane, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceStatus } from "@/hooks/useSystemHealthDashboard";

const SERVICE_ICONS: Record<string, typeof Activity> = {
  api: Server,
  database: Database,
  payments: CreditCard,
  notifications: Bell,
  duffel: Plane,
  stripe: CreditCard,
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  operational: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Operational" },
  degraded: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Degraded" },
  down: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Down" },
  maintenance: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Maintenance" },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.operational;
}

interface ServiceStatusGridProps {
  services: ServiceStatus[];
  isLoading: boolean;
}

export default function ServiceStatusGrid({ services, isLoading }: ServiceStatusGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service, i) => {
        const config = getStatusConfig(service.status);
        const Icon = SERVICE_ICONS[service.service_key] || Activity;

        return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "rounded-xl border p-5 backdrop-blur-sm",
              config.bg
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-sm font-semibold text-foreground">
                  {service.service_name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full animate-pulse", config.color.replace("text-", "bg-"))} />
                <span className={cn("text-xs font-medium", config.color)}>
                  {config.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Uptime</p>
                <p className="text-lg font-bold text-foreground">
                  {service.uptime_percent != null ? `${service.uptime_percent}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Response</p>
                <p className="text-lg font-bold text-foreground">
                  {service.response_time_ms != null ? `${service.response_time_ms}ms` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Error Rate</p>
                <p className="text-lg font-bold text-foreground">
                  {service.error_rate != null ? `${service.error_rate}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Incidents</p>
                <p className="text-lg font-bold text-foreground">
                  {service.incident_count ?? 0}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
