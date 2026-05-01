import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "zivo_saved_accounts";
const MAX_ACCOUNTS = 5;

export interface SavedAccount {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  lastLoginAt: string;
  role: string | null;
}

function read(): SavedAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedAccount[]) : [];
  } catch {
    return [];
  }
}

function write(accounts: SavedAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {}
}

export function saveAccount(account: SavedAccount) {
  const existing = read().filter((a) => a.email !== account.email);
  const updated = [account, ...existing].slice(0, MAX_ACCOUNTS);
  write(updated);
}

export function removeAccount(email: string) {
  write(read().filter((a) => a.email !== email));
}

export function useSavedAccounts() {
  const [accounts, setAccounts] = useState<SavedAccount[]>(() => read());

  const refresh = useCallback(() => setAccounts(read()), []);

  useEffect(() => {
    // Sync across tabs
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const remove = useCallback((email: string) => {
    removeAccount(email);
    refresh();
  }, [refresh]);

  return { accounts, remove, refresh };
}
