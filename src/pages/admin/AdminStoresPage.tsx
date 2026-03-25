import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const emptyStore = {
  name: "", slug: "", description: "", logo_url: "", banner_url: "",
  market: "KH", category: "grocery", address: "", phone: "", hours: "",
  rating: 0, delivery_min: 30, is_active: true,
};

export default function AdminStoresPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [form, setForm] = useState(emptyStore);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form & { id?: string }) => {
      const { id, ...rest } = values as any;
      if (id) {
        const { error } = await supabase.from("store_profiles").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("store_profiles").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      setDialogOpen(false);
      toast.success(editingStore ? "Store updated" : "Store added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      setDeleteConfirm(null);
      toast.success("Store deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openAdd = () => {
    setEditingStore(null);
    setForm(emptyStore);
    setDialogOpen(true);
  };

  const openEdit = (store: any) => {
    setEditingStore(store);
    setForm({
      name: store.name || "",
      slug: store.slug || "",
      description: store.description || "",
      logo_url: store.logo_url || "",
      banner_url: store.banner_url || "",
      market: store.market || "KH",
      category: store.category || "grocery",
      address: store.address || "",
      phone: store.phone || "",
      hours: store.hours || "",
      rating: store.rating || 0,
      delivery_min: store.delivery_min || 30,
      is_active: store.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.slug) {
      toast.error("Name and slug are required");
      return;
    }
    saveMutation.mutate(editingStore ? { ...form, id: editingStore.id } : form);
  };

  const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <AdminLayout title="Store Accounts">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Store Accounts</h2>
            <p className="text-muted-foreground">Manage store profiles and product catalogs</p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Store
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Stores</p>
                  <p className="text-2xl font-bold">{stores.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stores.filter((s: any) => s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold">{stores.filter((s: any) => !s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store List */}
        <Card>
          <CardHeader>
            <CardTitle>All Stores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading stores...</p>
            ) : stores.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No stores found. Add your first store to get started.</p>
            ) : (
              <div className="divide-y divide-border">
                {stores.map((store: any) => (
                  <div key={store.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Store className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{store.name}</p>
                        <p className="text-sm text-muted-foreground">{store.market} · {store.category} · /{store.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={store.is_active ? "default" : "secondary"}>
                        {store.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/stores/${store.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/grocery/shop/${store.slug}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(store.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStore ? "Edit Store" : "Add New Store"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Store name" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={e => updateField("slug", e.target.value)} placeholder="store-slug" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => updateField("description", e.target.value)} placeholder="Store description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={form.logo_url} onChange={e => updateField("logo_url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Banner URL</Label>
                <Input value={form.banner_url} onChange={e => updateField("banner_url", e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Market</Label>
                <Input value={form.market} onChange={e => updateField("market", e.target.value)} placeholder="KH" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => updateField("category", e.target.value)} placeholder="grocery" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => updateField("address", e.target.value)} placeholder="Store address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="023 900 888" />
              </div>
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input value={form.hours} onChange={e => updateField("hours", e.target.value)} placeholder="7am–10pm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => updateField("rating", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Min (minutes)</Label>
                <Input type="number" value={form.delivery_min} onChange={e => updateField("delivery_min", parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => updateField("is_active", v)} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editingStore ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete this store? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
