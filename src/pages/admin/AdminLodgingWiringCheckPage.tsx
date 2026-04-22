/**
 * AdminLodgingWiringCheckPage
 * End-to-end wiring check for the lodging booking workflow.
 * Calls `lodging_wiring_report()` (admin-only RPC) and renders pass/fail per check
 * with copyable SQL fixes and links to related dashboards.
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, RefreshCw, CheckCircle2, XCircle, Copy, ExternalLink,
  Database, Radio, Link as LinkIcon, Layers, Columns, Wrench, Activity,
} from "lucide-react";
import { toast } from "sonner";

type Check = {
  group: string;
  name: string;
  pass: boolean;
  fix: string;
};

type Report = {
  generated_at: string;
  reservations_count: number;
  audit_count: number;
  checks: Check[];
};

const SUPABASE_PROJECT = "slirphzzwcogdbkeicff";
const groupIcon: Record<string, typeof Database> = {
  RLS: Database,
  Realtime: Radio,
  "Foreign keys": LinkIcon,
  Indexes: Layers,
  Schema: Columns,
  Triggers: Wrench,
};

export default function AdminLodgingWiringCheckPage() {
  const navigate = useNavigate();

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["lodging-wiring-report"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("lodging_wiring_report" as any);
      if (error) throw error;
      return data as unknown as Report;
    },
  });

  const grouped = useMemo(() => {
    const out = new Map<string, Check[]>();
    (data?.checks || []).forEach((c) => {
      if (!out.has(c.group)) out.set(c.group, []);
      out.get(c.group)!.push(c);
    });
    return Array.from(out.entries());
  }, [data]);

  const totals = useMemo(() => {
    const checks = data?.checks || [];
    return {
      total: checks.length,
      pass: checks.filter((c) => c.pass).length,
      fail: checks.filter((c) => !c.pass).length,
    };
  }, [data]);

  const allPass = totals.fail === 0 && totals.total > 0;

  const copyFix = (sql: string) => {
    navigator.clipboard.writeText(sql);
    toast.success("Fix copied to clipboard");
  };

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Lodging wiring check
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Verifies RLS, realtime, foreign keys, indexes, and required schema for the booking workflow.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Re-run
        </Button>
      </div>

      {/* Summary */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-4">
          {isLoading ? (
            <p className="text-[12px] text-muted-foreground">Running checks…</p>
          ) : error ? (
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-destructive">
                  Couldn't load wiring report
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {(error as Error).message} — admin role required.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                {allPass ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {allPass ? "All wired correctly" : `${totals.fail} check${totals.fail === 1 ? "" : "s"} failing`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {totals.pass}/{totals.total} pass · {data?.reservations_count ?? 0} reservations · {data?.audit_count ?? 0} audit rows
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  {totals.pass} pass
                </Badge>
                {totals.fail > 0 && (
                  <Badge variant="outline" className="rounded-full text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                    {totals.fail} fail
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/database/publications`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border border-border bg-background hover:bg-accent transition"
        >
          <Radio className="h-3 w-3" /> Realtime publications <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/database/tables`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border border-border bg-background hover:bg-accent transition"
        >
          <Database className="h-3 w-3" /> Tables <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/functions`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border border-border bg-background hover:bg-accent transition"
        >
          <Wrench className="h-3 w-3" /> Edge functions <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/sql/new`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border border-border bg-background hover:bg-accent transition"
        >
          <Database className="h-3 w-3" /> SQL editor <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Grouped checks */}
      <div className="space-y-3">
        {grouped.map(([group, items]) => {
          const Icon = groupIcon[group] || Database;
          const groupFail = items.filter((i) => !i.pass).length;
          return (
            <Card key={group} className="rounded-2xl border-border/60">
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {group}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`rounded-full text-[10px] ${
                    groupFail === 0
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-destructive/10 text-destructive border-destructive/30"
                  }`}
                >
                  {groupFail === 0 ? "OK" : `${groupFail} failing`}
                </Badge>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {items.map((c) => (
                  <div
                    key={c.name}
                    className={`rounded-xl border p-2.5 ${
                      c.pass
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        {c.pass ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                        )}
                        <p className="text-[12px] font-medium text-foreground break-words">
                          {c.name}
                        </p>
                      </div>
                      {!c.pass && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyFix(c.fix)}
                          className="h-6 px-2 rounded-lg text-[10px]"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy fix
                        </Button>
                      )}
                    </div>
                    {!c.pass && (
                      <pre className="mt-2 text-[10px] bg-muted/50 rounded-lg p-2 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
                        {c.fix}
                      </pre>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data?.generated_at && (
        <p className="text-[10px] text-muted-foreground text-center">
          Generated {new Date(data.generated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
