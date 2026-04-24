import { Car } from "lucide-react";
import { AddonList, LoadingPanel, NextActions, SectionShell, StatCard, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingTransportSection({ storeId }: { storeId: string }) {
  const { profile, addons, isLoading } = useLodgingOpsData(storeId);
  const transport = addons.filter((a) => a.category === "Transport");
  const facilities = profile?.facilities || [];
  return (
    <SectionShell title="Transport & Transfers" subtitle="Airport, ferry, boat, scooter, car rental, parking, and arrival logistics." icon={Car}>
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Transfer add-ons" value={String(transport.length)} icon={Car} /><StatCard label="Transport facilities" value={String(facilities.filter((f) => /shuttle|parking|rental|bicycle|valet/i.test(f)).length)} icon={Car} /><StatCard label="Parking ready" value={facilities.some((f) => /parking/i.test(f)) ? "Yes" : "No"} icon={Car} /></div>
        <AddonList addons={transport} emptyTitle="Transport catalog is ready to fill" emptyBody="Add airport pickup, airport drop-off, ferry transfer, private boat transfer, scooter rental, car rental, and parking services." />
        <NextActions actions={[{ label: "Add transfer services", tab: "lodge-rooms", hint: "Attach transfer prices to rooms." }, { label: "Update property facilities", tab: "lodge-property", hint: "Mark shuttle, parking, and rental services." }, { label: "Open front desk", tab: "lodge-frontdesk", hint: "Coordinate arrivals and room keys." }]} />
      </>}
    </SectionShell>
  );
}
