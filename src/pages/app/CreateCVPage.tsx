/**
 * CreateCVPage — Professional CV/Resume builder with Supabase persistence.
 * Features: Photo cloud upload, templates, PDF download, share link, auto-save, progress tips.
 */
import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
/**
 * Robust download that works inside Lovable's sandboxed preview iframe.
 * Falls back to opening the blob URL in a new top-level tab if the
 * synthetic anchor click is blocked.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    // Fallback for restrictive sandboxes
    window.open(url, "_blank", "noopener,noreferrer");
  }
  // Revoke later so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
import {
  ArrowLeft, Plus, Trash2, User, Briefcase, GraduationCap,
  Wrench, Globe, Award, Save, FileText, Link2, Linkedin,
  Heart, Users, ChevronDown, ChevronUp, Loader2, Check,
  Star, MapPin, Mail, Phone, Eye, Camera, Image as ImageIcon,
  Download, Share2, Copy, Lightbulb, Palette, FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/app/AppLayout";
import { toast } from "sonner";
import { SkillLogo, PRESET_SKILLS, findPresetSkill } from "@/components/cv/SkillLogo";

const CV_TEMPLATES = [
  { id: "classic", name: "Classic", desc: "Two-column pro", color: "#10b981", gradient: "from-emerald-500 to-teal-600" },
  { id: "modern", name: "Modern", desc: "Bold header", color: "#3b82f6", gradient: "from-blue-500 to-indigo-600" },
  { id: "minimal", name: "Minimal", desc: "Clean & simple", color: "#64748b", gradient: "from-slate-400 to-slate-600" },
  { id: "professional", name: "Professional", desc: "Corporate navy", color: "#1e3a8a", gradient: "from-blue-900 to-slate-800" },
  { id: "premium", name: "Premium", desc: "Gold luxury", color: "#b45309", gradient: "from-amber-600 to-yellow-700" },
  { id: "executive", name: "Executive", desc: "Dark elegant", color: "#0f172a", gradient: "from-slate-900 to-zinc-800" },
  { id: "creative", name: "Creative", desc: "Vibrant artist", color: "#db2777", gradient: "from-pink-500 via-fuchsia-500 to-purple-600" },
  { id: "elegant", name: "Elegant", desc: "Burgundy serif", color: "#9f1239", gradient: "from-rose-700 to-red-900" },
  { id: "timeline", name: "Timeline", desc: "Vertical journey", color: "#0ea5e9", gradient: "from-sky-500 to-cyan-600" },
  { id: "compact", name: "Compact", desc: "Dense one-pager", color: "#475569", gradient: "from-slate-500 to-slate-700" },
  { id: "sidebar", name: "Sidebar", desc: "Dark left rail", color: "#18181b", gradient: "from-zinc-900 to-neutral-800" },
  { id: "bold", name: "Bold", desc: "Color block hero", color: "#f97316", gradient: "from-orange-500 to-red-600" },
  { id: "academic", name: "Academic", desc: "Scholar serif", color: "#7c2d12", gradient: "from-amber-900 to-stone-800" },
  { id: "tech", name: "Tech", desc: "Mono dev style", color: "#22c55e", gradient: "from-green-500 to-emerald-700" },
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

/* ── Shared preview helpers ────────────────────────── */
function ContactLine({ icon: Icon, text }: { icon: typeof Phone; text?: string }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
        <Icon className="w-2.5 h-2.5 text-foreground/70" />
      </div>
      <span className="text-[10px] text-foreground/80 leading-tight break-all">{text}</span>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <>
      <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">{title}</h3>
      <div className="w-full h-[2px] bg-foreground/20 mt-1 mb-2" />
    </>
  );
}

