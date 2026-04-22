/**
 * Lodging — Front Desk: today board (arrivals / in-house / departures).
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRound, LogIn, LogOut } from "lucide-react";
import { useLodgeReservations, type ReservationStatus, type LodgeReservation } from "@/hooks/lodging/useLodgeReservations";
import { toast } from "sonner";

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export default function LodgingFrontDeskSection({ storeId }: { storeId: string }) {
  const { data: reservations = [], setStatus } = useLodgeReservations(storeId, "all");
  const today = ymd(new Date());

  const { arrivals, inHouse, departures } = useMemo(() => {
    const arrivals = reservations.filter(r => r.check_in === today && ["confirmed", "hold"].includes(r.status));
    const departures = reservations.filter(r => r.check_out === today && r.status === "checked_in");
    const inHouse = reservations.filter(r => r.status === "checked_in" && r.check_in <= today && r.check_out > today);
    return { arrivals, inHouse, departures };
  }, [reservations, today]);

  const act = async (id: string, s: ReservationStatus, msg: string) => {
    try { await setStatus.mutateAsync({ id, status: s }); toast.success(msg); }
    catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const Column = ({ title, items, action, color }: { title: string; items: LodgeReservation[]; action?: { label: string; icon: any; status: ReservationStatus; msg: string }; color: string }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-sm">{title}</p>
        <Badge variant="outline" className={`text-[10px] ${color}`}>{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">None</p>
          : items.map(r => (
            <div key={r.id} className="p-2.5 rounded-lg border bg-card">
              <p className="text-sm font-semibold truncate">{r.guest_name || "Guest"}</p>
              <p className="text-[11px] text-muted-foreground">{r.room_number || "—"} · {r.adults}A{r.children ? `/${r.children}C` : ""}</p>
              <p className="text-[10px] text-muted-foreground">{r.check_in} → {r.check_out}</p>
              {action && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 mt-2 w-full"
                  onClick={() => act(r.id, action.status, action.msg)}>
                  <action.icon className="h-3 w-3" /> {action.label}
                </Button>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Front Desk — {today}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <Column title="Arrivals" items={arrivals} color="text-blue-600" action={{ label: "Check In", icon: LogIn, status: "checked_in", msg: "Checked in" }} />
          <Column title="In-House" items={inHouse} color="text-emerald-600" />
          <Column title="Departures" items={departures} color="text-amber-600" action={{ label: "Check Out", icon: LogOut, status: "checked_out", msg: "Checked out" }} />
        </div>
      </CardContent>
    </Card>
  );
}
