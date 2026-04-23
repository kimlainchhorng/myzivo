import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackagePlus } from "lucide-react";
import { AddonList, EmptyPanel, LoadingPanel, NextActions, SectionShell, StatCard, addonCategories, money, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingAddOnsSection({ storeId }: { storeId: string }) {
  const { rooms, addons, isLoading } = useLodgingOpsData(storeId);
  const active = addons.filter((a) => a.active !== false && !a.disabled);
  return (
    <SectionShell title="Add-ons & Packages" subtitle="Guest-visible extras grouped by hotel workflow, pulled from room add-ons." icon={PackagePlus} actions={<Button size="sm" onClick={() => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab: "lodge-rooms" } }))}>Manage room add-ons</Button>}>
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active add-ons" value={String(active.length)} icon={PackagePlus} />
          <StatCard label="Rooms using add-ons" value={String(new Set(addons.map((a) => a.roomId)).size)} icon={PackagePlus} />
          <StatCard label="Paid add-ons" value={String(active.filter((a) => a.price_cents > 0).length)} icon={PackagePlus} />
          <StatCard label="Free add-ons" value={String(active.filter((a) => !a.price_cents).length)} icon={PackagePlus} />
        </div>
        {active.length === 0 ? <EmptyPanel title="No active add-ons yet" body="Add breakfast, transfers, spa, tours, late check-out, and packages inside each room type." actionLabel="Open Rooms & Rates" tab="lodge-rooms" /> : addonCategories.map((category) => {
          const items = active.filter((a) => a.category === category);
          if (!items.length) return null;
          return <div key={category} className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-foreground">{category}</p><Badge variant="outline">{items.length}</Badge></div><AddonList addons={items} emptyTitle="" emptyBody="" /></div>;
        })}
        <NextActions actions={[{ label: "Open reservations add-on workflow", tab: "lodge-reservations", hint: "Review add-on requests and reservation timeline states." }, { label: "Edit room packages", tab: "lodge-rooms", hint: `Manage add-ons across ${rooms.length} room type${rooms.length === 1 ? "" : "s"}.` }, { label: "Check reports", tab: "lodge-reports", hint: `Track revenue including extras like ${money(active.reduce((sum, a) => sum + (a.price_cents || 0), 0))} catalog value.` }]} />
      </>}
    </SectionShell>
  );
}
