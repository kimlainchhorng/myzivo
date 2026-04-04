/**
 * CreateCVPage — Professional CV/Resume builder with Supabase persistence.
 * Features: Photo cloud upload, templates, PDF download, share link, auto-save, progress tips.
 */
import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, User, Briefcase, GraduationCap,
  Wrench, Globe, Award, Save, FileText, Link2, Linkedin,
  Heart, Users, ChevronDown, ChevronUp, Loader2, Check,
  Star, MapPin, Mail, Phone, Eye, Camera, Image as ImageIcon,
  Download, Share2, Copy, Lightbulb, Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/app/AppLayout";
import { toast } from "sonner";

const CV_TEMPLATES = [
  { id: "classic", name: "Classic", desc: "Two-column professional" },
  { id: "modern", name: "Modern", desc: "Bold header design" },
  { id: "minimal", name: "Minimal", desc: "Clean & simple" },
] as const;
type TemplateId = typeof CV_TEMPLATES[number]["id"];

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
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 40 }, (_, i) => String(2030 - i));

/* ── Date Roller Component ────────────────────────── */
function DateRoller({ value, onChange, label, disabled }: {
  value: string; onChange: (v: string) => void; label: string; disabled?: boolean;
}) {
  // value format: "2026-03" => month=03, year=2026
  const parts = value ? value.split("-") : ["", ""];
  const year = parts[0] || "";
  const monthIdx = parts[1] ? parseInt(parts[1], 10) - 1 : -1;

  const handleMonth = (m: string) => {
    const mi = MONTHS.indexOf(m);
    if (mi === -1) { onChange(""); return; }
    const mm = String(mi + 1).padStart(2, "0");
    onChange(`${year || "2026"}-${mm}`);
  };
  const handleYear = (y: string) => {
    if (!y) { onChange(""); return; }
    const mm = monthIdx >= 0 ? String(monthIdx + 1).padStart(2, "0") : "01";
    onChange(`${y}-${mm}`);
  };

  const selCls = "flex-1 px-2 py-2 rounded-lg border border-border/40 bg-card text-[12px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all disabled:opacity-40";

  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground/80 mb-0.5 block uppercase tracking-wider">{label}</label>
      <div className="flex gap-1.5">
        <select className={selCls} value={monthIdx >= 0 ? MONTHS[monthIdx] : ""} onChange={e => handleMonth(e.target.value)} disabled={disabled}>
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className={selCls} value={year} onChange={e => handleYear(e.target.value)} disabled={disabled}>
          <option value="">Year</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ── Photo Upload to Supabase Storage ─────────────── */
function PhotoUpload({ photo, onPhotoChange, userId }: { photo: string | null; onPhotoChange: (url: string) => void; userId?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5MB"); return; }
    if (!userId) {
      // Fallback to local preview if no userId
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) onPhotoChange(ev.target.result as string); };
      reader.readAsDataURL(file);
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/cv-photo.${ext}`;
    const { error } = await supabase.storage.from("cv-photos").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("cv-photos").getPublicUrl(path);
    onPhotoChange(urlData.publicUrl + "?t=" + Date.now());
    setUploading(false);
    toast.success("Photo uploaded!");
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-3">
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="relative w-20 h-20 rounded-full border-2 border-dashed border-primary/30 bg-muted/20 flex items-center justify-center overflow-hidden touch-manipulation active:scale-95 transition-transform group">
        {uploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : photo ? (
          <img src={photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <Camera className="w-5 h-5 text-muted-foreground/50" />
            <span className="text-[8px] text-muted-foreground/50 font-medium">Add Photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-active:opacity-100 rounded-full transition-opacity flex items-center justify-center">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {photo && !uploading && <button onClick={() => onPhotoChange("")} className="text-[10px] text-destructive/70 font-medium">Remove photo</button>}
    </div>
  );
}

/* ── Progress Tips ────────────────────────────────── */
function ProgressTips({ data }: { data: any }) {
  const tips: string[] = [];
  if (!data.photo) tips.push("Add a professional photo to stand out");
  if (!data.jobTitle?.trim()) tips.push("Add a job title/headline");
  if (!data.summary?.trim()) tips.push("Write a professional summary (2-3 sentences)");
  if (!data.experiences?.some((e: any) => e.description?.trim())) tips.push("Add descriptions to your work experience");
  if ((data.skills?.filter((s: any) => s.name?.trim())?.length || 0) < 3) tips.push("Add at least 3 skills to strengthen your CV");
  if (!data.linkedin?.trim()) tips.push("Add your LinkedIn profile link");
  if (tips.length === 0) return null;
  return (
    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Lightbulb className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-bold text-primary">Tips to improve your CV</span>
      </div>
      <ul className="space-y-1">
        {tips.slice(0, 3).map((tip, i) => (
          <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/50 mt-1.5 shrink-0" />{tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── CV Preview Modal — Two-column professional layout ── */
const CVPreviewModal = forwardRef<HTMLDivElement, { open: boolean; onClose: () => void; data: any }>(({ open, onClose, data }, ref) => {
  if (!open) return null;

  const hasExperience = data.experiences?.some((e: any) => e.position);
  const hasEducation = data.educations?.some((e: any) => e.school);
  const hasSkills = data.skills?.some((s: any) => s.name);
  const hasLanguages = data.languages?.some((l: any) => l.name);
  const hasCerts = data.certifications?.some((c: any) => c.name);
  const hasRefs = data.references?.some((r: any) => r.name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Sticky close bar */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-border/20 px-4 py-2.5 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-[13px] text-foreground">CV Preview</h2>
          </div>
          <button onClick={onClose} className="text-[11px] font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10 active:scale-95 transition-transform">
            Close
          </button>
        </div>

        {/* CV Document — Two-column layout */}
        <div className="overflow-y-auto flex-1">
          <div className="flex min-h-full">
            {/* ── LEFT SIDEBAR ── */}
            <div className="w-[38%] shrink-0 bg-[hsl(var(--accent)/0.15)] p-4 space-y-5">
              {/* Photo */}
              <div className="flex justify-center">
                {data.photo ? (
                  <img src={data.photo} alt="" className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted/40 border-[3px] border-white shadow-md flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-2.5">
                {data.phone && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <Phone className="w-2.5 h-2.5 text-foreground/70" />
                    </div>
                    <span className="text-[10px] text-foreground/80 leading-tight break-all">{data.phone}</span>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <Mail className="w-2.5 h-2.5 text-foreground/70" />
                    </div>
                    <span className="text-[10px] text-foreground/80 leading-tight break-all">{data.email}</span>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <Globe className="w-2.5 h-2.5 text-foreground/70" />
                    </div>
                    <span className="text-[10px] text-foreground/80 leading-tight break-all">{data.website}</span>
                  </div>
                )}
                {data.location && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-2.5 h-2.5 text-foreground/70" />
                    </div>
                    <span className="text-[10px] text-foreground/80 leading-tight">{data.location}</span>
                  </div>
                )}
                {data.linkedin && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <Linkedin className="w-2.5 h-2.5 text-foreground/70" />
                    </div>
                    <span className="text-[10px] text-foreground/80 leading-tight break-all">{data.linkedin}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {hasSkills && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider mb-1.5">Skills</h3>
                  <div className="w-8 h-[2px] bg-foreground/30 mb-2" />
                  <ul className="space-y-1.5">
                    {data.skills.filter((s: any) => s.name).map((s: any, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-foreground/50 mt-1.5 shrink-0" />
                        <span className="text-[10px] text-foreground/80">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {hasLanguages && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider mb-1.5">Languages</h3>
                  <div className="w-8 h-[2px] bg-foreground/30 mb-2" />
                  <ul className="space-y-1.5">
                    {data.languages.filter((l: any) => l.name).map((l: any, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-foreground/50 mt-1.5 shrink-0" />
                        <span className="text-[10px] text-foreground/80">{l.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications in sidebar */}
              {hasCerts && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider mb-1.5">Certifications</h3>
                  <div className="w-8 h-[2px] bg-foreground/30 mb-2" />
                  <ul className="space-y-1.5">
                    {data.certifications.filter((c: any) => c.name).map((c: any, i: number) => (
                      <li key={i} className="text-[10px] text-foreground/80">
                        <p className="font-semibold">{c.name}</p>
                        {c.issuer && <p className="text-foreground/50">{c.issuer}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── RIGHT MAIN CONTENT ── */}
            <div className="flex-1 p-4 space-y-4">
              {/* Name & Title */}
              <div>
                <h1 className="text-[22px] font-extrabold text-foreground tracking-tight leading-tight uppercase">
                  {data.fullName || "Your Name"}
                </h1>
                {data.jobTitle && (
                  <p className="text-[11px] font-semibold text-foreground/60 uppercase tracking-widest mt-0.5">{data.jobTitle}</p>
                )}
              </div>

              {/* Professional Summary */}
              {data.summary && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">Professional Experience</h3>
                  <div className="w-full h-[2px] bg-foreground/20 mt-1 mb-2" />
                  <p className="text-[10px] text-foreground/70 leading-relaxed text-justify">{data.summary}</p>
                </div>
              )}

              {/* Work Experience */}
              {hasExperience && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">Work Experience</h3>
                  <div className="w-full h-[2px] bg-foreground/20 mt-1 mb-2" />
                  <div className="space-y-3">
                    {data.experiences.filter((e: any) => e.position).map((e: any, i: number) => (
                      <div key={i}>
                        <p className="text-[11px] font-bold text-foreground">
                          {e.company}{e.position ? ` | ${e.position}` : ""}
                        </p>
                        {e.startDate && (
                          <p className="text-[10px] font-semibold text-foreground/50 italic">
                            {formatDate(e.startDate)} – {e.current ? "Present" : formatDate(e.endDate)}
                          </p>
                        )}
                        {e.description && (
                          <ul className="mt-1 space-y-0.5">
                            {e.description.split("\n").filter(Boolean).map((line: string, li: number) => (
                              <li key={li} className="flex items-start gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 shrink-0" />
                                <span className="text-[10px] text-foreground/70 leading-relaxed">{line}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {hasEducation && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">Education</h3>
                  <div className="w-full h-[2px] bg-foreground/20 mt-1 mb-2" />
                  <div className="space-y-2">
                    {data.educations.filter((e: any) => e.school).map((e: any, i: number) => (
                      <div key={i}>
                        <p className="text-[11px] font-bold text-foreground">
                          {e.school}{e.startDate ? `, ${formatDate(e.startDate)}–${formatDate(e.endDate)}` : ""}
                        </p>
                        <p className="text-[10px] text-foreground/60">
                          {e.degree}{e.field ? ` in ${e.field}` : ""}
                          {e.gpa ? ` • GPA: ${e.gpa}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {hasRefs && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">References</h3>
                  <div className="w-full h-[2px] bg-foreground/20 mt-1 mb-2" />
                  <div className="space-y-1.5">
                    {data.references.filter((r: any) => r.name).map((r: any, i: number) => (
                      <div key={i}>
                        <p className="text-[10px] font-bold text-foreground">{r.name}</p>
                        <p className="text-[9px] text-foreground/50">{r.position}{r.company ? `, ${r.company}` : ""}{r.phone ? ` • ${r.phone}` : ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hobbies */}
              {data.hobbies && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">Interests</h3>
                  <div className="w-full h-[2px] bg-foreground/20 mt-1 mb-2" />
                  <p className="text-[10px] text-foreground/70">{data.hobbies}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
CVPreviewModal.displayName = "CVPreviewModal";
function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${MONTHS[parseInt(m, 10) - 1] || ""} ${y}`;
}

/* ── Main Component ───────────────────────────────── */
const CreateCVPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Personal info
  const [photo, setPhoto] = useState<string | null>(null);
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
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("classic");
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true, experience: true, education: true, skills: true,
    languages: true, certifications: false, references: false, hobbies: false,
  });
  const [completionPct, setCompletionPct] = useState(0);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

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
        setShareCode((data as any).share_code || null);
        setPhoto((data as any).photo_url || null);
        if ((data as any).template) setSelectedTemplate((data as any).template as TemplateId);
        setLastSaved(new Date(data.updated_at));
      }
      setLoading(false);
      setTimeout(() => { initialLoadDone.current = true; }, 500);
    };
    void load();
  }, [user]);

  /* ── Completion calculation ──────────────────────── */
  useEffect(() => {
    let filled = 0;
    const total = 10;
    if (fullName.trim()) filled++;
    if (email.trim()) filled++;
    if (phone.trim()) filled++;
    if (jobTitle.trim()) filled++;
    if (summary.trim()) filled++;
    if (photo) filled++;
    if (experiences.some(e => e.position.trim())) filled++;
    if (educations.some(e => e.school.trim())) filled++;
    if (skills.some(s => s.name.trim())) filled++;
    if (languages.some(l => l.name.trim())) filled++;
    setCompletionPct(Math.round((filled / total) * 100));
  }, [fullName, email, phone, jobTitle, summary, photo, experiences, educations, skills, languages]);

  /* ── Save (manual + auto) ───────────────────────── */
  const doSave = useCallback(async (silent = false) => {
    if (!user) return;
    if (!fullName.trim()) { if (!silent) toast.error("Please enter your full name"); return; }
    if (!silent) setSaving(true);
    if (silent) setAutoSaveStatus("saving");
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
      experiences: experiences as any, educations: educations as any, skills: skills as any, languages: languages as any, certifications: certifications as any,
      references_list: references as any,
      hobbies: hobbies.trim(),
      is_primary: true,
      template: selectedTemplate,
      photo_url: photo || null,
    };
    let error;
    if (cvId) {
      ({ error } = await supabase.from("user_cvs").update(payload).eq("id", cvId));
    } else {
      const res = await supabase.from("user_cvs").insert(payload).select("id, share_code").single();
      error = res.error;
      if (res.data) { setCvId(res.data.id); if ((res.data as any).share_code) setShareCode((res.data as any).share_code); }
    }
    if (!silent) setSaving(false);
    if (error) { if (!silent) toast.error("Failed to save CV"); console.error(error); }
    else {
      setLastSaved(new Date());
      if (!silent) toast.success("CV saved!");
      if (silent) { setAutoSaveStatus("saved"); setTimeout(() => setAutoSaveStatus("idle"), 2000); }
    }
  }, [user, cvId, fullName, jobTitle, email, phone, location, website, linkedin, portfolio, summary, experiences, educations, skills, languages, certifications, references, hobbies, selectedTemplate, photo]);

  const handleSave = useCallback(() => doSave(false), [doSave]);

  /* ── Auto-save debounce (3s after changes) ──────── */
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { doSave(true); }, 3000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [fullName, jobTitle, email, phone, location, website, linkedin, portfolio, summary, experiences, educations, skills, languages, certifications, references, hobbies, doSave]);

  /* ── Delete CV ──────────────────────────────────── */
  const handleDelete = useCallback(async () => {
    if (!cvId) return;
    const { error } = await supabase.from("user_cvs").delete().eq("id", cvId);
    if (error) { toast.error("Failed to delete CV"); return; }
    toast.success("CV deleted");
    navigate(-1);
  }, [cvId, navigate]);

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

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-border/40 bg-card text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all shadow-sm";
  const lblCls = "text-[10px] font-semibold text-muted-foreground/80 mb-0.5 block uppercase tracking-wider";
  const cardCls = "relative rounded-xl border border-border/30 bg-card/80 p-3 space-y-2.5 shadow-sm";

  if (loading) {
    return (
      <AppLayout title="Create CV" hideHeader>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const previewData = { photo, fullName, jobTitle, email, phone, location, website, linkedin, portfolio, summary, experiences, educations, skills, languages, certifications, references, hobbies };

  const handleShare = () => {
    if (!shareCode) { toast.error("Save your CV first to get a share link"); return; }
    const url = `${window.location.origin}/cv/${shareCode}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Share link copied!")).catch(() => toast.error("Failed to copy"));
  };

  const handleDownloadPDF = () => {
    setShowPreview(true);
    setTimeout(() => { window.print(); }, 500);
  };

  return (
    <AppLayout title="Create CV" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-28">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center touch-manipulation active:scale-90 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base">Create CV</h1>
            <p className="text-[10px] text-muted-foreground">Professional resume builder</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold touch-manipulation active:scale-95 transition-transform flex items-center gap-1.5 disabled:opacity-60 shadow-sm"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center justify-end gap-1.5 mb-3 px-1">
          {autoSaveStatus === "saving" && (
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Auto-saving…
            </span>
          )}
          {autoSaveStatus === "saved" && (
            <span className="flex items-center gap-1 text-[9px] text-primary">
              <Check className="w-2.5 h-2.5" /> Auto-saved
            </span>
          )}
          {autoSaveStatus === "idle" && lastSaved && (
            <span className="text-[9px] text-muted-foreground/50">
              Last saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* Completion bar */}
        <div className="mb-4 bg-card rounded-xl p-3 border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground">Profile completeness</span>
            <span className="text-[11px] font-bold text-primary">{completionPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full transition-colors",
                completionPct < 40 ? "bg-destructive/70" : completionPct < 70 ? "bg-yellow-500" : "bg-primary"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground/60 mt-1">
            {completionPct < 40 ? "Add more details for a stronger CV" : completionPct < 70 ? "Good progress! Keep going" : completionPct < 100 ? "Almost complete!" : "Your CV is complete! 🎉"}
          </p>
        </div>

        {/* Template Selector */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-foreground">CV Template</span>
          </div>
          <div className="flex gap-2">
            {CV_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                className={cn("flex-1 py-2 px-2 rounded-xl border-2 text-center touch-manipulation active:scale-95 transition-all",
                  selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border/30 bg-card")}>
                <span className={cn("text-[11px] font-bold block", selectedTemplate === t.id ? "text-primary" : "text-foreground")}>{t.name}</span>
                <span className="text-[9px] text-muted-foreground">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Tips */}
        <ProgressTips data={previewData} />

        {/* ── PERSONAL INFO ── */}
        <SectionHeader icon={User} title="Personal Information" sectionKey="personal" expanded={expandedSections.personal} onToggle={toggle} />
        <AnimatePresence>
          {expandedSections.personal && (
            <CollapseWrap>
              <div className="space-y-2.5">
                <PhotoUpload photo={photo} onPhotoChange={setPhoto} userId={user?.id} />
                <div>
                  <label className={lblCls}>Full Name *</label>
                  <input className={inputCls} placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className={lblCls}>Job Title / Headline</label>
                  <input className={inputCls} placeholder="Senior Software Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lblCls}>Email</label><input className={inputCls} placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  <div><label className={lblCls}>Phone</label><input className={inputCls} placeholder="+1 234 567 890" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                </div>
                <div>
                  <label className={lblCls}>Location</label>
                  <input className={inputCls} placeholder="Phnom Penh, Cambodia" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div>
                  <label className={lblCls}>LinkedIn</label>
                  <input className={inputCls} placeholder="linkedin.com/in/yourname" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lblCls}>Website</label><input className={inputCls} placeholder="yoursite.com" value={website} onChange={e => setWebsite(e.target.value)} /></div>
                  <div><label className={lblCls}>Portfolio</label><input className={inputCls} placeholder="portfolio.com" value={portfolio} onChange={e => setPortfolio(e.target.value)} /></div>
                </div>
                <div>
                  <label className={lblCls}>Professional Summary</label>
                  <textarea className={cn(inputCls, "min-h-[70px] resize-none")} placeholder="Experienced professional with expertise in..." value={summary} onChange={e => setSummary(e.target.value)} />
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
              <div className="space-y-3">
                {experiences.map((exp, idx) => (
                  <div key={exp.id} className={cardCls}>
                    {experiences.length > 1 && <DelBtn onClick={() => setExperiences(p => p.filter(e => e.id !== exp.id))} />}
                    <div className="text-[10px] font-bold text-primary/60 mb-1">Experience #{idx + 1}</div>
                    <div><label className={lblCls}>Position</label><input className={inputCls} placeholder="Software Engineer" value={exp.position} onChange={e => updateExp(exp.id, "position", e.target.value)} /></div>
                    <div><label className={lblCls}>Company</label><input className={inputCls} placeholder="Company Name" value={exp.company} onChange={e => updateExp(exp.id, "company", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <DateRoller label="Start" value={exp.startDate} onChange={v => updateExp(exp.id, "startDate", v)} />
                      <DateRoller label="End" value={exp.current ? "" : exp.endDate} onChange={v => updateExp(exp.id, "endDate", v)} disabled={exp.current} />
                    </div>
                    <button type="button" onClick={() => updateExp(exp.id, "current", !exp.current)} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer py-1 touch-manipulation">
                      <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center transition-colors", exp.current ? "bg-primary border-primary" : "border-border/60")}>
                        {exp.current && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      Currently working here
                    </button>
                    <div><label className={lblCls}>Description</label><textarea className={cn(inputCls, "min-h-[50px] resize-none")} placeholder="Key achievements & responsibilities..." value={exp.description} onChange={e => updateExp(exp.id, "description", e.target.value)} /></div>
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
              <div className="space-y-3">
                {educations.map((edu, idx) => (
                  <div key={edu.id} className={cardCls}>
                    {educations.length > 1 && <DelBtn onClick={() => setEducations(p => p.filter(e => e.id !== edu.id))} />}
                    <div className="text-[10px] font-bold text-primary/60 mb-1">Education #{idx + 1}</div>
                    <div><label className={lblCls}>School / University</label><input className={inputCls} placeholder="University Name" value={edu.school} onChange={e => updateEdu(edu.id, "school", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lblCls}>Degree</label><input className={inputCls} placeholder="Bachelor's" value={edu.degree} onChange={e => updateEdu(edu.id, "degree", e.target.value)} /></div>
                      <div><label className={lblCls}>Field</label><input className={inputCls} placeholder="Computer Science" value={edu.field} onChange={e => updateEdu(edu.id, "field", e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-2"><DateRoller label="Start" value={edu.startDate} onChange={v => updateEdu(edu.id, "startDate", v)} /></div>
                      <div className="col-span-2"><DateRoller label="End" value={edu.endDate} onChange={v => updateEdu(edu.id, "endDate", v)} /></div>
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
                    <select className={cn(inputCls, "w-[105px] text-[11px]")} value={sk.level} onChange={e => updateSkill(sk.id, "level", e.target.value)}>
                      {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {skills.length > 1 && (
                      <button onClick={() => setSkills(p => p.filter(s => s.id !== sk.id))} className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 touch-manipulation"><Trash2 className="w-3 h-3 text-destructive" /></button>
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
                    <select className={cn(inputCls, "w-[115px] text-[11px]")} value={lg.proficiency} onChange={e => updateLang(lg.id, "proficiency", e.target.value)}>
                      {LANG_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {languages.length > 1 && (
                      <button onClick={() => setLanguages(p => p.filter(l => l.id !== lg.id))} className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 touch-manipulation"><Trash2 className="w-3 h-3 text-destructive" /></button>
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
              <div className="space-y-3">
                {certifications.map(cert => (
                  <div key={cert.id} className={cardCls}>
                    <DelBtn onClick={() => setCertifications(p => p.filter(c => c.id !== cert.id))} />
                    <div><label className={lblCls}>Certification Name</label><input className={inputCls} placeholder="AWS Solutions Architect" value={cert.name} onChange={e => updateCert(cert.id, "name", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lblCls}>Issuer</label><input className={inputCls} placeholder="Amazon" value={cert.issuer} onChange={e => updateCert(cert.id, "issuer", e.target.value)} /></div>
                      <DateRoller label="Date" value={cert.date} onChange={v => updateCert(cert.id, "date", v)} />
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
              <div className="space-y-3">
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
              <textarea className={cn(inputCls, "min-h-[50px] resize-none")} placeholder="Reading, traveling, photography..." value={hobbies} onChange={e => setHobbies(e.target.value)} />
            </CollapseWrap>
          )}
        </AnimatePresence>

        {/* Bottom Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button onClick={handleSave} disabled={saving}
            className="h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-[0.97] transition-all shadow-md disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save CV"}
          </button>
          <button onClick={() => setShowPreview(true)}
            className="h-12 rounded-xl border-2 border-primary/30 text-primary font-bold text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-[0.97] transition-all">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button onClick={handleDownloadPDF}
            className="h-10 rounded-xl border border-border/40 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button onClick={handleShare}
            className="h-10 rounded-xl border border-border/40 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all">
            <Share2 className="w-3.5 h-3.5" /> Share Link
          </button>
        </div>

        {/* Delete CV */}
        {cvId && (
          <div className="mt-6 pt-4 border-t border-border/20">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full h-10 rounded-xl border border-destructive/20 text-destructive/70 text-xs font-medium flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete CV
              </button>
            ) : (
              <div className="bg-destructive/5 rounded-xl p-3 border border-destructive/20 space-y-2">
                <p className="text-[12px] font-semibold text-destructive text-center">Delete this CV permanently?</p>
                <p className="text-[10px] text-muted-foreground text-center">This action cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-9 rounded-lg bg-muted/60 text-xs font-medium touch-manipulation active:scale-95 transition-transform">
                    Cancel
                  </button>
                  <button onClick={handleDelete} className="flex-1 h-9 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold touch-manipulation active:scale-95 transition-transform">
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto-save info */}
        <p className="text-[9px] text-muted-foreground/40 text-center mt-4">
          Your CV auto-saves 3 seconds after each change
        </p>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && <CVPreviewModal open={showPreview} onClose={() => setShowPreview(false)} data={previewData} />}
      </AnimatePresence>
    </AppLayout>
  );
};

/* ── Sub-components ────────────────────────────────── */

function SectionHeader({ icon: Icon, title, sectionKey, expanded, onToggle, count }: {
  icon: typeof User; title: string; sectionKey: string; expanded: boolean; onToggle: (k: string) => void; count?: number;
}) {
  return (
    <button onClick={() => onToggle(sectionKey)} className="flex items-center gap-2 py-2.5 mt-1.5 w-full text-left touch-manipulation group">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <span className="font-bold text-[13px] flex-1">{title}</span>
      {typeof count === "number" && count > 0 && (
        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{count}</span>
      )}
      <div className={cn("w-6 h-6 rounded-full bg-muted/40 flex items-center justify-center transition-transform", expanded && "rotate-180")}>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </button>
  );
}

function CollapseWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden mb-2">
      {children}
    </motion.div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full h-10 rounded-xl border-2 border-dashed border-primary/25 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98] transition-all hover:bg-primary/5">
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center touch-manipulation z-10 active:scale-90 transition-transform">
      <Trash2 className="w-3 h-3 text-destructive" />
    </button>
  );
}

export default CreateCVPage;
