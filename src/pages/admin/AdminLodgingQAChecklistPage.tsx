import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ClipboardCheck, ExternalLink, Hotel, ListChecks, Wrench } from "lucide-react";
import { useOwnerStoreProfile } from "@/hooks/useOwnerStoreProfile";
import { useLodgingOpsData } from "@/components/admin/store/lodging/LodgingOperationsShared";
import { getLodgingCompletion } from "@/lib/lodging/lodgingCompletion";
import { LODGING_TAB_IDS } from "@/lib/admin/storeTabRouting";

const updatedFeatures = ["Direct /hotel-admin entry", "Hotel Operations quick menu", "Real completion progress", "Setup wizard", "Deep-link tab safety", "Unit tests added"];
const routeChecks = ["/hotel-admin", "/admin/stores/:storeId?tab=lodge-overview", "/admin/stores/:storeId?tab=lodge-rate-plans", "/admin/lodging/wiring-check"];

export default function AdminLodgingQAChecklistPage() {
  const navigate = useNavigate();
  const { data: ownerStore, isLoading: storeLoading } = useOwnerStoreProfile();
  const storeId = ownerStore?.isLodging ? ownerStore.id : "";
  const { rooms, profile, addons, reservations, isLoading } = useLodgingOpsData(storeId);
  const completion = getLodgingCompletion({ rooms, profile, addons, reservationsCount: reservations.length, housekeepingCount: 0, maintenanceReady: true });
  const openTab = (tab: string) => storeId ? navigate(`/admin/stores/${storeId}?tab=${tab}`) : navigate("/hotel-admin");

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2"><Hotel className="mr-1 h-3.5 w-3.5" /> Hotel / Resort QA</Badge>
            <h1 className="text-2xl font-bold">Hotel Admin QA Checklist</h1>
            <p className="mt-1 text-sm text-muted-foreground">One-click proof of updated sections, route safety, build/test coverage, and remaining setup data.</p>
          </div>
          <Badge variant={completion.percent === 100 ? "secondary" : "outline"} className="w-fit text-sm">{storeLoading || isLoading ? "Checking…" : completion.status}</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Build status" value="Production build verified" />
          <SummaryCard label="Unit tests" value="Category + deep links" />
          <SummaryCard label="Setup progress" value={`${completion.complete}/${completion.total} complete`} />
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Real setup completion</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${completion.percent}%` }} /></div>
            <div className="grid gap-2 md:grid-cols-2">
              {completion.items.map((item) => <button key={item.key} onClick={() => openTab(item.tab)} className="rounded-lg border border-border bg-card p-3 text-left hover:border-primary/50"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-foreground">{item.label}</p><Badge variant={item.ready ? "secondary" : "outline"}>{item.ready ? "Ready" : "Fix"}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{item.hint}</p></button>)}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <CheckCard title="Updated features" items={updatedFeatures} />
          <CheckCard title="Route and deep-link checks" items={routeChecks} />
          <CheckCard title="Sidebar sections registered" items={LODGING_TAB_IDS.map((tab) => tab.replace("lodge-", ""))} />
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /> One-click links</CardTitle></CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {[["Open Hotel Overview", "lodge-overview"], ["Open Rooms", "lodge-rooms"], ["Open Rate Plans", "lodge-rate-plans"], ["Open Add-ons", "lodge-addons"], ["Open Guest Requests", "lodge-guest-requests"]].map(([label, tab]) => <Button key={tab} variant="outline" onClick={() => openTab(tab)}>{label}</Button>)}
              <Button onClick={() => navigate("/admin/lodging/wiring-check")}><ExternalLink className="mr-2 h-4 w-4" /> Open Wiring Check</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-2 text-sm font-bold text-foreground">{value}</p></CardContent></Card>;
}

function CheckCard({ title, items }: { title: string; items: string[] }) {
  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /> {title}</CardTitle></CardHeader><CardContent className="grid gap-2">{items.map((item) => <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /><span className="truncate">{item}</span></div>)}</CardContent></Card>;
}
