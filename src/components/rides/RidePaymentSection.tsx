/**
 * RidePaymentSection — Saved cards, add new card, Apple Pay for ride checkout
 */
import { useState, useEffect, useCallback } from "react";
import { CreditCard, Plus, Trash2, Check, Shield, ChevronRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface RidePaymentSectionProps {
  price: number;
  vehicleName: string;
  isSubmitting: boolean;
  onAuthorizeWithSavedCard: (paymentMethodId: string) => void;
  onAuthorizeWithNewCard: () => void;
  clientSecret: string | null;
  onPaymentSuccess: () => void;
  paymentFailed: boolean;
}

const BRAND_ICONS: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  amex: "💳",
  discover: "💳",
};

const BRAND_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
};

/* ─── Inline Stripe form for adding new card ─── */
function AddCardForm({ onSuccess, onCancel, setupClientSecret }: {
  onSuccess: () => void;
  onCancel: () => void;
  setupClientSecret: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: setupError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (setupError) {
      setError(setupError.message || "Failed to save card");
      setProcessing(false);
    } else {
      toast.success("Card saved successfully!");
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement options={{ layout: "accordion", paymentMethodOrder: ["card", "apple_pay", "google_pay"], wallets: { applePay: "auto", googlePay: "auto" } }} />
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-10 rounded-xl text-xs font-bold"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-10 rounded-xl text-xs font-bold bg-foreground text-background"
          disabled={!stripe || processing}
        >
          {processing ? "Saving..." : "Save Card"}
        </Button>
      </div>
    </form>
  );
}

/* ─── Stripe authorize form for new card payment ─── */
function AuthorizeForm({ onSuccess, price, vehicleName }: {
  onSuccess: () => void;
  price: number;
  vehicleName: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: payError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (payError) {
      setError(payError.message || "Payment failed");
      setProcessing(false);
    } else {
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement options={{ layout: "accordion", paymentMethodOrder: ["card", "apple_pay", "google_pay"], wallets: { applePay: "auto", googlePay: "auto" } }} />
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
      <Button
        type="submit"
        className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg gap-2"
        disabled={!stripe || processing}
      >
        <Shield className="w-5 h-5" />
        {processing ? "Authorizing..." : `Authorize $${price.toFixed(2)} · ${vehicleName}`}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        Your card will be pre-authorized. Final charge applied after ride completion.
      </p>
    </form>
  );
}

export default function RidePaymentSection({
  price,
  vehicleName,
  isSubmitting,
  onAuthorizeWithSavedCard,
  onAuthorizeWithNewCard,
  clientSecret,
  onPaymentSuccess,
  paymentFailed,
}: RidePaymentSectionProps) {
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingCard, setAddingCard] = useState(false);

  // Load saved cards
  const loadCards = useCallback(async () => {
    setLoadingCards(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-payment-methods", {
        body: { action: "list" },
      });
      if (!error && data?.ok) {
        setSavedCards(data.cards || []);
        // Auto-select default or first card
        const defaultCard = data.cards?.find((c: SavedCard) => c.is_default);
        if (defaultCard) {
          setSelectedCardId(defaultCard.id);
        } else if (data.cards?.length > 0) {
          setSelectedCardId(data.cards[0].id);
        }
      }
    } catch {
      console.error("Failed to load cards");
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Start add card flow
  const handleAddCard = async () => {
    setAddingCard(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-payment-methods", {
        body: { action: "create_setup_intent" },
      });
      console.log("[RidePayment] create_setup_intent response:", { data, error });
      if (error) {
        const errMsg = typeof error === 'string' ? error : error?.message || "Failed to start card setup";
        toast.error(errMsg);
        return;
      }
      if (!data?.ok || !data?.client_secret) {
        toast.error(data?.error || "Failed to start card setup");
        return;
      }
      setSetupClientSecret(data.client_secret);
      setShowAddCard(true);
    } catch (e: any) {
      console.error("[RidePayment] handleAddCard error:", e);
      toast.error(e?.message || "Failed to start card setup");
    } finally {
      setAddingCard(false);
    }
  };

  // Delete card
  const handleDeleteCard = async (cardId: string) => {
    setDeletingId(cardId);
    try {
      const { error } = await supabase.functions.invoke("manage-payment-methods", {
        body: { action: "delete", payment_method_id: cardId },
      });
      if (!error) {
        setSavedCards(prev => prev.filter(c => c.id !== cardId));
        if (selectedCardId === cardId) {
          setSelectedCardId(savedCards.find(c => c.id !== cardId)?.id || null);
        }
        toast.success("Card removed");
      }
    } catch {
      toast.error("Failed to remove card");
    } finally {
      setDeletingId(null);
    }
  };

  // After saving a new card, reload list
  const handleCardSaved = () => {
    setShowAddCard(false);
    setSetupClientSecret(null);
    loadCards();
  };

  // If we have a clientSecret for payment (new card authorize flow)
  if (clientSecret) {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment</p>
        <div className="rounded-2xl bg-card border border-border/20 p-4">
          <Elements
            stripe={getStripe()}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#16a34a", borderRadius: "12px" },
              },
            }}
          >
            <AuthorizeForm onSuccess={onPaymentSuccess} price={price} vehicleName={vehicleName} />
          </Elements>
        </div>
      </div>
    );
  }

  // Add card form
  if (showAddCard && setupClientSecret) {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Add Payment Method</p>
        <div className="rounded-2xl bg-card border border-border/20 p-4">
          <Elements
            stripe={getStripe()}
            options={{
              clientSecret: setupClientSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#16a34a", borderRadius: "12px" },
              },
            }}
          >
            <AddCardForm
              onSuccess={handleCardSaved}
              onCancel={() => { setShowAddCard(false); setSetupClientSecret(null); }}
              setupClientSecret={setupClientSecret}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment</p>

      {/* Saved cards */}
      <div className="rounded-2xl bg-card border border-border/20 overflow-hidden">
        {loadingCards ? (
          <div className="p-4 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {savedCards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/10 last:border-0 transition-all text-left",
                  selectedCardId === card.id
                    ? "bg-primary/5"
                    : "hover:bg-muted/10"
                )}
              >
                {/* Card brand icon */}
                <div className="w-10 h-7 rounded-md bg-muted/30 border border-border/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-foreground uppercase">{card.brand.slice(0, 4)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {BRAND_LABELS[card.brand] || card.brand} ···· {card.last4}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Expires {card.exp_month}/{card.exp_year}
                  </p>
                </div>
                {selectedCardId === card.id ? (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                  className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors shrink-0"
                  disabled={deletingId === card.id}
                >
                  {deletingId === card.id ? (
                    <div className="w-3 h-3 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  )}
                </button>
              </button>
            ))}

            {/* Add new card */}
            <button
              onClick={handleAddCard}
              disabled={addingCard}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/10 transition-all text-left disabled:opacity-50"
            >
              <div className="w-10 h-7 rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
                {addingCard ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm font-semibold text-foreground flex-1">
                {addingCard ? "Setting up..." : "Add new card"}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </>
        )}
      </div>

      {/* Apple Pay / Google Pay note */}
      <div className="rounded-2xl bg-card border border-border/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground flex-1">
            Apple Pay & Google Pay available at checkout if no saved card selected
          </span>
        </div>
      </div>

      {/* Authorize button */}
      <Button
        className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg gap-2"
        onClick={() => {
          if (selectedCardId) {
            onAuthorizeWithSavedCard(selectedCardId);
          } else {
            onAuthorizeWithNewCard();
          }
        }}
        disabled={isSubmitting}
      >
        <Shield className="w-5 h-5" />
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            Authorizing...
          </span>
        ) : (
          `Authorize $${price.toFixed(2)} · ${vehicleName}`
        )}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        Your card will be pre-authorized. Final charge applied after ride completion.
      </p>

      {paymentFailed && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-center">
          <p className="text-sm text-destructive font-medium">Payment setup failed. Please try again.</p>
        </div>
      )}
    </div>
  );
}
