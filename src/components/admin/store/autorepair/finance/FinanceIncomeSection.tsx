/**
 * Auto Repair Finance — Income & Revenue (full dashboard).
 * Period bar, KPI strip with sparklines, trend chart, breakdowns, invoice table.
 */
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

import {
  computeIncomeKpis,
  groupIncomeSeries,
  revenueByService,
  revenueByMethod,
  topCustomers,
  incomePresetRange,
  previousIncomeRange,
  type GroupBy,
  type IncomePreset,
  type IncomeInvoiceRow,
  type IncomePaymentRow,
} from "@/lib/admin/incomeCalculations";
import { exportIncomeCsv, downloadCsv } from "@/lib/admin/incomeCsvExport";

import IncomePeriodBar from "./income/IncomePeriodBar";
import IncomeKpiStrip from "./income/IncomeKpiStrip";
import IncomeTrendChart from "./income/IncomeTrendChart";
import IncomeServiceBreakdown from "./income/IncomeServiceBreakdown";
import IncomeMethodDonut from "./income/IncomeMethodDonut";
import IncomeTopCustomers from "./income/IncomeTopCustomers";
import IncomeInvoiceTable from "./income/IncomeInvoiceTable";

interface Props { storeId: string; storeName?: string }

function fetchInvoices(storeId: string, from: string, to: string) {
  return supabase
    .from("ar_invoices" as any)
    .select("id,number,total_cents,amount_paid_cents,subtotal_cents,tax_cents,status,paid_at,created_at,customer_name,vehicle_label,items")
    .eq("store_id", storeId)
    .gte("created_at", from)
    .lte("created_at", `${to}T23:59:59`)
    .order("created_at", { ascending: false })
    .then(({ data, error }) => { if (error) throw error; return (data ?? []) as unknown as IncomeInvoiceRow[]; });
}

function fetchPayments(storeId: string, from: string, to: string) {
  return supabase
    .from("ar_invoice_payments" as any)
    .select("amount_cents,paid_at,method,invoice_id")
    .eq("store_id", storeId)
    .gte("paid_at", from)
    .lte("paid_at", `${to}T23:59:59`)
    .then(({ data, error }) => { if (error) throw error; return (data ?? []) as unknown as IncomePaymentRow[]; });
}

export default function FinanceIncomeSection({ storeId, storeName }: Props) {
  const [, setSearchParams] = useSearchParams();
  const initial = useMemo(() => incomePresetRange("month"), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [groupByMode, setGroupByMode] = useState<GroupBy>("day");
  const [compare, setCompare] = useState(false);
  const [, setPreset] = useState<IncomePreset>("month");

  const prevRange = useMemo(() => compare ? previousIncomeRange(from, to) : null, [compare, from, to]);

  const queries = useQueries({
    queries: [
      { queryKey: ["ar-income-invoices", storeId, from, to], queryFn: () => fetchInvoices(storeId, from, to), staleTime: 30_000 },
      { queryKey: ["ar-income-payments", storeId, from, to], queryFn: () => fetchPayments(storeId, from, to), staleTime: 30_000 },
      ...(prevRange ? [
        { queryKey: ["ar-income-invoices", storeId, prevRange.from, prevRange.to], queryFn: () => fetchInvoices(storeId, prevRange.from, prevRange.to), staleTime: 60_000 },
        { queryKey: ["ar-income-payments", storeId, prevRange.from, prevRange.to], queryFn: () => fetchPayments(storeId, prevRange.from, prevRange.to), staleTime: 60_000 },
      ] : []),
    ],
  });

  const loading = queries.slice(0, 2).some((q) => q.isLoading);
  const invoices = (queries[0].data ?? []) as IncomeInvoiceRow[];
  const payments = (queries[1].data ?? []) as IncomePaymentRow[];
  const prevInvoices = (prevRange ? (queries[2]?.data ?? []) : []) as IncomeInvoiceRow[];
  const prevPayments = (prevRange ? (queries[3]?.data ?? []) : []) as IncomePaymentRow[];

  const kpis = useMemo(() => computeIncomeKpis(payments, invoices), [payments, invoices]);
  const prevKpis = useMemo(() => prevRange ? computeIncomeKpis(prevPayments, prevInvoices) : null, [prevRange, prevPayments, prevInvoices]);
  const series = useMemo(() => groupIncomeSeries(payments, groupByMode), [payments, groupByMode]);
  const services = useMemo(() => revenueByService(invoices), [invoices]);
  const methods = useMemo(() => revenueByMethod(payments), [payments]);
  const customers = useMemo(() => topCustomers(invoices), [invoices]);

  const openInvoice = (id: string) => {
    setSearchParams((sp) => { sp.set("tab", "ar-invoices"); sp.set("invoice", id); return sp; });
  };

  const onExportCsv = () => {
    const csv = exportIncomeCsv({
      storeName, from, to, kpis, prev: prevKpis,
      series, services, methods, customers, invoices,
    });
    const safe = (storeName || "store").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadCsv(`income-${safe}-${from}-to-${to}.csv`, csv);
    toast.success("CSV exported");
  };
  const onPrint = () => window.print();

  const empty = !loading && invoices.length === 0 && payments.length === 0;

  return (
    <div className="space-y-3 print:space-y-2">
      <Card className="print:hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Income & Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IncomePeriodBar
            from={from} to={to} groupBy={groupByMode} compare={compare}
            onFrom={setFrom} onTo={setTo} onPreset={setPreset}
            onGroupBy={setGroupByMode} onCompare={setCompare}
            onExportCsv={onExportCsv} onPrint={onPrint}
          />
        </CardContent>
      </Card>

      {empty ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <h3 className="text-sm font-medium">No revenue activity yet</h3>
            <p className="text-xs text-muted-foreground">Create an invoice and record a payment to see your revenue analytics.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <IncomeKpiStrip kpis={kpis} prev={prevKpis} series={series} loading={loading} />

          <IncomeTrendChart series={series} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <div className="xl:col-span-2">
              <IncomeServiceBreakdown services={services} invoices={invoices} onOpenInvoice={openInvoice} />
            </div>
            <IncomeMethodDonut methods={methods} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <IncomeTopCustomers customers={customers} />
            <div className="xl:col-span-2">
              <IncomeInvoiceTable invoices={invoices} onOpenInvoice={openInvoice} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
