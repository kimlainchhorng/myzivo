/**
 * StoreMarketingSection — Promotions, ad campaigns, and store analytics.
 * Placeholder until marketing features are fully implemented.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Megaphone, BarChart3, Plus, TrendingUp, Eye, MousePointerClick } from "lucide-react";

interface Props {
  storeId: string;
}

export default function StoreMarketingSection({ storeId }: Props) {
  const analyticsStats = [
    { label: "Store Views", value: "0", change: "+0%", icon: Eye },
    { label: "Product Clicks", value: "0", change: "+0%", icon: MousePointerClick },
    { label: "Conversion Rate", value: "0%", change: "+0%", icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      {/* Store Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {analyticsStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-emerald-500 font-medium">{s.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Promotions & Coupons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Promotions & Coupons
          </CardTitle>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create Promotion
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No active promotions</p>
            <p className="text-xs mt-1">Create discount codes and flash sales to attract more customers</p>
          </div>
        </CardContent>
      </Card>

      {/* Ad Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            Ad Campaigns
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Campaign
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No campaigns running</p>
            <p className="text-xs mt-1">Promote your store with targeted ad campaigns in the marketplace</p>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Traffic & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Analytics will appear here</p>
            <p className="text-xs mt-1">Track where your customers come from and how they interact with your store</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
