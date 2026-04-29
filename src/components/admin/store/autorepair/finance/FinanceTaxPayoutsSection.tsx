/**
 * Auto Repair Finance — Tax & Payouts (full dashboard).
 * Period bar, KPI strip, quarterly tracker, sales tax breakdown, payouts, 1099 prep.
 */
import { useMemo, useState, useEffect } from "react";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

import {
  computeSalesTax,
  breakdownByRate,
  aggregateVendorsForYear,
  quarterRange,
  currentQuarter,
  loadTaxRate,
  estimateIncomeTax,
  type QuarterKey,
  type TaxInvoiceRow,
  type TaxPayoutRow,
  type TaxExpenseRow,
} from "@/lib/admin/taxCalculations";
import { exportTaxCsv, export1099Csv, downloadCsv } from "@/lib/admin/taxCsvExport";

import TaxPeriodBar from "./tax/TaxPeriodBar";
import TaxKpiStrip from "./tax/TaxKpiStrip";
import TaxQuarterlyTracker from "./tax/TaxQuarterlyTracker";
import TaxSalesBreakdown from "./tax/TaxSalesBreakdown";
import TaxPayoutHistory from "./tax/TaxPayoutHistory";
import Tax1099Prep from "./tax/Tax1099Prep";

interface Props { storeId: string; storeName?: string }

function fetchInvoices(storeId: string, from: string, to: string) {
  return supabase
    .from("ar_invoices" as any)
    .select("id,total_cents,subtotal_cents,tax_cents,amount_paid_cents,status,paid_at,created_at,customer_name")
    .eq("store_id", storeId)
    .gte("created_at", from)
    .lte("created_at", `${to}T23:59:59`)
    .then(({ data, error }) => { if (error) throw error; return (data ?? []) as unknown as TaxInvoiceRow[]; });
}
function fetchPayouts(storeId: string, from: string, to: string) {
  return supabase
    .from("ar_payouts" as any)
    .select("id,amount_cents,payout_date,source,reference,receipt_url")
    .eq("store_id", storeId)
    .gte("payout_date", from)
    .lte("payout_date", to)
    .order("payout_date", { ascending: false })
    .then(({ data, error }) => { if (error) throw error; return (data ?? []) as unknown as TaxPayoutRow[]; });
}
function fetchYearVendors(storeId: string, year: number) {
  return supabase
    .from("ar_expenses" as any)
    .select("id,amount_cents,vendor,expense_date,category")
    .eq("store_id", storeId)
    .gte("expense_date", `${year}-01-01`)
    .lte("expense_date", `${year}-12-31`)
    .then(({ data, error }) => { if (error) throw error; return (data ?? []) as unknown as TaxExpenseRow[]; });
}

