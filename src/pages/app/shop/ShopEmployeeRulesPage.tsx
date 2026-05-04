import { useState } from "react";
import { ArrowLeft, Shield, Plus, X, Check, ChevronRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import AppLayout from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  title: string;
  description: string;
  category: string;
  active: boolean;
}

const CATEGORIES = ["General", "Safety", "Conduct", "Schedule", "Appearance", "Technology"];

const DEFAULT_RULES: Rule[] = [
  { id: "1", title: "Punctuality", description: "Employees must arrive on time and notify management at least 2 hours in advance if unable to attend.", category: "Schedule", active: true },
  { id: "2", title: "Dress Code", description: "All staff must wear the provided uniform during working hours and maintain a neat, professional appearance.", category: "Appearance", active: true },
  { id: "3", title: "Phone Policy", description: "Personal phone use is limited to break times. No phones during customer interactions.", category: "Technology", active: true },
  { id: "4", title: "Respectful Workplace", description: "All employees must treat colleagues and customers with respect. Discrimination or harassment will not be tolerated.", category: "Conduct", active: true },
  { id: "5", title: "Food Safety", description: "All employees handling food must follow hygiene protocols including handwashing and glove use at all times.", category: "Safety", active: true },
];

const STORAGE_KEY = "zivo_employee_rules";

function loadRules(): Rule[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") ?? DEFAULT_RULES; } catch { return DEFAULT_RULES; }
}

export default function ShopEmployeeRulesPage() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<Rule[]>(loadRules);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [form, setForm] = useState({ title: "", description: "", category: "General" });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const save = (updated: Rule[]) => {
    setRules(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addRule = () => {
    if (!form.title.trim()) return;
    const r: Rule = { id: `${Date.now()}`, ...form, title: form.title.trim(), description: form.description.trim(), active: true };
    save([...rules, r]);
    toast.success(`Rule added: ${r.title}`);
    setForm({ title: "", description: "", category: "General" });
    setShowForm(false);
  };

  const toggleRule = (id: string) => {
    const updated = rules.map((r) => r.id === id ? { ...r, active: !r.active } : r);
    save(updated);
    const r = updated.find((r) => r.id === id)!;
    toast.success(`${r.title} ${r.active ? "enabled" : "disabled"}`);
  };

  const removeRule = (id: string) => {
    save(rules.filter((r) => r.id !== id));
    toast.success("Rule removed");
  };

  const categories = ["All", ...CATEGORIES.filter((c) => rules.some((r) => r.category === c))];
  const filtered = rules.filter((r) => categoryFilter === "All" || r.category === categoryFilter);
  const activeCount = rules.filter((r) => r.active).length;

  return (
    <AppLayout title="Employee Rules" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24 max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5 mb-5">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-[17px] flex-1">Employee Rules</h1>
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Rule
          </Button>
        </div>

        {/* Summary card */}
        <Card className="p-4 border-border mb-4 bg-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-bold text-[15px]">{rules.length} workplace rules</p>
              <p className="text-[12px] text-muted-foreground">{activeCount} active · {rules.length - activeCount} disabled</p>
            </div>
          </div>
        </Card>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-4">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className={cn("px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all",
                  categoryFilter === c ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Add rule form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4">
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[14px]">Add Rule</p>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted/60">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Rule title (e.g. Break Policy)"
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Rule description..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2">
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="flex-1 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <Button onClick={addRule} disabled={!form.title.trim()}>Add</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rules list */}
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No rules in this category</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((rule) => (
              <Card key={rule.id} className={cn("p-3 transition-opacity", !rule.active && "opacity-50")}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      rule.active ? "bg-primary border-primary" : "border-border")}
                  >
                    {rule.active && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  <button className="flex-1 text-left min-w-0" onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}>
                    <div className="flex items-center gap-2">
                      <p className={cn("font-semibold text-[13px]", !rule.active && "line-through")}>{rule.title}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{rule.category}</span>
                    </div>
                    <AnimatePresence>
                      {expandedId === rule.id && (
                        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="text-[12px] text-muted-foreground mt-1 overflow-hidden">
                          {rule.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground/40 transition-transform", expandedId === rule.id && "rotate-90")} />
                    <button onClick={() => removeRule(rule.id)} className="p-1 rounded-lg hover:bg-muted/60">
                      <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
