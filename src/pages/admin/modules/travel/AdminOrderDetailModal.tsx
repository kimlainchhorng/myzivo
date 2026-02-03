/**
 * Admin Order Detail Modal
 * View full order details with timeline and admin actions
 */
import { useState } from "react";
import { 
  Building2, 
  Plane, 
  Car, 
  User, 
  Mail, 
  Phone,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  MessageSquare,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  useAdminOrderDetail,
  useAdminResendConfirmation,
  useAdminFlagOrder,
  useAdminUpdateNotes,
} from "@/hooks/useAdminTravelDashboard";
import { format } from "date-fns";

interface AdminOrderDetailModalProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

const AdminOrderDetailModal = ({ orderId, open, onClose }: AdminOrderDetailModalProps) => {
  const { data: order, isLoading } = useAdminOrderDetail(orderId || undefined);
  const [notes, setNotes] = useState("");
  const [notesChanged, setNotesChanged] = useState(false);

  const resendConfirmation = useAdminResendConfirmation();
  const flagOrder = useAdminFlagOrder();
  const updateNotes = useAdminUpdateNotes();

  // Sync notes when order loads
  useState(() => {
    if (order?.admin_notes) {
      setNotes(order.admin_notes);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case "pending_payment":
        return <Badge className="bg-amber-500/10 text-amber-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "cancelled":
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Building2 className="w-4 h-4" />;
      case "activity":
        return <Plane className="w-4 h-4" />;
      case "transfer":
        return <Car className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleSaveNotes = async () => {
    if (!orderId) return;
    await updateNotes.mutateAsync({ orderId, notes });
    setNotesChanged(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !order ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p>Order not found</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="font-mono">{order.order_number}</span>
                    {getStatusBadge(order.status)}
                    {order.flagged_for_review && (
                      <Flag className="w-4 h-4 text-amber-500" />
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    Created {format(new Date(order.created_at), "PPpp")}
                  </DialogDescription>
                </div>
                <p className="text-2xl font-bold">${order.total.toLocaleString()}</p>
              </div>
            </DialogHeader>

            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {/* Customer Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-3">Customer Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{order.holder_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{order.holder_email}</span>
                    </div>
                    {order.holder_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{order.holder_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancellation Info */}
                {order.cancellation_status && order.cancellation_status !== "none" && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                      Cancellation Status: {order.cancellation_status}
                    </h3>
                    {(order as any).cancellation_reason && (
                      <p className="text-sm">{(order as any).cancellation_reason}</p>
                    )}
                  </div>
                )}

                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setNotesChanged(true);
                    }}
                    placeholder="Internal notes about this order..."
                    rows={3}
                  />
                  {notesChanged && (
                    <Button 
                      size="sm" 
                      onClick={handleSaveNotes}
                      disabled={updateNotes.isPending}
                    >
                      {updateNotes.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Save Notes
                    </Button>
                  )}
                </div>

                {/* Actions */}
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => resendConfirmation.mutate(order.id)}
                    disabled={resendConfirmation.isPending}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Confirmation
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => flagOrder.mutate({ orderId: order.id })}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {order.flagged_for_review ? "Remove Flag" : "Flag Order"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                {order.travel_order_items?.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(item.start_date), "MMM d")}
                            {item.end_date && ` - ${format(new Date(item.end_date), "MMM d")}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.price.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.supplier_status}
                        </Badge>
                      </div>
                    </div>
                    {item.provider_reference && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                        <span className="text-muted-foreground">Supplier Ref: </span>
                        <code>{item.provider_reference}</code>
                      </div>
                    )}
                    {item.cancellation_policy && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.cancellation_policy}
                      </p>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                {order.travel_payments?.map((payment) => (
                  <div key={payment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium">Stripe Payment</span>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">${payment.amount} {payment.currency.toUpperCase()}</p>
                      </div>
                      {payment.stripe_checkout_session_id && (
                        <div>
                          <p className="text-muted-foreground">Session ID</p>
                          <code className="text-xs">{payment.stripe_checkout_session_id.slice(0, 24)}...</code>
                        </div>
                      )}
                    </div>
                    {payment.stripe_payment_intent_id && (
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <a 
                          href={`https://dashboard.stripe.com/payments/${payment.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View in Stripe
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  {order.audit_logs?.length > 0 ? (
                    order.audit_logs.map((log: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {i < order.audit_logs.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{log.event}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(log.created_at), "PPpp")}
                          </p>
                          {log.meta && (
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2" />
                      <p>No timeline events</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminOrderDetailModal;
