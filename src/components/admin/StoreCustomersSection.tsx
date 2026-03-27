/**
 * StoreCustomersSection — Shows store visitors, customer directory, and order history.
 * Placeholder until store order flow is implemented.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, Eye, TrendingUp } from "lucide-react";

interface Props {
  storeId: string;
}

export default function StoreCustomersSection({ storeId }: Props) {
  const stats = [
    { label: "Total Customers", value: "0", icon: Users, color: "text-primary" },
    { label: "Total Orders", value: "0", icon: ShoppingBag, color: "text-emerald-500" },
    { label: "Store Views Today", value: "0", icon: Eye, color: "text-blue-500" },
    { label: "Repeat Customers", value: "0%", icon: TrendingUp, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-muted ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Visitors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Store Visitors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No active visitors right now</p>
            <p className="text-xs mt-1">Visitors will appear here when customers view your store</p>
          </div>
        </CardContent>
      </Card>

      {/* Customer Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No customers yet</p>
            <p className="text-xs mt-1">Customers who order from your store will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No orders yet</p>
            <p className="text-xs mt-1">Order history will be shown here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
