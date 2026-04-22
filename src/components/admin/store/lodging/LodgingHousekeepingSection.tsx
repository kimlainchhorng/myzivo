/**
 * Lodging — Housekeeping board (per-room status).
 */
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { useLodgeRooms } from "@/hooks/lodging/useLodgeRooms";
import { useLodgeHousekeeping, type HousekeepingStatus } from "@/hooks/lodging/useLodgeHousekeeping";
import { toast } from "sonner";

const STATUSES: HousekeepingStatus[] = ["clean", "dirty", "in_progress", "inspected", "out_of_service"];
const LABEL: Record<HousekeepingStatus, string> = {
  clean: "Clean", dirty: "Dirty", in_progress: "In Progress", inspected: "Inspected", out_of_service: "Out of Service",
};
const COLOR: Record<HousekeepingStatus, string> = {
  clean: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  dirty: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  in_progress: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  inspected: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  out_of_service: "bg-muted text-muted-foreground border-border",
};

export default function LodgingHousekeepingSection({ storeId }: { storeId: string }) {
  const { data: rooms = [] } = useLodgeRooms(storeId);
  const { data: tasks = [], isLoading, upsert, setStatus } = useLodgeHousekeeping(storeId);

  // Auto-create housekeeping rows for rooms that don't have one yet
  useEffect(() => {
    if (!rooms.length) return;
    const missing = rooms.filter(r => !tasks.find(t => t.room_id === r.id));
    missing.forEach(r => {
      upsert.mutate({ store_id: storeId, room_id: r.id, room_number: r.name, status: "clean" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length, tasks.length]);

  const change = async (id: string, s: HousekeepingStatus) => {
    try { await setStatus.mutateAsync({ id, status: s }); toast.success(`Marked ${LABEL[s]}`); }
    catch (e: any) { toast.error(e.message || "Failed"); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Housekeeping</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          : tasks.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Add rooms first</p>
          : (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{t.room_number || "Room"}</p>
                    {t.last_cleaned_at && <p className="text-[10px] text-muted-foreground">Cleaned {new Date(t.last_cleaned_at).toLocaleString()}</p>}
                  </div>
                  <Badge className={`text-[10px] border ${COLOR[t.status]}`}>{LABEL[t.status]}</Badge>
                  <select value={t.status} onChange={e => change(t.id, e.target.value as HousekeepingStatus)}
                    className="h-8 text-xs rounded-md border border-input bg-background px-2">
                    {STATUSES.map(s => <option key={s} value={s}>{LABEL[s]}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
