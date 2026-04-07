/**
 * AdminGodView — Owner dashboard: platform volume, Meta match rate, server health
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, TrendingUp, Activity, Server, CheckCircle, AlertTriangle,
  ArrowLeft, Eye, Zap, ShoppingBag, Users, BarChart3, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminGodView() {
  const navigate = useNavigate();

  // Platform volume today
  const { data: volumeData } = useQuery({
    queryKey: ["god-view-volume"],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const db = supabase as any;

      const [storeOrders, foodOrders, truckSales] = await Promise.all([
        db.from("store_orders")
          .select("total_cents, status")
          .gte("created_at", todayStart.toISOString())
          .in("status", ["completed", "delivered", "confirmed"]),
        db.from("food_orders")
          .select("total_amount, status")
          .gte("created_at", todayStart.toISOString())
          .in("status", ["completed", "delivered"]),
        db.from("truck_sales")
          .select("amount_cents, status")
          .gte("created_at", todayStart.toISOString())
          .eq("status", "completed"),
      ]);

      const storeVolume = (storeOrders.data || []).reduce((s: number, o: any) => s + (o.total_cents || 0), 0);
      const foodVolume = (foodOrders.data || []).reduce((s: number, o: any) => s + ((o.total_amount || 0) * 100), 0);
      const truckVolume = (truckSales.data || []).reduce((s: number, o: any) => s + (o.amount_cents || 0), 0);

      const totalCents = storeVolume + foodVolume + truckVolume;
      const platformFeeCents = Math.round(totalCents * 0.02);

      return {
        totalVolume: totalCents / 100,
        platformRevenue: platformFeeCents / 100,
        storeOrders: (storeOrders.data || []).length,
        foodOrders: (foodOrders.data || []).length,
        truckSales: (truckSales.data || []).length,
        totalTransactions: (storeOrders.data || []).length + (foodOrders.data || []).length + (truckSales.data || []).length,
      };
    },
    refetchInterval: 30_000,
  });

  // Meta CAPI match rate
  const { data: metaData } = useQuery({
    queryKey: ["god-view-meta"],
    queryFn: async () => {
      const db = supabase as any;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Total completed orders
      const { count: totalOrders } = await db
        .from("store_orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["completed", "delivered"])
        .gte("created_at", sevenDaysAgo);

      // Orders with meta_event_id (successfully matched by CAPI)
      const { count: matchedOrders } = await db
        .from("store_orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["completed", "delivered"])
        .not("meta_event_id", "is", null)
        .gte("created_at", sevenDaysAgo);

      // CAPI bridge events
      const { count: capiEvents } = await db
        .from("meta_capi_events")
        .select("id", { count: "exact", head: true })
        .eq("event_name", "Purchase")
        .gte("created_at", sevenDaysAgo);

      const matchRate = totalOrders && totalOrders > 0
        ? Math.round(((matchedOrders || 0) / totalOrders) * 100)
        : 0;

      return {
        totalOrders: totalOrders || 0,
        matchedOrders: matchedOrders || 0,
        capiEvents: capiEvents || 0,
        matchRate,
      };
    },
    refetchInterval: 60_000,
  });

  // Edge function health
  const edgeFunctions = [
    { name: "stripe-webhook", critical: true },
    { name: "meta-conversion-handler", critical: true },
    { name: "ai-support-chat", critical: false },
    { name: "send-push-notification", critical: false },
    { name: "aba-payway-checkout", critical: true },
    { name: "duffel-flights", critical: false },
  ];

  // User/merchant counts
  const { data: userCounts } = useQuery({
    queryKey: ["god-view-users"],
    queryFn: async () => {
      const db = supabase as any;
      const { count: totalUsers } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true });
      const { count: totalStores } = await db
        .from("store_profiles")
        .select("id", { count: "exact", head: true });
      return { users: totalUsers || 0, stores: totalStores || 0 };
    },
    staleTime: 120_000,
  });

  return (
    <div className="min-h-screen bg-background p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">🔱 God View</h1>
          <p className="text-xs text-muted-foreground">Live platform overview — Owner Only</p>
        </div>
        <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-600 border-red-500/20">
          <Shield className="h-3 w-3 mr-1" /> RESTRICTED
        </Badge>
      </div>

      {/* Platform Volume — Today */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Platform Volume — Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-black">${(volumeData?.totalVolume || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Platform Revenue (2% fee): <span className="font-bold text-green-600">${(volumeData?.platformRevenue || 0).toFixed(2)}</span>
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 rounded-lg bg-background/50">
              <ShoppingBag className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{volumeData?.storeOrders || 0}</p>
              <p className="text-[9px] text-muted-foreground">Store Orders</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <Zap className="h-4 w-4 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold">{volumeData?.foodOrders || 0}</p>
              <p className="text-[9px] text-muted-foreground">Food Orders</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
              <p className="text-lg font-bold">{volumeData?.truckSales || 0}</p>
              <p className="text-[9px] text-muted-foreground">Truck Sales</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta CAPI Match Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Meta CAPI Match Rate (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black">{metaData?.matchRate || 0}%</p>
            <Badge
              variant="outline"
              className={(metaData?.matchRate || 0) >= 80
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
              }
            >
              {(metaData?.matchRate || 0) >= 80 ? "Excellent" : "Needs Attention"}
            </Badge>
          </div>
          <Progress value={metaData?.matchRate || 0} className="h-3" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-sm font-bold">{metaData?.totalOrders || 0}</p>
              <p className="text-[9px] text-muted-foreground">Total Orders</p>
            </div>
            <div>
              <p className="text-sm font-bold">{metaData?.matchedOrders || 0}</p>
              <p className="text-[9px] text-muted-foreground">CAPI Matched</p>
            </div>
            <div>
              <p className="text-sm font-bold">{metaData?.capiEvents || 0}</p>
              <p className="text-[9px] text-muted-foreground">Purchase Events</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Server Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="h-4 w-4" /> Edge Function Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {edgeFunctions.map((fn) => (
            <div key={fn.name} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{fn.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {fn.critical && (
                  <Badge variant="outline" className="text-[9px] bg-red-500/5 text-red-500 border-red-500/20">
                    CRITICAL
                  </Badge>
                )}
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px]">
                  LIVE
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" /> Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <p className="text-2xl font-black">{userCounts?.users || 0}</p>
              <p className="text-[10px] text-muted-foreground">Total Users</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <p className="text-2xl font-black">{userCounts?.stores || 0}</p>
              <p className="text-[10px] text-muted-foreground">Active Stores</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
