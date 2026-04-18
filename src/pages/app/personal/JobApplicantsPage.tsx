/** Employer view: applicants for a single job */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STATUSES = ["submitted", "reviewed", "shortlisted", "rejected", "hired"] as const;

export default function JobApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: j }, { data: a }] = await Promise.all([
        (supabase as any).from("career_jobs").select("id,title").eq("id", id).maybeSingle(),
        (supabase as any).from("career_applications").select("*").eq("job_id", id).order("created_at", { ascending: false }),
      ]);
      setJob(j);
      setApps(a ?? []);
      setLoading(false);
    })();
  }, [id]);

  const setStatus = async (appId: string, status: string) => {
    const { error } = await (supabase as any).from("career_applications").update({ status, reviewed_at: new Date().toISOString() }).eq("id", appId);
    if (error) return toast.error(error.message);
    setApps(apps.map(a => a.id === appId ? { ...a, status } : a));
  };

  const downloadResume = async (path: string) => {
    const { data, error } = await supabase.storage.from("job-resumes").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) return toast.error("Could not get resume.");
    window.open(data.signedUrl, "_blank");
  };

  if (loading) return <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="truncate text-lg font-bold">Applicants — {job?.title}</h1>
      </header>

      <div className="space-y-2 p-4">
        {apps.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">No applicants yet.</Card>}
        {apps.map(a => (
          <Card key={a.id} className="space-y-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{a.applicant_email ?? "Applicant"}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{a.status}</span>
            </div>
            {a.cover_note && <p className="whitespace-pre-wrap text-xs text-muted-foreground">{a.cover_note}</p>}
            <div className="flex flex-wrap items-center gap-2">
              {a.resume_url && (
                <Button size="sm" variant="outline" onClick={() => downloadResume(a.resume_url)}>
                  <Download className="mr-1 h-4 w-4" /> Resume
                </Button>
              )}
              {a.applicant_email && (
                <a href={`mailto:${a.applicant_email}`} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-accent">
                  <Mail className="h-3 w-3" /> Email
                </a>
              )}
              <select
                value={a.status}
                onChange={e => setStatus(a.id, e.target.value)}
                className="ml-auto rounded-md border bg-background px-2 py-1 text-xs"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
