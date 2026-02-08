/**
 * Ad Fraud Monitor
 * Displays fraud signals and suspicious activity
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, MousePointer, ShoppingCart, Eye } from "lucide-react";
import { useAdFraudSignals } from "@/hooks/useRestaurantAds";

const AdFraudMonitor = () => {
  const { data: signals, isLoading } = useAdFraudSignals();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case "high_ctr_no_orders":
        return <ShoppingCart className="h-5 w-5 text-orange-500" />;
      case "click_bombing":
        return <MousePointer className="h-5 w-5 text-red-500" />;
      case "suspicious_pattern":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSignalTitle = (type: string) => {
    switch (type) {
      case "high_ctr_no_orders":
        return "High CTR, No Orders";
      case "click_bombing":
        return "Click Bombing Detected";
      case "suspicious_pattern":
        return "Suspicious Pattern";
      default:
        return "Fraud Signal";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading fraud signals...
        </CardContent>
      </Card>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">All Clear</h3>
          <p className="text-muted-foreground">
            No fraud signals detected. The platform is operating normally.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Fraud Signals ({signals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {signals.map((signal, index) => (
            <div
              key={`${signal.adId}-${index}`}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <div className="p-2 rounded-lg bg-muted">
                {getSignalIcon(signal.signalType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{getSignalTitle(signal.signalType)}</h4>
                  {getSeverityBadge(signal.severity)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {signal.restaurantName}
                </p>
                <p className="text-sm">{signal.details}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{signal.clickCount} clicks</span>
                  <span>{signal.orderCount} orders</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Investigate
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fraud Detection Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Rule 1</Badge>
              <div>
                <p className="font-medium">High CTR, No Orders</p>
                <p className="text-muted-foreground">
                  Campaigns with 50+ clicks but 0 orders may indicate click fraud.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Rule 2</Badge>
              <div>
                <p className="font-medium">Click Bombing</p>
                <p className="text-muted-foreground">
                  Same user clicking an ad more than 10 times indicates fraud.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Rule 3</Badge>
              <div>
                <p className="font-medium">Suspicious Patterns</p>
                <p className="text-muted-foreground">
                  Unusual click bursts or patterns from specific IPs.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdFraudMonitor;
