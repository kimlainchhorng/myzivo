import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import type { LodgeRoom } from "@/hooks/lodging/useLodgeRooms";
import type { LodgePropertyProfile } from "@/hooks/lodging/useLodgePropertyProfile";

const goTab = (tab: string) => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab } }));

export type LodgingSetupItem = { label: string; tab: string; ready: boolean; hint: string };

export function getLodgingSetupItems({ rooms, profile, addons, housekeepingCount, maintenanceReady, reportsReady }: {
  rooms: LodgeRoom[];
  profile: LodgePropertyProfile | null | undefined;
  addons: { active?: boolean; disabled?: boolean }[];
  housekeepingCount?: number;
  maintenanceReady?: boolean;
  reportsReady?: boolean;
}): LodgingSetupItem[] {
  const hasRates = rooms.some((r) => (r.base_rate_cents || 0) > 0 && (r.units_total || 0) > 0);
  const hasAvailability = rooms.some((r) => r.is_active && (r.min_stay || 1) >= 1);
  const hasTimes = Boolean(profile?.check_in_from || profile?.check_out_until || rooms.some((r) => r.check_in_time || r.check_out_time));
  const hasPolicies = Boolean(profile?.cancellation_policy || Object.keys(profile?.house_rules || {}).length);
  const activeAddons = addons.filter((a) => a.active !== false && !a.disabled).length;
  return [
    { label: "Rooms & rates", tab: "lodge-rooms", ready: rooms.length > 0 && hasRates, hint: "Room inventory, base rates, and active room types." },
    { label: "Availability calendar", tab: "lodge-calendar", ready: hasAvailability, hint: "Active room availability and stay rules." },
    { label: "Check-in/check-out times", tab: "lodge-property", ready: hasTimes, hint: "Arrival and departure windows for guests." },
    { label: "Property profile", tab: "lodge-property", ready: Boolean(profile), hint: "Facilities, contacts, languages, and highlights." },
    { label: "Policies & rules", tab: "lodge-policies", ready: hasPolicies, hint: "Cancellation policy and house rules." },
    { label: "Add-ons & packages", tab: "lodge-addons", ready: activeAddons > 0, hint: "Paid or free guest extras attached to rooms." },
    { label: "Housekeeping", tab: "lodge-housekeeping", ready: Boolean(housekeepingCount), hint: "Room status board is populated." },
    { label: "Maintenance", tab: "lodge-maintenance", ready: Boolean(maintenanceReady), hint: "Work-order tracking is available." },
    { label: "Reports", tab: "lodge-reports", ready: Boolean(reportsReady), hint: "Revenue and occupancy reporting can run." },
  ];
}

export function setupProgress(items: LodgingSetupItem[]) {
  const complete = items.filter((item) => item.ready).length;
  return { complete, total: items.length, percent: items.length ? Math.round((complete / items.length) * 100) : 0 };
}

export default function LodgingSetupChecklist({ items, compact = false, wizard = false }: { items: LodgingSetupItem[]; compact?: boolean; wizard?: boolean }) {
  const progress = setupProgress(items);
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /> {wizard ? "Setup Wizard" : "Next Setup Steps"}</span>
          <Badge variant="secondary">{progress.complete}/{progress.total} ready</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "space-y-1.5" : wizard ? "grid gap-2 sm:grid-cols-2" : "grid gap-2 md:grid-cols-3"}>
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {item.ready ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className="truncate">{item.label}</span>
                </p>
                {!compact && <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>}
              </div>
              <Badge variant={item.ready ? "secondary" : "outline"} className="text-[10px]">{item.ready ? "Ready" : "Setup"}</Badge>
            </div>
            {!compact && <Button size="sm" variant={wizard && !item.ready ? "default" : "outline"} className="mt-3 h-8 w-full text-xs" onClick={() => goTab(item.tab)}>{item.ready ? "Review" : "Set up"}</Button>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
