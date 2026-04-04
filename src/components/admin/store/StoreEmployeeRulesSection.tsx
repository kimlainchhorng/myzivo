import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, Lock, Eye, Clock, AlertTriangle, Plus, Search,
  CheckCircle2, XCircle, Edit, Trash2, Users, FileText, Settings
} from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string; }

type Rule = {
  id: string; title: string; category: string; description: string;
  isActive: boolean; severity: "low" | "medium" | "high" | "critical";
  appliesTo: string; createdAt: string;
};

const SEVERITY_CONFIG = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-600" },
  high: { label: "High", color: "bg-amber-100 text-amber-600" },
  critical: { label: "Critical", color: "bg-red-100 text-red-600" },
};

const CATEGORY_OPTIONS = ["Workplace Conduct", "Attendance", "Security & Access", "Dress Code", "Communication", "Safety", "Data & Privacy"];

const DEMO_RULES: Rule[] = [
  { id: "1", title: "Clock In/Out Required", category: "Attendance", description: "All employees must clock in and out for every shift. Failure to do so will result in a warning.", isActive: true, severity: "high", appliesTo: "All Staff", createdAt: "2026-01-15" },
  { id: "2", title: "Uniform Policy", category: "Dress Code", description: "Employees must wear the provided company uniform during work hours. Name badge must be visible at all times.", isActive: true, severity: "medium", appliesTo: "All Staff", createdAt: "2026-01-15" },
  { id: "3", title: "No Personal Phone Usage", category: "Workplace Conduct", description: "Personal phones must be kept in lockers during shift. Emergency calls are permitted in break areas.", isActive: true, severity: "medium", appliesTo: "Floor Staff", createdAt: "2026-02-01" },
  { id: "4", title: "Cash Register Access", category: "Security & Access", description: "Only authorized personnel may access cash registers. Each employee has a unique PIN.", isActive: true, severity: "critical", appliesTo: "Cashiers", createdAt: "2026-01-15" },
  { id: "5", title: "Break Schedule", category: "Attendance", description: "15-minute break for 4-hour shifts, 30-minute break for 6+ hour shifts. Breaks must be taken at designated times.", isActive: true, severity: "low", appliesTo: "All Staff", createdAt: "2026-01-20" },
  { id: "6", title: "Customer Data Privacy", category: "Data & Privacy", description: "Employee must not share, copy, or discuss customer information outside of work. Violation results in immediate termination.", isActive: true, severity: "critical", appliesTo: "All Staff", createdAt: "2026-03-01" },
  { id: "7", title: "Safety Equipment Required", category: "Safety", description: "Appropriate PPE must be worn in storage and kitchen areas at all times.", isActive: true, severity: "high", appliesTo: "Kitchen & Storage", createdAt: "2026-01-15" },
  { id: "8", title: "Social Media Policy", category: "Communication", description: "Employees may not post about internal operations, customers, or proprietary info on social media.", isActive: false, severity: "medium", appliesTo: "All Staff", createdAt: "2026-02-15" },
];

