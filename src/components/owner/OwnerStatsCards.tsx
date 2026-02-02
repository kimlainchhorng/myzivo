/**
 * Owner Stats Cards Component
 * Displays key statistics for car owner dashboard
 */

import { Card, CardContent } from "@/components/ui/card";
import { Car, Calendar, DollarSign, Star, TrendingUp, Wallet } from "lucide-react";
import type { OwnerStats } from "@/types/p2p";
import { Skeleton } from "@/components/ui/skeleton";

interface OwnerStatsCardsProps {
  stats: OwnerStats | undefined;
  isLoading: boolean;
}

export default function OwnerStatsCards({ stats, isLoading }: OwnerStatsCardsProps) {
  const cards = [
    {
      label: "Vehicles Listed",
      value: stats?.totalVehicles ?? 0,
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Bookings",
      value: stats?.activeBookings ?? 0,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Trips",
      value: stats?.totalTrips ?? 0,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Total Earnings",
      value: stats ? `$${stats.totalEarnings.toLocaleString()}` : "$0",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Pending Payouts",
      value: stats ? `$${stats.pendingPayouts.toLocaleString()}` : "$0",
      icon: Wallet,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Average Rating",
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm text-muted-foreground">{card.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
