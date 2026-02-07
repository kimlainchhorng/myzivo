/**
 * DriverBatchPage
 * Driver view for managing active batch deliveries
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  MapPin,
  Clock,
  Route,
  Play,
  Loader2,
  Home,
} from "lucide-react";
import BatchStopsList from "@/components/batch/BatchStopsList";
import {
  useDriverActiveBatch,
  useStartBatch,
  useUpdateStopStatus,
} from "@/hooks/useDriverBatch";
import { useCurrentDriver } from "@/hooks/useCurrentDriver";

const DriverBatchPage = () => {
  const { driver, isLoading: driverLoading } = useCurrentDriver();
  const { data: batch, isLoading: batchLoading, refetch } = useDriverActiveBatch(driver?.id);
  const startBatch = useStartBatch();
  const updateStopStatus = useUpdateStopStatus();

  const isLoading = driverLoading || batchLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Please log in to view your batch
            </p>
            <Button asChild>
              <Link to="/driver/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Active Batch
          </h1>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/driver">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Active Batch</h3>
            <p className="text-muted-foreground">
              You don't have any batch assigned right now.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedStops = batch.stops.filter((s) => s.status === "completed").length;
  const progressPercent = batch.stops.length > 0
    ? (completedStops / batch.stops.length) * 100
    : 0;

  const formatDistance = (km: number | null) => {
    if (!km) return "—";
    const miles = km / 1.60934;
    return `${miles.toFixed(1)} mi`;
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "—";
    if (minutes < 60) return `~${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `~${hours}h ${mins}m`;
  };

  const handleStartBatch = async () => {
    if (!driver?.id) return;
    await startBatch.mutateAsync({
      batchId: batch.id,
      driverId: driver.id,
    });
    refetch();
  };

  const handleStopAction = async (stopId: string, action: "arrived" | "completed") => {
    if (!driver?.id) return;
    await updateStopStatus.mutateAsync({
      stopId,
      status: action,
      driverId: driver.id,
    });
    refetch();
  };

  const isAssigned = batch.status === "assigned";
  const isInProgress = batch.status === "in_progress";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Active Batch
          </h1>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/driver">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {completedStops} of {batch.stops.length} stops completed
            </span>
            <span className="text-muted-foreground">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <MapPin className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <div className="font-bold">{batch.stops.length}</div>
              <div className="text-xs text-muted-foreground">Stops</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Route className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <div className="font-bold">{formatDistance(batch.total_distance_km)}</div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <div className="font-bold">{formatDuration(batch.total_duration_minutes)}</div>
              <div className="text-xs text-muted-foreground">Est. Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Start Batch Button */}
        {isAssigned && (
          <Card>
            <CardContent className="p-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleStartBatch}
                disabled={startBatch.isPending}
              >
                {startBatch.isPending ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                Start Batch
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Tap to begin your deliveries
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stops List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isInProgress ? "Your Stops" : "Upcoming Stops"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BatchStopsList
              stops={batch.stops}
              showActions={isInProgress}
              onStopAction={handleStopAction}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        {batch.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{batch.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverBatchPage;
