/**
 * StorePayrollSection — Payroll management with pay runs, wage tracking.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Plus, Calendar, Download, ChevronRight, Users, TrendingUp, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface Props { storeId: string; }

type PayPeriod = { label: string; start: Date; end: Date; };

function getPayPeriods(): PayPeriod[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, i);
    return {
      label: format(d, "MMMM yyyy"),
      start: startOfMonth(d),
      end: endOfMonth(d),
    };
  });
}

export default function StorePayrollSection({ storeId }: Props) {
  const [period, setPeriod] = useState(0);
  const [runDialog, setRunDialog] = useState(false);
  const periods = getPayPeriods();

  const { data: employees = [] } = useQuery({
    queryKey: ["store-employees-payroll", storeId],
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

  const totalPayroll = employees.reduce((sum: number, e: any) => sum + (e.hourly_rate || 0) * 160, 0);
  const avgRate = employees.length ? (employees.reduce((s: number, e: any) => s + (e.hourly_rate || 0), 0) / employees.length) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Est. Monthly Payroll", value: `$${totalPayroll.toLocaleString()}`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: Users, label: "Active Employees", value: employees.length, color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: TrendingUp, label: "Avg. Hourly Rate", value: `$${avgRate.toFixed(2)}`, color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Clock, label: "Est. Monthly Hours", value: `${employees.length * 160}h`, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium truncate">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pay Period + Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Select value={String(period)} onValueChange={v => setPeriod(Number(v))}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p, i) => (
              <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setRunDialog(true)}>
            <Plus className="w-3.5 h-3.5" /> Run Payroll
          </Button>
        </div>
      </div>

      {/* Employee Payroll Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Role</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground">Hourly Rate</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground">Hours</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground">Gross Pay</th>
                <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No active employees. Add employees first.</td></tr>
              ) : employees.map((emp: any) => (
                <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {emp.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[13px]">{emp.name}</p>
                        <p className="text-[11px] text-muted-foreground">{emp.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[11px] capitalize">{emp.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[13px]">${(emp.hourly_rate || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-[13px]">160</td>
                  <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold">${((emp.hourly_rate || 0) * 160).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="text-[10px] bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Pending</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            {employees.length > 0 && (
              <tfoot>
                <tr className="bg-muted/30 font-semibold">
                  <td colSpan={4} className="px-4 py-3 text-[13px]">Total</td>
                  <td className="px-4 py-3 text-right font-mono text-[13px]">${totalPayroll.toLocaleString()}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      {/* Recent Pay Runs */}
      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" /> Recent Pay Runs
        </h3>
        <div className="text-center py-8 text-muted-foreground text-sm">
          No pay runs yet. Click "Run Payroll" to process your first pay run.
        </div>
      </Card>

      {/* Run Payroll Dialog */}
      <Dialog open={runDialog} onOpenChange={setRunDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Run Payroll — {periods[period]?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="rounded-xl bg-muted/40 p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Employees</span><span className="font-semibold">{employees.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Hours</span><span className="font-semibold">{employees.length * 160}h</span></div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2"><span className="text-muted-foreground">Gross Total</span><span className="font-bold text-lg">${totalPayroll.toLocaleString()}</span></div>
            </div>
            <p className="text-xs text-muted-foreground">This will generate a payroll record for {periods[period]?.label}. You can export or modify individual amounts afterwards.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunDialog(false)}>Cancel</Button>
            <Button onClick={() => { setRunDialog(false); }}>Confirm & Run</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
