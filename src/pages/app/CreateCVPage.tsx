/**
 * CreateCVPage — Professional CV/Resume builder with Supabase persistence.
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, User, Briefcase, GraduationCap,
  Wrench, Globe, Award, Save, FileText, Link2, Linkedin,
  Heart, Users, ChevronDown, ChevronUp, Loader2, Check,
  Star, MapPin, Mail, Phone, Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/app/AppLayout";
import { toast } from "sonner";

/* ── Types ────────────────────────────────────────── */
interface WorkExperience {
  id: string; company: string; position: string;
  startDate: string; endDate: string; current: boolean; description: string;
}
interface Education {
  id: string; school: string; degree: string;
  field: string; startDate: string; endDate: string; gpa: string;
}
interface Certification {
  id: string; name: string; issuer: string; date: string; url: string;
}
interface Reference {
  id: string; name: string; position: string; company: string; phone: string; email: string;
}
interface SkillItem { id: string; name: string; level: string; }
interface LangItem { id: string; name: string; proficiency: string; }

const uid = () => crypto.randomUUID();

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const LANG_LEVELS = ["Basic", "Conversational", "Fluent", "Native"];

/* ── Component ────────────────────────────────────── */
const CreateCVPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Personal info
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [summary, setSummary] = useState("");

  // Sections
  const [experiences, setExperiences] = useState<WorkExperience[]>([
    { id: uid(), company: "", position: "", startDate: "", endDate: "", current: false, description: "" },
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" },
  ]);
  const [skills, setSkills] = useState<SkillItem[]>([
    { id: uid(), name: "", level: "Intermediate" },
  ]);
  const [languages, setLanguages] = useState<LangItem[]>([
    { id: uid(), name: "", proficiency: "Conversational" },
  ]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [hobbies, setHobbies] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cvId, setCvId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true, experience: true, education: true, skills: true,
    languages: true, certifications: false, references: false, hobbies: false,
  });
  const [completionPct, setCompletionPct] = useState(0);

  /* ── Load existing CV ────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("user_cvs")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setCvId(data.id);
        setFullName(data.full_name || "");
        setJobTitle((data as any).job_title || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setWebsite((data as any).website || "");
        setLinkedin((data as any).linkedin || "");
        setPortfolio((data as any).portfolio || "");
        setSummary(data.summary || "");
        if (Array.isArray(data.experiences) && data.experiences.length) setExperiences(data.experiences as any);
        if (Array.isArray(data.educations) && data.educations.length) setEducations(data.educations as any);
        if (Array.isArray(data.skills) && data.skills.length) setSkills(data.skills as any);
        if (Array.isArray(data.languages) && data.languages.length) setLanguages(data.languages as any);
        if (Array.isArray(data.certifications) && data.certifications.length) setCertifications(data.certifications as any);
        if (Array.isArray((data as any).references_list) && (data as any).references_list.length) setReferences((data as any).references_list as any);
        setHobbies((data as any).hobbies || "");
      }
      setLoading(false);
    };
    void load();
  }, [user]);

  /* ── Completion calculation ──────────────────────── */
  useEffect(() => {
    let filled = 0;
    let total = 8;
    if (fullName.trim()) filled++;
    if (email.trim()) filled++;
    if (phone.trim()) filled++;
    if (summary.trim()) filled++;
    if (experiences.some(e => e.position.trim())) filled++;
    if (educations.some(e => e.school.trim())) filled++;
    if (skills.some(s => s.name.trim())) filled++;
    if (languages.some(l => l.name.trim())) filled++;
    setCompletionPct(Math.round((filled / total) * 100));
  }, [fullName, email, phone, summary, experiences, educations, skills, languages]);

  /* ── Save ────────────────────────────────────────── */
  const handleSave = useCallback(async () => {
    if (!user) return;
    if (!fullName.trim()) { toast.error("Please enter your full name"); return; }
    setSaving(true);
    const payload = {
      user_id: user.id,
      full_name: fullName.trim(),
      job_title: jobTitle.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      website: website.trim(),
      linkedin: linkedin.trim(),
      portfolio: portfolio.trim(),
      summary: summary.trim(),
      experiences, educations, skills, languages, certifications,
      references_list: references,
      hobbies: hobbies.trim(),
      is_primary: true,
    };
    let error;
    if (cvId) {
      ({ error } = await supabase.from("user_cvs").update(payload).eq("id", cvId));
    } else {
      const res = await supabase.from("user_cvs").insert(payload).select("id").single();
      error = res.error;
      if (res.data) setCvId(res.data.id);
    }
    setSaving(false);
    if (error) { toast.error("Failed to save CV"); console.error(error); }
    else toast.success("CV saved successfully!");
  }, [user, cvId, fullName, jobTitle, email, phone, location, website, linkedin, portfolio, summary, experiences, educations, skills, languages, certifications, references, hobbies]);

  /* ── Helpers ─────────────────────────────────────── */
  const toggle = (key: string) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  const updateExp = (id: string, field: keyof WorkExperience, value: any) =>
    setExperiences(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));
  const updateEdu = (id: string, field: keyof Education, value: string) =>
    setEducations(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));
  const updateSkill = (id: string, field: keyof SkillItem, value: string) =>
    setSkills(p => p.map(s => s.id === id ? { ...s, [field]: value } : s));
  const updateLang = (id: string, field: keyof LangItem, value: string) =>
    setLanguages(p => p.map(l => l.id === id ? { ...l, [field]: value } : l));
  const updateCert = (id: string, field: keyof Certification, value: string) =>
    setCertifications(p => p.map(c => c.id === id ? { ...c, [field]: value } : c));
  const updateRef = (id: string, field: keyof Reference, value: string) =>
    setReferences(p => p.map(r => r.id === id ? { ...r, [field]: value } : r));

  const inputCls = "w-full px-2.5 py-2 rounded-lg border border-border/50 bg-background text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";
  const lblCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";
  const cardCls = "relative rounded-lg border border-border/30 bg-muted/15 p-2.5 space-y-2";

  if (loading) {
    return (
      <AppLayout title="Create CV" hideHeader>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Create CV" hideHeader>
      <div className="flex flex-col px-3.5 pt-2.5 pb-24">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center touch-manipulation active:scale-90 transition-transform">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-[15px]">Create CV</h1>
            <p className="text-[10px] text-muted-foreground">Professional resume builder</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold touch-manipulation active:scale-95 transition-transform flex items-center gap-1 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {/* Completion bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-muted-foreground">Profile completeness</span>
            <span className="text-[10px] font-bold text-primary">{completionPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* ── PERSONAL INFO ── */}
        <SectionHeader icon={User} title="Personal Information" sectionKey="personal" expanded={expandedSections.personal} onToggle={toggle} />
        <AnimatePresence>
          {expandedSections.personal && (
            <CollapseWrap>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className={lblCls}>Full Name *</label>
                    <input className={inputCls} placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className={lblCls}>Job Title / Headline</label>
                    <input className={inputCls} placeholder="Senior Software Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                  </div>
                  <div><label className={lblCls}>Email</label><input className={inputCls} placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  <div><label className={lblCls}>Phone</label><input className={inputCls} placeholder="+1 234 567 890" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                  <div className="col-span-2"><label className={lblCls}>Location</label><input className={inputCls} placeholder="Phnom Penh, Cambodia" value={location} onChange={e => setLocation(e.target.value)} /></div>
                  <div className="col-span-2"><label className={lblCls}>LinkedIn</label><input className={inputCls} placeholder="linkedin.com/in/yourname" value={linkedin} onChange={e => setLinkedin(e.target.value)} /></div>
                  <div><label className={lblCls}>Website</label><input className={inputCls} placeholder="yoursite.com" value={website} onChange={e => setWebsite(e.target.value)} /></div>
                  <div><label className={lblCls}>Portfolio</label><input className={inputCls} placeholder="portfolio.com" value={portfolio} onChange={e => setPortfolio(e.target.value)} /></div>
                </div>
                <div>
                  <label className={lblCls}>Professional Summary</label>
                  <textarea className={cn(inputCls, "min-h-[56px] resize-none")} placeholder="Experienced professional with expertise in..." value={summary} onChange={e => setSummary(e.target.value)} />
                </div>
              </div>
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* ── EXPERIENCE ── */}
        <SectionHeader icon={Briefcase} title="Work Experience" sectionKey="experience" expanded={expandedSections.experience} onToggle={toggle} count={experiences.filter(e => e.position).length} />
        <AnimatePresence>
          {expandedSections.experience && (
            <CollapseWrap>
              <div className="space-y-2.5">
                {experiences.map(exp => (
                  <div key={exp.id} className={cardCls}>
                    {experiences.length > 1 && <DelBtn onClick={() => setExperiences(p => p.filter(e => e.id !== exp.id))} />}
                    <div><label className={lblCls}>Position</label><input className={inputCls} placeholder="Software Engineer" value={exp.position} onChange={e => updateExp(exp.id, "position", e.target.value)} /></div>
                    <div><label className={lblCls}>Company</label><input className={inputCls} placeholder="Company Name" value={exp.company} onChange={e => updateExp(exp.id, "company", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lblCls}>Start</label><input type="month" className={inputCls} value={exp.startDate} onChange={e => updateExp(exp.id, "startDate", e.target.value)} /></div>
                      <div>
                        <label className={lblCls}>End</label>
                        <input type="month" className={inputCls} disabled={exp.current} value={exp.current ? "" : exp.endDate} onChange={e => updateExp(exp.id, "endDate", e.target.value)} />
                      </div>
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={exp.current} onChange={e => updateExp(exp.id, "current", e.target.checked)} className="rounded border-border" />
                      Currently working here
                    </label>
                    <div><label className={lblCls}>Description</label><textarea className={cn(inputCls, "min-h-[44px] resize-none")} placeholder="Key achievements..." value={exp.description} onChange={e => updateExp(exp.id, "description", e.target.value)} /></div>
                  </div>
                ))}
                <AddBtn label="Add Experience" onClick={() => setExperiences(p => [...p, { id: uid(), company: "", position: "", startDate: "", endDate: "", current: false, description: "" }])} />
              </div>
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* ── EDUCATION ── */}
        <SectionHeader icon={GraduationCap} title="Education" sectionKey="education" expanded={expandedSections.education} onToggle={toggle} count={educations.filter(e => e.school).length} />
        <AnimatePresence>
          {expandedSections.education && (
            <CollapseWrap>
              <div className="space-y-2.5">
                {educations.map(edu => (
                  <div key={edu.id} className={cardCls}>
                    {educations.length > 1 && <DelBtn onClick={() => setEducations(p => p.filter(e => e.id !== edu.id))} />}
                    <div><label className={lblCls}>School / University</label><input className={inputCls} placeholder="University Name" value={edu.school} onChange={e => updateEdu(edu.id, "school", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lblCls}>Degree</label><input className={inputCls} placeholder="Bachelor's" value={edu.degree} onChange={e => updateEdu(edu.id, "degree", e.target.value)} /></div>
                      <div><label className={lblCls}>Field</label><input className={inputCls} placeholder="Computer Science" value={edu.field} onChange={e => updateEdu(edu.id, "field", e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><label className={lblCls}>Start</label><input type="month" className={inputCls} value={edu.startDate} onChange={e => updateEdu(edu.id, "startDate", e.target.value)} /></div>
                      <div><label className={lblCls}>End</label><input type="month" className={inputCls} value={edu.endDate} onChange={e => updateEdu(edu.id, "endDate", e.target.value)} /></div>
                      <div><label className={lblCls}>GPA</label><input className={inputCls} placeholder="3.8" value={edu.gpa} onChange={e => updateEdu(edu.id, "gpa", e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <AddBtn label="Add Education" onClick={() => setEducations(p => [...p, { id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" }])} />
              </div>
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* ── SKILLS ── */}
        <SectionHeader icon={Wrench} title="Skills" sectionKey="skills" expanded={expandedSections.skills} onToggle={toggle} count={skills.filter(s => s.name).length} />
        <AnimatePresence>
          {expandedSections.skills && (
            <CollapseWrap>
              <div className="space-y-2">
                {skills.map(sk => (
                  <div key={sk.id} className="flex items-center gap-2">
                    <input className={cn(inputCls, "flex-1")} placeholder="e.g. React, Python" value={sk.name} onChange={e => updateSkill(sk.id, "name", e.target.value)} />
                    <select className={cn(inputCls, "w-[100px]")} value={sk.level} onChange={e => updateSkill(sk.id, "level", e.target.value)}>
                      {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {skills.length > 1 && (
                      <button onClick={() => setSkills(p => p.filter(s => s.id !== sk.id))} className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0"><Trash2 className="w-2.5 h-2.5 text-destructive" /></button>
                    )}
                  </div>
                ))}
                <AddBtn label="Add Skill" onClick={() => setSkills(p => [...p, { id: uid(), name: "", level: "Intermediate" }])} />
              </div>
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* ── LANGUAGES ── */}
        <SectionHeader icon={Globe} title="Languages" sectionKey="languages" expanded={expandedSections.languages} onToggle={toggle} count={languages.filter(l => l.name).length} />
        <AnimatePresence>
          {expandedSections.languages && (
            <CollapseWrap>
              <div className="space-y-2">
                {languages.map(lg => (
                  <div key={lg.id} className="flex items-center gap-2">
                    <input className={cn(inputCls, "flex-1")} placeholder="e.g. English, Khmer" value={lg.name} onChange={e => updateLang(lg.id, "name", e.target.value)} />
                    <select className={cn(inputCls, "w-[110px]")} value={lg.proficiency} onChange={e => updateLang(lg.id, "proficiency", e.target.value)}>
                      {LANG_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {languages.length > 1 && (
                      <button onClick={() => setLanguages(p => p.filter(l => l.id !== lg.id))} className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0"><Trash2 className="w-2.5 h-2.5 text-destructive" /></button>
                    )}
                  </div>
                ))}
                <AddBtn label="Add Language" onClick={() => setLanguages(p => [...p, { id: uid(), name: "", proficiency: "Conversational" }])} />
              </div>
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* ── CERTIFICATIONS ── */}
        <SectionHeader icon={Award} title="Certifications" sectionKey="certifications" expanded={expandedSections.certifications} onToggle={toggle} count={certifications.filter(c => c.name).length} />
        <AnimatePresence>
          {expandedSections.certifications && (
            <CollapseWrap>
              <div className="space-y-2.5">
                {certifications.map(cert => (
                  <div key={cert.id} className={cardCls}>
                    <DelBtn onClick={() => setCertifications(p => p.filter(c => c.id !== cert.id))} />
                    <div><label className={lblCls}>Certification Name</label><input className={inputCls} placeholder="AWS Solutions Architect" value={cert.name} onChange={e => updateCert(cert.id, "name", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lblCls}>Issuer</label><input className={inputCls} placeholder="Amazon" value={cert.issuer} onChange={e => updateCert(cert.id, "issuer", e.target.value)} /></div>
                      <div><label className={lblCls}>Date</label><input type="month" className={inputCls} value={cert.date} onChange={e => updateCert(cert.id, "date", e.target.value)} /></div>
                    </div>
                    <div><label className={lblCls}>URL</label><input className={inputCls} placeholder="https://credential.url" value={cert.url} onChange={e => updateCert(cert.id, "url", e.target.value)} /></div>
                  </div>
                ))}
                <AddBtn label="Add Certification" onClick={() => setCertifications(p => [...p, { id: uid(), name: "", issuer: "", date: "", url: "" }])} />
              </div>
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* ── REFERENCES ── */}
        <SectionHeader icon={Users} title="References" sectionKey="references" expanded={expandedSections.references} onToggle={toggle} count={references.filter(r => r.name).length} />
        <AnimatePresence>
          {expandedSections.references && (
            <CollapseWrap>
              <div className="space-y-2.5">
                {references.map(ref => (
                  <div key={ref.id} className={cardCls}>
                    <DelBtn onClick={() => setReferences(p => p.filter(r => r.id !== ref.id))} />
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lblCls}>Name</label><input className={inputCls} placeholder="Jane Smith" value={ref.name} onChange={e => updateRef(ref.id, "name", e.target.value)} /></div>
                      <div><label className={lblCls}>Position</label><input className={inputCls} placeholder="Manager" value={ref.position} onChange={e => updateRef(ref.id, "position", e.target.value)} /></div>
                    </div>
                    <div><label className={lblCls}>Company</label><input className={inputCls} placeholder="Company" value={ref.company} onChange={e => updateRef(ref.id, "company", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lblCls}>Phone</label><input className={inputCls} placeholder="+1..." value={ref.phone} onChange={e => updateRef(ref.id, "phone", e.target.value)} /></div>
                      <div><label className={lblCls}>Email</label><input className={inputCls} placeholder="email" value={ref.email} onChange={e => updateRef(ref.id, "email", e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <AddBtn label="Add Reference" onClick={() => setReferences(p => [...p, { id: uid(), name: "", position: "", company: "", phone: "", email: "" }])} />
              </div>
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* ── HOBBIES ── */}
        <SectionHeader icon={Heart} title="Hobbies & Interests" sectionKey="hobbies" expanded={expandedSections.hobbies} onToggle={toggle} />
        <AnimatePresence>
          {expandedSections.hobbies && (
            <CollapseWrap>
              <textarea className={cn(inputCls, "min-h-[44px] resize-none")} placeholder="Reading, traveling, photography..." value={hobbies} onChange={e => setHobbies(e.target.value)} />
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* Save & Preview */}
        <div className="flex gap-2 mt-4">
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[13px] flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save CV"}
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => { handleSave(); toast.info("Preview coming soon!"); }}
            className="flex-1 py-2.5 rounded-lg border border-primary/30 text-primary font-bold text-[13px] flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </motion.button>
        </div>
      </div>
    </AppLayout>
  );
};

/* ── Sub-components ────────────────────────────────── */

function SectionHeader({ icon: Icon, title, sectionKey, expanded, onToggle, count }: {
  icon: typeof User; title: string; sectionKey: string; expanded: boolean; onToggle: (k: string) => void; count?: number;
}) {
  return (
    <button onClick={() => onToggle(sectionKey)} className="flex items-center gap-1.5 py-2 mt-1 w-full text-left touch-manipulation">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="font-bold text-[13px] flex-1">{title}</span>
      {typeof count === "number" && count > 0 && (
        <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{count}</span>
      )}
      {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

function CollapseWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden mb-1">
      {children}
    </motion.div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full py-1.5 rounded-lg border border-dashed border-primary/30 text-primary text-[11px] font-semibold flex items-center justify-center gap-1 touch-manipulation active:scale-[0.98]">
      <Plus className="w-3 h-3" /> {label}
    </button>
  );
}

function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center touch-manipulation z-10">
      <Trash2 className="w-2.5 h-2.5 text-destructive" />
    </button>
  );
}

export default CreateCVPage;
