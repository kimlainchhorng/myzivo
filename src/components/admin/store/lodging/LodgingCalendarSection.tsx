/**
 * Lodging — Calendar & Availability (simple month grid showing booked + blocked dates).
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLodgeRooms } from "@/hooks/lodging/useLodgeRooms";
import { useLodgeBlocks } from "@/hooks/lodging/useLodgeBlocks";
import { useLodgeReservations } from "@/hooks/lodging/useLodgeReservations";
import { toast } from "sonner";

function ymd(d: Date) { return d.toISOString().slice(0, 10); }
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function LodgingCalendarSection({ storeId }: { storeId: string }) {
  const { data: rooms = [] } = useLodgeRooms(storeId);
  const [roomId, setRoomId] = useState<string | undefined>();
  const activeRoomId = roomId || rooms[0]?.id;
  const { data: blocks = [], upsert: upsertBlock, remove: removeBlock } = useLodgeBlocks(storeId, activeRoomId);
  const { data: reservations = [] } = useLodgeReservations(storeId, "all");

  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const year = cursor.getFullYear(); const month = cursor.getMonth();

  const grid = useMemo(() => {
    const dim = daysInMonth(year, month);
    const startDow = new Date(year, month, 1).getDay();
    const cells: (Date | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= dim; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [year, month]);

  const blockedSet = useMemo(() => new Set(blocks.map(b => b.block_date)), [blocks]);
  const reservedSet = useMemo(() => {
    const s = new Set<string>();
    reservations.filter(r => r.room_id === activeRoomId && !["cancelled", "no_show"].includes(r.status))
      .forEach(r => {
        const start = new Date(r.check_in); const end = new Date(r.check_out);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) s.add(ymd(d));
      });
    return s;
  }, [reservations, activeRoomId]);

  const toggleBlock = async (date: string) => {
    if (!activeRoomId) return;
    const existing = blocks.find(b => b.block_date === date);
    try {
      if (existing) { await removeBlock.mutateAsync(existing.id); toast.success("Block removed"); }
      else { await upsertBlock.mutateAsync({ store_id: storeId, room_id: activeRoomId, block_date: date, reason: "manual" } as any); toast.success("Date blocked"); }
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Calendar & Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rooms.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
            <CalendarDays className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-3 text-sm font-semibold text-foreground">Availability calendar is ready</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">Add rooms first, then this calendar will show booked nights, manual blocks, and available dates.</p>
            <Button size="sm" className="mt-4" onClick={() => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab: "lodge-rooms" } }))}>Open rooms</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {rooms.map(r => (
                <button key={r.id} onClick={() => setRoomId(r.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${activeRoomId === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}>
                  {r.name}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <p className="font-semibold text-sm">{cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}</p>
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground font-semibold">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((d, i) => {
                if (!d) return <div key={i} />;
                const key = ymd(d);
                const reserved = reservedSet.has(key);
                const blocked = blockedSet.has(key);
                return (
                  <button key={i} onClick={() => !reserved && toggleBlock(key)}
                    disabled={reserved}
                    className={`aspect-square rounded-md text-xs font-medium border transition ${
                      reserved ? "bg-primary/15 text-primary border-primary/30 cursor-not-allowed"
                        : blocked ? "bg-destructive/15 text-destructive border-destructive/30"
                        : "bg-background border-border hover:bg-muted"
                    }`}>
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/15 border border-primary/30 inline-block" /> Booked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/15 border border-destructive/30 inline-block" /> Blocked</span>
              <span>Click any free date to block / unblock</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
