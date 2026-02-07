/**
 * SLA By Zone Table
 * Zone performance breakdown with on-time rates
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { ZonePerformance } from "@/hooks/useSLAMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface SLAByZoneTableProps {
  zones: ZonePerformance[] | undefined;
  isLoading: boolean;
}

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function getRateBadge(rate: number) {
  if (rate >= 95) return <Badge className="bg-green-500">Excellent</Badge>;
  if (rate >= 90) return <Badge className="bg-green-600">Good</Badge>;
  if (rate >= 80) return <Badge className="bg-amber-500">Fair</Badge>;
  return <Badge variant="destructive">Needs Work</Badge>;
}

const SLAByZoneTable = ({ zones, isLoading }: SLAByZoneTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Performance by Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Performance by Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!zones || zones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No zone data available</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">On-Time</TableHead>
                <TableHead className="text-right">Late</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Avg Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.zone_code}>
                  <TableCell className="font-medium">{zone.zone_code || "Unknown"}</TableCell>
                  <TableCell className="text-right">{zone.total_orders}</TableCell>
                  <TableCell className="text-right text-green-600">{zone.on_time_count}</TableCell>
                  <TableCell className="text-right text-destructive">{zone.late_count}</TableCell>
                  <TableCell className="text-right font-medium">{zone.on_time_rate}%</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatMinutes(zone.avg_total_seconds)}
                  </TableCell>
                  <TableCell>{getRateBadge(zone.on_time_rate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SLAByZoneTable;
