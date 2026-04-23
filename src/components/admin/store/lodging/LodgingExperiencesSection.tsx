import { Palmtree } from "lucide-react";
import { AddonList, LoadingPanel, NextActions, SectionShell, StatCard, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingExperiencesSection({ storeId }: { storeId: string }) {
  const { profile, addons, isLoading } = useLodgingOpsData(storeId);
  const experiences = addons.filter((a) => a.category === "Experiences" || ["snorkeling", "island", "cruise", "fishing"].includes(a.icon || ""));
  return (
    <SectionShell title="Experiences & Tours" subtitle="Resort activities, tours, cruises, and destination experiences tied to reservations." icon={Palmtree}>
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Tour add-ons" value={String(experiences.length)} icon={Palmtree} /><StatCard label="Nearby places" value={String(profile?.nearby?.length || 0)} icon={Palmtree} /><StatCard label="Hero badges" value={String(profile?.hero_badges?.length || 0)} icon={Palmtree} /></div>
        <AddonList addons={experiences} emptyTitle="No experiences configured" emptyBody="Add snorkeling tours, island hopping, fishing trips, sunset cruises, and private destination packages." />
        <NextActions actions={[{ label: "Add tour add-ons", tab: "lodge-rooms", hint: "Create guest-bookable experiences." }, { label: "Update nearby attractions", tab: "lodge-property", hint: "Show nearby beaches, marinas, and landmarks." }, { label: "Check guest requests", tab: "lodge-reservations", hint: "Review experience add-on requests." }]} />
      </>}
    </SectionShell>
  );
}
