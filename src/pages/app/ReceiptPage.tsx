import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, MapPin, Clock, Route, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ReceiptRow {
  id: string;
  job_id: string;
  currency: string;
  subtotal: number;
  surge_multiplier: number;
  total: number;
  created_at: string;
}

interface ReceiptItem {
  id: string;
  label: string;
  amount: number;
  sort_order: number;
}

interface JobSummary {
  pickup_address: string | null;
  dropoff_address: string | null;
  status: string;
  distance_miles: number | null;
  duration_minutes: number | null;
  created_at: string;
}

export default function ReceiptPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptRow | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [job, setJob] = useState<JobSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      // Load receipt + job in parallel
      const [receiptRes, jobRes] = await Promise.all([
        supabase.from("trip_receipts").select("*").eq("job_id", jobId).single(),
        supabase.from("jobs").select("*").eq("id", jobId).single(),
      ]);

      if (receiptRes.error || !receiptRes.data) {
        setError("Receipt not found for this trip.");
        setLoading(false);
        return;
      }

      const r = receiptRes.data as any as ReceiptRow;
      setReceipt(r);

      if (jobRes.data) {
        const j = jobRes.data as any;
        setJob({
          pickup_address: j.pickup_address,
          dropoff_address: j.dropoff_address,
          status: j.status,
          distance_miles: j.distance_miles ?? j.pricing_distance_miles ?? null,
          duration_minutes: j.duration_minutes ?? j.pricing_duration_minutes ?? null,
          created_at: j.created_at,
        });
      }

      // Load items
      const { data: itemsData } = await supabase
        .from("trip_receipt_items")
        .select("*")
        .eq("receipt_id", r.id)
        .order("sort_order", { ascending: true });

      if (itemsData) setItems(itemsData as any as ReceiptItem[]);
      setLoading(false);
    };

    load();
  }, [jobId]);

  const fmt = (v: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(v);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">{error || "Receipt not found."}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const currency = receipt.currency || "USD";

  return (
    <div className="min-h-screen bg-background flex flex-col print:bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3 print:hidden">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted transition">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Trip Receipt</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-5">
        {/* Trip details */}
        {job && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="w-0.5 h-8 bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="text-sm font-medium text-foreground truncate">{job.pickup_address || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dropoff</p>
                  <p className="text-sm font-medium text-foreground truncate">{job.dropoff_address || "—"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
              {job.distance_miles != null && (
                <span className="flex items-center gap-1">
                  <Route className="w-3.5 h-3.5" />
                  {job.distance_miles.toFixed(1)} mi
                </span>
              )}
              {job.duration_minutes != null && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.round(job.duration_minutes)} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Fare breakdown */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Fare Breakdown</span>
          </div>

          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground">{fmt(item.amount, currency)}</span>
              </div>
            ))}

            {items.length === 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{fmt(receipt.subtotal, currency)}</span>
              </div>
            )}

            {receipt.surge_multiplier > 1 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Surge ({receipt.surge_multiplier.toFixed(2)}×)</span>
                <span>applied</span>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-3 border-t border-border font-bold text-lg">
            <span className="text-foreground">Total</span>
            <span className="text-primary">{fmt(receipt.total, currency)}</span>
          </div>
        </div>

        {/* Download / Share */}
        <Button onClick={handlePrint} variant="outline" className="w-full gap-2 print:hidden">
          <Download className="w-4 h-4" />
          Download / Print Receipt
        </Button>
      </div>
    </div>
  );
}
