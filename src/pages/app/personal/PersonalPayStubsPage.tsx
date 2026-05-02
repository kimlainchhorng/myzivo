import { useState } from "react";
import { ArrowLeft, FileText, Download, ChevronDown, ChevronUp, Wallet, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/app/AppLayout";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EarningsPeriod {
  id: string;
  period: string;
  issued: string;
  gross: number;
  transactions: { description: string | null; amount: number; date: string }[];
}

function groupByMonth(
  rows: { id: string; amount_cents: number; created_at: string | null; description: string | null }[]
): EarningsPeriod[] {
  const map = new Map<string, EarningsPeriod>();

  for (const row of rows) {
    const date = row.created_at ? new Date(row.created_at) : new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleString("default", { month: "long", year: "numeric" });
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const period = `${monthLabel.split(" ")[0]} 1 – ${monthLabel.split(" ")[0]} ${lastDay.getDate()}, ${date.getFullYear()}`;

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        period,
        issued: lastDay.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        gross: 0,
        transactions: [],
      });
    }

    const entry = map.get(key)!;
    entry.gross += row.amount_cents / 100;
    entry.transactions.push({
      description: row.description,
      amount: row.amount_cents / 100,
      date: row.created_at
        ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "",
    });
  }

  return [...map.values()].sort((a, b) => b.id.localeCompare(a.id));
}

export default function PersonalPayStubsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ["personal-pay-stubs", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("customer_wallet_transactions")
        .select("id, amount_cents, created_at, description")
        .eq("user_id", user!.id)
        .gt("amount_cents", 0)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return groupByMonth(data || []);
    },
    enabled: !!user,
  });

  const ytdGross = periods.reduce((s, p) => s + p.gross, 0);

  const downloadPeriod = (p: EarningsPeriod) => {
    const lines = [
      "ZIVO EARNINGS SUMMARY",
      `Period: ${p.period}`,
      `Issued: ${p.issued}`,
      "---",
      ...p.transactions.map((t) => `${t.date}  ${t.description || "Credit"}  +$${t.amount.toFixed(2)}`),
      "---",
      `TOTAL:  $${p.gross.toFixed(2)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-${p.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Earnings summary downloaded");
  };

  return (
    <AppLayout title="Pay Stubs" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24 space-y-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-[17px]">Earnings History</h1>
        </div>

        {/* YTD summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto" />
            ) : (
              <p className="text-xl font-black text-emerald-600">${ytdGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            )}
            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">YTD Credits</p>
          </div>
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
            ) : (
              <p className="text-xl font-black text-primary">{periods.length}</p>
            )}
            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Pay Periods</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Earnings History</p>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : periods.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border/40 p-8 text-center">
              <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-foreground">No earnings yet</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Wallet credits and earnings will appear here as you use ZIVO.
              </p>
            </div>
          ) : (
            periods.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-card border border-border/40 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-4"
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-foreground">{p.period}</p>
                      <p className="text-[11px] text-muted-foreground">Issued {p.issued}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
                      ${p.gross.toFixed(2)}
                    </Badge>
                    {expanded === p.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expanded === p.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 space-y-2 border-t border-border/30"
                    >
                      <div className="pt-3 space-y-2">
                        {p.transactions.map((t, j) => (
                          <div key={j} className="flex items-center justify-between">
                            <span className="text-[12px] text-muted-foreground">
                              {t.date} · {t.description || "Credit"}
                            </span>
                            <span className="text-[12px] font-bold text-emerald-600">+${t.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          <span className="text-[13px] font-bold text-foreground">Total</span>
                          <span className="text-[13px] font-black text-emerald-600">${p.gross.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadPeriod(p)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-[12px] font-bold text-foreground"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Summary
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
