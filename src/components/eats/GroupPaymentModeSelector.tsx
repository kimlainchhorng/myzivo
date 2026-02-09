/**
 * GroupPaymentModeSelector
 * Sheet shown when host taps "Lock & Checkout" — pick payment mode
 */
import { useState, useMemo } from "react";
import { CreditCard, Users, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { GroupOrderItem } from "@/hooks/useGroupOrder";

export type PaymentMode = "host_pays" | "split_even" | "pay_own";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GroupOrderItem[];
  total: number;
  onConfirm: (mode: PaymentMode) => Promise<void>;
}

export default function GroupPaymentModeSelector({ open, onOpenChange, items, total, onConfirm }: Props) {
  const [mode, setMode] = useState<PaymentMode>("host_pays");
  const [confirming, setConfirming] = useState(false);

  const participants = useMemo(() => {
    const map = new Map<string, { userId: string; userName: string; itemTotal: number }>();
    items.forEach((item) => {
      const existing = map.get(item.user_id) || { userId: item.user_id, userName: item.user_name, itemTotal: 0 };
      existing.itemTotal += item.price * item.quantity;
      map.set(item.user_id, existing);
    });
    return Array.from(map.values());
  }, [items]);

  const perPerson = participants.length > 0 ? total / participants.length : 0;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm(mode);
    } finally {
      setConfirming(false);
    }
  };

  const options = [
    {
      value: "host_pays" as const,
      icon: CreditCard,
      label: "Host pays total",
      desc: `You pay $${total.toFixed(2)}`,
    },
    {
      value: "split_even" as const,
      icon: Users,
      label: "Split evenly",
      desc: `$${perPerson.toFixed(2)} per person (${participants.length})`,
    },
    {
      value: "pay_own" as const,
      icon: UserCheck,
      label: "Pay for own items",
      desc: "Each person pays for what they ordered",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
        <SheetHeader className="text-left mb-6">
          <SheetTitle>How should everyone pay?</SheetTitle>
          <SheetDescription>Choose a payment mode before locking the order.</SheetDescription>
        </SheetHeader>

        <RadioGroup value={mode} onValueChange={(v) => setMode(v as PaymentMode)} className="space-y-3 mb-6">
          {options.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={opt.value}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors",
                mode === opt.value
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                mode === opt.value ? "bg-violet-500/20 text-violet-400" : "bg-muted text-muted-foreground"
              )}>
                <opt.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                mode === opt.value ? "border-violet-500" : "border-muted-foreground/30"
              )}>
                {mode === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
              </div>
            </Label>
          ))}
        </RadioGroup>

        {/* Pay-own breakdown */}
        {mode === "pay_own" && (
          <div className="mb-6 p-3 rounded-xl bg-muted/50 space-y-2">
            {participants.map((p) => (
              <div key={p.userId} className="flex justify-between text-sm">
                <span>{p.userName}</span>
                <span className="font-medium">${p.itemTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600"
        >
          {confirming ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Lock Order"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
