import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, UtensilsCrossed, PiggyBank, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useActivityInsights } from "@/hooks/useActivityInsights";
import SEOHead from "@/components/SEOHead";

export default function ActivityPage() {
  const navigate = useNavigate();
  const insights = useActivityInsights();

  if (insights.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-top safe-area-bottom">
      <SEOHead title="Activity Insights — ZIVO" description="View your personal activity stats on ZIVO" />

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 container max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="rounded-xl -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold">Activity Insights</h1>
            <p className="text-muted-foreground text-xs">Your personal stats this month</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Orders This Month */}
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-teal-500/5" />
            <CardContent className="p-5 relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">Orders This Month</p>
                {insights.ordersThisMonth > 0 ? (
                  <p className="text-3xl font-bold">{insights.ordersThisMonth}</p>
                ) : (
                  <>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Place your first order!</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Favorite Restaurant */}
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
            <CardContent className="p-5 relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">Favorite Restaurant</p>
                {insights.favoriteRestaurant ? (
                  <>
                    <p className="text-lg font-bold">{insights.favoriteRestaurant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {insights.favoriteRestaurant.orderCount} order{insights.favoriteRestaurant.orderCount !== 1 ? "s" : ""} this month
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total Saved */}
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
            <CardContent className="p-5 relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">Total Saved This Month</p>
                {insights.totalSaved > 0 ? (
                  <>
                    <p className="text-3xl font-bold">${insights.totalSaved.toFixed(2)}</p>
                    <div className="flex gap-4 mt-1">
                      <p className="text-xs text-muted-foreground">
                        ZIVO+ savings: <span className="font-semibold text-foreground">${insights.membershipSaved.toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Promo savings: <span className="font-semibold text-foreground">${insights.promoSaved.toFixed(2)}</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold">$0.00</p>
                    <p className="text-xs text-muted-foreground">Use promos or join ZIVO+ to save</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
