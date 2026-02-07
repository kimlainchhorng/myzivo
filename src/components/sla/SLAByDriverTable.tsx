/**
 * SLA By Driver Table
 * Driver performance breakdown sorted by on-time rate (worst first)
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
import { Users, TrendingDown } from "lucide-react";
import { DriverPerformance } from "@/hooks/useSLAMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface SLAByDriverTableProps {
  drivers: DriverPerformance[] | undefined;
  isLoading: boolean;
}

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

const SLAByDriverTable = ({ drivers, isLoading }: SLAByDriverTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Drivers by Late Rate
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
          <Users className="h-5 w-5" />
          Drivers by Late Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!drivers || drivers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No driver data available</p>
            <p className="text-xs">Requires at least 5 deliveries</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">On-Time %</TableHead>
                <TableHead className="text-right">Avg Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver, idx) => {
                const lateRate = 100 - driver.on_time_rate;
                return (
                  <TableRow key={driver.driver_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {idx < 3 && lateRate > 10 && (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <span className="font-medium truncate max-w-[150px]">
                          {driver.driver_name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{driver.total_orders}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={driver.on_time_rate >= 90 ? "outline" : driver.on_time_rate >= 80 ? "secondary" : "destructive"}
                        className={driver.on_time_rate >= 90 ? "text-green-600" : ""}
                      >
                        {driver.on_time_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatMinutes(driver.avg_delivery_seconds)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SLAByDriverTable;
