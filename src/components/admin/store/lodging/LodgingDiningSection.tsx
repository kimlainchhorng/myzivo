import { Utensils } from "lucide-react";
import { AddonList, LoadingPanel, NextActions, SectionShell, StatCard, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingDiningSection({ storeId }: { storeId: string }) {
  const { rooms, profile, addons, isLoading } = useLodgingOpsData(storeId);
  const dining = addons.filter((a) => a.category === "Food & drink");
  const mealPlans = profile?.meal_plans || [];
  return (
    <SectionShell title="Dining & Meal Plans" subtitle="Breakfast, board plans, room service, and food packages guests can add to stays." icon={Utensils}>
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Meal plans" value={String(mealPlans.length)} icon={Utensils} /><StatCard label="Dining add-ons" value={String(dining.length)} icon={Utensils} /><StatCard label="Breakfast rooms" value={String(rooms.filter((r) => r.breakfast_included).length)} icon={Utensils} /></div>
        <div className="flex flex-wrap gap-2">{mealPlans.length ? mealPlans.map((plan) => <span key={plan} className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-foreground">{plan}</span>) : <span className="text-sm text-muted-foreground">No meal plans selected yet.</span>}</div>
        <AddonList addons={dining} emptyTitle="No dining add-ons yet" emptyBody="Add breakfast buffet, lunch set menu, dinner set menu, kids meals, floating breakfast, and romantic dinner packages." />
        <NextActions actions={[{ label: "Add dining packages", tab: "lodge-rooms", hint: "Attach meal add-ons to guest rooms." }, { label: "Edit meal plans", tab: "lodge-property", hint: "Set property-level board options." }, { label: "Review amenities", tab: "lodge-amenities", hint: "Keep restaurant, bar, and room-service policies current." }]} />
      </>}
    </SectionShell>
  );
}
