import { useState, useEffect, useCallback } from "react";

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

/**
 * Format card number with spaces (XXXX XXXX XXXX XXXX)
 */
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  const parts = cleaned.match(/.{1,4}/g);
  return parts ? parts.join(" ") : cleaned;
}

/**
 * Format expiry date (MM/YY)
 */
export function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
}

/**
 * Parse expiry string to month and year
 */
export function parseExpiry(expiry: string): { month: number; year: number } | null {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

/**
 * Validate card number (basic Luhn check)
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  // Luhn algorithm
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

/**
 * Validate expiry is in the future
 */
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

/**
 * Validate CVV (3-4 digits)
 */
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Mock payment methods hook using localStorage
 */
export function useLocalPaymentMethods() {
  const [methods, setMethods] = useState<LocalPaymentMethod[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever methods change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
    } catch (error) {
      console.error("[useLocalPaymentMethods] Failed to persist:", error);
    }
  }, [methods]);

  const addCard = useCallback((card: CardInput) => {
    const newCard: LocalPaymentMethod = {
      ...card,
      id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      isDefault: false,
    };

    setMethods((prev) => {
      // If this is the first card, make it default
      if (prev.length === 0) {
        newCard.isDefault = true;
      }
      return [...prev, newCard];
    });

    return newCard;
  }, []);

  const deleteCard = useCallback((id: string) => {
    setMethods((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      // If we deleted the default card, make the first remaining card default
      const hasDefault = updated.some((m) => m.isDefault);
      if (!hasDefault && updated.length > 0) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  }, []);

  const setDefault = useCallback((id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  }, []);

  const getDefault = useCallback(() => {
    return methods.find((m) => m.isDefault) || methods[0] || null;
  }, [methods]);

  return {
    methods,
    addCard,
    deleteCard,
    setDefault,
    getDefault,
    isEmpty: methods.length === 0,
  };
}
