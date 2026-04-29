/**
 * Sales tax breakdown by tax rate (jurisdiction proxy).
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent } from "lucide-react";
import { fmtMoney, type RateBucket } from "@/lib/admin/taxCalculations";

interface Props { buckets: RateBucket[] }

export default function TaxSalesBreakdown({ buckets }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Percent className="w-4 h-4 text-primary" /> Sales tax by rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {buckets.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">No paid invoices in this period.</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] text-muted-foreground border-b">
                  <th className="px-2 py-1.5 font-medium">Rate</th>
                  <th className="px-2 py-1.5 font-medium text-right">Subtotal</th>
                  <th className="px-2 py-1.5 font-medium text-right">Tax</th>
                  <th className="px-2 py-1.5 font-medium text-right">Invoices</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((b) => (
                  <tr key={b.rateLabel} className="border-b last:border-0">
                    <td className="px-2 py-1.5 font-medium">{b.rateLabel}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{fmtMoney(b.subtotal)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{fmtMoney(b.tax)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
