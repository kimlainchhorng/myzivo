/**
 * Searchable, sortable invoice table for the Income & Revenue dashboard.
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Receipt, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtMoney, type IncomeInvoiceRow } from "@/lib/admin/incomeCalculations";

interface Props {
  invoices: IncomeInvoiceRow[];
  onOpenInvoice?: (id: string) => void;
}

type SortField = "date" | "total";

const STATUS_TONE: Record<string, string> = {
  paid:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  sent:    "bg-blue-100 text-blue-700 border-blue-200",
  overdue: "bg-rose-100 text-rose-700 border-rose-200",
  draft:   "bg-muted text-muted-foreground border-border",
};

export default function IncomeInvoiceTable({ invoices, onOpenInvoice }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = invoices.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (!q) return true;
      return (
        (i.number ?? "").toLowerCase().includes(q) ||
        (i.customer_name ?? "").toLowerCase().includes(q) ||
        (i.vehicle_label ?? "").toLowerCase().includes(q)
      );
    });
    arr = [...arr].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "total") return ((a.total_cents - b.total_cents) * dir);
      return (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0) * dir;
    });
    return arr;
  }, [invoices, search, status, sortField, sortDir]);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("desc"); }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" /> Invoices in period
          <span className="text-[11px] font-normal text-muted-foreground">· {filtered.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search number, customer, vehicle"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All statuses</SelectItem>
              <SelectItem value="paid" className="text-xs">Paid</SelectItem>
              <SelectItem value="partial" className="text-xs">Partial</SelectItem>
              <SelectItem value="sent" className="text-xs">Sent</SelectItem>
              <SelectItem value="overdue" className="text-xs">Overdue</SelectItem>
              <SelectItem value="draft" className="text-xs">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] text-muted-foreground border-b">
                <th className="px-2 py-1.5 font-medium">Number</th>
                <th className="px-2 py-1.5 font-medium">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("date")}>
                    Date <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-2 py-1.5 font-medium">Customer</th>
                <th className="px-2 py-1.5 font-medium">Status</th>
                <th className="px-2 py-1.5 font-medium text-right">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("total")}>
                    Total <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-2 py-1.5 font-medium text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-2 py-6 text-center text-muted-foreground">No invoices match.</td></tr>
              ) : filtered.slice(0, 50).map((i) => {
                const outstanding = Math.max(0, i.total_cents - i.amount_paid_cents);
                return (
                  <tr key={i.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => onOpenInvoice?.(i.id)}>
                    <td className="px-2 py-1.5 font-medium">{i.number || i.id.slice(0, 8)}</td>
                    <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">{(i.created_at || "").slice(0, 10)}</td>
                    <td className="px-2 py-1.5 truncate max-w-[160px]">{i.customer_name || "—"}</td>
                    <td className="px-2 py-1.5">
                      <Badge variant="outline" className={`text-[10px] h-5 px-1.5 border ${STATUS_TONE[i.status] ?? "bg-muted"}`}>
                        {i.status}
                      </Badge>
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums font-medium">{fmtMoney(i.total_cents)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{fmtMoney(outstanding)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <p className="text-[10px] text-muted-foreground text-center">Showing first 50 of {filtered.length}. Refine with search/status.</p>
        )}
      </CardContent>
    </Card>
  );
}
