import { Button } from "@/components/ui/button";
import { BedDouble, CheckCircle2, Hotel, KeyRound, ListChecks, PackagePlus } from "lucide-react";
import { AddonList, LoadingPanel, NextActions, OpsSnapshot, SectionShell, StatCard, useLodgingOpsData } from "./LodgingOperationsShared";
import LodgingSetupChecklist from "./LodgingSetupChecklist";
import LodgingQuickJump from "./LodgingQuickJump";
import LodgingSectionStatusBanner from "./LodgingSectionStatusBanner";
import RevenuePulseCard from "./RevenuePulseCard";
import LodgingReviewsSummaryCard from "./LodgingReviewsSummaryCard";
import StorefrontPreviewCard from "./StorefrontPreviewCard";
import { useLodgeHousekeeping } from "@/hooks/lodging/useLodgeHousekeeping";
import { getLodgingCompletion } from "@/lib/lodging/lodgingCompletion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const goTab = (tab: string) => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab } }));

export default function LodgingOverviewSection({ storeId }: { storeId: string }) {
  const { rooms, profile, addons, reservations, isLoading } = useLodgingOpsData(storeId);
  const { data: housekeeping = [] } = useLodgeHousekeeping(storeId);
  const { data: phase5Signals } = useQuery({
    queryKey: ["lodging-phase5-signals", storeId],
    enabled: Boolean(storeId),
    queryFn: async () => {
      const counts = async (table: string, filters: Record<string, any> = {}) => {
        let q: any = (supabase as any).from(table).select("id", { count: "exact", head: true }).eq("store_id", storeId);
        for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
        const { count } = await q;
        return count || 0;
      };
      const reviewsAwaitingReply = await (async () => {
        const { count } = await (supabase as any).from("lodging_reviews").select("id", { count: "exact", head: true }).eq("store_id", storeId).is("reply", null);
        return count || 0;
      })().catch(() => 0);
      const [mealPlansCount, staffCount, channelConnectionsCount, promotionsCount] = await Promise.all([
        counts("lodging_meal_plans"),
        counts("store_employees"),
        counts("lodging_channel_connections"),
        counts("lodging_promotions"),
      ]);
      return { mealPlansCount, staffCount, channelConnectionsCount, promotionsCount, reviewsAwaitingReply };
    },
  });
  const activeReservations = reservations.filter((r) => !["cancelled", "checked_out", "no_show"].includes(r.status)).length;
  const activeAddons = addons.filter((a) => a.active !== false && !a.disabled).length;
  const policiesReady = Boolean(profile?.check_in_from || profile?.check_out_until || profile?.cancellation_policy || profile?.house_rules);
  const guestServicesReady = activeAddons > 0 || Boolean(profile?.facilities?.length || profile?.meal_plans?.length);
  const completion = getLodgingCompletion({
    rooms, profile, addons,
    housekeepingCount: housekeeping.length,
    maintenanceReady: true,
    reservationsCount: reservations.length,
    reportsReady: reservations.length > 0 || rooms.length > 0,
    ...(phase5Signals || {}),
  });
  const setupItems = completion.items;
  const hasRates = rooms.some((r) => (r.base_rate_cents || 0) > 0 && (r.units_total || 0) > 0);
  const nextAction = completion.nextBestAction;
  const setupMessage = rooms.length === 0
    ? "Hotel admin is installed. Add your first room to start."
    : !hasRates
      ? "Rooms added. Add base rates next."
      : activeAddons === 0
        ? "Rates ready. Add guest services next."
        : "Hotel admin is active and guest-ready workflows are enabled.";

  return (
    <SectionShell title="Hotel Overview" subtitle="A quick operating snapshot for rooms, stays, add-ons, and guest-ready setup." icon={Hotel} actions={<div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => window.location.assign("/admin/lodging/qa-checklist")}><ListChecks className="mr-1.5 h-4 w-4" /> QA Checklist</Button><Button size="sm" onClick={() => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab: "lodge-addons" } }))}><PackagePlus className="mr-1.5 h-4 w-4" /> Add-ons</Button></div>}>
      <LodgingQuickJump active="lodge-overview" />
      <LodgingSectionStatusBanner title="Hotel Overview" icon={Hotel} countLabel={`Rooms · Active stays`} countValue={`${rooms.length} · ${activeReservations}`} fixLabel="Open Reservations" fixTab="lodge-reservations" />
      {isLoading ? <LoadingPanel /> : <>
        <div className="rounded-lg border border-primary/20 bg-primary/8 p-4">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-primary/12 p-2 text-primary"><CheckCircle2 className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Hotel / Resort Admin Installed</p>
              <p className="mt-1 text-xs text-muted-foreground">{setupMessage}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Admin sections enabled", "Deep links enabled", "Setup checklist enabled", "Rate plans enabled", "Guest requests enabled", "Folio & charges enabled"].map((label) => <span key={label} className="rounded-full bg-background px-2.5 py-1 text-[10px] font-medium text-primary ring-1 ring-primary/15">{label}</span>)}
              </div>
              <div className="mt-3 rounded-lg border border-primary/25 bg-background p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Next best action: {nextAction.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{nextAction.hint}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="h-8" onClick={() => goTab(nextAction.tab)}>{nextAction.actionLabel}</Button>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => window.location.assign("/admin/lodging/qa-checklist")}>Review QA</Button>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <Button size="sm" variant="outline" onClick={() => goTab("lodge-overview")}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Checklist</Button>
                <Button size="sm" variant="outline" onClick={() => goTab("lodge-rooms")}><BedDouble className="mr-1.5 h-3.5 w-3.5" /> Rooms</Button>
                <Button size="sm" variant="outline" onClick={() => goTab("lodge-addons")}><PackagePlus className="mr-1.5 h-3.5 w-3.5" /> Add-ons</Button>
                <Button size="sm" variant="outline" onClick={() => goTab("lodge-frontdesk")}><KeyRound className="mr-1.5 h-3.5 w-3.5" /> Front desk</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2"><RevenuePulseCard storeId={storeId} /></div>
          <LodgingReviewsSummaryCard storeId={storeId} />
        </div>
        <LodgingSetupChecklist items={setupItems} wizard />
        <OpsSnapshot rooms={rooms} addons={addons} reservations={reservations} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Rooms configured" value={String(rooms.length)} icon={Hotel} />
          <StatCard label="Active reservations" value={String(activeReservations)} icon={Hotel} />
          <StatCard label="Active add-ons" value={String(activeAddons)} icon={PackagePlus} />
          <StatCard label="Property profile" value={profile ? "Ready" : "Missing"} icon={Hotel} />
          <StatCard label="Policies status" value={policiesReady ? "Ready" : "Needs setup"} icon={Hotel} />
          <StatCard label="Guest services" value={guestServicesReady ? "Ready" : "Needs setup"} icon={PackagePlus} />
        </div>
        <AddonList addons={addons.filter((a) => a.active !== false && !a.disabled)} emptyTitle="No guest add-ons configured yet" emptyBody="Create room add-ons such as transfers, meal plans, spa services, and celebration packages from Rooms & Rates." />
        <NextActions actions={[{ label: "Review today’s stays", tab: "lodge-frontdesk", hint: "Open arrivals, in-house guests, and departures." }, { label: "Manage rate plans", tab: "lodge-rate-plans", hint: "Check pricing, restrictions, and inventory readiness." }, { label: "Complete property profile", tab: "lodge-property", hint: "Set check-in, policies, facilities, and contact details." }]} />
      </>}
    </SectionShell>
  );
}
