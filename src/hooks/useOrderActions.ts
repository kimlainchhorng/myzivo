/** Order actions stub */
export function useOrderActions() {
  return {
    cancelOrder: async (_orderId: string) => {},
    isCancelling: false,
    resendConfirmation: async (_orderId: string) => {},
    isResending: false,
  };
}
