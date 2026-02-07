/**
 * SLA By Merchant Table
 * Merchant performance breakdown sorted by prep time
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
import { Store, AlertTriangle } from "lucide-react";
import { MerchantPerformance } from "@/hooks/useSLAMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface SLAByMerchantTableProps {
  merchants: MerchantPerformance[] | undefined;
  isLoading: boolean;
}

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

const SLAByMerchantTable = ({ merchants, isLoading }: SLAByMerchantTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5" />
            Slowest Merchants (Prep Time)
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
          <Store className="h-5 w-5" />
          Slowest Merchants (Prep Time)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!merchants || merchants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No merchant data available</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">On-Time %</TableHead>
                <TableHead className="text-right">Avg Prep</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchants.map((merchant, idx) => {
                const prepMins = Math.round(merchant.avg_prep_seconds / 60);
                const isSlowPrep = prepMins > 20;
                return (
                  <TableRow key={merchant.merchant_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {idx < 3 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        <span className="font-medium truncate max-w-[150px]">
                          {merchant.merchant_name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{merchant.total_orders}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={merchant.on_time_rate >= 90 ? "outline" : "destructive"}
                        className={merchant.on_time_rate >= 90 ? "text-green-600" : ""}
                      >
                        {merchant.on_time_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isSlowPrep ? "text-amber-600 font-medium" : ""}>
                        {formatMinutes(merchant.avg_prep_seconds)}
                      </span>
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

export default SLAByMerchantTable;
