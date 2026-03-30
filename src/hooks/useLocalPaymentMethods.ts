import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const STORAGE_KEY = "zivo_local_payment_methods";

export interface LocalPaymentMethod {
  id: string;
  type: "card";
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt: number;
  stripeId?: string; // If sourced from DB
}

export type CardInput = Omit<LocalPaymentMethod, "id" | "createdAt" | "isDefault">;

/**
 * Detect card brand from card number
 */
export function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (cleaned.startsWith("4")) return "Visa";
  if (cleaned.startsWith("5")) return "Mastercard";
  if (cleaned.startsWith("34") || cleaned.startsWith("37")) return "Amex";
  if (cleaned.startsWith("6")) return "Discover";
  return "Card";
}

export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  const parts = cleaned.match(/.{1,4}/g);
  return parts ? parts.join(" ") : cleaned;
}

export function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
}

export function parseExpiry(expiry: string): { month: number; year: number } | null {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export function validateExpiry(expiry: string): boolean {
  const parsed = parseExpiry(expiry);
  if (!parsed) return false;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  if (parsed.year > currentYear) return true;
  if (parsed.year === currentYear && parsed.month >= currentMonth) return true;
  return false;
}

export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Payment methods hook — reads from zivo_payment_methods table (Supabase)
 * Falls back to localStorage for offline/unauthenticated use
 */
export function useLocalPaymentMethods() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch saved cards from DB
  const { data: dbMethods = [], isLoading } = useQuery({
    queryKey: ["zivo-payment-methods", user?.id],
    queryFn: async (): Promise<LocalPaymentMethod[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("zivo_payment_methods")
        .select("id, brand, last_four, exp_month, exp_year, is_default, type, stripe_payment_method_id, nickname, created_at")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[PaymentMethods] Fetch error:", error);
        return [];
      }
      return (data || []).map(pm => ({
        id: pm.id,
        type: "card" as const,
        brand: pm.brand || "Card",
        last4: pm.last_four || "****",
        expMonth: pm.exp_month || 0,
        expYear: pm.exp_year || 0,
        cardholderName: pm.nickname || "",
        isDefault: pm.is_default || false,
        createdAt: new Date(pm.created_at).getTime(),
        stripeId: pm.stripe_payment_method_id,
      }));
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  // Fallback to localStorage for unauthenticated users
  const [localMethods, setLocalMethods] = useState<LocalPaymentMethod[]>(() => {
    if (user) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!user) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(localMethods)); } catch {}
    }
  }, [localMethods, user]);

  const methods = user ? dbMethods : localMethods;

  const deleteCard = useCallback(async (id: string) => {
    if (user) {
      const { error } = await supabase.from("zivo_payment_methods").delete().eq("id", id).eq("user_id", user.id);
      if (error) {
        toast.error("Failed to remove card");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["zivo-payment-methods"] });
      toast.success("Card removed");
    } else {
      setLocalMethods(prev => {
        const updated = prev.filter(m => m.id !== id);
        if (!updated.some(m => m.isDefault) && updated.length > 0) updated[0].isDefault = true;
        return updated;
      });
    }
  }, [user, queryClient]);

  const setDefault = useCallback(async (id: string) => {
    if (user) {
      // Unset all defaults, then set the new one
      await supabase.from("zivo_payment_methods").update({ is_default: false }).eq("user_id", user.id);
      await supabase.from("zivo_payment_methods").update({ is_default: true }).eq("id", id);
      queryClient.invalidateQueries({ queryKey: ["zivo-payment-methods"] });
    } else {
      setLocalMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    }
  }, [user, queryClient]);

  const addCard = useCallback((card: CardInput) => {
    // For DB-backed cards, they're added via Stripe SetupIntent flow, not here
    // This is for local/demo cards only
    const newCard: LocalPaymentMethod = {
      ...card,
      id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      isDefault: localMethods.length === 0,
    };
    setLocalMethods(prev => [...prev, newCard]);
    return newCard;
  }, [localMethods]);

  const getDefault = useCallback(() => {
    return methods.find(m => m.isDefault) || methods[0] || null;
  }, [methods]);

  return {
    methods,
    addCard,
    deleteCard,
    setDefault,
    getDefault,
    isEmpty: methods.length === 0,
    isLoading,
  };
}
