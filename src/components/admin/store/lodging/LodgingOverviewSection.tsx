import { Button } from "@/components/ui/button";
import { Hotel, PackagePlus } from "lucide-react";
import { AddonList, LoadingPanel, NextActions, OpsSnapshot, SectionShell, StatCard, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingOverviewSection({ storeId }: { storeId: string }) {
  const { rooms, profile, addons, reservations, isLoading } = useLodgingOpsData(storeId);
  const activeReservations = reservations.filter((r) => !["cancelled", "checked_out", "no_show"].includes(r.status)).length;
  const activeAddons = addons.filter((a) => a.active !== false && !a.disabled).length;
  const policiesReady = Boolean(profile?.check_in_from || profile?.check_out_until || profile?.cancellation_policy || profile?.house_rules);
  const guestServicesReady = activeAddons > 0 || Boolean(profile?.facilities?.length || profile?.meal_plans?.length);
  return (
    <SectionShell title="Hotel Overview" subtitle="A quick operating snapshot for rooms, stays, add-ons, and guest-ready setup." icon={Hotel} actions={<Button size="sm" onClick={() => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab: "lodge-addons" } }))}><PackagePlus className="mr-1.5 h-4 w-4" /> Add-ons</Button>}>
      {isLoading ? <LoadingPanel /> : <><OpsSnapshot rooms={rooms} addons={addons} reservations={reservations} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><StatCard label="Rooms configured" value={String(rooms.length)} icon={Hotel} /><StatCard label="Active reservations" value={String(activeReservations)} icon={Hotel} /><StatCard label="Active add-ons" value={String(activeAddons)} icon={PackagePlus} /><StatCard label="Property profile" value={profile ? "Ready" : "Missing"} icon={Hotel} /><StatCard label="Policies status" value={policiesReady ? "Ready" : "Needs setup"} icon={Hotel} /><StatCard label="Guest services" value={guestServicesReady ? "Ready" : "Needs setup"} icon={PackagePlus} /></div><AddonList addons={addons.filter((a) => a.active !== false && !a.disabled)} emptyTitle="No guest add-ons configured yet" emptyBody="Create room add-ons such as transfers, meal plans, spa services, and celebration packages from Rooms & Rates." /><NextActions actions={[{ label: "Review today’s stays", tab: "lodge-reservations", hint: "Open reservations and front-desk workflows." }, { label: "Complete property profile", tab: "lodge-property", hint: "Set check-in, policies, facilities, and contact details." }, { label: "Manage rooms and rates", tab: "lodge-rooms", hint: "Update inventory, pricing, photos, and add-ons." }]} /></>}
    </SectionShell>
  );
}
