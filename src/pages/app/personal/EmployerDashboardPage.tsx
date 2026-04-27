/** Employer dashboard — partner accounts manage their company + post/manage jobs */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Building2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSmartBack } from "@/lib/smartBack";

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const goBack = useSmartBack("/personal");
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Company create form
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [creatingCo, setCreatingCo] = useState(false);

  // Job create form
  const [showJobForm, setShowJobForm] = useState(false);
  const [jTitle, setJTitle] = useState("");
  const [jDesc, setJDesc] = useState("");
  const [jLoc, setJLoc] = useState("");
  const [jRemote, setJRemote] = useState(false);
  const [jType, setJType] = useState("full_time");
  const [jSalMin, setJSalMin] = useState("");
  const [jSalMax, setJSalMax] = useState("");
  const [creatingJob, setCreatingJob] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: co } = await (supabase as any).from("career_companies").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setCompany(co);
      if (co) {
        const { data: js } = await (supabase as any).from("career_jobs").select("*, career_applications(count)").eq("company_id", co.id).order("created_at", { ascending: false });
        setJobs(js ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  const createCompany = async () => {
    if (!user) return;
    if (!name.trim()) return toast.error("Name required.");
    setCreatingCo(true);
    const { data, error } = await (supabase as any).from("career_companies").insert({
      owner_id: user.id,
      name: name.trim(),
      industry: industry.trim() || null,
      location: location.trim() || null,
      website: website.trim() || null,
      description: description.trim() || null,
    }).select("*").maybeSingle();
    setCreatingCo(false);
    if (error) {
      if (error.message?.includes("row-level security")) {
        toast.error("Only Partner accounts can create a company.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    setCompany(data);
    toast.success("Company created!");
  };

  const createJob = async () => {
    if (!user || !company) return;
    if (!jTitle.trim()) return toast.error("Title required.");
    setCreatingJob(true);
    const { data, error } = await (supabase as any).from("career_jobs").insert({
      company_id: company.id,
      posted_by: user.id,
      title: jTitle.trim(),
      description: jDesc.trim() || null,
      location: jLoc.trim() || null,
      is_remote: jRemote,
      employment_type: jType,
      salary_min: jSalMin ? Number(jSalMin) : null,
      salary_max: jSalMax ? Number(jSalMax) : null,
    }).select("*").maybeSingle();
    setCreatingJob(false);
    if (error) { toast.error(error.message); return; }
    setJobs([data, ...jobs]);
    setShowJobForm(false);
    setJTitle(""); setJDesc(""); setJLoc(""); setJSalMin(""); setJSalMax("");
    toast.success("Job posted!");
  };

  const toggleJobStatus = async (j: any) => {
    const next = j.status === "open" ? "closed" : "open";
    const { error } = await (supabase as any).from("career_jobs").update({ status: next }).eq("id", j.id);
    if (error) return toast.error(error.message);
    setJobs(jobs.map(x => x.id === j.id ? { ...x, status: next } : x));
  };

  if (loading) return <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur pt-safe">
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Employer Hub</h1>
      </header>

      <div className="space-y-4 p-4">
        {!company ? (
          <Card className="space-y-3 p-4">
            <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-emerald-500" /><h2 className="font-semibold">Create your company</h2></div>
            <p className="text-xs text-muted-foreground">Only Partner (business) accounts can publish a company. Contact support if you need partner access.</p>
            <Input placeholder="Company name *" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Industry" value={industry} onChange={e => setIndustry(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
            <Input placeholder="Website" value={website} onChange={e => setWebsite(e.target.value)} />
            <Textarea placeholder="Short description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            <Button className="w-full" onClick={createCompany} disabled={creatingCo}>{creatingCo ? "Creating…" : "Create Company"}</Button>
          </Card>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  {company.logo_url ? <img src={company.logo_url} alt="" className="h-full w-full rounded-lg object-cover" /> : <Building2 className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold">{company.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{company.industry ?? "—"}{company.location ? ` · ${company.location}` : ""}</div>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your Jobs ({jobs.length})</h3>
              <Button size="sm" onClick={() => setShowJobForm(s => !s)}>
                <Plus className="mr-1 h-4 w-4" /> {showJobForm ? "Cancel" : "Post Job"}
              </Button>
            </div>

            {showJobForm && (
              <Card className="space-y-2 p-4">
                <Input placeholder="Job title *" value={jTitle} onChange={e => setJTitle(e.target.value)} />
                <Textarea placeholder="Description" value={jDesc} onChange={e => setJDesc(e.target.value)} rows={4} />
                <Input placeholder="Location" value={jLoc} onChange={e => setJLoc(e.target.value)} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={jRemote} onChange={e => setJRemote(e.target.checked)} /> Remote
                </label>
                <select value={jType} onChange={e => setJType(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="full_time">Full time</option>
                  <option value="part_time">Part time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Salary min" type="number" value={jSalMin} onChange={e => setJSalMin(e.target.value)} />
                  <Input placeholder="Salary max" type="number" value={jSalMax} onChange={e => setJSalMax(e.target.value)} />
                </div>
                <Button className="w-full" onClick={createJob} disabled={creatingJob}>{creatingJob ? "Posting…" : "Post Job"}</Button>
              </Card>
            )}

            <div className="space-y-2">
              {jobs.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">No jobs yet.</Card>}
              {jobs.map(j => (
                <Card key={j.id} className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/personal/jobs/${j.id}`)}>
                      <div className="truncate text-sm font-semibold">{j.title}</div>
                      <div className="text-xs text-muted-foreground">{j.applications_count ?? 0} applicants · {j.status}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/personal/employer/jobs/${j.id}/applicants`)}>
                      <Users className="mr-1 h-4 w-4" /> View
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleJobStatus(j)}>
                      {j.status === "open" ? "Close" : "Reopen"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
