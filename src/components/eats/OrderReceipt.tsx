/**
 * Order Receipt Component
 * Printable receipt for food orders
 */
import { format } from "date-fns";
import { Printer, Download, UtensilsCrossed, MapPin, CreditCard, Banknote, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveEatsOrder } from "@/hooks/useLiveEatsOrder";
import { downloadReceipt } from "@/lib/receiptUtils";
import type { UnifiedOrder } from "@/hooks/useSpendingStats";

interface OrderReceiptProps {
  order: LiveEatsOrder;
  onPrint?: () => void;
}

export function OrderReceipt({ order, onPrint }: OrderReceiptProps) {
  const items = (order.items as any[]) || [];
  const restaurantName = order.restaurants?.name || "Restaurant";
  const restaurantAddress = order.restaurants?.address || "";
  const createdAt = new Date(order.created_at);
  const orderNumber = order.id.slice(0, 8).toUpperCase();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-white text-zinc-900 rounded-2xl overflow-hidden print:shadow-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center print:bg-orange-500">
        <h1 className="text-2xl font-bold mb-1">ZIVO EATS</h1>
        <p className="text-orange-100 text-sm">Order Receipt</p>
      </div>

      {/* Order Info */}
      <div className="p-6 border-b border-zinc-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-zinc-500">Order Number</p>
            <p className="font-bold text-lg">#{orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500">Date & Time</p>
            <p className="font-medium">{format(createdAt, "MMM d, yyyy")}</p>
            <p className="text-sm text-zinc-600">{format(createdAt, "h:mm a")}</p>
          </div>
        </div>

        {/* Restaurant */}
        <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-bold">{restaurantName}</p>
            {restaurantAddress && (
              <p className="text-sm text-zinc-500">{restaurantAddress}</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {order.delivery_address && (
        <div className="px-6 py-4 border-b border-zinc-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-zinc-500">Delivered to</p>
              <p className="font-medium">{order.delivery_address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="p-6 border-b border-zinc-200">
        <h2 className="font-bold mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <div className="flex-1">
                <p className="font-medium">
                  <span className="text-orange-600 mr-2">{item.quantity}x</span>
                  {item.name}
                </p>
                {item.notes && (
                  <p className="text-xs text-zinc-500 mt-0.5">{item.notes}</p>
                )}
              </div>
              <p className="font-medium">
                ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-6 border-b border-zinc-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Subtotal</span>
          <span>${order.subtotal?.toFixed(2) || "0.00"}</span>
        </div>

        {order.discount_amount && order.discount_amount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Discount {order.promo_code && `(${order.promo_code})`}</span>
            <span>-${order.discount_amount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Delivery Fee</span>
          <span>${order.delivery_fee?.toFixed(2) || "0.00"}</span>
        </div>

        {order.tax && order.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">
              Tax{order.subtotal && order.tax ? ` (${((order.tax / order.subtotal) * 100).toFixed(2)}%)` : ""}
            </span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
        )}

        {order.service_fee != null && order.service_fee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Service Fee</span>
            <span>${order.service_fee.toFixed(2)}</span>
          </div>
        )}

        {order.tip_amount != null && order.tip_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Tip</span>
            <span>${order.tip_amount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between pt-3 border-t border-zinc-200">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg text-orange-600">
            ${order.total_amount?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(order as any).payment_type === "cash" ? (
              <>
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Cash on Delivery</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-zinc-600" />
                <span className="font-medium">Card Payment</span>
              </>
            )}
          </div>
          <span className={`text-sm font-medium ${
            order.payment_status === "paid" ? "text-emerald-600" : "text-orange-600"
          }`}>
            {order.payment_status === "paid" ? "Paid" : "Pending"}
          </span>
        </div>
      </div>

      {/* Actions (hidden in print) */}
      <div className="p-6 flex gap-3 print:hidden">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex-1 h-12 rounded-xl border-zinc-300"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const unified: UnifiedOrder = {
              id: order.id,
              type: "eats",
              title: restaurantName,
              amount: order.total_amount || 0,
              date: order.created_at,
              status: order.status,
              subtotal: order.subtotal ?? undefined,
              deliveryFee: order.delivery_fee ?? undefined,
              serviceFee: order.service_fee ?? undefined,
              tax: order.tax ?? undefined,
              tip: order.tip_amount ?? undefined,
              discount: order.discount_amount ?? undefined,
              promoCode: order.promo_code ?? undefined,
              taxRate: order.subtotal && order.tax ? order.tax / order.subtotal : undefined,
            };
            downloadReceipt(unified);
          }}
          className="flex-1 h-12 rounded-xl border-zinc-300"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </Button>
      </div>

      {/* Footer */}
      <div className="p-6 bg-zinc-50 text-center text-sm text-zinc-500 print:bg-transparent">
        <p>Thank you for ordering with ZIVO Eats!</p>
        <p className="mt-1">Questions? Contact support@zivo.app</p>
      </div>
    </div>
  );
}
