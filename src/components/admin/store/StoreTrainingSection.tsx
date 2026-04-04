import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap, BookOpen, ClipboardCheck, Award, Plus, Search,
  CheckCircle2, Clock, Users, ChevronRight, Play, RotateCcw, Trash2, Edit
} from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string; }

type Program = {
  id: string; name: string; type: "onboarding" | "training" | "certification";
  description: string; modules: Module[]; assignedTo: string[]; createdAt: string;
};
type Module = { id: string; title: string; duration: string; completed: boolean; };

const DEMO_PROGRAMS: Program[] = [
  {
    id: "1", name: "New Hire Onboarding", type: "onboarding",
    description: "Complete onboarding checklist for new employees",
    modules: [
      { id: "m1", title: "Company Overview & Culture", duration: "30 min", completed: true },
      { id: "m2", title: "Systems & Tools Setup", duration: "1 hr", completed: true },
      { id: "m3", title: "Role-Specific Training", duration: "2 hr", completed: false },
      { id: "m4", title: "Safety & Compliance", duration: "45 min", completed: false },
      { id: "m5", title: "First Week Goals", duration: "15 min", completed: false },
    ],
    assignedTo: [], createdAt: "2026-03-15",
  },
  {
    id: "2", name: "Customer Service Excellence", type: "training",
    description: "Advanced customer interaction and conflict resolution",
    modules: [
      { id: "m6", title: "Communication Fundamentals", duration: "45 min", completed: false },
      { id: "m7", title: "Handling Complaints", duration: "1 hr", completed: false },
      { id: "m8", title: "Upselling Techniques", duration: "30 min", completed: false },
    ],
    assignedTo: [], createdAt: "2026-03-20",
  },
  {
    id: "3", name: "Food Safety Certification", type: "certification",
    description: "Required food handling and safety certification",
    modules: [
      { id: "m9", title: "Food Handling Basics", duration: "1 hr", completed: false },
      { id: "m10", title: "Temperature Control", duration: "45 min", completed: false },
      { id: "m11", title: "Sanitation Procedures", duration: "1 hr", completed: false },
      { id: "m12", title: "Final Assessment", duration: "30 min", completed: false },
    ],
    assignedTo: [], createdAt: "2026-04-01",
  },
];

