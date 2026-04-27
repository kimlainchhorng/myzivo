/** Find Company — browse companies and open jobs */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Building2, Briefcase, MapPin, FileText, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartBack } from "@/lib/smartBack";

type CareerCompany = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
  description: string | null;
  is_verified: boolean;
};

type CareerJob = {
  id: string;
  title: string;
  location: string | null;
  is_remote: boolean;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  applications_count: number;
  company_id: string;
  career_companies: { name: string; logo_url: string | null } | null;
};

export default function FindEmployeePage() {
  const navigate = useNavigate();
  const goBack = useSmartBack("/personal/apply-job");
  const { user } = useAuth();
  const [tab, setTab] = useState<"jobs" | "companies">("jobs");
  const [q, setQ] = useState("");
  const [companies, setCompanies] = useState<CareerCompany[]>([]);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const [cRes, jRes] = await Promise.all([
        (supabase as any).from("career_companies").select("id,name,industry,location,logo_url,description,is_verified").eq("is_active", true).order("created_at", { ascending: false }).limit(50),
        (supabase as any).from("career_jobs").select("id,title,location,is_remote,employment_type,salary_min,salary_max,salary_currency,applications_count,company_id, career_companies!inner(name,logo_url)").eq("status", "open").order("created_at", { ascending: false }).limit(50),
      ]);
      if (cancel) return;
      setCompanies(cRes.data ?? []);
      setJobs(jRes.data ?? []);
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, []);

  const filteredJobs = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return jobs;
    return jobs.filter(j =>
      j.title.toLowerCase().includes(s) ||
      (j.location ?? "").toLowerCase().includes(s) ||
      (j.career_companies?.name ?? "").toLowerCase().includes(s)
    );
  }, [q, jobs]);

  const filteredCompanies = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return companies;
    return companies.filter(c =>
      c.name.toLowerCase().includes(s) ||
      (c.industry ?? "").toLowerCase().includes(s) ||
      (c.location ?? "").toLowerCase().includes(s)
    );
  }, [q, companies]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur pt-safe">
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Find Company</h1>
        {user && (
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("/personal/my-applications")}>
            <FileText className="mr-1 h-4 w-4" /> My Apps
          </Button>
        )}
      </header>

      <div className="space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies, or location"
            className="pl-9"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <Card className="flex items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-semibold">Are you hiring?</div>
              <div className="text-xs text-muted-foreground">Post jobs as a Partner</div>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("/personal/employer")}>
            <Plus className="mr-1 h-4 w-4" /> Post
          </Button>
        </Card>

        <Tabs value={tab} onValueChange={v => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">
              <Briefcase className="mr-1 h-4 w-4" /> Open Jobs ({filteredJobs.length})
            </TabsTrigger>
            <TabsTrigger value="companies">
              <Building2 className="mr-1 h-4 w-4" /> Companies ({filteredCompanies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-3 space-y-2">
            {loading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
            {!loading && filteredJobs.length === 0 && (
              <Card className="p-6 text-center text-sm text-muted-foreground">No open jobs yet.</Card>
            )}
            {filteredJobs.map(j => (
              <Card key={j.id} className="cursor-pointer p-4 transition-colors hover:bg-accent" onClick={() => navigate(`/personal/jobs/${j.id}`)}>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {j.career_companies?.logo_url ? (
                      <img src={j.career_companies.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{j.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{j.career_companies?.name ?? "Company"}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      {(j.location || j.is_remote) && (
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{j.is_remote ? "Remote" : j.location}</span>
                      )}
                      {j.employment_type && <span className="rounded-full bg-muted px-2 py-0.5">{j.employment_type.replace("_", " ")}</span>}
                      {(j.salary_min || j.salary_max) && (
                        <span className="font-medium text-foreground">
                          {j.salary_currency ?? "USD"} {j.salary_min ?? "?"}–{j.salary_max ?? "?"}
                        </span>
                      )}
                      <span className="ml-auto">{j.applications_count} applied</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="companies" className="mt-3 space-y-2">
            {loading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
            {!loading && filteredCompanies.length === 0 && (
              <Card className="p-6 text-center text-sm text-muted-foreground">No companies yet.</Card>
            )}
            {filteredCompanies.map(c => (
              <Card key={c.id} className="cursor-pointer p-4 transition-colors hover:bg-accent" onClick={() => navigate(`/personal/companies/${c.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {c.logo_url ? <img src={c.logo_url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold">{c.name}</div>
                      {c.is_verified && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Verified</span>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{c.industry ?? "—"}{c.location ? ` · ${c.location}` : ""}</div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
