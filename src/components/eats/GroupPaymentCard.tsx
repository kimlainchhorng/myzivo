/**
 * GroupPaymentCard
 * Shows each participant's payment status and a "Pay Now" button for own row
 */
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GroupOrderItem } from "@/hooks/useGroupOrder";

export interface GroupPayment {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  created_at: string;
}

interface Props {
  payment: GroupPayment;
  items?: GroupOrderItem[];
  isCurrentUser: boolean;
  isPaying: boolean;
  onPayNow: (paymentId: string) => void;
  showItems?: boolean;
}

export default function GroupPaymentCard({
  payment, items, isCurrentUser, isPaying, onPayNow, showItems,
}: Props) {
  const isPaid = payment.status === "paid";

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all duration-200",
      isPaid ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{payment.user_name}</span>
          {isCurrentUser && <Badge variant="outline" className="text-[10px]">You</Badge>}
        </div>
        <Badge className={cn(
          "text-xs",
          isPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
        )}>
          {isPaid ? (
            <><CheckCircle className="w-3 h-3 mr-1" /> Paid</>
          ) : (
            <><Clock className="w-3 h-3 mr-1" /> Pending</>
          )}
        </Badge>
      </div>

      {/* Item breakdown for pay_own mode */}
      {showItems && items && items.length > 0 && (
        <div className="space-y-1 mb-3 pl-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
              <span>{item.item_name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">${payment.amount.toFixed(2)}</span>
        {isCurrentUser && !isPaid && (
          <Button
            size="sm"
            disabled={isPaying}
            onClick={() => onPayNow(payment.id)}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600"
          >
            {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pay Now"}
          </Button>
        )}
      </div>
    </div>
  );
}
