/** Order details stub */
export function useOrderDetails(_orderId?: string) {
  return {
    order: null,
    data: null,
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}
