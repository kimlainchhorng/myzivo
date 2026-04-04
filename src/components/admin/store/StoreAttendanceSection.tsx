/**
 * StoreAttendanceSection — Attendance tracking & leave management.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, Plus, CheckCircle2, XCircle, Clock, AlertTriangle, Palmtree, Thermometer, Baby, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Props { storeId: string; }

type LeaveRequest = {
  id: string; employeeId: string; employeeName: string;
  type: string; startDate: string; endDate: string;
  reason: string; status: "pending" | "approved" | "rejected";
  createdAt: Date;
};

type AttendanceRecord = {
  employeeId: string; employeeName: string;
  date: string; status: "present" | "absent" | "late" | "half-day";
};

const LEAVE_TYPES = [
  { value: "vacation", label: "Vacation", icon: Palmtree, color: "text-emerald-500" },
  { value: "sick", label: "Sick Leave", icon: Thermometer, color: "text-red-500" },
  { value: "personal", label: "Personal", icon: Calendar, color: "text-blue-500" },
  { value: "parental", label: "Parental", icon: Baby, color: "text-purple-500" },
];

const ATTENDANCE_STATUS = {
  present: { label: "Present", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
  absent: { label: "Absent", color: "bg-red-500/10 text-red-600", icon: XCircle },
  late: { label: "Late", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  "half-day": { label: "Half Day", color: "bg-blue-500/10 text-blue-600", icon: AlertTriangle },
};

export default function StoreAttendanceSection({ storeId }: Props) {
  const [tab, setTab] = useState("attendance");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ employeeId: "", type: "vacation", startDate: "", endDate: "", reason: "" });

  const { data: employees = [] } = useQuery({
    queryKey: ["store-employees-attendance", storeId],
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

  const submitLeave = () => {
    if (!leaveForm.employeeId || !leaveForm.startDate) return;
    const emp = employees.find((e: any) => e.id === leaveForm.employeeId);
    setLeaveRequests(prev => [...prev, {
      id: crypto.randomUUID(),
      employeeId: leaveForm.employeeId,
      employeeName: emp?.name || "",
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate || leaveForm.startDate,
      reason: leaveForm.reason,
      status: "pending",
      createdAt: new Date(),
    }]);
    setLeaveDialog(false);
    setLeaveForm({ employeeId: "", type: "vacation", startDate: "", endDate: "", reason: "" });
  };

  const updateLeaveStatus = (id: string, status: "approved" | "rejected") => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const markAttendance = (employeeId: string, status: "present" | "absent" | "late" | "half-day") => {
    const emp = employees.find((e: any) => e.id === employeeId);
    const today = format(new Date(), "yyyy-MM-dd");
    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => !(r.employeeId === employeeId && r.date === today));
      return [...filtered, { employeeId, employeeName: emp?.name || "", date: today, status }];
    });
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const pendingCount = leaveRequests.filter(r => r.status === "pending").length;
  const presentToday = attendanceRecords.filter(r => r.date === todayStr && r.status === "present").length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle2, label: "Present Today", value: presentToday, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: XCircle, label: "Absent Today", value: attendanceRecords.filter(r => r.date === todayStr && r.status === "absent").length, color: "text-red-500", bg: "bg-red-500/10" },
          { icon: Clock, label: "Pending Leaves", value: pendingCount, color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: CalendarCheck, label: "Total Staff", value: employees.length, color: "text-blue-500", bg: "bg-blue-500/10" },
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="attendance" className="gap-1.5 text-xs">
            <CalendarCheck className="w-3.5 h-3.5" /> Daily Attendance
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-1.5 text-xs">
            <Palmtree className="w-3.5 h-3.5" /> Leave Requests
            {pendingCount > 0 && <Badge className="ml-1 text-[9px] h-4 px-1.5 bg-amber-500 text-white">{pendingCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Daily Attendance */}
        <TabsContent value="attendance" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b">
              <h3 className="font-semibold text-sm">Mark Attendance — {format(new Date(), "EEEE, MMMM d")}</h3>
            </div>
            {employees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No employees yet.</div>
            ) : (
              <div className="divide-y">
                {employees.map((emp: any) => {
                  const record = attendanceRecords.find(r => r.employeeId === emp.id && r.date === todayStr);
                  return (
                    <div key={emp.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {emp.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[13px]">{emp.name}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{emp.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(Object.keys(ATTENDANCE_STATUS) as Array<keyof typeof ATTENDANCE_STATUS>).map(status => {
                          const s = ATTENDANCE_STATUS[status];
                          const isActive = record?.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => markAttendance(emp.id, status)}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all",
                                isActive ? s.color + " border-current" : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted"
                              )}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Leave Requests */}
        <TabsContent value="leave" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => setLeaveDialog(true)}>
              <Plus className="w-3.5 h-3.5" /> New Leave Request
            </Button>
          </div>

          {leaveRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <Palmtree className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No leave requests yet.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {leaveRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(req => {
                const leaveType = LEAVE_TYPES.find(t => t.value === req.type);
                const Icon = leaveType?.icon || Calendar;
                return (
                  <Card key={req.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", req.type === "sick" ? "bg-red-500/10" : req.type === "vacation" ? "bg-emerald-500/10" : "bg-blue-500/10")}>
                          <Icon className={cn("w-4.5 h-4.5", leaveType?.color || "text-muted-foreground")} />
                        </div>
                        <div>
                          <p className="font-medium text-[13px]">{req.employeeName}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{req.type} · {req.startDate}{req.endDate !== req.startDate ? ` → ${req.endDate}` : ""}</p>
                          {req.reason && <p className="text-[11px] text-muted-foreground mt-0.5 italic">"{req.reason}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {req.status === "pending" ? (
                          <>
                            <Button variant="outline" size="sm" className="h-7 text-[11px] text-red-500 border-red-200" onClick={() => updateLeaveStatus(req.id, "rejected")}>Reject</Button>
                            <Button size="sm" className="h-7 text-[11px]" onClick={() => updateLeaveStatus(req.id, "approved")}>Approve</Button>
                          </>
                        ) : (
                          <Badge className={cn("text-[10px]", req.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                            {req.status === "approved" ? "Approved" : "Rejected"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Leave Request Dialog */}
      <Dialog open={leaveDialog} onOpenChange={setLeaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={leaveForm.employeeId} onValueChange={v => setLeaveForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={leaveForm.type} onValueChange={v => setLeaveForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} rows={2} placeholder="Brief reason..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialog(false)}>Cancel</Button>
            <Button onClick={submitLeave} disabled={!leaveForm.employeeId || !leaveForm.startDate}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
