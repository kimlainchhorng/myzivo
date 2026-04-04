import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FolderOpen, FileText, Upload, Search, Download, Trash2, Eye,
  File, FileImage, FileLock, Clock, Users, Filter, Plus, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string; }

type Doc = {
  id: string; name: string; category: string; employeeId: string | null;
  employeeName: string; fileType: string; size: string;
  uploadedAt: string; expiresAt: string | null; status: "active" | "expired" | "pending";
};

const CATEGORIES = ["All", "Contracts", "IDs & Licenses", "Certifications", "Tax Forms", "Policies", "Other"];

const DEMO_DOCS: Doc[] = [
  { id: "1", name: "Employment Contract - kimlain.pdf", category: "Contracts", employeeId: "e1", employeeName: "kimlain", fileType: "pdf", size: "245 KB", uploadedAt: "2026-03-15", expiresAt: null, status: "active" },
  { id: "2", name: "Food Safety Certificate.pdf", category: "Certifications", employeeId: "e1", employeeName: "kimlain", fileType: "pdf", size: "180 KB", uploadedAt: "2026-02-20", expiresAt: "2027-02-20", status: "active" },
  { id: "3", name: "National ID Copy.jpg", category: "IDs & Licenses", employeeId: "e1", employeeName: "kimlain", fileType: "image", size: "1.2 MB", uploadedAt: "2026-03-15", expiresAt: "2028-06-30", status: "active" },
  { id: "4", name: "W-4 Tax Form.pdf", category: "Tax Forms", employeeId: "e1", employeeName: "kimlain", fileType: "pdf", size: "92 KB", uploadedAt: "2026-03-16", expiresAt: null, status: "active" },
  { id: "5", name: "Employee Handbook v3.pdf", category: "Policies", employeeId: null, employeeName: "Company", fileType: "pdf", size: "3.4 MB", uploadedAt: "2026-01-10", expiresAt: null, status: "active" },
];

export default function StoreDocumentsSection({ storeId }: Props) {
  const [docs, setDocs] = useState<Doc[]>(DEMO_DOCS);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [newDoc, setNewDoc] = useState({ name: "", category: "Contracts", employeeId: "" });

  const { data: employees = [] } = useQuery({
    queryKey: ["store-employees-docs", storeId],
    queryFn: async () => {
      const { data } = await supabase.from("store_employees").select("*").eq("store_id", storeId).eq("status", "active");
      return data || [];
    },
  });

  const filtered = docs.filter(d =>
    (category === "All" || d.category === category) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const expiringSoon = docs.filter(d => {
    if (!d.expiresAt) return false;
    const diff = new Date(d.expiresAt).getTime() - Date.now();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
  });

  const stats = [
    { icon: FileText, label: "Total Documents", value: docs.length, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: FolderOpen, label: "Categories", value: CATEGORIES.length - 1, color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: AlertTriangle, label: "Expiring Soon", value: expiringSoon.length, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Users, label: "Employees", value: employees.length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const fileIcons: Record<string, typeof FileText> = { pdf: FileText, image: FileImage, locked: FileLock };

  const handleUpload = () => {
    if (!newDoc.name) return toast.error("Document name required");
    const doc: Doc = {
      id: Date.now().toString(), name: newDoc.name, category: newDoc.category,
      employeeId: newDoc.employeeId || null,
      employeeName: newDoc.employeeId ? (employees.find((e: any) => e.id === newDoc.employeeId) as any)?.name || "Employee" : "Company",
      fileType: "pdf", size: "0 KB", uploadedAt: new Date().toISOString().split("T")[0],
      expiresAt: null, status: "active",
    };
    setDocs(prev => [doc, ...prev]);
    setShowUpload(false);
    setNewDoc({ name: "", category: "Contracts", employeeId: "" });
    toast.success("Document uploaded");
  };

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    setSelectedDoc(null);
    toast.success("Document deleted");
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

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            )}>
            {c}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" /> Export</Button>
        <Button onClick={() => setShowUpload(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Upload className="w-4 h-4 mr-1.5" /> Upload Document
        </Button>
      </div>

      {/* Documents Table */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/30 text-xs text-muted-foreground">
            <th className="text-left px-4 py-3 font-medium">Document</th>
            <th className="text-left px-4 py-3 font-medium">Category</th>
            <th className="text-left px-4 py-3 font-medium">Employee</th>
            <th className="text-left px-4 py-3 font-medium">Uploaded</th>
            <th className="text-left px-4 py-3 font-medium">Expires</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border/30">
            {filtered.map(d => {
              const Icon = fileIcons[d.fileType] || File;
              return (
                <tr key={d.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="font-medium text-xs truncate max-w-[200px]">{d.name}</p>
                        <p className="text-[10px] text-muted-foreground">{d.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px]">{d.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">{d.employeeName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.uploadedAt}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.expiresAt || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-[10px]",
                      d.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      d.status === "expired" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-600 border-amber-200"
                    )}>{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedDoc(d)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">No documents found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Expiring Soon</h3>
          </div>
          <div className="space-y-1">
            {expiringSoon.map(d => (
              <p key={d.id} className="text-xs text-amber-700">
                {d.name} — expires {d.expiresAt} ({d.employeeName})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
              <p className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input value={newDoc.name} onChange={e => setNewDoc(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Contract - John.pdf" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select value={newDoc.category} onChange={e => setNewDoc(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Employee (optional)</Label>
              <select value={newDoc.employeeId} onChange={e => setNewDoc(p => ({ ...p, employeeId: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">Company-wide</option>
                {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button onClick={handleUpload} className="bg-emerald-500 hover:bg-emerald-600 text-white">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Detail */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-sm">
          {selectedDoc && (
            <>
              <DialogHeader><DialogTitle className="text-base">{selectedDoc.name}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><Badge variant="outline">{selectedDoc.category}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Employee</span><span>{selectedDoc.employeeName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span>{selectedDoc.size}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Uploaded</span><span>{selectedDoc.uploadedAt}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Expires</span><span>{selectedDoc.expiresAt || "Never"}</span></div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Download</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedDoc.id)}><Trash2 className="w-3.5 h-3.5 mr-1" /> Delete</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
