/**
 * 1099-NEC vendor prep list — flag vendors paid > $600 in calendar year.
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet } from "lucide-react";
import { fmtMoney, type VendorTotal } from "@/lib/admin/taxCalculations";

interface Props {
  year: number;
  vendors: VendorTotal[];
}

export default function Tax1099Prep({ year, vendors }: Props) {
  const [onlyEligible, setOnlyEligible] = useState(true);

  const list = useMemo(
    () => (onlyEligible ? vendors.filter((v) => v.eligible1099) : vendors),
    [vendors, onlyEligible]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" /> 1099-NEC prep — {year}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch id="only-eligible" checked={onlyEligible} onCheckedChange={setOnlyEligible} />
            <Label htmlFor="only-eligible" className="text-[11px]">Only eligible (&gt; $600)</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">No vendor expenses for {year}.</p>
        ) : (
          <ul className="divide-y">
            {list.slice(0, 25).map((v) => (
              <li key={v.vendor} className="py-1.5 flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="truncate">{v.vendor}</span>
                  {v.eligible1099 && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] h-5 px-1.5">
                      1099
                    </Badge>
                  )}
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="font-semibold tabular-nums text-xs">{fmtMoney(v.total)}</div>
                  <div className="text-[10px] text-muted-foreground">{v.count} expense{v.count === 1 ? "" : "s"}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[10px] text-muted-foreground pt-2">
          Use the 1099-NEC export to send to your CPA. Sole proprietorships and corporations are typically exempt — verify before filing.
        </p>
      </CardContent>
    </Card>
  );
}
