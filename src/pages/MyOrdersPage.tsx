/**
 * My Orders Page
 * Lists all user's travel orders
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hotel, MapPin, Car, Loader2, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyOrders } from "@/hooks/useOrderDetails";
import { format } from "date-fns";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useMyOrders();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending_payment":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      case "refunded":
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getItemTypeIcon = (types: string[]) => {
    if (types.includes("hotel")) return <Hotel className="h-5 w-5" />;
    if (types.includes("activity")) return <MapPin className="h-5 w-5" />;
    if (types.includes("transfer")) return <Car className="h-5 w-5" />;
    return <Package className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Orders</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive mb-4">Failed to load orders</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const items = order.travel_order_items || [];
              const itemTypes = [...new Set(items.map((i) => i.type))];
              const firstDate = items[0]?.start_date;
              
              return (
                <Card 
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/confirmation/${order.order_number}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        {getItemTypeIcon(itemTypes)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">
                            {order.order_number}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {items.map((i) => i.title).join(", ")}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {firstDate && (
                            <span>{format(new Date(firstDate), "MMM d, yyyy")}</span>
                          )}
                          <span>${order.total.toFixed(2)}</span>
                          <span>{items.length} item{items.length > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-4">
                Start exploring hotels, activities, and transfers to book your next adventure.
              </p>
              <Button onClick={() => navigate("/hotels")}>Browse Hotels</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MyOrdersPage;
