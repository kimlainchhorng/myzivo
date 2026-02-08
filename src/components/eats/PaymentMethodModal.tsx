/**
 * Payment Method Modal
 * UI-first payment selection (Stripe integration ready)
 */
import { useState } from "react";
import { CreditCard, Plus, Check, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PaymentMethod {
  id: string;
  type: "card" | "apple_pay" | "google_pay";
  brand?: string;
  last4?: string;
  isDefault?: boolean;
}

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMethodId: string | null;
  onSelect: (method: PaymentMethod) => void;
}

// Mock payment methods for UI - will be replaced with Stripe integration
const mockMethods: PaymentMethod[] = [
  { id: "pm_1", type: "card", brand: "Visa", last4: "4242", isDefault: true },
  { id: "pm_2", type: "card", brand: "Mastercard", last4: "8888" },
];

const digitalWallets: PaymentMethod[] = [
  { id: "apple_pay", type: "apple_pay" },
  { id: "google_pay", type: "google_pay" },
];

export function PaymentMethodModal({
  open,
  onOpenChange,
  selectedMethodId,
  onSelect,
}: PaymentMethodModalProps) {
  const getCardIcon = (brand?: string) => {
    // Could be extended with actual card brand icons
    return <CreditCard className="w-5 h-5" />;
  };

  const handleSelect = (method: PaymentMethod) => {
    onSelect(method);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Payment Method</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Saved Cards */}
          <div className="space-y-3">
            <p className="text-sm text-zinc-400 font-medium">Saved Cards</p>
            {mockMethods.length > 0 ? (
              mockMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(method)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                    selectedMethodId === method.id
                      ? "bg-orange-500/10 border-orange-500/50"
                      : "bg-zinc-800/50 border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                    {getCardIcon(method.brand)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">
                      {method.brand} •••• {method.last4}
                    </p>
                    {method.isDefault && (
                      <p className="text-xs text-zinc-500">Default</p>
                    )}
                  </div>
                  {selectedMethodId === method.id && (
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.button>
              ))
            ) : (
              <div className="text-center py-6 text-zinc-500">
                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved cards</p>
              </div>
            )}
          </div>

          {/* Digital Wallets */}
          <div className="space-y-3">
            <p className="text-sm text-zinc-400 font-medium">Digital Wallets</p>
            <div className="grid grid-cols-2 gap-3">
              {digitalWallets.map((wallet) => (
                <motion.button
                  key={wallet.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(wallet)}
                  className={cn(
                    "flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                    selectedMethodId === wallet.id
                      ? "bg-orange-500/10 border-orange-500/50"
                      : "bg-zinc-800/50 border-white/5 hover:border-white/10"
                  )}
                >
                  {wallet.type === "apple_pay" ? (
                    <>
                      <Apple className="w-5 h-5" />
                      <span className="font-medium text-sm">Apple Pay</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      <span className="font-medium text-sm">Google Pay</span>
                    </>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Add New Card */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-dashed border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:border-zinc-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple display component for selected payment method
interface PaymentMethodDisplayProps {
  selectedMethod: PaymentMethod | null;
  onClick: () => void;
}

export function PaymentMethodDisplay({
  selectedMethod,
  onClick,
}: PaymentMethodDisplayProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
    >
      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
        <CreditCard className="w-5 h-5 text-orange-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-0.5">Payment</p>
        {selectedMethod ? (
          <p className="font-bold text-sm text-white">
            {selectedMethod.type === "card"
              ? `${selectedMethod.brand} •••• ${selectedMethod.last4}`
              : selectedMethod.type === "apple_pay"
              ? "Apple Pay"
              : "Google Pay"}
          </p>
        ) : (
          <p className="text-sm text-orange-500 font-medium">
            Select payment method
          </p>
        )}
      </div>

      <span className="text-xs text-orange-500 font-medium">Change</span>
    </motion.button>
  );
}
