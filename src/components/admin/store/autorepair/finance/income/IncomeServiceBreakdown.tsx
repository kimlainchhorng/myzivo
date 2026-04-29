/**
 * Top services breakdown with horizontal bars + click-to-drill drawer.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Wrench } from "lucide-react";
import { fmtMoney, type ServiceTotal, type IncomeInvoiceRow } from "@/lib/admin/incomeCalculations";

interface Props {
  services: ServiceTotal[];
  invoices: IncomeInvoiceRow[];
  onOpenInvoice?: (id: string) => void;
}

export default function IncomeServiceBreakdown({ services, invoices, onOpenInvoice }: Props) {
  const [active, setActive] = useState<ServiceTotal | null>(null);
  const max = services[0]?.revenue || 1;

  const drillInvoices = useMemo(() => {
    if (!active) return [];
    return invoices.filter((i) => active.invoiceIds.includes(i.id));
  }, [active, invoices]);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" /> Top services by revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">No services billed in this period.</p>
          ) : (
            <ul className="space-y-1.5">
              {services.slice(0, 10).map((s) => (
                <li key={s.name}>
                  <button onClick={() => setActive(s)} className="w-full text-left group">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="truncate pr-2 group-hover:text-primary transition-colors">{s.name}</span>
                      <span className="font-medium tabular-nums">{fmtMoney(s.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(s.revenue / max) * 100}%` }} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-base">{active?.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <div className="text-xs text-muted-foreground">
              Total revenue: <span className="font-semibold text-foreground">{fmtMoney(active?.revenue ?? 0)}</span> · {drillInvoices.length} invoice{drillInvoices.length === 1 ? "" : "s"}
            </div>
            <ul className="divide-y border rounded-lg">
              {drillInvoices.map((inv) => (
                <li key={inv.id}>
                  <button
                    onClick={() => onOpenInvoice?.(inv.id)}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{inv.number || inv.id.slice(0, 8)}</span>
                      <span className="tabular-nums">{fmtMoney(inv.total_cents)}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {inv.customer_name || "—"} · {(inv.created_at || "").slice(0, 10)} · {inv.status}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
