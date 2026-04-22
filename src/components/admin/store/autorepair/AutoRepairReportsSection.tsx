/**
 * Auto Repair — Reports & Analytics
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, FileDown } from "lucide-react";

interface Props { storeId: string }

export default function AutoRepairReportsSection({ storeId }: Props) {
  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const { data: orders = [] } = useQuery({
    queryKey: ["ar-reports-orders", storeId, from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_work_orders" as any)
        .select("id,number,status,labor_hours,total_cents,is_comeback,technician_id,created_at,completed_at")
        .eq("store_id", storeId)
        .gte("created_at", from)
        .lte("created_at", `${to}T23:59:59`);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: techs = [] } = useQuery({
    queryKey: ["ar-technicians", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_technicians" as any).select("id,name").eq("store_id", storeId);
      if (error) throw error;
      return data as any[];
    },
  });

  const stats = useMemo(() => {
    const closed = orders.filter((o: any) => o.status === "done");
    const revenue = closed.reduce((s, o: any) => s + (o.total_cents ?? 0), 0);
    const laborHours = orders.reduce((s, o: any) => s + Number(o.labor_hours ?? 0), 0);
    const avg = closed.length ? revenue / closed.length : 0;
    const comebacks = orders.filter((o: any) => o.is_comeback).length;
    const cbRate = orders.length ? (comebacks / orders.length) * 100 : 0;

    const byTech: Record<string, { ros: number; revenue: number; hours: number }> = {};
    closed.forEach((o: any) => {
      const k = o.technician_id ?? "_unassigned";
      byTech[k] = byTech[k] ?? { ros: 0, revenue: 0, hours: 0 };
      byTech[k].ros++;
      byTech[k].revenue += o.total_cents ?? 0;
      byTech[k].hours += Number(o.labor_hours ?? 0);
    });

    return { revenue, closedCount: closed.length, laborHours, avg, cbRate, byTech };
  }, [orders]);

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Revenue", `$${(stats.revenue / 100).toFixed(2)}`],
      ["ROs Closed", String(stats.closedCount)],
      ["Avg Ticket", `$${(stats.avg / 100).toFixed(2)}`],
      ["Labor Hours", stats.laborHours.toFixed(1)],
      ["Comeback Rate", `${stats.cbRate.toFixed(1)}%`],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ar-report-${from}-to-${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Reports & Analytics</CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCsv}>
            <FileDown className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Revenue", value: `$${(stats.revenue / 100).toFixed(2)}` },
          { label: "ROs Closed", value: stats.closedCount },
          { label: "Avg Ticket", value: `$${(stats.avg / 100).toFixed(2)}` },
          { label: "Labor Hours", value: stats.laborHours.toFixed(1) },
          { label: "Comeback Rate", value: `${stats.cbRate.toFixed(1)}%` },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <p className="text-xl font-bold mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Tech Leaderboard</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(stats.byTech).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No closed work orders in this period.</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(stats.byTech)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([tid, s]) => {
                  const name = techs.find((t: any) => t.id === tid)?.name ?? "Unassigned";
                  return (
                    <div key={tid} className="flex items-center justify-between border border-border rounded-lg p-3 text-sm">
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground">{s.ros} ROs · {s.hours.toFixed(1)}h · ${(s.revenue / 100).toFixed(2)}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