export default function StoreEmployeeRulesSection({ storeId }: Props) {
  const [rules, setRules] = useState<Rule[]>(DEMO_RULES);
  const [tab, setTab] = useState<"rules" | "access" | "policies">("rules");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [form, setForm] = useState({ title: "", category: "Workplace Conduct", description: "", severity: "medium" as Rule["severity"], appliesTo: "All Staff" });

  const activeRules = rules.filter(r => r.isActive).length;
  const criticalRules = rules.filter(r => r.severity === "critical" && r.isActive).length;
  const categories = [...new Set(rules.map(r => r.category))];

  const stats = [
    { icon: Shield, label: "Total Rules", value: rules.length, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: CheckCircle2, label: "Active", value: activeRules, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: AlertTriangle, label: "Critical", value: criticalRules, color: "text-red-500", bg: "bg-red-500/10" },
    { icon: FileText, label: "Categories", value: categories.length, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const filtered = rules.filter(r =>
    (categoryFilter === "All" || r.category === categoryFilter) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    toast.success("Rule updated");
  };

  const handleSave = () => {
    if (!form.title) return toast.error("Title required");
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...form } : r));
      toast.success("Rule updated");
    } else {
      const rule: Rule = { id: Date.now().toString(), ...form, isActive: true, createdAt: new Date().toISOString().split("T")[0] };
      setRules(prev => [rule, ...prev]);
      toast.success("Rule created");
    }
    setShowCreate(false);
    setEditingRule(null);
    setForm({ title: "", category: "Workplace Conduct", description: "", severity: "medium", appliesTo: "All Staff" });
  };

  const openEdit = (r: Rule) => {
    setForm({ title: r.title, category: r.category, description: r.description, severity: r.severity, appliesTo: r.appliesTo });
    setEditingRule(r);
    setShowCreate(true);
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success("Rule deleted");
  };

  // Access Levels Tab
  const accessLevels = [
    { role: "Manager", permissions: ["Full POS Access", "Employee Management", "Reports", "Settings", "Inventory", "Refunds"], color: "text-purple-600" },
    { role: "Supervisor", permissions: ["POS Access", "View Reports", "Inventory", "Refunds up to $50"], color: "text-blue-600" },
    { role: "Cashier", permissions: ["POS Access", "View Own Schedule", "Clock In/Out"], color: "text-emerald-600" },
    { role: "Staff", permissions: ["View Own Schedule", "Clock In/Out", "View Tasks"], color: "text-gray-600" },
  ];

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
          { id: "rules" as const, label: "Rules", icon: Shield },
          { id: "access" as const, label: "Access Levels", icon: Lock },
          { id: "policies" as const, label: "Policies", icon: FileText },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              tab === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "rules" && (
        <>
          {/* Category Pills + Search */}
          <div className="flex items-center gap-2 flex-wrap">
            {["All", ...categories].map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  categoryFilter === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                )}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search rules..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={() => { setEditingRule(null); setForm({ title: "", category: "Workplace Conduct", description: "", severity: "medium", appliesTo: "All Staff" }); setShowCreate(true); }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-1.5" /> Add Rule
            </Button>
          </div>

          {/* Rules List */}
          <div className="space-y-2">
            {filtered.map(r => (
              <div key={r.id} className={cn("rounded-xl border bg-card p-4 transition-all",
                r.isActive ? "border-border/40" : "border-border/20 opacity-60"
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm">{r.title}</h3>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", SEVERITY_CONFIG[r.severity].color)}>
                        {SEVERITY_CONFIG[r.severity].label}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{r.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.appliesTo}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={r.isActive} onCheckedChange={() => toggleRule(r.id)} className="scale-90" />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteRule(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "access" && (
        <div className="space-y-4">
          {accessLevels.map(a => (
            <div key={a.role} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock className={cn("w-5 h-5", a.color)} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{a.role}</h3>
                  <p className="text-[10px] text-muted-foreground">{a.permissions.length} permissions</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.permissions.map(p => (
                  <span key={p} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "policies" && (
        <div className="space-y-3">
          {[
            { title: "Employee Handbook", version: "v3.2", updated: "2026-03-01", pages: 42 },
            { title: "Code of Conduct", version: "v2.1", updated: "2026-02-15", pages: 12 },
            { title: "Health & Safety Policy", version: "v1.8", updated: "2026-01-20", pages: 18 },
            { title: "Anti-Harassment Policy", version: "v2.0", updated: "2026-03-10", pages: 8 },
            { title: "Data Protection Guidelines", version: "v1.5", updated: "2026-03-01", pages: 15 },
          ].map(p => (
            <div key={p.title} className="rounded-xl border border-border/40 bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{p.title}</h3>
                  <p className="text-[10px] text-muted-foreground">{p.version} • {p.pages} pages • Updated {p.updated}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs"><Eye className="w-3 h-3 mr-1" /> View</Button>
                <Button variant="outline" size="sm" className="text-xs"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={v => { setShowCreate(v); if (!v) setEditingRule(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingRule ? "Edit Rule" : "Add Rule"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. No Late Arrivals" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <div className="flex gap-2">
                {(["low", "medium", "high", "critical"] as const).map(s => (
                  <button key={s} onClick={() => setForm(p => ({ ...p, severity: s }))}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      form.severity === s ? cn("border-transparent", SEVERITY_CONFIG[s].color) : "border-border text-muted-foreground"
                    )}>{SEVERITY_CONFIG[s].label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Applies To</Label>
              <Input value={form.appliesTo} onChange={e => setForm(p => ({ ...p, appliesTo: e.target.value }))} placeholder="e.g. All Staff" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditingRule(null); }}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">{editingRule ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
