/**
 * Period bar for Tax & Payouts: quarter selector + presets + custom range + export menu.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Printer, FileText, Calendar } from "lucide-react";
import {
  type QuarterKey,
  quarterRange,
  currentQuarter,
  previousQuarter,
} from "@/lib/admin/taxCalculations";

interface Props {
  year: number;
  quarter: QuarterKey;
  from: string;
  to: string;
  onYear: (y: number) => void;
  onQuarter: (q: QuarterKey) => void;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onApplyQuarter: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onExport1099: () => void;
}

export default function TaxPeriodBar(p: Props) {
  const setPreset = (kind: "this_q" | "last_q" | "ytd") => {
    if (kind === "ytd") {
      const yr = new Date().getFullYear();
      p.onFrom(`${yr}-01-01`);
      p.onTo(new Date().toISOString().slice(0, 10));
      return;
    }
    const cur = currentQuarter();
    const target = kind === "this_q" ? cur : previousQuarter(cur.year, cur.quarter);
    p.onYear(target.year);
    p.onQuarter(target.quarter);
    const r = quarterRange(target.year, target.quarter);
    p.onFrom(r.from); p.onTo(r.to);
  };

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        <Select value={p.quarter} onValueChange={(v) => p.onQuarter(v as QuarterKey)}>
          <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(["Q1", "Q2", "Q3", "Q4"] as QuarterKey[]).map((q) => (
              <SelectItem key={q} value={q} className="text-xs">{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(p.year)} onValueChange={(v) => p.onYear(parseInt(v))}>
          <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {years.map((y) => (<SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={p.onApplyQuarter}>Apply</Button>
      </div>

      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setPreset("this_q")}>This quarter</Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setPreset("last_q")}>Last quarter</Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setPreset("ytd")}>YTD</Button>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <Label className="text-[11px]">From</Label>
        <Input type="date" value={p.from} onChange={(e) => p.onFrom(e.target.value)} className="h-8 w-36 text-xs" />
        <Label className="text-[11px]">To</Label>
        <Input type="date" value={p.to} onChange={(e) => p.onTo(e.target.value)} className="h-8 w-36 text-xs" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="default" className="h-8 text-xs"><Download className="w-3.5 h-3.5 mr-1" />Export</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={p.onExportCsv}><FileText className="w-3.5 h-3.5 mr-2" />Tax CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={p.onExport1099}><FileText className="w-3.5 h-3.5 mr-2" />1099-NEC CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={p.onPrint}><Printer className="w-3.5 h-3.5 mr-2" />Print</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
