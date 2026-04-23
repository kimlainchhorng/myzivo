import { FileText, Loader2, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReceiptHistoryItem {
  id: string;
  filename: string;
  created_at: string;
  reservation_number?: string | null;
}

interface Props {
  reservationId: string;
  receipts: ReceiptHistoryItem[];
}

export default function ReceiptHistoryCard({ reservationId, receipts }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const redownload = async (receipt: ReceiptHistoryItem) => {
    setLoadingId(receipt.id);
    const { data, error } = await supabase.functions.invoke("lodging-reservation-receipt", {
      body: { reservation_id: reservationId, receipt_id: receipt.id },
    });
    setLoadingId(null);
    if (error || !data) {
      toast.error(error?.message || "Could not re-download receipt");
      return;
    }
    const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = receipt.filename || `ZIVO-reservation-${receipt.reservation_number || "receipt"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Receipt history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!receipts.length ? (
          <p className="text-sm text-muted-foreground">No receipts downloaded yet.</p>
        ) : receipts.map((receipt) => (
          <div key={receipt.id} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{receipt.filename}</p>
              <p className="text-xs text-muted-foreground">{format(parseISO(receipt.created_at), "MMM d, yyyy h:mm a")}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => redownload(receipt)} disabled={loadingId === receipt.id}>
              {loadingId === receipt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Re-download
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
