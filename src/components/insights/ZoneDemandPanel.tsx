/**
 * Zone Demand Panel
 * Shows zones with driver shortages
 */

import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Users, TrendingUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useZoneDemandGaps } from "@/hooks/useInsights";
import type { ZoneDemandGap } from "@/lib/insights";

const urgencyColors = {
  critical: "bg-destructive text-destructive-foreground",
  warning: "bg-amber-500 text-white",
  ok: "bg-green-500 text-white",
};

const urgencyBorders = {
  critical: "border-destructive/30",
  warning: "border-amber-500/30",
  ok: "border-green-500/30",
};

interface ZoneDemandPanelProps {
  compact?: boolean;
  limit?: number;
}

const ZoneDemandPanel = ({ compact = false, limit = 5 }: ZoneDemandPanelProps) => {
  const { data: gaps, isLoading } = useZoneDemandGaps();

  const displayGaps = (gaps || []).slice(0, limit);
  const totalShortage = displayGaps.reduce((sum, g) => sum + g.shortage, 0);
  const criticalCount = displayGaps.filter((g) => g.urgency === "critical").length;

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40 bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/10" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <MapPin className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Driver Shortage</p>
              <p className="text-xl font-bold text-white">{criticalCount} zones at risk</p>
            </div>
          </div>
          <p className="text-sm text-white/60">
            Need <span className="text-amber-400 font-medium">{totalShortage} more drivers</span>
          </p>
          <Link to="/dispatch/demand">
            <Button variant="link" className="p-0 h-auto text-primary mt-2">
              View Zones <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/80 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-amber-400" />
          Zone Driver Shortages
          {criticalCount > 0 && (
            <Badge className="bg-destructive">{criticalCount} critical</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayGaps.length === 0 ? (
          <div className="text-center py-6 text-white/40">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>All zones adequately staffed</p>
          </div>
        ) : (
          displayGaps.map((gap, index) => (
            <ZoneGapItem key={gap.zoneId} gap={gap} index={index} />
          ))
        )}

        {(gaps?.length || 0) > limit && (
          <Link to="/dispatch/demand">
            <Button variant="outline" className="w-full mt-2">
              View All {gaps?.length} Zones
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

const ZoneGapItem = ({ gap, index }: { gap: ZoneDemandGap; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className={`p-3 rounded-xl border ${urgencyBorders[gap.urgency]} bg-white/5`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{gap.zoneName}</span>
          <Badge className={`text-xs ${urgencyColors[gap.urgency]}`}>
            {gap.urgency}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {gap.expectedOrders} orders expected
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {gap.driversOnline}/{gap.driversNeeded} drivers
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-amber-400">+{gap.shortage}</p>
        <p className="text-xs text-white/40">needed</p>
      </div>
    </div>
  </motion.div>
);

export default ZoneDemandPanel;