export default function FinanceTaxPayoutsSection({ storeId, storeName }: Props) {
  const qc = useQueryClient();
  const cur = useMemo(() => currentQuarter(), []);
  const [year, setYear] = useState<number>(cur.year);
  const [quarter, setQuarter] = useState<QuarterKey>(cur.quarter);
  const initial = useMemo(() => quarterRange(cur.year, cur.quarter), [cur.year, cur.quarter]);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const applyQuarter = () => {
    const r = quarterRange(year, quarter);
    setFrom(r.from); setTo(r.to);
  };

  const queries = useQueries({
    queries: [
      { queryKey: ["ar-tax-invoices", storeId, from, to], queryFn: () => fetchInvoices(storeId, from, to), staleTime: 30_000 },
      { queryKey: ["ar-tax-payouts", storeId, from, to], queryFn: () => fetchPayouts(storeId, from, to), staleTime: 30_000 },
      { queryKey: ["ar-tax-payouts-year", storeId, year], queryFn: () => fetchPayouts(storeId, `${year}-01-01`, `${year}-12-31`), staleTime: 60_000 },
      { queryKey: ["ar-tax-vendors-year", storeId, year], queryFn: () => fetchYearVendors(storeId, year), staleTime: 60_000 },
      { queryKey: ["ar-tax-invoices-year", storeId, year], queryFn: () => fetchInvoices(storeId, `${year}-01-01`, `${year}-12-31`), staleTime: 60_000 },
    ],
  });

  const loading = queries.some((q) => q.isLoading);
  const invoices    = (queries[0].data ?? []) as TaxInvoiceRow[];
  const payouts     = (queries[1].data ?? []) as TaxPayoutRow[];
  const yearPayouts = (queries[2].data ?? []) as TaxPayoutRow[];
  const yearVendors = (queries[3].data ?? []) as TaxExpenseRow[];
  const yearInvoices = (queries[4].data ?? []) as TaxInvoiceRow[];

  const stats = useMemo(() => computeSalesTax(invoices, payouts, from, to), [invoices, payouts, from, to]);
  const buckets = useMemo(() => breakdownByRate(invoices), [invoices]);
  const vendors1099 = useMemo(() => aggregateVendorsForYear(yearVendors, year), [yearVendors, year]);

  // Yearly est. income tax for the quarterly tracker
  const yearStats = useMemo(
    () => computeSalesTax(yearInvoices, yearPayouts, `${year}-01-01`, `${year}-12-31`),
    [yearInvoices, yearPayouts, year]
  );
  const [taxRateTick, setTaxRateTick] = useState(0);
  useEffect(() => {
    // listen to localStorage updates from KPI strip
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes(`tax-rate:${storeId}`)) setTaxRateTick((t) => t + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storeId]);
  const ratePct = useMemo(() => loadTaxRate(storeId), [storeId, taxRateTick]);
  const yearlyEstTax = useMemo(() => estimateIncomeTax(yearStats.paidRevenue, ratePct), [yearStats.paidRevenue, ratePct]);
  const estPerQuarter = Math.round(yearlyEstTax / 4);

  const markPaid = useMutation({
    mutationFn: async ({ label, amountCents, dueDate }: { label: string; amountCents: number; dueDate: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("ar_payouts" as any).insert({
        store_id: storeId,
        payout_date: new Date().toISOString().slice(0, 10),
        amount_cents: amountCents,
        source: "Tax Payment",
        reference: `${label} (due ${dueDate})`,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Quarterly tax payment recorded");
      qc.invalidateQueries({ queryKey: ["ar-tax-payouts", storeId] });
      qc.invalidateQueries({ queryKey: ["ar-tax-payouts-year", storeId, year] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const onExportCsv = () => {
    const csv = exportTaxCsv({
      storeName, from, to, stats, ratePct,
      estIncomeTax: estimateIncomeTax(stats.paidRevenue, ratePct),
      rateBuckets: buckets, payouts,
    });
    const safe = (storeName || "store").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadCsv(`tax-${safe}-${from}-to-${to}.csv`, csv);
    toast.success("Tax CSV exported");
  };
  const onExport1099 = () => {
    const csv = export1099Csv(year, vendors1099);
    const safe = (storeName || "store").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadCsv(`1099-${safe}-${year}.csv`, csv);
    toast.success("1099 CSV exported");
  };
  const onPrint = () => window.print();

  return (
    <div className="space-y-3 print:space-y-2">
      <Card className="print:hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Tax & Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaxPeriodBar
            year={year} quarter={quarter} from={from} to={to}
            onYear={setYear} onQuarter={setQuarter}
            onFrom={setFrom} onTo={setTo}
            onApplyQuarter={applyQuarter}
            onExportCsv={onExportCsv} onPrint={onPrint} onExport1099={onExport1099}
          />
        </CardContent>
      </Card>

      <TaxKpiStrip storeId={storeId} stats={stats} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 space-y-3">
          <TaxQuarterlyTracker
            year={year}
            payouts={yearPayouts}
            estTaxPerQuarter={estPerQuarter}
            onMarkPaid={(label, amt, due) => markPaid.mutate({ label, amountCents: amt, dueDate: due })}
          />
          <TaxSalesBreakdown buckets={buckets} />
        </div>
        <div className="space-y-3">
          <TaxPayoutHistory storeId={storeId} payouts={payouts} />
          <Tax1099Prep year={year} vendors={vendors1099} />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Tax estimates are guidance only. Always confirm filings, deductions, and entity-specific rules with your CPA.
      </p>
    </div>
  );
}
