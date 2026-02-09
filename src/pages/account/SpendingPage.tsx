import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, UtensilsCrossed, Car, Plane, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSpendingStats, type UnifiedOrder } from "@/hooks/useSpendingStats";
import { OrderReceiptCard } from "@/components/account/OrderReceiptCard";
import SEOHead from "@/components/SEOHead";
import { format } from "date-fns";

type FilterType = "all" | "eats" | "rides" | "travel";

export default function SpendingPage() {
  const navigate = useNavigate();
  const stats = useSpendingStats();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredOrders =
    filter === "all"
      ? stats.recentOrders
      : stats.recentOrders.filter((o) => o.type === filter);

  const monthName = format(new Date(), "MMMM yyyy");

  if (stats.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-top safe-area-bottom">
      <SEOHead title="Spending History — ZIVO" description="View your spending history across all ZIVO services" />

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 container max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="rounded-xl -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold">Spending History</h1>
            <p className="text-muted-foreground text-xs">Track your spending across ZIVO</p>
          </div>
        </div>

        {/* Monthly Summary Card */}
        <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl mb-6 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-teal-500/5" />
          <CardContent className="p-5 relative">
            <p className="text-sm text-muted-foreground font-medium mb-4">{monthName}</p>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <p className="text-2xl font-bold">${stats.thisMonth.total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.thisMonth.orderCount}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${stats.thisMonth.averageOrder.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Avg. Order</p>
              </div>
            </div>

            {/* Service Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-orange-500/10 p-3 text-center">
                <UtensilsCrossed className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <p className="text-sm font-bold">${stats.thisMonth.byService.eats.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">Eats</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-center">
                <Car className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">${stats.thisMonth.byService.rides.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">Rides</p>
              </div>
              <div className="rounded-xl bg-violet-500/10 p-3 text-center">
                <Plane className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                <p className="text-sm font-bold">${stats.thisMonth.byService.travel.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">Travel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All-time summary */}
        <Card className="border-0 bg-card/80 shadow-lg mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">All-time Spending</p>
                <p className="text-xs text-muted-foreground">{stats.allTime.orderCount} orders total</p>
              </div>
            </div>
            <p className="text-lg font-bold">${stats.allTime.total.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base">Recent Orders</h2>
          </div>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
            <TabsTrigger value="eats" className="flex-1 text-xs">Eats</TabsTrigger>
            <TabsTrigger value="rides" className="flex-1 text-xs">Rides</TabsTrigger>
            <TabsTrigger value="travel" className="flex-1 text-xs">Travel</TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {filter === "all"
                    ? "No spending history yet. Start exploring ZIVO!"
                    : `No ${filter} orders found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => (
                  <OrderReceiptCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
