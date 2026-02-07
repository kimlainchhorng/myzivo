/**
 * AnalyticsTopLists - Top drivers and merchants tables
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Medal, Trophy, Award } from "lucide-react";
import type { DriverStats, MerchantStats } from "@/hooks/useDispatchAnalytics";

interface AnalyticsTopListsProps {
  topDrivers: DriverStats[] | undefined;
  topMerchants: MerchantStats[] | undefined;
  isLoadingDrivers: boolean;
  isLoadingMerchants: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className="h-4 w-4 text-chart-4" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />;
  if (rank === 3) return <Award className="h-4 w-4 text-chart-5" />;
  return <span className="text-muted-foreground w-4 text-center">{rank}</span>;
};

const AnalyticsTopLists = ({
  topDrivers,
  topMerchants,
  isLoadingDrivers,
  isLoadingMerchants,
}: AnalyticsTopListsProps) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Top Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Drivers by Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDrivers ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : topDrivers && topDrivers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDrivers.map((driver, index) => (
                  <TableRow key={driver.driverId}>
                    <TableCell>
                      <RankBadge rank={index + 1} />
                    </TableCell>
                    <TableCell className="font-medium">{driver.driverName}</TableCell>
                    <TableCell className="text-right">{driver.totalOrders}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(driver.totalEarnings)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              No driver earnings data for selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Merchants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Merchants by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMerchants ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : topMerchants && topMerchants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMerchants.map((merchant, index) => (
                  <TableRow key={merchant.merchantId}>
                    <TableCell>
                      <RankBadge rank={index + 1} />
                    </TableCell>
                    <TableCell className="font-medium">{merchant.merchantName}</TableCell>
                    <TableCell className="text-right">{merchant.totalOrders}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(merchant.totalRevenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              No merchant revenue data for selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTopLists;
