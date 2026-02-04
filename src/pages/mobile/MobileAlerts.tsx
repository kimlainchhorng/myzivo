/**
 * ZIVO Mobile Alerts Screen
 * Price alerts dashboard with active alerts and history
 */
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Bell, BellOff, TrendingDown, Trash2, Plane, Plus, AlertCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePriceAlerts, type PriceAlert } from "@/hooks/usePriceAlerts";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TabType = "active" | "history";

export default function MobileAlerts() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const { alerts, removeAlert, checkAlerts } = usePriceAlerts();

  // Separate active and triggered alerts
  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const getPriceDiff = (alert: PriceAlert) => {
    if (alert.currentPrice > alert.targetPrice) {
      return { diff: alert.currentPrice - alert.targetPrice, above: true };
    }
    return { diff: alert.targetPrice - alert.currentPrice, above: false };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">Price Alerts</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => checkAlerts()}
            className="text-primary"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all touch-manipulation flex items-center justify-center gap-2",
              activeTab === "active"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Active
            {activeAlerts.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeAlerts.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all touch-manipulation flex items-center justify-center gap-2",
              activeTab === "history"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {activeTab === "active" ? (
          activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => {
                const { diff, above } = getPriceDiff(alert);
                
                return (
                  <Card key={alert.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Plane className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {alert.route.fromCode} → {alert.route.toCode}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {alert.flexibleDates 
                                ? "Flexible dates" 
                                : alert.departureDate 
                                  ? format(new Date(alert.departureDate), "MMM d, yyyy")
                                  : "Any dates"}
                            </p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Alert</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this price alert for {alert.route.fromCode} → {alert.route.toCode}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeAlert(alert.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Target price</span>
                          <span className="font-semibold text-green-600">${alert.targetPrice} or less</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current price</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">${alert.currentPrice}</span>
                            {above ? (
                              <Badge variant="secondary" className="text-xs">
                                ${diff} above target
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                ${diff} below target!
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => removeAlert(alert.id)}
                        >
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/flights/${alert.route.fromCode.toLowerCase()}-to-${alert.route.toCode.toLowerCase()}`)}
                        >
                          View Prices
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No active price alerts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up alerts to get notified when prices drop for your favorite routes.
                </p>
                <Button onClick={() => navigate("/search")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Track New Route
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          // History Tab
          triggeredAlerts.length > 0 ? (
            <div className="space-y-3">
              {triggeredAlerts.map((alert) => (
                <Card key={alert.id} className="overflow-hidden bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {alert.route.fromCode} → {alert.route.toCode}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Price dropped to ${alert.triggeredPrice}!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.lastCheckedAt && format(new Date(alert.lastCheckedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => navigate(`/flights/${alert.route.fromCode.toLowerCase()}-to-${alert.route.toCode.toLowerCase()}`)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No alert history</h3>
                <p className="text-sm text-muted-foreground">
                  Triggered alerts will appear here.
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Floating Action Button */}
      {activeTab === "active" && (
        <div className="fixed bottom-24 right-4 z-40">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => navigate("/search")}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <ZivoMobileNav />
    </div>
  );
}
