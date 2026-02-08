/**
 * ZIVO Eats — Receipt Page
 * Print-friendly full-page receipt view
 */
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLiveEatsOrder } from "@/hooks/useLiveEatsOrder";
import { OrderReceipt } from "@/components/eats/OrderReceipt";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/SEOHead";

export default function EatsReceipt() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { order, loading, error } = useLiveEatsOrder(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <Skeleton className="max-w-md mx-auto h-[600px] rounded-2xl bg-zinc-800" />
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Receipt not found</p>
          <button
            onClick={() => navigate("/eats/orders")}
            className="text-orange-500 font-medium"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 print:bg-white">
      <SEOHead title="Receipt — ZIVO Eats" description="Your order receipt" />

      {/* Header (hidden in print) */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 print:hidden">
        <div className="flex items-center justify-between px-6 py-4 max-w-md mx-auto">
          <button
            onClick={() => navigate(`/eats/orders/${id}`)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-white">Receipt</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Receipt */}
      <div className="p-6 print:p-0">
        <div className="max-w-md mx-auto">
          <OrderReceipt order={order} />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:bg-transparent {
            background-color: transparent !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
