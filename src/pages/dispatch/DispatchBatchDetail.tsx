/**
 * DispatchBatchDetail Page
 * View and manage a single batch with stops, optimization, and driver assignment
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  Route,
  User,
  Loader2,
  Sparkles,
  Play,
  Trash2,
  RefreshCw,
} from "lucide-react";
import BatchStopsList from "@/components/batch/BatchStopsList";
import {
  useBatchDetails,
  useOptimizeBatch,
  useAssignBatchDriver,
  useCancelBatch,
  useReorderBatchStops,
} from "@/hooks/useBatches";
import { useAvailableDrivers } from "@/hooks/useAvailableDrivers";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-yellow-500/20 text-yellow-600" },
  assigned: { label: "Assigned", color: "bg-blue-500/20 text-blue-600" },
  in_progress: { label: "In Progress", color: "bg-purple-500/20 text-purple-600" },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-600" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-600" },
};

const DispatchBatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const { data, isLoading, refetch } = useBatchDetails(id);
  const { data: drivers } = useAvailableDrivers();
  const optimizeBatch = useOptimizeBatch();
  const assignDriver = useAssignBatchDriver();
  const cancelBatch = useCancelBatch();
  const reorderStops = useReorderBatchStops();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Batch not found</p>
        <Button variant="link" onClick={() => navigate("/dispatch/batches")}>
          Back to Batches
        </Button>
      </div>
    );
  }

  const { batch, stops, orders } = data;

  const formatDistance = (km: number | null) => {
    if (!km) return "—";
    const miles = km / 1.60934;
    return `${miles.toFixed(1)} mi`;
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const handleOptimize = async () => {
    if (!id) return;
    await optimizeBatch.mutateAsync({ batchId: id });
    refetch();
  };

  const handleAssignDriver = async () => {
    if (!id || !selectedDriverId) return;
    await assignDriver.mutateAsync({
      batchId: id,
      driverId: selectedDriverId,
    });
    refetch();
  };

  const handleCancel = async () => {
    if (!id) return;
    await cancelBatch.mutateAsync(id);
    navigate("/dispatch/batches");
  };

  const handleReorderStops = async (stopIds: string[]) => {
    if (!id) return;
    await reorderStops.mutateAsync({ batchId: id, stopIds });
  };

  const isEditable = batch.status === "draft";
  const canAssign = batch.status === "draft";
  const canOptimize = batch.status === "draft" || batch.status === "assigned";

  const completedStops = stops.filter((s) => s.status === "completed").length;
  const progressPercent = stops.length > 0 ? (completedStops / stops.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dispatch/batches")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-6 w-6" />
                Batch #{batch.id.slice(0, 8)}
              </h1>
              <Badge
                variant="secondary"
                className={statusConfig[batch.status]?.color}
              >
                {statusConfig[batch.status]?.label || batch.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {formatDistanceToNow(new Date(batch.created_at), { addSuffix: true })}
              {batch.region_name && ` • ${batch.region_name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {batch.status !== "completed" && batch.status !== "cancelled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Batch?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all orders from this batch. The orders will
                    become available for assignment again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Batch</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Cancel Batch
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Stops</span>
            </div>
            <div className="text-2xl font-bold">
              {completedStops}/{stops.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Route className="h-4 w-4" />
              <span className="text-sm">Distance</span>
            </div>
            <div className="text-2xl font-bold">
              {formatDistance(batch.total_distance_km)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Est. Duration</span>
            </div>
            <div className="text-2xl font-bold">
              {formatDuration(batch.total_duration_minutes)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <User className="h-4 w-4" />
              <span className="text-sm">Driver</span>
            </div>
            <div className="text-lg font-bold truncate">
              {batch.driver_name || "Unassigned"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar for active batches */}
      {(batch.status === "in_progress" || batch.status === "assigned") && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stops List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stops ({stops.length})</CardTitle>
                {canOptimize && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOptimize}
                    disabled={optimizeBatch.isPending}
                  >
                    {optimizeBatch.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Optimize Route
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <BatchStopsList
                stops={stops}
                isEditable={isEditable}
                onReorder={handleReorderStops}
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel */}
        <div className="space-y-4">
          {/* Driver Assignment */}
          {canAssign && (
            <Card>
              <CardHeader>
                <CardTitle>Assign Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedDriverId}
                  onValueChange={setSelectedDriverId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                <SelectContent>
                    {(drivers || []).map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  onClick={handleAssignDriver}
                  disabled={!selectedDriverId || assignDriver.isPending}
                >
                  {assignDriver.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Assign & Start
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Orders in Batch */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {order.restaurant_name || "Unknown Restaurant"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {order.delivery_address}
                      </div>
                    </div>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {batch.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{batch.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchBatchDetail;
