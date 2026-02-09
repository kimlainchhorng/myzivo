import { UtensilsCrossed, Car, Plane, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UnifiedOrder } from "@/hooks/useSpendingStats";
import { downloadReceipt } from "@/lib/receiptUtils";
import { format } from "date-fns";

const serviceConfig = {
  eats: { icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-500/10" },
  rides: { icon: Car, color: "text-primary", bg: "bg-primary/10" },
  travel: { icon: Plane, color: "text-violet-500", bg: "bg-violet-500/10" },
} as const;

interface OrderReceiptCardProps {
  order: UnifiedOrder;
}

export function OrderReceiptCard({ order }: OrderReceiptCardProps) {
  const config = serviceConfig[order.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/80 border border-border/50 hover:border-border transition-colors">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.bg)}>
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{order.title}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(order.date), "MMM d, yyyy")}
        </p>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2">
        <div>
          <p className="font-bold text-sm">${order.amount.toFixed(2)}</p>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
            {order.status}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => downloadReceipt(order)}
          aria-label={`Download receipt for ${order.title}`}
        >
          <Printer className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
