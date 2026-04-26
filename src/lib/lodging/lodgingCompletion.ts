import type { LodgeRoom } from "@/hooks/lodging/useLodgeRooms";
import type { LodgePropertyProfile } from "@/hooks/lodging/useLodgePropertyProfile";

export type LodgingCompletionTab =
  | "lodge-overview" | "lodge-rooms" | "lodge-rate-plans" | "lodge-calendar" | "lodge-property"
  | "lodge-policies" | "lodge-addons" | "lodge-housekeeping" | "lodge-maintenance"
  | "lodge-reservations" | "lodge-guest-requests" | "lodge-frontdesk" | "lodge-reports"
  | "lodge-dining" | "lodge-staff" | "lodge-channels" | "lodge-promos" | "lodge-reviews";

export type LodgingCompletionItem = {
  key: string;
  label: string;
  tab: LodgingCompletionTab;
  ready: boolean;
  hint: string;
  actionLabel: string;
};

export type LodgingCompletionInput = {
  rooms: LodgeRoom[];
  profile: LodgePropertyProfile | null | undefined;
  addons: { active?: boolean; disabled?: boolean }[];
  housekeepingCount?: number;
  maintenanceReady?: boolean;
  reservationsCount?: number;
  guestRequestsCount?: number;
  reportsReady?: boolean;
};

export function getLodgingCompletion(input: LodgingCompletionInput) {
  const { rooms, profile, addons, housekeepingCount = 0, maintenanceReady = false, reservationsCount = 0, guestRequestsCount = 0 } = input;
  const activeRooms = rooms.filter((r) => r.is_active);
  const hasRooms = rooms.length > 0;
  const hasInventory = activeRooms.some((r) => (r.units_total || 0) > 0);
  const hasRates = activeRooms.some((r) => (r.base_rate_cents || 0) > 0 && (r.units_total || 0) > 0);
  const hasAvailability = activeRooms.some((r) => (r.min_stay || 1) >= 1 && (r.units_total || 0) > 0);
  const hasTimes = Boolean(profile?.check_in_from || profile?.check_out_until || rooms.some((r) => r.check_in_time || r.check_out_time));
  const hasProfile = Boolean(profile && ((profile.facilities?.length || 0) > 0 || (profile.languages?.length || 0) > 0 || (profile.contact && Object.keys(profile.contact).length > 0) || hasTimes));
  const hasPolicies = Boolean(profile?.cancellation_policy || Object.keys(profile?.house_rules || {}).length || rooms.some((r) => r.cancellation_policy));
  const activeAddons = addons.filter((a) => a.active !== false && !a.disabled).length;
  const hasReservations = reservationsCount > 0;
  const reportsReady = input.reportsReady ?? (hasReservations || hasRooms);

  const items: LodgingCompletionItem[] = [
    { key: "rooms", label: "Rooms created", tab: "lodge-rooms", ready: hasRooms, hint: "Create at least one sellable room type.", actionLabel: "Add rooms" },
    { key: "inventory", label: "Active room inventory", tab: "lodge-rooms", ready: hasInventory, hint: "Set active rooms and available unit counts.", actionLabel: "Set inventory" },
    { key: "rates", label: "Base rates", tab: "lodge-rate-plans", ready: hasRates, hint: "Add base rates to active rooms with units.", actionLabel: "Add rates" },
    { key: "availability", label: "Availability rules", tab: "lodge-calendar", ready: hasAvailability, hint: "Confirm stay rules and calendar availability.", actionLabel: "Open calendar" },
    { key: "times", label: "Check-in/check-out", tab: "lodge-property", ready: hasTimes, hint: "Set guest arrival and departure windows.", actionLabel: "Set times" },
    { key: "profile", label: "Property profile", tab: "lodge-property", ready: hasProfile, hint: "Complete facilities, contacts, languages, and highlights.", actionLabel: "Complete profile" },
    { key: "policies", label: "Policies & rules", tab: "lodge-policies", ready: hasPolicies, hint: "Add cancellation policy and house rules.", actionLabel: "Add policies" },
    { key: "addons", label: "Add-ons & packages", tab: "lodge-addons", ready: activeAddons > 0, hint: "Create guest extras, transfers, meals, tours, or services.", actionLabel: "Add services" },
    { key: "housekeeping", label: "Housekeeping board", tab: "lodge-housekeeping", ready: housekeepingCount > 0, hint: "Populate room status tracking for operations.", actionLabel: "Open housekeeping" },
    { key: "reports", label: "Reports readiness", tab: "lodge-reports", ready: reportsReady, hint: "Revenue and occupancy reports can run after rooms or reservations exist.", actionLabel: "Open reports" },
  ];

  const complete = items.filter((item) => item.ready).length;
  const incomplete = items.filter((item) => !item.ready);
  const nextBestAction = !hasRooms
    ? items[0]
    : !hasRates || !hasInventory
      ? items[2]
      : !hasProfile
        ? items[5]
        : activeAddons === 0
          ? items[7]
          : guestRequestsCount === 0 && !hasReservations
            ? { key: "guest-requests", label: "Guest Requests", tab: "lodge-guest-requests" as const, ready: false, hint: "Open the request workspace and reservation follow-up queue.", actionLabel: "Open guest requests" }
            : { key: "frontdesk", label: "Front Desk", tab: "lodge-frontdesk" as const, ready: true, hint: "Run arrivals, in-house guests, departures, folios, and service follow-up.", actionLabel: "Open front desk" };

  return {
    items,
    complete,
    total: items.length,
    percent: items.length ? Math.round((complete / items.length) * 100) : 0,
    readyItems: items.filter((item) => item.ready),
    incompleteItems: incomplete,
    nextBestAction,
    status: incomplete.length === 0 ? "Complete" : hasRooms && hasRates ? "Needs setup data" : "Needs attention",
  };
}
