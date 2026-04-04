/**
 * StoreEmployeesSection — Manage store employees (add, edit, remove).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Plus, Edit, Trash2, Loader2, Phone, Mail, DollarSign, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  storeId: string;
}

type Employee = {
  id: string;
  store_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  hourly_rate: number | null;
  notes: string | null;
  created_at: string;
};

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "staff", label: "Staff" },
];

const emptyForm = { name: "", email: "", phone: "", role: "staff", hourly_rate: "", notes: "" };

export default function StoreEmployeesSection({ storeId }: Props) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["store-employees", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_employees")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Employee[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        store_id: storeId,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        role: form.role,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("store_employees").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("store_employees").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-employees", storeId] });
      toast.success(editing ? "Employee updated" : "Employee added");
      closeDialog();
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-employees", storeId] });
      toast.success("Employee removed");
      setDeleteId(null);
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "active" ? "inactive" : "active";
      const { error } = await supabase.from("store_employees").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-employees", storeId] });
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialog(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      email: emp.email || "",
      phone: emp.phone || "",
      role: emp.role,
      hourly_rate: emp.hourly_rate?.toString() || "",
      notes: emp.notes || "",
    });
    setDialog(true);
  };

  const closeDialog = () => {
    setDialog(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-amber-500/10 text-amber-700 border-amber-200";
      case "manager": return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "cashier": return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold">Employees</h2>
          <p className="text-sm text-muted-foreground">{employees.length} team member{employees.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {/* Search */}
      {employees.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Empty state */}
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-blue-500" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No employees yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">Add your first team member to start managing your store staff.</p>
          <Button onClick={openAdd} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((emp) => (
            <Card key={emp.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{emp.name}</p>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", roleColor(emp.role))}>
                      {emp.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0 cursor-pointer", emp.status === "active" ? "bg-emerald-500/10 text-emerald-700 border-emerald-200" : "bg-red-500/10 text-red-700 border-red-200")}
                      onClick={() => toggleStatus.mutate({ id: emp.id, status: emp.status })}
                    >
                      {emp.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    {emp.email && (
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{emp.email}</span>
                    )}
                    {emp.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{emp.phone}</span>
                    )}
                    {emp.hourly_rate && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${emp.hourly_rate}/hr</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(emp.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && search && (
            <p className="text-center text-sm text-muted-foreground py-8">No employees match "{search}"</p>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" type="email" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Hourly Rate ($)</Label>
                <Input value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} placeholder="0.00" type="number" step="0.01" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeDialog}>Cancel</Button>
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!form.name.trim() || saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              {editing ? "Save Changes" : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Employee?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. The employee will be permanently removed from your store.</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
