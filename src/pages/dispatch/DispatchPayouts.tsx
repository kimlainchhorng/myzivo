/**
 * Dispatch Payouts Page with CSV Export
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const DispatchPayouts = () => {
  const { data: earnings, isLoading } = useQuery({
    queryKey: ["dispatch-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("driver_earnings")
        .select("*, drivers:driver_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const exportCSV = () => {
    if (!earnings?.length) return;
    const headers = ["Date", "Driver", "Type", "Base", "Tip", "Net"];
    const rows = earnings.map((e) => [
      format(new Date(e.created_at), "yyyy-MM-dd HH:mm"),
      (e.drivers as any)?.full_name || "",
      e.earning_type,
      e.base_amount,
      e.tip_amount || 0,
      e.net_amount,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispatch-payouts-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const total = (earnings || []).reduce((sum, e) => sum + (e.net_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-muted-foreground">Driver earnings</p>
        </div>
        <Button onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Total: ${total.toFixed(2)}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(earnings || []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{format(new Date(e.created_at), "MMM d, HH:mm")}</TableCell>
                  <TableCell>{(e.drivers as any)?.full_name}</TableCell>
                  <TableCell>{e.earning_type}</TableCell>
                  <TableCell>${e.base_amount?.toFixed(2)}</TableCell>
                  <TableCell>${(e.tip_amount || 0).toFixed(2)}</TableCell>
                  <TableCell className="font-medium">${e.net_amount?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchPayouts;
