import { HeartPulse } from "lucide-react";
import { AddonList, LoadingPanel, NextActions, SectionShell, StatCard, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingWellnessSection({ storeId }: { storeId: string }) {
  const { profile, addons, isLoading } = useLodgingOpsData(storeId);
  const wellness = addons.filter((a) => a.category === "Wellness");
  const facilities = profile?.facilities || [];
  return (
    <SectionShell title="Spa & Wellness" subtitle="Massage, spa, yoga, gym, sauna, pool, and wellness services for resort guests." icon={HeartPulse}>
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Wellness add-ons" value={String(wellness.length)} icon={HeartPulse} /><StatCard label="Wellness facilities" value={String(facilities.filter((f) => /spa|sauna|pool|gym|massage|hot tub|steam/i.test(f)).length)} icon={HeartPulse} /><StatCard label="Guest-visible" value={String(wellness.filter((a) => a.active !== false && !a.disabled).length)} icon={HeartPulse} /></div>
        <AddonList addons={wellness} emptyTitle="No wellness add-ons yet" emptyBody="Add spa massage, couples massage, yoga sessions, sauna access, or wellness packages to room add-ons." />
        <NextActions actions={[{ label: "Add spa packages", tab: "lodge-rooms", hint: "Create wellness add-ons guests can request." }, { label: "Update facilities", tab: "lodge-property", hint: "Mark spa, pool, gym, and sauna facilities." }, { label: "Review service requests", tab: "lodge-reservations", hint: "Track wellness add-ons in reservation workflows." }]} />
      </>}
    </SectionShell>
  );
}
