/**
 * Top customers by revenue.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { fmtMoney, type CustomerTotal } from "@/lib/admin/incomeCalculations";

interface Props { customers: CustomerTotal[] }

export default function IncomeTopCustomers({ customers }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Top customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">No customer revenue yet.</p>
        ) : (
          <ul className="divide-y">
            {customers.slice(0, 10).map((c) => (
              <li key={c.customer} className="py-1.5 flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.customer}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {c.invoiceCount} invoice{c.invoiceCount === 1 ? "" : "s"}
                    {c.lastVisit && ` · last ${c.lastVisit.slice(0, 10)}`}
                  </div>
                </div>
                <span className="font-semibold tabular-nums whitespace-nowrap">{fmtMoney(c.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
