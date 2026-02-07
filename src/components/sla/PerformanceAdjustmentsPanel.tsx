/**
 * Performance Adjustments Panel
 * Pending bonus/penalty approvals
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { PerformanceAdjustment, useApproveAdjustment } from "@/hooks/useSLAMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface PerformanceAdjustmentsPanelProps {
  adjustments: PerformanceAdjustment[] | undefined;
  isLoading: boolean;
}

const PerformanceAdjustmentsPanel = ({
  adjustments,
  isLoading,
}: PerformanceAdjustmentsPanelProps) => {
  const approveMutation = useApproveAdjustment();

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      await approveMutation.mutateAsync({ adjustmentId: id, approve });
      toast.success(approve ? "Adjustment approved and applied" : "Adjustment rejected");
    } catch (error) {
      toast.error("Failed to process adjustment");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pending Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pending Adjustments
          </CardTitle>
          {adjustments && adjustments.length > 0 && (
            <Badge variant="secondary">{adjustments.length} pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {!adjustments || adjustments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No pending adjustments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adjustments.map((adj) => (
                <div
                  key={adj.id}
                  className={`p-3 rounded-lg border ${
                    adj.type === "bonus"
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {adj.type === "bonus" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <span className="font-medium">{adj.driver_name || "Unknown Driver"}</span>
                        <Badge
                          variant={adj.type === "bonus" ? "outline" : "destructive"}
                          className={adj.type === "bonus" ? "text-green-600 border-green-500" : ""}
                        >
                          {adj.type === "bonus" ? "+" : "-"}$
                          {(adj.amount_cents / 100).toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{adj.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(adj.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:text-green-700 hover:bg-green-500/10"
                        onClick={() => handleApprove(adj.id, true)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleApprove(adj.id, false)}
                        disabled={approveMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PerformanceAdjustmentsPanel;
