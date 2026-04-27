export const LODGING_TAB_IDS = ["lodge-overview", "lodge-rooms", "lodge-rate-plans", "lodge-reservations", "lodge-calendar", "lodge-guests", "lodge-frontdesk", "lodge-housekeeping", "lodge-maintenance", "lodge-addons", "lodge-guest-requests", "lodge-dining", "lodge-experiences", "lodge-transport", "lodge-wellness", "lodge-amenities", "lodge-property", "lodge-policies", "lodge-reviews", "lodge-reports", "lodge-promos", "lodge-channels", "lodge-payouts", "lodge-inbox", "lodge-staff", "lodge-concierge", "lodge-lostfound", "lodge-gallery"] as const;
export const BASE_TAB_IDS = ["profile", "orders", "products", "payment", "settings", "customers", "marketing", "livestream", "software", "employees", "payroll", "employee-schedule", "time-clock", "attendance", "training", "documents", "employee-rules", "customer-bookings"] as const;

export type LodgingTabId = typeof LODGING_TAB_IDS[number];
export type BaseTabId = typeof BASE_TAB_IDS[number];

export const isLodgingTab = (tab?: string | null): tab is LodgingTabId => Boolean(tab && (LODGING_TAB_IDS as readonly string[]).includes(tab));
export const isBaseStoreTab = (tab?: string | null): tab is BaseTabId => Boolean(tab && (BASE_TAB_IDS as readonly string[]).includes(tab));
export const isKnownStoreTab = (tab?: string | null) => isLodgingTab(tab) || isBaseStoreTab(tab);

export function getTabFromSearch(search: string | URLSearchParams | null | undefined) {
  if (!search) return null;
  const params = typeof search === "string" ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search) : search;
  return params.get("tab");
}

export function resolveStoreTab(requestedTab: string | null | undefined, isLodgingStore: boolean) {
  if (!requestedTab) return isLodgingStore ? "lodge-overview" : "profile";
  if (isLodgingTab(requestedTab)) return isLodgingStore ? requestedTab : "profile";
  if (isBaseStoreTab(requestedTab)) return requestedTab;
  return isLodgingStore ? "lodge-overview" : "profile";
}

export function resolveStoreTabFromSearch(search: string | URLSearchParams | null | undefined, isLodgingStore: boolean) {
  return resolveStoreTab(getTabFromSearch(search), isLodgingStore);
}

export function buildStoreTabUrl(storeId: string, tab: string) {
  return `/admin/stores/${encodeURIComponent(storeId)}?tab=${encodeURIComponent(tab)}`;
}
