/** My job applications */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const statusColor: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-600",
  reviewed: "bg-amber-500/10 text-amber-600",
  shortlisted: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
  hired: "bg-emerald-600/10 text-emerald-700",
  withdrawn: "bg-muted text-muted-foreground",
};

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("career_applications")
        .select("id,status,created_at, career_jobs!inner(id,title, career_companies(name,logo_url))")
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });
      setApps(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">My Applications</h1>
      </header>

      <div className="space-y-2 p-4">
        {loading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
        {!loading && apps.length === 0 && (
          <Card className="space-y-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">You haven't applied to any jobs yet.</p>
            <Button onClick={() => navigate("/personal/find-employee")}>Browse Jobs</Button>
          </Card>
        )}
        {apps.map(a => (
          <Card key={a.id} className="cursor-pointer p-3 transition-colors hover:bg-accent" onClick={() => navigate(`/personal/jobs/${a.career_jobs?.id}`)}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div className="truncate text-sm font-semibold">{a.career_jobs?.title}</div>
                </div>
                <div className="ml-6 truncate text-xs text-muted-foreground">{a.career_jobs?.career_companies?.name}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[a.status] ?? "bg-muted"}`}>
                {a.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
