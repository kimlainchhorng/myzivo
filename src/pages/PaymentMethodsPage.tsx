import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  Star,
  Check,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useLocalPaymentMethods,
  LocalPaymentMethod,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  parseExpiry,
  validateCardNumber,
  validateExpiry,
  validateCVV,
} from "@/hooks/useLocalPaymentMethods";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const { methods, addCard, deleteCard, setDefault, isEmpty } = useLocalPaymentMethods();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(value);
  };

  const resetForm = () => {
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setCardholderName("");
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!validateCardNumber(cardNumber)) {
      toast.error("Invalid card number");
      return;
    }
    if (!validateExpiry(expiry)) {
      toast.error("Card expiry must be in the future");
      return;
    }
    if (!validateCVV(cvv)) {
      toast.error("Invalid CVV");
      return;
    }
    if (!cardholderName.trim()) {
      toast.error("Cardholder name is required");
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanedNumber = cardNumber.replace(/\s/g, "");
    const parsedExpiry = parseExpiry(expiry)!;

    addCard({
      type: "card",
      brand: detectCardBrand(cleanedNumber),
      last4: cleanedNumber.slice(-4),
      expMonth: parsedExpiry.month,
      expYear: parsedExpiry.year,
      cardholderName: cardholderName.trim(),
    });

    toast.success("Card added successfully");
    resetForm();
    setIsSubmitting(false);
  };

  const handleDelete = (card: LocalPaymentMethod) => {
    deleteCard(card.id);
    toast.success(`${card.brand} •••• ${card.last4} removed`);
  };

  const handleSetDefault = (card: LocalPaymentMethod) => {
    if (card.isDefault) return;
    setDefault(card.id);
    toast.success(`${card.brand} •••• ${card.last4} set as default`);
  };

  const getCardIcon = (brand: string) => {
    // In production, use proper card brand icons
    return CreditCard;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-4 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Payment Methods</h1>
      </header>

      {/* Demo Mode Banner */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
        <Wifi className="w-4 h-4 text-amber-500" />
        <span className="text-xs text-amber-200">
          Demo mode — cards stored locally, not processed
        </span>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Saved Cards */}
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Add a card to speed up checkout
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {methods.map((card) => {
                const Icon = getCardIcon(card.brand);
                return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      "relative p-4 rounded-xl border transition-all",
                      card.isDefault
                        ? "bg-primary/10 border-primary/50"
                        : "bg-white/5 border-white/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          card.isDefault ? "bg-primary/20" : "bg-white/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            card.isDefault ? "text-primary" : "text-zinc-400"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {card.brand} •••• {card.last4}
                          </span>
                          {card.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Expires {String(card.expMonth).padStart(2, "0")}/
                          {String(card.expYear).slice(-2)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                          {card.cardholderName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSetDefault(card)}
                          disabled={card.isDefault}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            card.isDefault
                              ? "text-primary cursor-default"
                              : "text-zinc-500 hover:text-amber-400 hover:bg-white/5"
                          )}
                          aria-label="Set as default"
                        >
                          <Star
                            className={cn(
                              "w-4 h-4",
                              card.isDefault && "fill-primary"
                            )}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(card)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                          aria-label="Delete card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Add New Card Button */}
            {!showAddForm && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAddForm(true)}
                className="w-full p-4 rounded-xl border border-dashed border-white/20 flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:border-white/40 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add New Card</span>
              </motion.button>
            )}
          </div>
        )}

        {/* Add Card Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Add New Card</h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Card Number
                  </label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    leftIcon={CreditCard}
                    className="bg-zinc-900/50"
                    style={{ fontSize: 16 }}
                    autoComplete="cc-number"
                  />
                  {cardNumber.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {detectCardBrand(cardNumber)}
                    </p>
                  )}
                </div>

                {/* Expiry & CVV Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      Expiry
                    </label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="bg-zinc-900/50"
                      style={{ fontSize: 16 }}
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      CVV
                    </label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      className="bg-zinc-900/50"
                      style={{ fontSize: 16 }}
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Cardholder Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="bg-zinc-900/50"
                    style={{ fontSize: 16 }}
                    autoComplete="cc-name"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Add Card
                    </>
                  )}
                </Button>

                {/* Security Note */}
                <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Demo only — card data stored locally
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentMethodsPage;
