/** Car inventory stub */
export function useCarInventory() {
  return {
    vehicles: [],
    results: [],
    isLoading: false,
    error: null,
    filters: {} as any,
    setFilters: () => {},
    updateFilter: (_key: string, _value: any) => {},
    resetFilters: () => {},
    totalCount: 0,
    makes: [],
    models: [],
    years: [],
    loadingMakes: false,
    loadingModels: false,
    loadingYears: false,
    loadingResults: false,
    searchVehicles: () => {},
    hasSearched: false,
  };
}
