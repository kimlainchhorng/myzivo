/** P2P booking stub */
export function useP2PVehicleCount() {
  return { count: 0, isLoading: false };
}

export interface P2PSearchFilters {
  [key: string]: any;
}

export interface P2PVehicleWithOwner {
  id: string;
  [key: string]: any;
}

export function useP2PVehicleSearch(_filters?: P2PSearchFilters) {
  return { vehicles: [], data: [], isLoading: false, error: null, isError: false };
}

export function useP2PVehicleDetail(_id?: string) {
  return { vehicle: null, data: null, isLoading: false };
}

export function useBookingPricing(..._args: any[]) {
  return { pricing: null, data: null, isLoading: false };
}

export function useVehicleReviews(_vehicleId?: string) {
  return { reviews: [], data: null, isLoading: false };
}
