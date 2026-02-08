/**
 * Declining Merchants Table
 * Shows restaurants with week-over-week order decline
 */

import { motion } from "framer-motion";
import { TrendingDown, Star, Store, ExternalLink, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDecliningMerchants } from "@/hooks/useInsights";
import type { DecliningMerchant } from "@/lib/insights";

interface DecliningMerchantsTableProps {
  compact?: boolean;
  limit?: number;
}

const DecliningMerchantsTable = ({ compact = false, limit = 10 }: DecliningMerchantsTableProps) => {
  const { data: merchants, isLoading } = useDecliningMerchants(limit);

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48 bg-white/10" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-white/10" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Declining Merchants</p>
              <p className="text-xl font-bold text-white">{merchants?.length || 0} restaurants</p>
            </div>
          </div>
          <p className="text-sm text-white/60">
            <span className="text-red-400 font-medium">&gt;20% drop</span> in weekly orders
          </p>
          <Link to="/admin/analytics/merchants">
            <Button variant="link" className="p-0 h-auto text-primary mt-2">
              View List <ExternalLink className="h-3 w-3 ml-1" />
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
          <TrendingDown className="h-5 w-5 text-red-400" />
          Declining Merchants
          {merchants && merchants.length > 0 && (
            <Badge variant="destructive">{merchants.length}</Badge>
          )}
        </CardTitle>
        <p className="text-sm text-white/40">Restaurants with &gt;20% order drop week-over-week</p>
      </CardHeader>
      <CardContent>
        {!merchants || merchants.length === 0 ? (
          <div className="text-center py-6 text-white/40">
            <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No significant declines detected</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Restaurant</TableHead>
                <TableHead className="text-white/60 text-right">This Week</TableHead>
                <TableHead className="text-white/60 text-right">Last Week</TableHead>
                <TableHead className="text-white/60 text-right">Change</TableHead>
                <TableHead className="text-white/60 text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchants.map((merchant, index) => (
                <MerchantRow key={merchant.restaurantId} merchant={merchant} index={index} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const MerchantRow = ({ merchant, index }: { merchant: DecliningMerchant; index: number }) => (
  <motion.tr
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="border-white/5 hover:bg-white/5"
  >
    <TableCell>
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4 text-white/40" />
        <span className="font-medium text-white">{merchant.restaurantName}</span>
        {merchant.changePercent < -40 && (
          <AlertCircle className="h-4 w-4 text-red-400" />
        )}
      </div>
    </TableCell>
    <TableCell className="text-right font-medium">{merchant.currentWeekOrders}</TableCell>
    <TableCell className="text-right text-white/60">{merchant.previousWeekOrders}</TableCell>
    <TableCell className="text-right">
      <Badge className="bg-red-500/20 text-red-400 border-0">
        {merchant.changePercent}%
      </Badge>
    </TableCell>
    <TableCell className="text-right">
      {merchant.avgRating ? (
        <span className="flex items-center justify-end gap-1">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          {merchant.avgRating.toFixed(1)}
        </span>
      ) : (
        <span className="text-white/30">—</span>
      )}
    </TableCell>
  </motion.tr>
);

export default DecliningMerchantsTable;
