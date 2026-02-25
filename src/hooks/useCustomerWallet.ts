/** Customer wallet stub */
export interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
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
