import { LODGING_TAB_IDS, type LodgingTabId } from "@/lib/admin/storeTabRouting";

export type LodgingSidebarAuditItem = {
  tab: LodgingTabId;
  label: string;
  emptyTitle: string;
  emptyBody: string;
  fixButtonLabel: string;
  fixTab: LodgingTabId;
};

const make = (tab: LodgingTabId, label: string, emptyTitle: string, fixButtonLabel: string, fixTab: LodgingTabId = tab): LodgingSidebarAuditItem => ({
  tab,
  label,
  emptyTitle,
  emptyBody: `${label} is available and shows a setup path when no live data exists.`,
  fixButtonLabel,
  fixTab,
});

export const LODGING_EMPTY_STATE_AUDIT: LodgingSidebarAuditItem[] = [
  make("lodge-overview", "Hotel Operations", "Hotel setup is ready to continue", "Continue setup"),
  make("lodge-rooms", "Rooms & Rates", "No room types configured yet", "Add first room"),
  make("lodge-rate-plans", "Rate Plans & Availability", "No rooms to price yet", "Open Rooms & Rates", "lodge-rooms"),
  make("lodge-reservations", "Reservations", "No reservations yet", "Open Front Desk", "lodge-frontdesk"),
  make("lodge-calendar", "Calendar & Availability", "No active room inventory yet", "Set inventory", "lodge-rooms"),
  make("lodge-guests", "Guests", "No guest records yet", "Open Reservations", "lodge-reservations"),
  make("lodge-frontdesk", "Front Desk", "No arrivals or in-house guests yet", "Review reservations", "lodge-reservations"),
  make("lodge-housekeeping", "Housekeeping", "No housekeeping rooms yet", "Set room inventory", "lodge-rooms"),
  make("lodge-maintenance", "Maintenance", "No maintenance tickets yet", "Open rooms", "lodge-rooms"),
  make("lodge-addons", "Add-ons & Packages", "Guest service catalog is ready to fill", "Add room add-ons", "lodge-rooms"),
  make("lodge-guest-requests", "Guest Requests", "No guest requests yet", "Open Reservations", "lodge-reservations"),
  make("lodge-dining", "Dining & Meal Plans", "No dining add-ons configured yet", "Add meal plans", "lodge-rooms"),
  make("lodge-experiences", "Experiences & Tours", "No experiences configured yet", "Add experiences", "lodge-rooms"),
  make("lodge-transport", "Transport & Transfers", "No transport add-ons configured yet", "Add transfers", "lodge-rooms"),
  make("lodge-wellness", "Spa & Wellness", "No wellness services configured yet", "Add wellness services", "lodge-rooms"),
  make("lodge-amenities", "Amenities & Policies", "Amenities need property details", "Complete profile", "lodge-property"),
  make("lodge-property", "Property Profile", "Property profile needs details", "Complete property profile"),
  make("lodge-policies", "Policies & Rules", "Policies and rules need setup", "Add policies"),
  make("lodge-reviews", "Reviews & Guest Feedback", "No guest feedback yet", "Open guest requests", "lodge-guest-requests"),
  make("lodge-reports", "Reports", "No report data yet", "Add rooms", "lodge-rooms"),
];

export function auditLodgingSidebarTabs() {
  const registered = new Set(LODGING_TAB_IDS);
  return LODGING_EMPTY_STATE_AUDIT.map((item) => ({
    ...item,
    registered: registered.has(item.tab),
    hasMeaningfulEmptyState: Boolean(item.emptyTitle && item.emptyBody && item.fixButtonLabel && item.fixTab),
    passes: registered.has(item.tab) && Boolean(item.emptyTitle && item.emptyBody && item.fixButtonLabel && item.fixTab),
  }));
}