export default function StoreTrainingSection({ storeId }: Props) {
  const [programs, setPrograms] = useState<Program[]>(DEMO_PROGRAMS);
  const [tab, setTab] = useState<"programs" | "assignments" | "certifications">("programs");
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newProgram, setNewProgram] = useState({ name: "", type: "training" as Program["type"], description: "" });

  const { data: employees = [] } = useQuery({
    queryKey: ["store-employees-training", storeId],
    queryFn: async () => {
      const { data } = await supabase.from("store_employees").select("*").eq("store_id", storeId).eq("status", "active");
      return data || [];
    },
  });

  const stats = [
    { icon: BookOpen, label: "Programs", value: programs.length, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { icon: ClipboardCheck, label: "Modules", value: programs.reduce((a, p) => a + p.modules.length, 0), color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Award, label: "Certifications", value: programs.filter(p => p.type === "certification").length, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Users, label: "Active Staff", value: employees.length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const typeConfig = {
    onboarding: { label: "Onboarding", color: "bg-emerald-100 text-emerald-700" },
    training: { label: "Training", color: "bg-blue-100 text-blue-700" },
    certification: { label: "Certification", color: "bg-amber-100 text-amber-700" },
  };

  const filtered = programs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!newProgram.name) return toast.error("Name required");
    const p: Program = {
      id: Date.now().toString(), name: newProgram.name, type: newProgram.type,
      description: newProgram.description, modules: [], assignedTo: [], createdAt: new Date().toISOString().split("T")[0],
    };
    setPrograms(prev => [p, ...prev]);
    setShowCreate(false);
    setNewProgram({ name: "", type: "training", description: "" });
    toast.success("Program created");
  };

  const toggleModule = (progId: string, modId: string) => {
    setPrograms(prev => prev.map(p =>
      p.id === progId ? { ...p, modules: p.modules.map(m => m.id === modId ? { ...m, completed: !m.completed } : m) } : p
    ));
    if (selectedProgram?.id === progId) {
      setSelectedProgram(prev => prev ? { ...prev, modules: prev.modules.map(m => m.id === modId ? { ...m, completed: !m.completed } : m) } : null);
    }
  };

  const getProgress = (p: Program) => {
    if (!p.modules.length) return 0;
    return Math.round((p.modules.filter(m => m.completed).length / p.modules.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {[
          { id: "programs" as const, label: "Programs", icon: BookOpen },
          { id: "assignments" as const, label: "Assignments", icon: Users },
          { id: "certifications" as const, label: "Certifications", icon: Award },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              tab === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search programs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="w-4 h-4 mr-1.5" /> Create Program
        </Button>
      </div>

      {/* Programs List */}
      {tab === "programs" && (
        <div className="space-y-3">
          {filtered.map(p => {
            const progress = getProgress(p);
            const cfg = typeConfig[p.type];
            return (
              <button key={p.id} onClick={() => setSelectedProgram(p)}
                className="w-full text-left rounded-xl border border-border/40 bg-card p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{p.name}</h3>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", cfg.color)}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
                  <span className="text-xs text-muted-foreground">{p.modules.length} modules</span>
                </div>
              </button>
            );
          })}
          {!filtered.length && (
            <div className="text-center py-12 text-muted-foreground text-sm">No programs found.</div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {tab === "assignments" && (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/30 text-xs text-muted-foreground">
              <th className="text-left px-4 py-3 font-medium">Employee</th>
              <th className="text-left px-4 py-3 font-medium">Program</th>
              <th className="text-left px-4 py-3 font-medium">Progress</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border/30">
              {employees.length ? employees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {(emp.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-xs">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground">{emp.role || "Staff"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">New Hire Onboarding</td>
                  <td className="px-4 py-3"><Progress value={40} className="h-1.5 w-24" /></td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">In Progress</Badge></td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground text-xs">No employees assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Certifications Tab */}
      {tab === "certifications" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.filter(p => p.type === "certification").map(p => (
            <div key={p.id} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{p.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{p.modules.length} modules • Required</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{getProgress(p)}%</span>
                </div>
                <Progress value={getProgress(p)} className="h-2" />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <span className="text-[10px] text-muted-foreground">Expires: Dec 31, 2026</span>
                <Badge variant="outline" className="text-[10px]">
                  {getProgress(p) === 100 ? "✓ Certified" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
          {!programs.filter(p => p.type === "certification").length && (
            <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">No certifications yet.</div>
          )}
        </div>
      )}

      {/* Program Detail Dialog */}
      <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgram(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedProgram && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base">{selectedProgram.name}</DialogTitle>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", typeConfig[selectedProgram.type].color)}>
                    {typeConfig[selectedProgram.type].label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selectedProgram.description}</p>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{getProgress(selectedProgram)}%</span>
                </div>
                <Progress value={getProgress(selectedProgram)} className="h-2 mb-4" />
                {selectedProgram.modules.map((m, i) => (
                  <button key={m.id} onClick={() => toggleModule(selectedProgram.id, m.id)}
                    className={cn("w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      m.completed ? "border-emerald-200 bg-emerald-50/50" : "border-border/40 hover:bg-muted/30"
                    )}>
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                      m.completed ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {m.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", m.completed && "line-through text-muted-foreground")}>{m.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {m.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Program</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Program Name</Label>
              <Input value={newProgram.name} onChange={e => setNewProgram(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Safety Training" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {(["training", "onboarding", "certification"] as const).map(t => (
                  <button key={t} onClick={() => setNewProgram(p => ({ ...p, type: t }))}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      newProgram.type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                    )}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newProgram.description} onChange={e => setNewProgram(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Brief description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