function ExperienceBlock({ data }: { data: any }) {
  const items = data.experiences?.filter((e: any) => e.position) || [];
  if (!items.length) return null;
  return (
    <div>
      <SectionTitle title="Work Experience" />
      <div className="space-y-3">
        {items.map((e: any, i: number) => (
          <div key={i}>
            <p className="text-[11px] font-bold text-foreground">{e.company}{e.position ? ` | ${e.position}` : ""}</p>
            {e.startDate && <p className="text-[10px] font-semibold text-foreground/50 italic">{formatDate(e.startDate)} – {e.current ? "Present" : formatDate(e.endDate)}</p>}
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
  );
}

function EducationBlock({ data }: { data: any }) {
  const items = data.educations?.filter((e: any) => e.school) || [];
  if (!items.length) return null;
  return (
    <div>
      <SectionTitle title="Education" />
      <div className="space-y-2">
        {items.map((e: any, i: number) => (
          <div key={i}>
            <p className="text-[11px] font-bold text-foreground">{e.school}{e.startDate ? `, ${formatDate(e.startDate)}–${formatDate(e.endDate)}` : ""}</p>
            <p className="text-[10px] text-foreground/60">{e.degree}{e.field ? ` in ${e.field}` : ""}{e.gpa ? ` • GPA: ${e.gpa}` : ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsList({ data, label = "Skills" }: { data: any; label?: string }) {
  const items = data.skills?.filter((s: any) => s.name) || [];
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider mb-1.5">{label}</h3>
      <div className="w-8 h-[2px] bg-foreground/30 mb-2" />
      <ul className="space-y-1.5">
        {items.map((s: any, i: number) => (
          <li key={i} className="flex items-center gap-1.5">
            <SkillLogo name={s.name} size={12} />
            <span className="text-[10px] text-foreground/80">{s.name}{s.level ? ` · ${s.level}` : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LanguagesList({ data }: { data: any }) {
  const items = data.languages?.filter((l: any) => l.name) || [];
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider mb-1.5">Languages</h3>
      <div className="w-8 h-[2px] bg-foreground/30 mb-2" />
      <ul className="space-y-1.5">
        {items.map((l: any, i: number) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full bg-foreground/50 mt-1.5 shrink-0" />
            <span className="text-[10px] text-foreground/80">{l.name}{l.proficiency ? ` · ${l.proficiency}` : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertsList({ data }: { data: any }) {
  const items = data.certifications?.filter((c: any) => c.name) || [];
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider mb-1.5">Certifications</h3>
      <div className="w-8 h-[2px] bg-foreground/30 mb-2" />
      <ul className="space-y-1.5">
        {items.map((c: any, i: number) => (
          <li key={i} className="text-[10px] text-foreground/80">
            <p className="font-semibold">{c.name}</p>
            {c.issuer && <p className="text-foreground/50">{c.issuer}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RefsBlock({ data }: { data: any }) {
  const items = data.references?.filter((r: any) => r.name) || [];
  if (!items.length) return null;
  return (
    <div>
      <SectionTitle title="References" />
      <div className="space-y-1.5">
        {items.map((r: any, i: number) => (
          <div key={i}>
            <p className="text-[10px] font-bold text-foreground">{r.name}</p>
            <p className="text-[9px] text-foreground/50">{r.position}{r.company ? `, ${r.company}` : ""}{r.phone ? ` • ${r.phone}` : ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoCircle({ photo }: { photo?: string }) {
  return photo ? (
    <img src={photo} alt="" className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-md" />
  ) : (
    <div className="w-24 h-24 rounded-full bg-muted/40 border-[3px] border-white shadow-md flex items-center justify-center">
      <User className="w-10 h-10 text-muted-foreground/30" />
    </div>
  );
}

/* ── Classic Template — Two-column layout ── */
function ClassicLayout({ data }: { data: any }) {
  return (
    <div className="cv-flex-cols flex min-h-full">
      <div className="cv-sidebar w-[38%] shrink-0 cv-accent-soft p-4 space-y-5">
        <div className="flex justify-center"><PhotoCircle photo={data.photo} /></div>
        <div className="space-y-2.5">
          <ContactLine icon={Phone} text={data.phone} />
          <ContactLine icon={Mail} text={data.email} />
          <ContactLine icon={Globe} text={data.website} />
          <ContactLine icon={MapPin} text={data.location} />
          <ContactLine icon={Linkedin} text={data.linkedin} />
        </div>
        <SkillsList data={data} />
        <LanguagesList data={data} />
        <CertsList data={data} />
      </div>
      <div className="cv-main flex-1 p-4 space-y-4">
        <div className="cv-hero">
          <h1 className="cv-name text-[22px] font-extrabold text-foreground tracking-tight leading-tight uppercase">{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className="text-[11px] font-semibold cv-accent-text uppercase tracking-widest mt-0.5">{data.jobTitle}</p>}
        </div>
        {data.summary && <div><SectionTitle title="Professional Summary" /><p className="text-[10px] text-foreground/70 leading-relaxed text-justify">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        <RefsBlock data={data} />
        {data.hobbies && <div><SectionTitle title="Interests" /><p className="text-[10px] text-foreground/70">{data.hobbies}</p></div>}
      </div>
    </div>
  );
}

/* ── Modern Template ── */
function ModernLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full">
      <div className="cv-hero cv-accent-bg px-5 py-5 flex items-center gap-4">
        <div className="shrink-0">
          {data.photo ? (
            <img src={data.photo} alt="" className="cv-photo w-20 h-20 rounded-xl object-cover border-2 border-white/30 shadow-lg" />
          ) : (
            <div className="cv-photo w-20 h-20 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center">
              <User className="w-8 h-8 text-white/60" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="cv-name text-[20px] font-extrabold text-white leading-tight truncate">{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className="text-[11px] font-semibold text-white/85 mt-0.5 uppercase tracking-wider">{data.jobTitle}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {data.email && <span className="text-[9px] text-white/80 flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{data.email}</span>}
            {data.phone && <span className="text-[9px] text-white/80 flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{data.phone}</span>}
            {data.location && <span className="text-[9px] text-white/80 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{data.location}</span>}
          </div>
        </div>
      </div>
      <div className="cv-main p-4 space-y-4">
        {data.summary && <div><SectionTitle title="About Me" /><p className="text-[10px] text-foreground/70 leading-relaxed">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        {(data.skills?.some((s: any) => s.name) || data.languages?.some((l: any) => l.name)) && (
          <div className="grid grid-cols-2 gap-4">
            <SkillsList data={data} />
            <LanguagesList data={data} />
          </div>
        )}
        <CertsList data={data} />
        <RefsBlock data={data} />
        {data.hobbies && <div><SectionTitle title="Interests" /><p className="text-[10px] text-foreground/70">{data.hobbies}</p></div>}
      </div>
    </div>
  );
}

/* ── Minimal Template ── */
function MinimalLayout({ data }: { data: any }) {
  return (
    <div className="cv-main p-5 space-y-4 min-h-full">
      <div className="cv-hero text-center border-b border-foreground/10 pb-4">
        {data.photo && (
          <div className="flex justify-center mb-2">
            <img src={data.photo} alt="" className="cv-photo w-16 h-16 rounded-full object-cover" />
          </div>
        )}
        <h1 className="cv-name text-[20px] font-bold text-foreground leading-tight">{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className="text-[11px] cv-accent-text mt-0.5">{data.jobTitle}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-[9px] text-foreground/55">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.location && <span>• {data.location}</span>}
          {data.linkedin && <span>• {data.linkedin}</span>}
        </div>
      </div>
      {data.summary && <div><h3 className="text-[10px] font-bold cv-accent-text uppercase tracking-wider mb-1">Summary</h3><p className="text-[10px] text-foreground/65 leading-relaxed">{data.summary}</p></div>}
      <ExperienceBlock data={data} />
      <EducationBlock data={data} />
      {data.skills?.some((s: any) => s.name) && (
        <div>
          <SectionTitle title="Skills" />
          <div className="flex flex-wrap gap-1.5">
            {data.skills.filter((s: any) => s.name).map((s: any, i: number) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full cv-accent-soft cv-accent-text border cv-accent-border">{s.name}</span>
            ))}
          </div>
        </div>
      )}
      {data.languages?.some((l: any) => l.name) && (
        <div>
          <SectionTitle title="Languages" />
          <div className="flex flex-wrap gap-1.5">
            {data.languages.filter((l: any) => l.name).map((l: any, i: number) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full cv-accent-soft cv-accent-text border cv-accent-border">{l.name}{l.proficiency ? ` (${l.proficiency})` : ""}</span>
            ))}
          </div>
        </div>
      )}
      <CertsList data={data} />
      <RefsBlock data={data} />
      {data.hobbies && <div><SectionTitle title="Interests" /><p className="text-[10px] text-foreground/70">{data.hobbies}</p></div>}
    </div>
  );
}

/* ── Professional Template ── */
function ProfessionalLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full bg-white">
      <div className="cv-hero cv-accent-bg text-white px-5 py-5 flex items-center gap-4 border-b-4" style={{ borderBottomColor: 'hsl(var(--primary) / 0.45)' }}>
        {data.photo ? (
          <img src={data.photo} alt="" className="cv-photo w-20 h-20 rounded-full object-cover border-2 border-white/40" />
        ) : (
          <div className="cv-photo w-20 h-20 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center"><User className="w-8 h-8 text-white/60" /></div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="cv-name text-[22px] font-extrabold leading-tight uppercase tracking-wide">{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className="text-[11px] font-semibold text-white/90 mt-0.5 uppercase tracking-widest">{data.jobTitle}</p>}
        </div>
      </div>
      <div className="cv-flex-cols flex">
        <div className="cv-sidebar w-[35%] cv-accent-soft p-4 space-y-4 border-r border-border/30">
          <div className="space-y-2">
            <h3 className="text-[10px] font-extrabold cv-accent-text uppercase tracking-wider border-b-2 cv-accent-border pb-1">Contact</h3>
            <ContactLine icon={Phone} text={data.phone} />
            <ContactLine icon={Mail} text={data.email} />
            <ContactLine icon={MapPin} text={data.location} />
            <ContactLine icon={Linkedin} text={data.linkedin} />
            <ContactLine icon={Globe} text={data.website} />
          </div>
          <SkillsList data={data} />
          <LanguagesList data={data} />
          <CertsList data={data} />
        </div>
        <div className="cv-main flex-1 p-4 space-y-4">
          {data.summary && <div><h3 className="text-[11px] font-extrabold cv-accent-text uppercase tracking-wider border-b-2 cv-accent-border pb-1 mb-1.5">Profile</h3><p className="text-[10px] text-foreground/75 leading-relaxed text-justify">{data.summary}</p></div>}
          <ExperienceBlock data={data} />
          <EducationBlock data={data} />
          <RefsBlock data={data} />
        </div>
      </div>
    </div>
  );
}

/* ── Premium Template ── */
function PremiumLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.06), #fff)' }}>
      <div className="cv-hero px-5 py-6 text-center border-b-2 cv-accent-border relative">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }} />
        {data.photo && (
          <div className="flex justify-center mb-3">
            <div className="p-1 rounded-full" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.4))' }}>
              <img src={data.photo} alt="" className="cv-photo w-20 h-20 rounded-full object-cover border-2 border-white" />
            </div>
          </div>
        )}
        <h1 className="cv-name text-[24px] font-extrabold text-foreground tracking-[0.15em] uppercase leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{data.fullName || "Your Name"}</h1>
        <div className="flex items-center justify-center gap-2 my-1.5">
          <span className="h-px w-8 cv-accent-rule" />
          {data.jobTitle && <p className="text-[10px] font-semibold cv-accent-text uppercase tracking-[0.25em]">{data.jobTitle}</p>}
          <span className="h-px w-8 cv-accent-rule" />
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-[9px] text-foreground/70">
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>☎ {data.phone}</span>}
          {data.location && <span>◉ {data.location}</span>}
        </div>
      </div>
      <div className="cv-main p-5 space-y-4">
        {data.summary && <div><h3 className="text-[11px] font-extrabold cv-accent-text uppercase tracking-[0.2em] mb-1.5" style={{ fontFamily: 'Georgia, serif' }}>❖ Profile</h3><p className="text-[10px] text-foreground/75 leading-relaxed italic">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        <div className="grid grid-cols-2 gap-4">
          <SkillsList data={data} />
          <LanguagesList data={data} />
        </div>
        <CertsList data={data} />
        <RefsBlock data={data} />
      </div>
    </div>
  );
}

/* ── Executive Template ── */
function ExecutiveLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full bg-white">
      <div className="cv-hero text-white p-5" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.95), hsl(var(--primary) / 0.65))' }}>
        <div className="flex items-center gap-4">
          {data.photo ? (
            <img src={data.photo} alt="" className="cv-photo w-20 h-20 rounded-sm object-cover border border-white/20" />
          ) : (
            <div className="cv-photo w-20 h-20 rounded-sm bg-white/5 border border-white/20 flex items-center justify-center"><User className="w-8 h-8 text-white/40" /></div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="cv-name text-[22px] font-light tracking-[0.1em] uppercase leading-tight">{data.fullName || "Your Name"}</h1>
            <div className="h-px w-12 my-1.5 cv-accent-rule" />
            {data.jobTitle && <p className="text-[10px] text-white/75 uppercase tracking-[0.3em]">{data.jobTitle}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-white/10 text-[9px] text-white/65">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>
      <div className="cv-main p-5 space-y-4">
        {data.summary && <div><h3 className="text-[10px] font-bold cv-accent-text uppercase tracking-[0.25em] mb-1.5">— Executive Summary</h3><p className="text-[10px] text-foreground/75 leading-relaxed">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        <SkillsList data={data} />
        <LanguagesList data={data} />
        <CertsList data={data} />
        <RefsBlock data={data} />
      </div>
    </div>
  );
}

/* ── Creative Template ── */
function CreativeLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full bg-white">
      <div
        className="cv-hero p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 60%, hsl(var(--primary) / 0.45) 100%)' }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/15" />
        <div className="relative flex items-center gap-4">
          {data.photo ? (
            <img src={data.photo} alt="" className="cv-photo w-20 h-20 rounded-2xl object-cover border-[3px] border-white shadow-lg rotate-[-3deg]" />
          ) : (
            <div className="cv-photo w-20 h-20 rounded-2xl bg-white/20 border-[3px] border-white flex items-center justify-center rotate-[-3deg]"><User className="w-8 h-8 text-white" /></div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="cv-name text-[22px] font-black leading-tight">{data.fullName || "Your Name"}</h1>
            {data.jobTitle && <p className="text-[11px] font-bold text-white/95 mt-0.5">✦ {data.jobTitle}</p>}
            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2 text-[9px] text-white/90">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>• {data.phone}</span>}
              {data.location && <span>• {data.location}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="cv-main p-4 space-y-4">
        {data.summary && <div><h3 className="text-[11px] font-black cv-accent-text uppercase tracking-wider mb-1.5">✦ Hello!</h3><p className="text-[10px] text-foreground/75 leading-relaxed">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        {data.skills?.some((s: any) => s.name) && (
          <div>
            <h3 className="text-[11px] font-black cv-accent-text uppercase tracking-wider mb-1.5">✦ Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.filter((s: any) => s.name).map((s: any, i: number) => (
                <span key={i} className="text-[9px] font-semibold px-2.5 py-1 rounded-full cv-accent-bg">{s.name}</span>
              ))}
            </div>
          </div>
        )}
        <LanguagesList data={data} />
        <CertsList data={data} />
        <RefsBlock data={data} />
        {data.hobbies && <div><h3 className="text-[11px] font-black cv-accent-text uppercase tracking-wider mb-1.5">✦ Interests</h3><p className="text-[10px] text-foreground/70">{data.hobbies}</p></div>}
      </div>
    </div>
  );
}

/* ── Elegant Template ── */
function ElegantLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full" style={{ fontFamily: 'Georgia, serif', backgroundColor: 'hsl(var(--primary) / 0.04)' }}>
      <div className="cv-hero px-5 py-6 text-center">
        {data.photo && (
          <div className="flex justify-center mb-3">
            <img src={data.photo} alt="" className="cv-photo w-20 h-20 rounded-full object-cover border-[3px] cv-accent-border" />
          </div>
        )}
        <h1 className="cv-name text-[26px] font-bold cv-accent-text leading-tight italic">{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className="text-[11px] cv-accent-text mt-1 italic tracking-wide opacity-80">— {data.jobTitle} —</p>}
        <div className="flex items-center justify-center gap-2 my-3">
          <span className="h-px w-12 cv-accent-rule opacity-50" />
          <span className="cv-accent-text">❦</span>
          <span className="h-px w-12 cv-accent-rule opacity-50" />
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] text-foreground/70">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
        </div>
      </div>
      <div className="cv-main px-5 pb-5 space-y-4 bg-white mx-3 mb-3 rounded-sm border pt-4" style={{ borderColor: 'hsl(var(--primary) / 0.2)' }}>
        {data.summary && <div><h3 className="text-[12px] font-bold cv-accent-text mb-1.5 italic">Profile</h3><p className="text-[10px] text-foreground/75 leading-relaxed">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        <SkillsList data={data} />
        <LanguagesList data={data} />
        <CertsList data={data} />
        <RefsBlock data={data} />
      </div>
    </div>
  );
}

/* ── Timeline Template ── */
function TimelineLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full">
      <div className="cv-hero px-5 py-4 cv-accent-soft border-l-[5px] cv-accent-border flex items-center gap-4">
        {data.photo
          ? <img src={data.photo} alt="" className="cv-photo w-16 h-16 rounded-full object-cover cv-accent-ring" />
          : <div className="cv-photo w-16 h-16 rounded-full bg-white/60 flex items-center justify-center"><User className="w-7 h-7 cv-accent-text opacity-60" /></div>}
        <div className="min-w-0 flex-1">
          <h1 className="cv-name text-[20px] font-extrabold text-foreground leading-tight">{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className="text-[11px] cv-accent-text font-semibold uppercase tracking-wider mt-0.5">{data.jobTitle}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[9px] text-foreground/65">
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>☎ {data.phone}</span>}
            {data.location && <span>📍 {data.location}</span>}
          </div>
        </div>
      </div>
      <div className="cv-main p-4 space-y-4">
        {data.summary && <div><h3 className="text-[11px] font-extrabold cv-accent-text uppercase tracking-wider mb-1.5">About</h3><p className="text-[10px] text-foreground/75 leading-relaxed">{data.summary}</p></div>}
        <div className="relative pl-4 border-l-2 cv-accent-border space-y-3">
          <h3 className="text-[11px] font-extrabold cv-accent-text uppercase tracking-wider -ml-4 mb-1">Journey</h3>
          {(data.experiences || []).filter((e: any) => e.company || e.position).map((e: any, i: number) => (
            <div key={i} className="relative">
              <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full cv-accent-bg border-2 border-white" />
              <p className="text-[11px] font-bold text-foreground">{e.company}{e.position ? ` · ${e.position}` : ""}</p>
              {e.startDate && <p className="text-[9px] cv-accent-text font-semibold">{formatDate(e.startDate)} – {e.current ? "Present" : formatDate(e.endDate)}</p>}
              {e.description && <p className="text-[10px] text-foreground/70 leading-relaxed mt-0.5">{e.description}</p>}
            </div>
          ))}
        </div>
        <EducationBlock data={data} />
        <SkillsList data={data} />
        <LanguagesList data={data} />
        <CertsList data={data} />
        <RefsBlock data={data} />
      </div>
    </div>
  );
}

/* ── Compact Template ── */
function CompactLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full p-4 space-y-3">
      <div className="cv-hero flex items-center gap-3 pb-2 border-b-2 cv-accent-border">
        {data.photo && <img src={data.photo} alt="" className="cv-photo w-14 h-14 rounded-md object-cover" />}
        <div className="min-w-0 flex-1">
          <h1 className="cv-name text-[18px] font-extrabold leading-tight">{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className="text-[10px] cv-accent-text font-bold uppercase tracking-wider">{data.jobTitle}</p>}
          <div className="flex flex-wrap gap-x-2 text-[9px] text-foreground/60 mt-0.5">
            {data.email && <span>{data.email}</span>}{data.phone && <span>· {data.phone}</span>}{data.location && <span>· {data.location}</span>}
          </div>
        </div>
      </div>
      <div className="cv-main grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2.5">
          {data.summary && <p className="text-[10px] text-foreground/75 leading-snug italic border-l-2 cv-accent-border pl-2">{data.summary}</p>}
          <ExperienceBlock data={data} />
          <EducationBlock data={data} />
        </div>
        <div className="space-y-2.5">
          <SkillsList data={data} />
          <LanguagesList data={data} />
          <CertsList data={data} />
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar (dark rail) Template ── */
function SidebarLayout({ data }: { data: any }) {
  return (
    <div className="cv-flex-cols flex min-h-full">
      <div className="cv-sidebar w-[36%] shrink-0 p-4 space-y-5 text-white" style={{ background: 'linear-gradient(180deg, #18181b, #27272a)' }}>
        <div className="text-center">
          {data.photo
            ? <img src={data.photo} alt="" className="cv-photo w-20 h-20 rounded-full object-cover mx-auto border-2" style={{ borderColor: 'hsl(var(--primary))' }} />
            : <div className="cv-photo w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto"><User className="w-9 h-9 text-white/50" /></div>}
          <h1 className="cv-name text-[15px] font-extrabold mt-2 leading-tight">{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: 'hsl(var(--primary))' }}>{data.jobTitle}</p>}
        </div>
        <div className="space-y-1 text-[10px] text-white/80">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'hsl(var(--primary))' }}>Contact</p>
          {data.email && <p className="break-all">✉ {data.email}</p>}
          {data.phone && <p>☎ {data.phone}</p>}
          {data.location && <p>📍 {data.location}</p>}
          {data.linkedin && <p className="break-all">in/ {data.linkedin}</p>}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'hsl(var(--primary))' }}>Skills</p>
          <div className="flex flex-wrap gap-1">
            {(data.skills || []).filter((s: any) => s.name).map((s: any, i: number) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/90">{s.name}</span>
            ))}
          </div>
        </div>
        {(data.languages || []).filter((l: any) => l.name).length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'hsl(var(--primary))' }}>Languages</p>
            {(data.languages || []).filter((l: any) => l.name).map((l: any, i: number) => (
              <p key={i} className="text-[10px] text-white/80">{l.name} <span className="text-white/50">· {l.proficiency}</span></p>
            ))}
          </div>
        )}
      </div>
      <div className="cv-main flex-1 p-4 space-y-4 bg-white">
        {data.summary && <div><h3 className="text-[11px] font-extrabold cv-accent-text uppercase tracking-wider mb-1.5">Profile</h3><p className="text-[10px] text-foreground/75 leading-relaxed">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        <CertsList data={data} />
        <RefsBlock data={data} />
      </div>
    </div>
  );
}

/* ── Bold Color Block Template ── */
function BoldLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full">
      <div className="cv-hero cv-accent-bg p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative flex items-end gap-4">
          {data.photo && <img src={data.photo} alt="" className="cv-photo w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="cv-name text-[26px] font-black text-white leading-none uppercase tracking-tight">{data.fullName || "Your Name"}</h1>
            {data.jobTitle && <p className="text-[12px] font-bold text-white/95 mt-1">{data.jobTitle}</p>}
          </div>
        </div>
      </div>
      <div className="cv-main p-5 space-y-4">
        <div className="grid grid-cols-3 gap-2 -mt-5 relative z-10">
          {data.email && <div className="bg-white shadow-md rounded-lg p-2 text-[9px]"><p className="cv-accent-text font-bold uppercase">Email</p><p className="break-all">{data.email}</p></div>}
          {data.phone && <div className="bg-white shadow-md rounded-lg p-2 text-[9px]"><p className="cv-accent-text font-bold uppercase">Phone</p><p>{data.phone}</p></div>}
          {data.location && <div className="bg-white shadow-md rounded-lg p-2 text-[9px]"><p className="cv-accent-text font-bold uppercase">Location</p><p>{data.location}</p></div>}
        </div>
        {data.summary && <div><h3 className="text-[12px] font-black cv-accent-text uppercase tracking-wider mb-1.5">▍ About Me</h3><p className="text-[10px] text-foreground/75 leading-relaxed">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        <SkillsList data={data} />
        <LanguagesList data={data} />
        <CertsList data={data} />
      </div>
    </div>
  );
}

/* ── Academic Serif Template ── */
function AcademicLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full p-5 space-y-4" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      <div className="cv-hero text-center pb-3 border-b-[3px] border-double cv-accent-border">
        <h1 className="cv-name text-[24px] font-bold text-foreground leading-tight">{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className="text-[11px] cv-accent-text mt-1 italic">{data.jobTitle}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 mt-2 text-[10px] text-foreground/70">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
        </div>
      </div>
      <div className="cv-main space-y-3">
        {data.summary && <div><h3 className="text-[12px] font-bold cv-accent-text uppercase tracking-[0.15em] mb-1">Summary</h3><p className="text-[10px] text-foreground/80 leading-relaxed text-justify">{data.summary}</p></div>}
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        <CertsList data={data} />
        <SkillsList data={data} />
        <LanguagesList data={data} />
        <RefsBlock data={data} />
      </div>
    </div>
  );
}

/* ── Tech Mono Template ── */
function TechLayout({ data }: { data: any }) {
  return (
    <div className="min-h-full" style={{ fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace' }}>
      <div className="cv-hero p-4 border-b-2 cv-accent-border bg-foreground/[0.03]">
        <p className="text-[9px] cv-accent-text font-semibold mb-1">{`> whoami`}</p>
        <h1 className="cv-name text-[22px] font-bold text-foreground leading-tight">{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className="text-[11px] text-foreground/70 mt-0.5">{`// ${data.jobTitle}`}</p>}
        <div className="flex flex-wrap gap-x-3 mt-2 text-[9px] text-foreground/60">
          {data.email && <span>email: <span className="cv-accent-text">{data.email}</span></span>}
          {data.phone && <span>tel: <span className="cv-accent-text">{data.phone}</span></span>}
          {data.location && <span>loc: <span className="cv-accent-text">{data.location}</span></span>}
        </div>
      </div>
      <div className="cv-main p-4 space-y-4">
        {data.summary && <div><h3 className="text-[11px] font-bold cv-accent-text mb-1">{`## summary`}</h3><p className="text-[10px] text-foreground/75 leading-relaxed">{data.summary}</p></div>}
        <div>
          <h3 className="text-[11px] font-bold cv-accent-text mb-1">{`## stack`}</h3>
          <div className="flex flex-wrap gap-1">
            {(data.skills || []).filter((s: any) => s.name).map((s: any, i: number) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded cv-accent-soft cv-accent-text border cv-accent-border">{s.name}</span>
            ))}
          </div>
        </div>
        <ExperienceBlock data={data} />
        <EducationBlock data={data} />
        <CertsList data={data} />
        <LanguagesList data={data} />
      </div>
    </div>
  );
}

/* ── Style Customization ────────────────────────── */
const ACCENT_COLORS = [
  { id: "emerald", name: "Emerald", hsl: "152 60% 40%" },
  { id: "blue", name: "Ocean", hsl: "217 91% 50%" },
  { id: "navy", name: "Navy", hsl: "222 65% 22%" },
  { id: "gold", name: "Gold", hsl: "38 78% 42%" },
  { id: "rose", name: "Rose", hsl: "346 77% 45%" },
  { id: "purple", name: "Purple", hsl: "270 70% 50%" },
  { id: "slate", name: "Slate", hsl: "215 20% 35%" },
  { id: "black", name: "Mono", hsl: "0 0% 12%" },
  { id: "teal", name: "Teal", hsl: "180 65% 35%" },
  { id: "orange", name: "Sunset", hsl: "22 90% 50%" },
  { id: "burgundy", name: "Burgundy", hsl: "350 60% 32%" },
  { id: "forest", name: "Forest", hsl: "140 55% 25%" },
] as const;
type AccentId = typeof ACCENT_COLORS[number]["id"];

const HEADER_STYLES = [
  { id: "standard", name: "Standard" },
  { id: "bold", name: "Bold" },
  { id: "banner", name: "Banner" },
  { id: "minimal", name: "Minimal" },
  { id: "split", name: "Split" },
  { id: "stripe", name: "Stripe" },
] as const;
type HeaderStyleId = typeof HEADER_STYLES[number]["id"];

const COLUMN_STYLES = [
  { id: "auto", name: "Default" },
  { id: "one", name: "1 Column" },
  { id: "two", name: "2 Columns" },
] as const;
type ColumnStyleId = typeof COLUMN_STYLES[number]["id"];

const FONT_FAMILIES = [
  { id: "sans", name: "Sans", css: "" },
  { id: "serif", name: "Serif", css: "Georgia, 'Times New Roman', serif" },
  { id: "mono", name: "Mono", css: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace" },
  { id: "display", name: "Display", css: "'Inter', system-ui, -apple-system, sans-serif" },
] as const;
type FontFamilyId = typeof FONT_FAMILIES[number]["id"];

const PHOTO_SHAPES = [
  { id: "default", name: "Default" },
  { id: "round", name: "Circle" },
  { id: "square", name: "Square" },
  { id: "rounded", name: "Rounded" },
] as const;
type PhotoShapeId = typeof PHOTO_SHAPES[number]["id"];

const SECTION_DIVIDERS = [
  { id: "default", name: "Default" },
  { id: "underline", name: "Underline" },
  { id: "pill", name: "Pill" },
  { id: "bar", name: "Side Bar" },
] as const;
type SectionDividerId = typeof SECTION_DIVIDERS[number]["id"];

export interface CVStyle {
  accent: AccentId;
  header: HeaderStyleId;
  columns: ColumnStyleId;
  fontScale: number; // 0.9 - 1.15
  fontFamily?: FontFamilyId;
  photoShape?: PhotoShapeId;
  sectionDivider?: SectionDividerId;
}

function CVDocumentLayout({ data, template, style }: { data: any; template: TemplateId; style?: CVStyle }) {
  const accent = ACCENT_COLORS.find(a => a.id === style?.accent) || ACCENT_COLORS[0];
  const fontFamily = FONT_FAMILIES.find(f => f.id === style?.fontFamily);
  const wrapStyle: React.CSSProperties = {
    ['--primary' as any]: accent.hsl,
    ['--accent' as any]: accent.hsl,
    fontSize: `${style?.fontScale ?? 1}em`,
    ...(fontFamily?.css ? { fontFamily: fontFamily.css } : {}),
  };
  const cls = cn(
    "cv-doc h-full",
    style?.columns === "one" && "cv-cols-1",
    style?.columns === "two" && "cv-cols-2",
    style?.header && `cv-header-${style.header}`,
    style?.photoShape && style.photoShape !== "default" && `cv-photo-${style.photoShape}`,
    style?.sectionDivider && style.sectionDivider !== "default" && `cv-divider-${style.sectionDivider}`,
  );
  const inner = (() => {
    if (template === "modern") return <ModernLayout data={data} />;
    if (template === "minimal") return <MinimalLayout data={data} />;
    if (template === "professional") return <ProfessionalLayout data={data} />;
    if (template === "premium") return <PremiumLayout data={data} />;
    if (template === "executive") return <ExecutiveLayout data={data} />;
    if (template === "creative") return <CreativeLayout data={data} />;
    if (template === "elegant") return <ElegantLayout data={data} />;
    if (template === "timeline") return <TimelineLayout data={data} />;
    if (template === "compact") return <CompactLayout data={data} />;
    if (template === "sidebar") return <SidebarLayout data={data} />;
    if (template === "bold") return <BoldLayout data={data} />;
    if (template === "academic") return <AcademicLayout data={data} />;
    if (template === "tech") return <TechLayout data={data} />;
    return <ClassicLayout data={data} />;
  })();
  return <div className={cls} style={wrapStyle}>{inner}</div>;
}

/* ── CV Preview Modal ─────────────────────────────── */
const CVPreviewModal = forwardRef<HTMLDivElement, { open: boolean; onClose: () => void; data: any; template: TemplateId; style?: CVStyle }>(({ open, onClose, data, template, style }, ref) => {
  if (!open) return null;

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
            <span className="text-[9px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded capitalize">{template}</span>
          </div>
          <button onClick={onClose} className="text-[11px] font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10 active:scale-95 transition-transform">
            Close
          </button>
        </div>

        {/* CV Document */}
        <div className="overflow-y-auto flex-1">
          <CVDocumentLayout data={data} template={template} style={style} />
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
  const initialFull = (user?.user_metadata?.full_name || "").trim();
  const initialParts = initialFull.split(/\s+/);
  const [firstName, setFirstName] = useState(initialParts[0] || "");
  const [lastName, setLastName] = useState(initialParts.slice(1).join(" ") || "");
  const fullName = [firstName, lastName].map(s => s.trim()).filter(Boolean).join(" ");
  const setFullName = (v: string) => {
    const parts = v.trim().split(/\s+/);
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
  };
  const [dateOfBirth, setDateOfBirth] = useState(""); // YYYY-MM-DD
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
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cvId, setCvId] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("classic");
  const [cvStyle, setCvStyle] = useState<CVStyle>(() => {
    try {
      const raw = localStorage.getItem("zivo.cv.style");
      if (raw) return JSON.parse(raw) as CVStyle;
    } catch {}
    return { accent: "emerald", header: "standard", columns: "auto", fontScale: 1, fontFamily: "sans" as const, photoShape: "default" as const, sectionDivider: "default" as const };
  });
  useEffect(() => {
    try { localStorage.setItem("zivo.cv.style", JSON.stringify(cvStyle)); } catch {}
  }, [cvStyle]);
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
  const exportRef = useRef<HTMLDivElement>(null);

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
        setDateOfBirth((data as any).date_of_birth || "");
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
      date_of_birth: dateOfBirth || null,
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
  }, [user, cvId, fullName, dateOfBirth, jobTitle, email, phone, location, website, linkedin, portfolio, summary, experiences, educations, skills, languages, certifications, references, hobbies, selectedTemplate, photo]);

  const handleSave = useCallback(() => doSave(false), [doSave]);

  /* ── Auto-save debounce (3s after changes) ──────── */
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { doSave(true); }, 3000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [fullName, dateOfBirth, jobTitle, email, phone, location, website, linkedin, portfolio, summary, experiences, educations, skills, languages, certifications, references, hobbies, doSave]);

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

  const previewData = { photo, firstName, lastName, fullName, dateOfBirth, jobTitle, email, phone, location, website, linkedin, portfolio, summary, experiences, educations, skills, languages, certifications, references, hobbies };

  const handleShare = () => {
    if (!shareCode) { toast.error("Save your CV first to get a share link"); return; }
    const url = `${window.location.origin}/cv/${shareCode}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Share link copied!")).catch(() => toast.error("Failed to copy"));
  };


  const waitForExportAssets = async (element: HTMLDivElement) => {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(images.map((img) => (
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          })
    )));

    if ("fonts" in document) {
      await document.fonts.ready;
    }
  };

  const handleDownloadPDF = async () => {
    const el = exportRef.current;
    if (!el) {
      toast.error("PDF export is not ready yet");
      return;
    }

    try {
      setDownloading(true);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await waitForExportAssets(el);

      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const imageData = canvas.toDataURL("image/png");

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0.1) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      const fileBaseName = (fullName.trim() || "cv")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "cv";

      pdf.save(`${fileBaseName}-a4.pdf`);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const fileBaseName = () => (fullName.trim() || "cv")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cv";

  const handleDownloadWord = async () => {
    try {
      setDownloading(true);
      const docx = await import("docx");
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

      const H = (text: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 }, children: [new TextRun({ text, bold: true })] });
      const P = (text: string, opts: any = {}) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, ...opts })] });
      const Bullet = (text: string) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun(text)] });

      const children: any[] = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: fullName || "Your Name", bold: true, size: 40 })] }),
        jobTitle ? new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: jobTitle, size: 24, color: "555555" })] }) : null,
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({
          text: [email, phone, location, dateOfBirth ? `DOB: ${dateOfBirth}` : ""].filter(Boolean).join("  •  "),
          size: 20, color: "666666",
        })] }),
      ].filter(Boolean);

      if (summary) { children.push(H("Professional Summary")); children.push(P(summary)); }

      if (experiences.some(e => e.position || e.company)) {
        children.push(H("Work Experience"));
        experiences.forEach(e => {
          if (!e.position && !e.company) return;
          children.push(P(`${e.position}${e.company ? " — " + e.company : ""}`, { bold: true }));
          children.push(P(`${e.startDate || ""} – ${e.current ? "Present" : (e.endDate || "")}`, { italics: true, color: "666666" }));
          if (e.description) children.push(P(e.description));
        });
      }

      if (educations.some(e => e.school || e.degree)) {
        children.push(H("Education"));
        educations.forEach(e => {
          if (!e.school && !e.degree) return;
          children.push(P(`${e.degree}${e.field ? ", " + e.field : ""}`, { bold: true }));
          children.push(P(`${e.school} • ${e.startDate || ""} – ${e.endDate || ""}${e.gpa ? " • GPA: " + e.gpa : ""}`, { color: "666666" }));
        });
      }

      const validSkills = skills.filter(s => s.name.trim());
      if (validSkills.length) { children.push(H("Skills")); validSkills.forEach(s => children.push(Bullet(`${s.name} — ${s.level}`))); }

      const validLangs = languages.filter(l => l.name.trim());
      if (validLangs.length) { children.push(H("Languages")); validLangs.forEach(l => children.push(Bullet(`${l.name} — ${l.proficiency}`))); }

      if (certifications.length) {
        children.push(H("Certifications"));
        certifications.forEach(c => children.push(Bullet(`${c.name}${c.issuer ? " — " + c.issuer : ""}${c.date ? " (" + c.date + ")" : ""}`)));
      }

      if (references.length) {
        children.push(H("References"));
        references.forEach(r => children.push(P(`${r.name} — ${r.position}${r.company ? ", " + r.company : ""} • ${r.email} ${r.phone}`)));
      }

      if (hobbies) { children.push(H("Hobbies & Interests")); children.push(P(hobbies)); }

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `${fileBaseName()}.docx`);
      toast.success("Word document downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Word file");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadExcel = () => {
    try {
      setDownloading(true);
      const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const rows: string[][] = [
        ["Section", "Field", "Value"],
        ["Personal", "First Name", firstName],
        ["Personal", "Last Name", lastName],
        ["Personal", "Full Name", fullName],
        ["Personal", "Date of Birth", dateOfBirth],
        ["Personal", "Job Title", jobTitle],
        ["Personal", "Email", email],
        ["Personal", "Phone", phone],
        ["Personal", "Location", location],
        ["Personal", "Website", website],
        ["Personal", "LinkedIn", linkedin],
        ["Personal", "Portfolio", portfolio],
        ["Personal", "Summary", summary],
      ];
      experiences.forEach((e, i) => {
        rows.push([`Experience ${i + 1}`, "Position", e.position]);
        rows.push([`Experience ${i + 1}`, "Company", e.company]);
        rows.push([`Experience ${i + 1}`, "Period", `${e.startDate} – ${e.current ? "Present" : e.endDate}`]);
        rows.push([`Experience ${i + 1}`, "Description", e.description]);
      });
      educations.forEach((e, i) => {
        rows.push([`Education ${i + 1}`, "School", e.school]);
        rows.push([`Education ${i + 1}`, "Degree", e.degree]);
        rows.push([`Education ${i + 1}`, "Field", e.field]);
        rows.push([`Education ${i + 1}`, "Period", `${e.startDate} – ${e.endDate}`]);
        rows.push([`Education ${i + 1}`, "GPA", e.gpa]);
      });
      skills.forEach(s => rows.push(["Skill", s.name, s.level]));
      languages.forEach(l => rows.push(["Language", l.name, l.proficiency]));
      certifications.forEach(c => rows.push(["Certification", c.name, `${c.issuer} ${c.date}`]));
      references.forEach(r => rows.push(["Reference", r.name, `${r.position}, ${r.company} • ${r.email} ${r.phone}`]));
      if (hobbies) rows.push(["Hobbies", "—", hobbies]);

      const csv = "\uFEFF" + rows.map(r => r.map(esc).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `${fileBaseName()}.csv`);
      toast.success("Excel (CSV) downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel");
    } finally {
      setDownloading(false);
    }
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
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-[11px] sm:text-sm md:text-base font-bold text-foreground">CV Template</span>
            </div>
            <span className="text-[9px] sm:text-xs text-muted-foreground">{CV_TEMPLATES.length} designs</span>
          </div>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x scrollbar-hide">
            {CV_TEMPLATES.map(t => {
              const active = selectedTemplate === t.id;
              const accentHsl = ACCENT_COLORS.find(a => a.id === cvStyle.accent)?.hsl || ACCENT_COLORS[0].hsl;
              return (
                <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                  className={cn("shrink-0 w-[110px] sm:w-[140px] md:w-[160px] snap-start rounded-xl border-2 overflow-hidden text-left touch-manipulation active:scale-95 transition-all",
                    active ? "border-primary shadow-md" : "border-border/30 bg-card")}>
                  <div
                    className="h-12 sm:h-16 md:h-20 relative"
                    style={{
                      background: t.id === "classic"
                        ? `linear-gradient(135deg, hsl(${accentHsl} / 0.18), hsl(${accentHsl} / 0.05))`
                        : t.id === "minimal"
                        ? `linear-gradient(135deg, hsl(${accentHsl} / 0.08), #fafafa)`
                        : t.id === "executive"
                        ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
                        : t.id === "elegant"
                        ? `linear-gradient(135deg, hsl(${accentHsl} / 0.12), #fff)`
                        : `linear-gradient(135deg, hsl(${accentHsl}), hsl(${accentHsl} / 0.55))`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-sm border border-white/60" />
                    </div>
                    {active && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <span className={cn("text-[11px] font-bold block leading-tight", active ? "text-primary" : "text-foreground")}>{t.name}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{t.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Style Customization Panel */}
        <div className="mb-4 rounded-2xl border border-border/30 bg-card/60 p-3 space-y-3">
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-foreground">Customize Style</span>
            <button onClick={() => setCvStyle({ accent: "emerald", header: "standard", columns: "auto", fontScale: 1, fontFamily: "sans", photoShape: "default", sectionDivider: "default" })}
              className="ml-auto text-[9px] font-semibold text-muted-foreground hover:text-primary">Reset</button>
          </div>

          {/* Accent color */}
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-1">Accent Color</p>
            <div className="flex gap-1.5 flex-wrap">
              {ACCENT_COLORS.map(c => {
                const active = cvStyle.accent === c.id;
                return (
                  <button key={c.id} onClick={() => setCvStyle(s => ({ ...s, accent: c.id }))}
                    aria-label={c.name}
                    className={cn("w-7 h-7 rounded-full border-2 transition-all touch-manipulation active:scale-90",
                      active ? "border-foreground scale-110 shadow-md" : "border-white/60 hover:border-foreground/40")}
                    style={{ backgroundColor: `hsl(${c.hsl})` }}>
                    {active && <Check className="w-3 h-3 text-white mx-auto" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout columns */}
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-1">Layout</p>
            <div className="grid grid-cols-3 gap-1.5">
              {COLUMN_STYLES.map(o => {
                const active = cvStyle.columns === o.id;
                return (
                  <button key={o.id} onClick={() => setCvStyle(s => ({ ...s, columns: o.id }))}
                    className={cn("px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all touch-manipulation active:scale-95",
                      active ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-foreground/70")}>
                    {o.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Header style */}
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-1">Header Style</p>
            <div className="grid grid-cols-3 gap-1.5">
              {HEADER_STYLES.map(o => {
                const active = cvStyle.header === o.id;
                return (
                  <button key={o.id} onClick={() => setCvStyle(s => ({ ...s, header: o.id }))}
                    className={cn("px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all touch-manipulation active:scale-95",
                      active ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-foreground/70")}>
                    {o.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font family */}
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-1">Font Family</p>
            <div className="grid grid-cols-4 gap-1.5">
              {FONT_FAMILIES.map(o => {
                const active = (cvStyle.fontFamily || "sans") === o.id;
                return (
                  <button key={o.id} onClick={() => setCvStyle(s => ({ ...s, fontFamily: o.id }))}
                    style={o.css ? { fontFamily: o.css } : undefined}
                    className={cn("px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all touch-manipulation active:scale-95",
                      active ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-foreground/70")}>
                    {o.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo shape */}
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-1">Photo Shape</p>
            <div className="grid grid-cols-4 gap-1.5">
              {PHOTO_SHAPES.map(o => {
                const active = (cvStyle.photoShape || "default") === o.id;
                return (
                  <button key={o.id} onClick={() => setCvStyle(s => ({ ...s, photoShape: o.id }))}
                    className={cn("px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all touch-manipulation active:scale-95",
                      active ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-foreground/70")}>
                    {o.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section divider */}
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-1">Section Divider</p>
            <div className="grid grid-cols-4 gap-1.5">
              {SECTION_DIVIDERS.map(o => {
                const active = (cvStyle.sectionDivider || "default") === o.id;
                return (
                  <button key={o.id} onClick={() => setCvStyle(s => ({ ...s, sectionDivider: o.id }))}
                    className={cn("px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all touch-manipulation active:scale-95",
                      active ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-foreground/70")}>
                    {o.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font size */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/70">Font Size</p>
              <span className="text-[10px] font-bold text-primary">{Math.round(cvStyle.fontScale * 100)}%</span>
            </div>
            <input type="range" min={0.9} max={1.15} step={0.05} value={cvStyle.fontScale}
              onChange={e => setCvStyle(s => ({ ...s, fontScale: parseFloat(e.target.value) }))}
              className="w-full accent-primary" />
          </div>
        </div>

        {/* Live Preview (inline) — instantly reflects template + style */}
        <div className="mb-4 rounded-2xl border border-border/30 bg-card/60 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-muted/30">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-bold text-foreground">Live Preview</span>
              <span className="text-[9px] text-muted-foreground bg-background px-1.5 py-0.5 rounded capitalize">{selectedTemplate}</span>
            </div>
            <button onClick={() => setShowPreview(true)}
              className="text-[10px] font-semibold text-primary px-2 py-1 rounded-md bg-primary/10 active:scale-95 transition-transform">
              Full View
            </button>
          </div>
          <div className="bg-muted/10 p-2 max-h-[360px] overflow-hidden">
            <div className="origin-top mx-auto bg-white rounded shadow-sm overflow-hidden" style={{ transform: 'scale(0.78)', transformOrigin: 'top center', width: '128%', marginLeft: '-14%' }}>
              <div className="w-full" style={{ minHeight: 440 }}>
                <CVDocumentLayout data={previewData} template={selectedTemplate} style={cvStyle} />
              </div>
            </div>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={lblCls}>First Name *</label>
                    <input className={inputCls} placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className={lblCls}>Last Name</label>
                    <input className={inputCls} placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={lblCls}>Date of Birth</label>
                  <input type="date" className={inputCls} value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
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
                {/* Quick-pick popular skills with real logos */}
                <div className="rounded-xl border border-border/40 bg-muted/20 p-2">
                  <p className="text-[10px] font-semibold text-muted-foreground/80 mb-1.5 uppercase tracking-wider">Quick add</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SKILLS.slice(0, 14).map(p => {
                      const already = skills.some(s => s.name.trim().toLowerCase() === p.name.toLowerCase());
                      return (
                        <button
                          key={p.slug}
                          type="button"
                          disabled={already}
                          onClick={() => setSkills(prev => {
                            const empty = prev.find(s => !s.name.trim());
                            if (empty) return prev.map(s => s.id === empty.id ? { ...s, name: p.name } : s);
                            return [...prev, { id: uid(), name: p.name, level: "Intermediate" }];
                          })}
                          className={cn(
                            "h-7 px-2 rounded-full border border-border/50 bg-card flex items-center gap-1 text-[10px] font-semibold text-foreground/80 touch-manipulation active:scale-95 transition-all",
                            already && "opacity-40"
                          )}
                        >
                          <SkillLogo name={p.name} size={12} />
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {skills.map(sk => {
                  const preset = findPresetSkill(sk.name);
                  return (
                    <div key={sk.id} className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input className={cn(inputCls, "w-full", preset && "pl-7")} placeholder="e.g. React, Python" value={sk.name} onChange={e => updateSkill(sk.id, "name", e.target.value)} />
                        {preset && (
                          <SkillLogo name={preset.name} size={16} className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                      <select className={cn(inputCls, "w-[105px] text-[11px]")} value={sk.level} onChange={e => updateSkill(sk.id, "level", e.target.value)}>
                        {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      {skills.length > 1 && (
                        <button onClick={() => setSkills(p => p.filter(s => s.id !== sk.id))} className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 touch-manipulation"><Trash2 className="w-3 h-3 text-destructive" /></button>
                      )}
                    </div>
                  );
                })}
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
          <button onClick={() => void handleDownloadPDF()} disabled={downloading}
            className="h-10 rounded-xl border border-border/40 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all disabled:opacity-60">
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloading ? "Preparing PDF…" : "Download PDF"}
          </button>
          <button onClick={handleShare}
            className="h-10 rounded-xl border border-border/40 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all">
            <Share2 className="w-3.5 h-3.5" /> Share Link
          </button>
          <button onClick={() => void handleDownloadWord()} disabled={downloading}
            className="h-10 rounded-xl border border-border/40 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all disabled:opacity-60">
            <img src="https://cdn.simpleicons.org/microsoftword/2B579A" alt="" className="w-3.5 h-3.5" loading="lazy" /> Word (.docx)
          </button>
          <button onClick={handleDownloadExcel} disabled={downloading}
            className="h-10 rounded-xl border border-border/40 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all disabled:opacity-60">
            <img src="https://cdn.simpleicons.org/microsoftexcel/217346" alt="" className="w-3.5 h-3.5" loading="lazy" /> Excel (.csv)
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
        {showPreview && <CVPreviewModal open={showPreview} onClose={() => setShowPreview(false)} data={previewData} template={selectedTemplate} style={cvStyle} />}
      </AnimatePresence>

      {/* Hidden A4 export container */}
      <div className="fixed left-[-10000px] top-0 pointer-events-none" aria-hidden="true">
        <div ref={exportRef} id="cv-export-area" className="w-[210mm] min-h-[297mm] bg-white" style={{ fontFamily: "system-ui, sans-serif", color: "#1a1a1a" }}>
          <CVDocumentLayout data={previewData} template={selectedTemplate} style={cvStyle} />
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
