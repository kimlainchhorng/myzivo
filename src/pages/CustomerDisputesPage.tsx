/**
 * Customer Disputes Page
 * Shows a list of the customer's filed disputes with status tracking
 */
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyDisputes } from "@/hooks/useCustomerDisputes";
import { DisputeStatusBadge } from "@/components/disputes/DisputeStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

const reasonLabels: Record<string, string> = {
  missing_items: "Missing items",
  wrong_items: "Wrong items",
  order_late: "Order late",
  not_delivered: "Not Delivered",
  damaged: "Damaged",
  overcharged: "Overcharged",
  other: "Other",
};

export default function CustomerDisputesPage() {
  const { data: disputes, isLoading } = useMyDisputes();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/my-trips">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-bold">My Disputes</h1>
          </div>
        </div>
      </div>

      <div className="container px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !disputes?.length ? (
          <EmptyState
            type="search"
            title="No disputes filed"
            description="If you have a problem with an order, you can report it from your order details page."
          />
        ) : (
          disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium text-sm">
                      {reasonLabels[dispute.reason] || dispute.reason}
                    </p>
                    {dispute.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {dispute.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {dispute.created_at
                        ? format(new Date(dispute.created_at), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                  <DisputeStatusBadge status={dispute.status} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
