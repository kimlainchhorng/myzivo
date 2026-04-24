/**
 * Lodging — Front Desk: today board (arrivals / in-house / departures).
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BedDouble, CalendarRange, ClipboardCheck, DollarSign, KeyRound, ListChecks, LogIn, LogOut } from "lucide-react";
import { useLodgeReservations, type ReservationStatus, type LodgeReservation } from "@/hooks/lodging/useLodgeReservations";
import { toast } from "sonner";
import LodgingSectionStatusBanner from "./LodgingSectionStatusBanner";

function ymd(d: Date) { return d.toISOString().slice(0, 10); }
const timeRange = (r: LodgeReservation) => r.room?.check_in_time || r.room?.check_out_time ? `${r.room?.check_in_time || "15:00"} → ${r.room?.check_out_time || "11:00"}` : "Standard hotel times";
const goTab = (tab: string) => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab } }));

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
  const activeReservations = reservations.filter(r => !["cancelled", "checked_out", "no_show"].includes(r.status)).length;
  const stats = [
    { label: "Today’s arrivals", value: arrivals.length, icon: LogIn },
    { label: "In-house guests", value: inHouse.length, icon: KeyRound },
    { label: "Today’s departures", value: departures.length, icon: LogOut },
    { label: "Active reservations", value: activeReservations, icon: ClipboardCheck },
  ];

  const Column = ({ title, empty, items, action, color }: { title: string; empty: string; items: LodgeReservation[]; action?: { label: string; icon: any; status: ReservationStatus; msg: string }; color: string }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-sm">{title}</p>
        <Badge variant="outline" className={`text-[10px] ${color}`}>{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-center">
            <p className="text-sm font-semibold text-foreground">{empty}</p>
            <p className="mt-1 text-xs text-muted-foreground">No live records yet. The Front Desk workflow is installed and ready for hotel data.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => goTab("lodge-reservations")}>Create / review reservations</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => goTab("lodge-rooms")}>Open rooms</Button>
            </div>
          </div>
          : items.map(r => (
            <div key={r.id} className="p-2.5 rounded-lg border bg-card">
              <p className="text-sm font-semibold truncate">{r.guest_name || "Guest"}</p>
              <p className="text-[11px] text-muted-foreground">{r.room_number || "—"} · {r.adults}A{r.children ? `/${r.children}C` : ""}</p>
              <p className="text-[10px] text-muted-foreground">{r.check_in} → {r.check_out}</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-foreground"><CalendarRange className="h-3 w-3 text-primary" /> {timeRange(r)}</p>
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
          <Column title="Arrivals" empty="No arrivals scheduled for today." items={arrivals} color="text-primary" action={{ label: "Check In", icon: LogIn, status: "checked_in", msg: "Checked in" }} />
          <Column title="In-House" empty="No in-house guests right now." items={inHouse} color="text-primary" />
          <Column title="Departures" empty="No departures scheduled for today." items={departures} color="text-primary" action={{ label: "Check Out", icon: LogOut, status: "checked_out", msg: "Checked out" }} />
        </div>
      </CardContent>
    </Card>
  );
}
