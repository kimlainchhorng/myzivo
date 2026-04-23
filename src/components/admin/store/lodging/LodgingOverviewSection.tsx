import { Button } from "@/components/ui/button";
import { Hotel, PackagePlus } from "lucide-react";
import { AddonList, LoadingPanel, NextActions, OpsSnapshot, SectionShell, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingOverviewSection({ storeId }: { storeId: string }) {
  const { rooms, addons, reservations, isLoading } = useLodgingOpsData(storeId);
  return (
    <SectionShell title="Hotel Overview" subtitle="A quick operating snapshot for rooms, stays, add-ons, and guest-ready setup." icon={Hotel} actions={<Button size="sm" onClick={() => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab: "lodge-addons" } }))}><PackagePlus className="mr-1.5 h-4 w-4" /> Add-ons</Button>}>
      {isLoading ? <LoadingPanel /> : <><OpsSnapshot rooms={rooms} addons={addons} reservations={reservations} /><AddonList addons={addons.filter((a) => a.active !== false && !a.disabled)} emptyTitle="No guest add-ons configured yet" emptyBody="Create room add-ons such as transfers, meal plans, spa services, and celebration packages from Rooms & Rates." /><NextActions actions={[{ label: "Review today’s stays", tab: "lodge-reservations", hint: "Open reservations and front-desk workflows." }, { label: "Complete property profile", tab: "lodge-property", hint: "Set check-in, policies, facilities, and contact details." }, { label: "Manage rooms and rates", tab: "lodge-rooms", hint: "Update inventory, pricing, photos, and add-ons." }]} /></>}
    </SectionShell>
  );
}
