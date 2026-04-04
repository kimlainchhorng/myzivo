/**
 * StoreTimeClockSection — Employee clock-in/out tracking.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, LogIn, LogOut, Timer, Users, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Props { storeId: string; }

type ClockEntry = { employeeId: string; employeeName: string; clockIn: Date; clockOut: Date | null; };

export default function StoreTimeClockSection({ storeId }: Props) {
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const { data: employees = [] } = useQuery({
    queryKey: ["store-employees-timeclock", storeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_employees")
        .select("*")
        .eq("store_id", storeId)
        .eq("status", "active")
        .order("name");
      return (data || []) as any[];
    },
  });

  const clockedIn = entries.filter(e => !e.clockOut);
  const todayEntries = entries.filter(e => format(e.clockIn, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"));

  const handleClockIn = () => {
    if (!selectedEmployee) return;
    const emp = employees.find((e: any) => e.id === selectedEmployee);
    if (!emp) return;
    setEntries(prev => [...prev, { employeeId: emp.id, employeeName: emp.name, clockIn: new Date(), clockOut: null }]);
    setSelectedEmployee("");
  };

  const handleClockOut = (idx: number) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, clockOut: new Date() } : e));
  };

  const getHoursWorked = (entry: ClockEntry) => {
    const end = entry.clockOut || new Date();
    return ((end.getTime() - entry.clockIn.getTime()) / 3600000).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Currently Clocked In", value: clockedIn.length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: Clock, label: "Total Entries Today", value: todayEntries.length, color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Timer, label: "Total Hours Today", value: `${todayEntries.reduce((s, e) => s + parseFloat(getHoursWorked(e)), 0).toFixed(1)}h`, color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Calendar, label: "Active Staff", value: employees.length, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Clock-In */}
      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <LogIn className="w-4 h-4 text-emerald-500" /> Quick Clock In
        </h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Select Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger><SelectValue placeholder="Choose employee..." /></SelectTrigger>
              <SelectContent>
                {employees
                  .filter((e: any) => !clockedIn.some(c => c.employeeId === e.id))
                  .map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name} — {e.role}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleClockIn} disabled={!selectedEmployee} className="gap-1.5 shrink-0">
            <LogIn className="w-3.5 h-3.5" /> Clock In
          </Button>
        </div>
      </Card>

      {/* Currently Clocked In */}
      {clockedIn.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" /> Currently Working
          </h3>
          <div className="space-y-2">
            {clockedIn.map((entry, idx) => {
              const realIdx = entries.indexOf(entry);
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-600">{entry.employeeName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-[13px]">{entry.employeeName}</p>
                      <p className="text-[11px] text-muted-foreground">Clocked in at {format(entry.clockIn, "h:mm a")} · {getHoursWorked(entry)}h</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleClockOut(realIdx)}>
                    <LogOut className="w-3.5 h-3.5" /> Clock Out
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Today's Log */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">Today's Time Log</h3>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
        {todayEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No clock entries for today yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Employee</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Clock In</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Clock Out</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Hours</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayEntries.map((entry, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-medium text-[13px]">{entry.employeeName}</td>
                    <td className="px-4 py-2.5 text-[13px]">{format(entry.clockIn, "h:mm a")}</td>
                    <td className="px-4 py-2.5 text-[13px]">{entry.clockOut ? format(entry.clockOut, "h:mm a") : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[13px]">{getHoursWorked(entry)}h</td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge className={cn("text-[10px]", entry.clockOut ? "bg-muted text-muted-foreground" : "bg-emerald-500/10 text-emerald-600")}>
                        {entry.clockOut ? "Completed" : "Working"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
