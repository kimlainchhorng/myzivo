/**
 * CreateCVPage — CV/Resume builder with form sections.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, User, Briefcase, GraduationCap,
  Wrench, Globe, Award, Save, FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/app/AppLayout";
import { toast } from "sonner";

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

const CreateCVPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");

  const [experiences, setExperiences] = useState<WorkExperience[]>([
    { id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", description: "" },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    { id: crypto.randomUUID(), school: "", degree: "", field: "", startDate: "", endDate: "" },
  ]);

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", description: "" },
    ]);
  };

  const removeExperience = (id: string) => {
    if (experiences.length > 1) setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setExperiences((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), school: "", degree: "", field: "", startDate: "", endDate: "" },
    ]);
  };

  const removeEducation = (id: string) => {
    if (educations.length > 1) setEducations((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducations((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    toast.success("CV saved successfully!");
  };

  const inputClass =
    "w-full px-2.5 py-2 rounded-lg border border-border/50 bg-background text-[13px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  const labelClass = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  return (
    <AppLayout title="Create CV" hideHeader>
      <div className="flex flex-col px-3.5 pt-2.5 pb-24">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-[15px]">Create CV</h1>
            <p className="text-[10px] text-muted-foreground">Build your resume to apply for jobs</p>
          </div>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold touch-manipulation active:scale-95 transition-transform flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>

        {/* Personal Information */}
        <Section icon={User} title="Personal Information" index={0}>
          <div className="space-y-2">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input className={inputClass} placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} placeholder="+1 234 567 890" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input className={inputClass} placeholder="City, Country" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Professional Summary</label>
              <textarea
                className={cn(inputClass, "min-h-[80px] resize-none")}
                placeholder="Brief summary of your professional background..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* Work Experience */}
        <Section icon={Briefcase} title="Work Experience" index={1}>
          <div className="space-y-4">
            {experiences.map((exp, i) => (
              <div key={exp.id} className="relative rounded-xl border border-border/30 bg-muted/20 p-3 space-y-2.5">
                {experiences.length > 1 && (
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center touch-manipulation">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                )}
                <div>
                  <label className={labelClass}>Position</label>
                  <input className={inputClass} placeholder="Software Engineer" value={exp.position} onChange={(e) => updateExperience(exp.id, "position", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <input className={inputClass} placeholder="Company Name" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="month" className={inputClass} value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input type="month" className={inputClass} value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    className={cn(inputClass, "min-h-[60px] resize-none")}
                    placeholder="Key responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button onClick={addExperience} className="w-full py-2 rounded-xl border border-dashed border-primary/30 text-primary text-[13px] font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98]">
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </div>
        </Section>

        {/* Education */}
        <Section icon={GraduationCap} title="Education" index={2}>
          <div className="space-y-4">
            {educations.map((edu) => (
              <div key={edu.id} className="relative rounded-xl border border-border/30 bg-muted/20 p-3 space-y-2.5">
                {educations.length > 1 && (
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center touch-manipulation">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                )}
                <div>
                  <label className={labelClass}>School / University</label>
                  <input className={inputClass} placeholder="University Name" value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass}>Degree</label>
                    <input className={inputClass} placeholder="Bachelor's" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Field of Study</label>
                    <input className={inputClass} placeholder="Computer Science" value={edu.field} onChange={(e) => updateEducation(edu.id, "field", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="month" className={inputClass} value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input type="month" className={inputClass} value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="w-full py-2 rounded-xl border border-dashed border-primary/30 text-primary text-[13px] font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98]">
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </div>
        </Section>

        {/* Skills */}
        <Section icon={Wrench} title="Skills" index={3}>
          <div>
            <label className={labelClass}>Skills (comma-separated)</label>
            <textarea
              className={cn(inputClass, "min-h-[60px] resize-none")}
              placeholder="JavaScript, React, Node.js, Python..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
        </Section>

        {/* Languages */}
        <Section icon={Globe} title="Languages" index={4}>
          <div>
            <label className={labelClass}>Languages (comma-separated)</label>
            <input className={inputClass} placeholder="English, Khmer, Korean..." value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </div>
        </Section>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleSave}
          className="mt-5 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-[0.97] transition-all shadow-sm"
        >
          <FileText className="w-4 h-4" />
          Save & Preview CV
        </motion.button>
      </div>
    </AppLayout>
  );
};

/* Section wrapper */
function Section({ icon: Icon, title, index, children }: { icon: typeof User; title: string; index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04 }}
      className="mb-4"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-bold text-[14px]">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default CreateCVPage;
