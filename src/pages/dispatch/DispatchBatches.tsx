/**
 * DispatchBatches Page
 * List and manage delivery batches
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Plus,
  MapPin,
  Clock,
  Truck,
  User,
  ChevronRight,
  Route,
} from "lucide-react";
import { useBatches } from "@/hooks/useBatches";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-yellow-500/20 text-yellow-600" },
  assigned: { label: "Assigned", color: "bg-blue-500/20 text-blue-600" },
  in_progress: { label: "In Progress", color: "bg-purple-500/20 text-purple-600" },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-600" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-600" },
};

const DispatchBatches = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: batches, isLoading } = useBatches(
    activeTab === "all" ? undefined : (activeTab as any)
  );

  const getStatusCounts = () => {
    if (!batches) return { draft: 0, assigned: 0, in_progress: 0, completed: 0 };
    return {
      draft: batches.filter((b) => b.status === "draft").length,
      assigned: batches.filter((b) => b.status === "assigned").length,
      in_progress: batches.filter((b) => b.status === "in_progress").length,
      completed: batches.filter((b) => b.status === "completed").length,
    };
  };

  const counts = getStatusCounts();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6" />
            Batches
          </h1>
          <p className="text-muted-foreground">
            Create and manage multi-stop delivery batches
          </p>
        </div>
        <Button onClick={() => navigate("/dispatch/batches/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">
            Draft {counts.draft > 0 && `(${counts.draft})`}
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned {counts.assigned > 0 && `(${counts.assigned})`}
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress {counts.in_progress > 0 && `(${counts.in_progress})`}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading batches...
            </div>
          ) : !batches || batches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No batches found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first batch to start optimizing deliveries
                </p>
                <Button onClick={() => navigate("/dispatch/batches/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {batches.map((batch) => (
                <Card
                  key={batch.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/dispatch/batches/${batch.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            #{batch.id.slice(0, 8)}
                          </span>
                          <Badge
                            variant="secondary"
                            className={statusConfig[batch.status]?.color}
                          >
                            {statusConfig[batch.status]?.label || batch.status}
                          </Badge>
                          {batch.region && (
                            <Badge variant="outline">{batch.region.name}</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {batch.total_stops || 0} stops
                          </div>
                          <div className="flex items-center gap-1">
                            <Route className="h-4 w-4" />
                            {formatDistance(batch.total_distance_km)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            ~{formatDuration(batch.total_duration_minutes)}
                          </div>
                          {batch.driver ? (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {batch.driver.full_name}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <Truck className="h-4 w-4" />
                              Unassigned
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(new Date(batch.created_at), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatchBatches;
