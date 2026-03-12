/**
 * useDeliveryAddress - Manage saved delivery addresses (Home, Work, Custom)
 * Persists to localStorage for quick access across grocery pages.
 */
import { useState, useEffect, useCallback } from "react";

export interface DeliveryAddress {
  id: string;
  label: "Home" | "Work" | "Other";
  address: string;
  /** Optional apt/suite/unit */
  apt?: string;
  /** Optional delivery instructions */
  instructions?: string;
  isDefault: boolean;
}

const STORAGE_KEY = "zivo_delivery_addresses";
const SELECTED_KEY = "zivo_selected_address";

function loadAddresses(): DeliveryAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSelectedId(): string | null {
  try {
    return localStorage.getItem(SELECTED_KEY);
  } catch {
    return null;
  }
}

export function useDeliveryAddress() {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(loadAddresses);
  const [selectedId, setSelectedIdState] = useState<string | null>(loadSelectedId);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (selectedId) localStorage.setItem(SELECTED_KEY, selectedId);
  }, [selectedId]);

  const selectedAddress = addresses.find((a) => a.id === selectedId) 
    ?? addresses.find((a) => a.isDefault)
    ?? addresses[0] 
    ?? null;

  const addAddress = useCallback((addr: Omit<DeliveryAddress, "id">) => {
    const id = crypto.randomUUID().slice(0, 8);
    setAddresses((prev) => {
      const updated = addr.isDefault
        ? prev.map((a) => ({ ...a, isDefault: false }))
        : prev;
      return [...updated, { ...addr, id }];
    });
    setSelectedIdState(id);
    return id;
  }, []);

  const updateAddress = useCallback((id: string, updates: Partial<DeliveryAddress>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) return { ...a, ...updates };
        if (updates.isDefault && a.id !== id) return { ...a, isDefault: false };
        return a;
      })
    );
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedIdState(null);
  }, [selectedId]);

  const selectAddress = useCallback((id: string) => {
    setSelectedIdState(id);
  }, []);

  return {
    addresses,
    selectedAddress,
    selectedId,
    addAddress,
    updateAddress,
    removeAddress,
    selectAddress,
  };
}
