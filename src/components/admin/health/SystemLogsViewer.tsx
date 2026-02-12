import { useState } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSystemLogs } from "@/hooks/useSystemHealthDashboard";

const LEVEL_CONFIG = {
  error: { icon: AlertCircle, color: "text-red-400", badge: "destructive" as const },
  warning: { icon: AlertTriangle, color: "text-amber-400", badge: "secondary" as const },
  info: { icon: Info, color: "text-blue-400", badge: "outline" as const },
};

export default function SystemLogsViewer() {
  const [level, setLevel] = useState<string>("");
  const [source, setSource] = useState<string>("");

  const { data: logs, isLoading } = useSystemLogs({
    level: level || undefined,
    source: source || undefined,
    hours: 24,
  });

  const sources = [...new Set((logs || []).map((l) => l.source))];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <Select value={level} onValueChange={(v) => setLevel(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={(v) => setSource(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Log entries */}
      <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
        {!logs?.length ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No logs found for the selected filters
          </div>
        ) : (
          logs.map((log) => {
            const config = LEVEL_CONFIG[log.level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.info;
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
              >
                <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant={config.badge} className="text-[10px] px-1.5 py-0">
                      {log.level}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{log.source}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {format(new Date(log.created_at), "MMM dd HH:mm:ss")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground truncate">{log.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
