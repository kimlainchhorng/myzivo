/**
 * Quarterly tax filing tracker — 4 IRS due dates per year with status + Mark as Paid.
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, AlertOctagon, Clock, Hourglass } from "lucide-react";
import {
  irsDueDatesForYear,
  filingStatus,
  type FilingStatus,
  type TaxPayoutRow,
  fmtMoney,
} from "@/lib/admin/taxCalculations";

interface Props {
  year: number;
  payouts: TaxPayoutRow[];
  estTaxPerQuarter: number;
  onMarkPaid: (label: string, amountCents: number, dueDate: string) => void;
}

const STATUS_META: Record<FilingStatus, { label: string; cls: string; Icon: any }> = {
  paid:     { label: "Paid",      cls: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
  overdue:  { label: "Overdue",   cls: "bg-rose-100 text-rose-700 border-rose-200",          Icon: AlertOctagon },
  due_soon: { label: "Due soon",  cls: "bg-amber-100 text-amber-700 border-amber-200",       Icon: Clock },
  upcoming: { label: "Upcoming",  cls: "bg-muted text-muted-foreground border-border",       Icon: Hourglass },
};

export default function TaxQuarterlyTracker({ year, payouts, estTaxPerQuarter, onMarkPaid }: Props) {
  const dueDates = useMemo(() => irsDueDatesForYear(year), [year]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> Quarterly filing tracker — {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {dueDates.map((d) => {
          const status = filingStatus(d, payouts);
          const meta = STATUS_META[status];
          return (
            <div key={d.quarter} className="flex items-center justify-between gap-3 rounded-lg border p-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{d.label}</span>
                  <Badge variant="outline" className={`text-[10px] h-5 px-1.5 border ${meta.cls}`}>
                    <meta.Icon className="w-3 h-3 mr-0.5" />{meta.label}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Covers {d.coversFrom} → {d.coversTo} · Due {d.dueDate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">{fmtMoney(estTaxPerQuarter)}</div>
                {status !== "paid" && (
                  <Button size="sm" variant="outline" className="h-6 text-[11px] mt-1"
                    onClick={() => onMarkPaid(d.label, estTaxPerQuarter, d.dueDate)}>
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        <p className="text-[10px] text-muted-foreground pt-1">
          Marking as paid creates a payout entry tagged "Tax Payment". Confirm exact dates with your CPA.
        </p>
      </CardContent>
    </Card>
  );
}
