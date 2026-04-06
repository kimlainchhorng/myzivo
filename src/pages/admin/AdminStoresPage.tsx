import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, Plus, Edit, Trash2, Eye, Upload, Loader2, X, ChevronDown, ChevronUp, Mail, UserPlus, Link2, Copy, Check } from "lucide-react";
import { useRef } from "react";
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

const DAYS_OF_WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<string, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

type DaySchedule = { open: string; close: string; closed: boolean };
type WeeklySchedule = Record<string, DaySchedule>;

const DEFAULT_SCHEDULE: WeeklySchedule = Object.fromEntries(
  DAYS_OF_WEEK.map(d => [d, { open: "8:00 AM", close: "5:00 PM", closed: false }])
);

const FOOD_CATEGORIES = ["restaurant", "food-market", "drink", "grocery", "supermarket"];

function parseSchedule(hours: string): WeeklySchedule {
  try {
    const parsed = JSON.parse(hours);
    if (parsed && typeof parsed === "object" && parsed.mon) return parsed;
  } catch {}
  // Legacy "7:00 AM–10:00 PM" format → apply to all days
  const parts = hours?.split("–") || [];
  const open = parts[0]?.trim() || "8:00 AM";
  const close = parts[1]?.trim() || "5:00 PM";
  return Object.fromEntries(DAYS_OF_WEEK.map(d => [d, { open, close, closed: false }]));
}

const emptyStore = {
  name: "", slug: "", description: "", logo_url: "", banner_url: "",
  market: "KH", category: "grocery", address: "", phone: "", hours: JSON.stringify(DEFAULT_SCHEDULE),
  rating: 0, delivery_min: 30, is_active: true,
};

