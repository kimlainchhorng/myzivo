/** Customer wallet stub */
export interface WalletTransaction {
  id: string;
  amount: number;
  amount_cents: number;
  type: string;
  description?: string;
  created_at: string;
  createdAt: string;
}

export function useCustomerWallet() {
  return {
    balance: 0,
    balanceDollars: 0,
    lifetimeEarnedDollars: 0,
    wallet: null,
    transactions: [] as WalletTransaction[],
    isLoading: false,
    error: null,
  };
}
