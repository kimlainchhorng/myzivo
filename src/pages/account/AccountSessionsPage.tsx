import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert, LogOut, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { getDeviceFingerprint } from "@/lib/security/deviceFingerprint";

type LoginRow = {
  id: string;
  device_fingerprint: string | null;
  success: boolean;
  blocked_before_attempt: boolean;
  risk_score: number;
  risk_labels: string[];
  created_at: string;
};

export default function AccountSessionsPage() {
  const queryClient = useQueryClient();
  const thisDeviceFp = useMemo<string | null>(() => {
    try { return getDeviceFingerprint(); } catch { return null; }
  }, []);

  const list = useQuery({
    queryKey: ["my-recent-logins"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("list_my_recent_logins", {
        _limit: 50, _hours: 24 * 30,
      });
      if (error) throw error;
      return (data || []) as LoginRow[];
    },
  });

  const signOutOthers = useMutation({
    mutationFn: async () => {
      // Supabase v2: scope 'others' revokes all sessions except this one.
      const { error } = await (supabase.auth as any).signOut({ scope: "others" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Signed out from all other devices");
      queryClient.invalidateQueries({ queryKey: ["my-recent-logins"] });
    },
    onError: (e: any) => toast.error(e?.message || "Sign-out failed"),
  });

  const rows = list.data || [];
  const stats = useMemo(() => {
    const successes = rows.filter((r) => r.success).length;
    const failures  = rows.filter((r) => !r.success).length;
    const distinctDevices = new Set(
      rows.filter((r) => r.success && r.device_fingerprint).map((r) => r.device_fingerprint)
    ).size;
    return { successes, failures, distinctDevices };
  }, [rows]);

  const fpShort = (fp: string | null) => (fp ? `${fp.slice(0, 12)}…` : "unknown");

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-3 pb-24 sm:p-4 lg:p-6">
      <SEOHead title="Active sessions" description="See where you're signed in and revoke other sessions." />
      <header className="flex items-center gap-2">
        <Link to="/account" className="rounded-full p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Active sessions</h1>
          <p className="text-sm text-muted-foreground">Recent sign-ins to your account.</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Successful sign-ins</p>
          <p className="text-2xl font-semibold text-emerald-600">{stats.successes}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Failed attempts</p>
          <p className={`text-2xl font-semibold ${stats.failures > 0 ? "text-red-600" : ""}`}>{stats.failures}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Distinct devices</p>
          <p className="text-2xl font-semibold">{stats.distinctDevices}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-orange-600" />
            Sign out from all other devices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you see a sign-in you don&apos;t recognize, sign out everywhere else and change your password from{" "}
            <Link to="/account/security" className="underline">Security</Link>.
          </p>
          <Button
            variant="destructive"
            className="gap-2"
            disabled={signOutOthers.isPending}
            onClick={() => signOutOthers.mutate()}
          >
            {signOutOthers.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out other sessions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm">Recent activity (last 30 days)</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => list.refetch()} className="gap-1">
            <RefreshCw className={`h-4 w-4 ${list.isFetching ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {list.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!list.isLoading && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">No recorded sign-ins.</p>
          )}
          {rows.map((r) => {
            const isThis = thisDeviceFp && r.device_fingerprint === thisDeviceFp;
            return (
              <div
                key={r.id}
                className={`rounded-md border p-3 text-sm ${isThis ? "border-emerald-500/60 bg-emerald-500/5" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {r.success
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    : <XCircle className="h-4 w-4 text-red-600" />}
                  <span className="text-xs font-medium">
                    {r.success ? "Success" : "Failed"}
                  </span>
                  {isThis && <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-400/40">This device</Badge>}
                  {r.blocked_before_attempt && <Badge variant="outline" className="text-orange-700">blocked early</Badge>}
                  {r.risk_score >= 50 && (
                    <Badge variant="outline" className="text-red-700">risk {r.risk_score}</Badge>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  device: {fpShort(r.device_fingerprint)}
                </p>
                {r.risk_labels.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.risk_labels.map((l) => (
                      <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </main>
  );
}