export default function AdminStoresPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [form, setForm] = useState(emptyStore);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const uploadStoreImage = async (file: File, type: "logo" | "banner") => {
    const isLogo = type === "logo";
    isLogo ? setUploadingLogo(true) : setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `temp/${type}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("store-assets")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
      updateField(isLogo ? "logo_url" : "banner_url", urlData.publicUrl);
      toast.success(`${isLogo ? "Logo" : "Banner"} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingBanner(false);
    }
  };

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

  // Derive used categories and filtered list
  const usedCategories = STORE_CATEGORY_OPTIONS.filter(opt =>
    stores.some((s: any) => s.category === opt.value)
  );
  const filteredStores = activeCategory === "all"
    ? stores
    : stores.filter((s: any) => s.category === activeCategory);

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
      hours: store.hours || JSON.stringify(DEFAULT_SCHEDULE),
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

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => setActiveCategory("all")}
            className="rounded-full"
          >
            All
          </Button>
          {usedCategories.map(cat => (
            <Button
              key={cat.value}
              size="sm"
              variant={activeCategory === cat.value ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.value)}
              className="rounded-full"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Store List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeCategory === "all" ? "All Stores" : STORE_CATEGORY_OPTIONS.find(o => o.value === activeCategory)?.label || activeCategory}
              <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredStores.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading stores...</p>
            ) : filteredStores.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No stores found in this category.</p>
            ) : (
              <div className="divide-y divide-border">
                {filteredStores.map((store: any) => (
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
                        <p className="text-sm text-muted-foreground">{store.market} · {STORE_CATEGORY_OPTIONS.find(o => o.value === store.category)?.label || store.category} · /{store.slug}</p>
                        <p className="text-xs text-muted-foreground font-mono">ID: CBD{store.id.replace(/-/g, '').slice(0, 8).toUpperCase()}</p>
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
                <Input value={form.name} onChange={e => {
                  const name = e.target.value;
                  updateField("name", name);
                  if (!editingStore) {
                    updateField("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                  }
                }} placeholder="Store name" />
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
                <Label>Logo</Label>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadStoreImage(f, "logo"); e.target.value = ""; }} />
                {form.logo_url ? (
                  <div className="relative w-20 h-20 rounded-xl border border-border overflow-hidden group">
                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="h-6 w-6 rounded-full bg-background/80 flex items-center justify-center"><Upload className="h-3 w-3" /></button>
                      <button type="button" onClick={() => updateField("logo_url", "")} className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-3 w-3" /></button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    {uploadingLogo ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /><span className="text-[10px]">Upload</span></>}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Banner</Label>
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadStoreImage(f, "banner"); e.target.value = ""; }} />
                {form.banner_url ? (
                  <div className="relative w-full h-20 rounded-xl border border-border overflow-hidden group">
                    <img src={form.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => bannerInputRef.current?.click()} className="h-6 w-6 rounded-full bg-background/80 flex items-center justify-center"><Upload className="h-3 w-3" /></button>
                      <button type="button" onClick={() => updateField("banner_url", "")} className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-3 w-3" /></button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner} className="w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    {uploadingBanner ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /><span className="text-[10px]">Upload</span></>}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Market</Label>
                <select
                  value={form.market}
                  onChange={e => updateField("market", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {[
                    { code: "KH", label: "🇰🇭 Cambodia (KH)" },
                    { code: "US", label: "🇺🇸 United States (US)" },
                    { code: "VN", label: "🇻🇳 Vietnam (VN)" },
                    { code: "TH", label: "🇹🇭 Thailand (TH)" },
                    { code: "CN", label: "🇨🇳 China (CN)" },
                    { code: "KR", label: "🇰🇷 South Korea (KR)" },
                    { code: "JP", label: "🇯🇵 Japan (JP)" },
                    { code: "IN", label: "🇮🇳 India (IN)" },
                    { code: "GB", label: "🇬🇧 United Kingdom (GB)" },
                    { code: "AU", label: "🇦🇺 Australia (AU)" },
                    { code: "SG", label: "🇸🇬 Singapore (SG)" },
                    { code: "MY", label: "🇲🇾 Malaysia (MY)" },
                    { code: "PH", label: "🇵🇭 Philippines (PH)" },
                    { code: "ID", label: "🇮🇩 Indonesia (ID)" },
                    { code: "LA", label: "🇱🇦 Laos (LA)" },
                    { code: "MM", label: "🇲🇲 Myanmar (MM)" },
                  ].map(m => (
                    <option key={m.code} value={m.code}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={form.category}
                  onChange={e => updateField("category", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {STORE_CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => updateField("address", e.target.value)} placeholder="Store address" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="flex gap-1">
                <span className="flex h-10 items-center rounded-md border border-input bg-muted px-2 text-sm text-muted-foreground whitespace-nowrap">
                  {{ KH: "+855", US: "+1", VN: "+84", TH: "+66", CN: "+86", KR: "+82", JP: "+81", IN: "+91", GB: "+44", AU: "+61", SG: "+65", MY: "+60", PH: "+63", ID: "+62", LA: "+856", MM: "+95" }[form.market] || "+855"}
                </span>
                <Input value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="23 900 888" className="flex-1" />
              </div>
            </div>

            {/* Weekly Hours Schedule */}
            <div className="space-y-2">
              <Label>Operating Hours</Label>
              <div className="border border-border rounded-lg overflow-hidden">
                {(() => {
                  const schedule = parseSchedule(form.hours);
                  const timeOptions = Array.from({ length: 48 }, (_, i) => {
                    const h = Math.floor(i / 2);
                    const m = i % 2 === 0 ? "00" : "30";
                    const ampm = h < 12 ? "AM" : "PM";
                    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    return `${h12}:${m} ${ampm}`;
                  });
                  const updateDay = (day: string, field: string, value: any) => {
                    const updated = { ...schedule, [day]: { ...schedule[day], [field]: value } };
                    updateField("hours", JSON.stringify(updated));
                  };
                  return DAYS_OF_WEEK.map((day, idx) => (
                    <div key={day} className={`flex items-center gap-2 px-3 py-2 ${idx > 0 ? "border-t border-border" : ""} ${schedule[day]?.closed ? "bg-muted/50" : ""}`}>
                      <div className="w-16 flex-shrink-0">
                        <span className="text-xs font-medium">{DAY_LABELS[day].slice(0, 3)}</span>
                      </div>
                      <Switch
                        checked={!schedule[day]?.closed}
                        onCheckedChange={(open) => updateDay(day, "closed", !open)}
                        className="scale-75"
                      />
                      {schedule[day]?.closed ? (
                        <span className="text-xs text-muted-foreground italic">Closed</span>
                      ) : (
                        <div className="flex items-center gap-1 flex-1">
                          <select
                            value={schedule[day]?.open || "8:00 AM"}
                            onChange={e => updateDay(day, "open", e.target.value)}
                            className="flex h-8 rounded-md border border-input bg-background px-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="text-xs text-muted-foreground">to</span>
                          <select
                            value={schedule[day]?.close || "5:00 PM"}
                            onChange={e => updateDay(day, "close", e.target.value)}
                            className="flex h-8 rounded-md border border-input bg-background px-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => updateField("rating", parseFloat(e.target.value) || 0)} />
              </div>
              {FOOD_CATEGORIES.includes(form.category) && (
                <div className="space-y-2">
                  <Label>Delivery Time (minutes)</Label>
                  <Input type="number" value={form.delivery_min} onChange={e => updateField("delivery_min", parseInt(e.target.value) || 0)} />
                </div>
              )}
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
