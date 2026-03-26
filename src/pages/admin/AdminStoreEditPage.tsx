/**
 * AdminStoreEditPage - Full store management: edit profile, cover, logo, products
 */
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Store, Image, Package, Plus, Edit, Trash2, Loader2, Eye, Upload, Camera, MapPin, ExternalLink, Globe, Check, Percent, DollarSign, CalendarIcon, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import StoreMapPicker from "@/components/admin/StoreMapPicker";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

function generateSku(storeName: string, category: string, name: string): string {
  const s = (storeName || "ST").substring(0, 2).toUpperCase();
  const c = (category || "GN").substring(0, 2).toUpperCase();
  const n = (name || "").replace(/[^a-zA-Z0-9]/g, "").substring(0, 3).toUpperCase() || "XXX";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${s}-${c}-${n}${rand}`;
}

const emptyProduct = {
  name: "", description: "", price: 0, price_khr: 0, image_url: "", image_urls: [] as string[], category: "",
  brand: "", sku: "", in_stock: true, sort_order: 0,
  discount_type: null as string | null, discount_value: null as number | null,
  discount_price_khr: null as number | null, discount_expires_at: "" as string,
};

export default function AdminStoreEditPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentLanguage, changeLanguage, t } = useI18n();
  const { data: supportedLanguages } = useSupportedLanguages(true);
  const STORE_LANG_CODES = ["en", "km", "th", "vi", "ko", "zh"];
  const activeLanguages = (supportedLanguages || []).filter(l => l.is_active && STORE_LANG_CODES.includes(l.code));
  const currentLangData = activeLanguages.find(l => l.code === currentLanguage);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ["admin-store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("*")
        .eq("id", storeId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-store-products", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_products")
        .select("*")
        .eq("store_id", storeId!)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const [form, setForm] = useState({
    name: "", slug: "", description: "", logo_url: "", banner_url: "",
    market: "", category: "", address: "", phone: "", hours: "",
    rating: 0, delivery_min: 0, is_active: true, khr_rate: 4062.5,
    latitude: null as number | null, longitude: null as number | null,
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "",
        slug: store.slug || "",
        description: store.description || "",
        logo_url: store.logo_url || "",
        banner_url: store.banner_url || "",
        market: store.market || "",
        category: store.category || "",
        address: store.address || "",
        phone: store.phone || "",
        hours: store.hours || "",
        rating: store.rating || 0,
        delivery_min: store.delivery_min || 0,
        is_active: store.is_active ?? true,
        khr_rate: (store as any).khr_rate ?? 4062.5,
        latitude: (store as any).latitude ?? null,
        longitude: (store as any).longitude ?? null,
      });
    }
  }, [store]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { rating, ...profileData } = form;
      const { error } = await supabase
        .from("store_profiles")
        .update(profileData as any)
        .eq("id", storeId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store", storeId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      toast.success("Store profile updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const uploadProductImage = async (file: File) => {
    const currentImages = productForm.image_urls || [];
    if (currentImages.length >= 8) {
      toast.error("Maximum 8 images allowed");
      return;
    }
    setUploadingProductImage(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `products/${storeId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
      const newUrls = [...currentImages, urlData.publicUrl];
      updateProductField("image_urls", newUrls);
      updateProductField("image_url", newUrls[0]); // keep first as primary
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingProductImage(false);
    }
  };

  const removeProductImage = (index: number) => {
    const newUrls = (productForm.image_urls || []).filter((_: string, i: number) => i !== index);
    updateProductField("image_urls", newUrls);
    updateProductField("image_url", newUrls[0] || "");
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductDialog(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || 0,
      price_khr: p.price_khr || Math.round((p.price || 0) * (form.khr_rate || 4062.5)),
      image_url: p.image_url || "",
      image_urls: (p.image_urls as string[]) || (p.image_url ? [p.image_url] : []),
      category: p.category || "",
      brand: p.brand || "",
      sku: p.sku || "",
      in_stock: p.in_stock ?? true,
      sort_order: p.sort_order || 0,
      discount_type: p.discount_type || null,
      discount_value: p.discount_value || null,
      discount_price_khr: p.discount_price_khr || null,
      discount_expires_at: p.discount_expires_at || "",
    });
    setProductDialog(true);
  };

  const saveProduct = useMutation({
    mutationFn: async (keepOpen?: boolean) => {
      const { _khrRaw, ...productPayload } = productForm as typeof productForm & { _khrRaw?: string };

      if (editingProduct) {
        const { error } = await supabase
          .from("store_products")
          .update(productPayload)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("store_products")
          .insert({ ...productPayload, store_id: storeId! })
          .select()
          .single();
        if (error) throw error;
        if (data) setEditingProduct(data);
      }
      return keepOpen;
    },
    onSuccess: (keepOpen) => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-products", storeId] });
      if (keepOpen) {
        toast.success("Saved");
      } else {
        setProductDialog(false);
        toast.success(editingProduct ? "Product updated" : "Product added");
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-products", storeId] });
      setDeleteProductId(null);
      toast.success("Product deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateField = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));
  const updateProductField = (field: string, value: any) => setProductForm((p) => ({ ...p, [field]: value }));

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const uploadImage = async (file: File, type: "logo" | "cover") => {
    const isLogo = type === "logo";
    isLogo ? setUploadingLogo(true) : setUploadingCover(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${storeId}/${type}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("store-assets")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
      const field = isLogo ? "logo_url" : "banner_url";
      updateField(field, urlData.publicUrl);
      // Auto-save immediately
      const { error: saveErr } = await supabase
        .from("store_profiles")
        .update({ [field]: urlData.publicUrl })
        .eq("id", storeId!);
      if (saveErr) throw saveErr;
      queryClient.invalidateQueries({ queryKey: ["admin-store", storeId] });
      toast.success(`${isLogo ? "Profile" : "Cover"} image updated`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingCover(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Store">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!store) {
    return (
      <AdminLayout title="Store Not Found">
        <div className="text-center py-20 space-y-4">
          <p className="text-muted-foreground">Store not found</p>
          <Button onClick={() => navigate("/admin/stores")} variant="outline">Back to Stores</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit: ${store.name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/admin/stores")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-foreground">{store.name}</h2>
              <p className="text-sm text-muted-foreground">/{store.slug} · {store.market}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <Popover open={isLangOpen} onOpenChange={setIsLangOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  {currentLangData?.flag_svg ? (
                    <img src={currentLangData.flag_svg} alt="" className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm border border-foreground/10" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">{currentLangData?.native_name || "English"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl rounded-2xl overflow-hidden" align="end" sideOffset={8}>
                {/* Header with background flag watermark */}
                <div className="relative p-3 border-b border-border/50 bg-muted/30 overflow-hidden">
                  {currentLangData?.flag_svg && (
                    <img src={currentLangData.flag_svg} alt="" className="absolute -right-4 -top-4 w-32 h-32 opacity-[0.07] pointer-events-none blur-[1px]" style={{ transform: "rotate(-12deg) scale(1.3)" }} />
                  )}
                  <div className="flex items-center gap-2 relative z-10">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{t("admin.store.select_language")}</p>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[360px] p-1">
                  {activeLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setIsLangOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden group",
                        currentLanguage === lang.code ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "hover:bg-muted/60"
                      )}
                    >
                      {/* Hover background flag watermark */}
                      {lang.flag_svg && (
                        <img src={lang.flag_svg} alt="" className="absolute right-1 top-1/2 -translate-y-1/2 w-16 h-16 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none blur-[0.5px]" style={{ transform: "translateY(-50%) rotate(-8deg)" }} />
                      )}
                      {lang.flag_svg ? (
                        <img src={lang.flag_svg} alt={lang.name} className="w-6 h-[17px] rounded-[3px] object-cover shadow-sm border border-black/10 shrink-0 relative z-10" />
                      ) : (
                        <span className="text-lg">{lang.flag_emoji}</span>
                      )}
                      <div className="flex-1 text-left relative z-10">
                        <p className="font-medium text-sm">{lang.name}</p>
                        <p className="text-xs text-muted-foreground">{lang.native_name}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/70 uppercase relative z-10">{lang.code}</span>
                      {currentLanguage === lang.code && <Check className="w-4 h-4 text-primary relative z-10" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={() => navigate(`/grocery/shop/${store.slug}`)} variant="outline" className="gap-2">
              <Eye className="h-4 w-4" /> {t("admin.store.preview")}
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-52 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10">
            {form.banner_url && (
              <img src={form.banner_url} alt="Banner" className="w-full h-full object-cover object-center" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent" />
            <div className="absolute top-3 right-4">
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, "cover"); e.target.value = ""; }} />
              <Button size="sm" variant="secondary" className="gap-1.5 bg-background/80 backdrop-blur-sm" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
                {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />} {t("admin.store.change_cover")}
              </Button>
            </div>
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
              <div className="flex items-end gap-3 min-w-0">
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, "logo"); e.target.value = ""; }} />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="relative h-16 w-16 rounded-xl bg-background border-2 border-background shadow-lg overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-8 w-8 text-muted-foreground/30" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    {uploadingLogo ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                  </div>
                </button>
...
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
             <TabsTrigger value="profile" className="gap-1.5"><Store className="h-3.5 w-3.5" /> {t("admin.store.profile")}</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5"><Package className="h-3.5 w-3.5" /> {t("admin.store.products")} ({products.length})</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-card">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">៛ KHR Rate</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">1 USD =</span>
            <Input
              type="number"
              step="0.5"
              min="1"
              value={form.khr_rate || ""}
              onChange={e => updateField("khr_rate", parseFloat(e.target.value) || 0)}
              placeholder="4062.5"
              className="w-28 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">KHR</span>
          </div>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.store.store_info")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.store.store_name")}</Label>
                    <Input value={form.name} onChange={e => updateField("name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.slug")}</Label>
                    <Input value={form.slug} onChange={e => updateField("slug", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.store.description")}</Label>
                  <Textarea value={form.description} onChange={e => updateField("description", e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.store.market")}</Label>
                    <Input value={form.market} onChange={e => updateField("market", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.category")}</Label>
                    <Input value={form.category} onChange={e => updateField("category", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.store.address")}</Label>
                  <div
                    className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setMapPickerOpen(true)}
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className={`text-sm truncate ${form.address ? "text-foreground" : "text-muted-foreground"}`}>
                      {form.address || t("admin.store.tap_pick_location")}
                    </span>
                  </div>
                  {form.address && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const query = form.latitude != null && form.longitude != null
                          ? `${form.latitude},${form.longitude}`
                          : encodeURIComponent(form.address);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("admin.store.view_on_maps")}
                    </Button>
                  )}
                  <StoreMapPicker
                    open={mapPickerOpen}
                    onOpenChange={setMapPickerOpen}
                    currentAddress={form.address}
                    currentCoords={form.latitude != null && form.longitude != null ? { lat: form.latitude, lng: form.longitude } : null}
                    onConfirm={(addr, lat, lng) => {
                      updateField("address", addr);
                      updateField("latitude", lat);
                      updateField("longitude", lng);
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.store.phone")}</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground shrink-0">
                        <span>🇰🇭</span>
                        <span>+855</span>
                      </div>
                      <Input
                        value={form.phone.replace(/^\+855\s?/, "")}
                        onChange={e => {
                          let val = e.target.value.replace(/[^0-9]/g, "").replace(/^0+/, "");
                          if (val.length > 9) val = val.slice(0, 9);
                          updateField("phone", val ? `+855 ${val}` : "");
                        }}
                        placeholder="12 345 678"
                        maxLength={9}
                      />
                    </div>
                    {form.phone && (() => {
                      const digits = form.phone.replace(/^\+855\s?/, "").replace(/\D/g, "");
                      if (digits.length > 0 && (digits.length < 8 || digits.length > 9)) {
                        return <p className="text-xs text-destructive">Must be 8–9 digits</p>;
                      }
                      return null;
                    })()}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.hours")}</Label>
                    <Input value={form.hours} onChange={e => updateField("hours", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.delivery_min")}</Label>
                    <Input type="number" value={form.delivery_min} onChange={e => updateField("delivery_min", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.store.rating")}</Label>
                    <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border bg-muted">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm font-medium">{form.rating || "0"}</span>
                      <span className="text-[10px] text-muted-foreground">/ 5 — from customer reviews</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-1">
                    <Label>{t("admin.store.store_status")}</Label>
                    <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border bg-muted">
                      <span className="text-sm font-medium">{form.is_active ? t("admin.store.active") : t("admin.store.inactive")}</span>
                      <span className="text-[10px] text-muted-foreground">— status is controlled elsewhere</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saveProfile.isPending ? t("admin.store.saving") : t("admin.store.save_changes")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("admin.store.products")}</CardTitle>
                <Button size="sm" onClick={openAddProduct} className="gap-1.5">
                  <Plus className="h-4 w-4" /> {t("admin.store.add_product")}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                    <p className="text-muted-foreground">{t("admin.store.no_products")}</p>
                    <Button variant="outline" size="sm" onClick={openAddProduct} className="gap-1.5">
                      <Plus className="h-4 w-4" /> {t("admin.store.add_first_product")}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {products.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ៛{(product.price_khr || Math.round(product.price * (form.khr_rate || 4062.5))).toLocaleString()} · ${product.price?.toFixed(2)}
                              {product.category && ` · ${product.category}`}
                              {product.brand && ` · ${product.brand}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.in_stock ? "default" : "secondary"} className="text-[10px]">
                            {product.in_stock ? t("admin.store.in_stock") : t("admin.store.out_of_stock")}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => openEditProduct(product)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteProductId(product.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Add/Edit Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={productForm.name} onChange={e => updateProductField("name", e.target.value)} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={productForm.description} onChange={e => updateProductField("description", e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (៛ KHR) *</Label>
                <Input
                  type="number"
                  step="100"
                  value={productForm.price_khr || ""}
                  onChange={e => {
                    const val = e.target.value;
                    const khr = val === "" ? 0 : parseInt(val) || 0;
                    updateProductField("price_khr", khr);
                    updateProductField("price", parseFloat((khr / (form.khr_rate || 4062.5)).toFixed(2)));
                  }}
                  placeholder="0"
                />
                <p className="text-[10px] text-muted-foreground">Rate: 1 USD = {(form.khr_rate || 4062.5).toLocaleString()} KHR</p>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={e => {
                    const val = e.target.value;
                    const num = val === "" ? 0 : parseFloat(val) || 0;
                    updateProductField("price", num);
                    updateProductField("price_khr", Math.round(num * (form.khr_rate || 4062.5)));
                  }}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <div className="flex gap-2">
                  <Input value={productForm.sku} onChange={e => updateProductField("sku", e.target.value)} className="flex-1" placeholder="Auto-generated" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => updateProductField("sku", generateSku(form.name, productForm.category, productForm.name))}
                  >
                    Auto
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Images ({(productForm.image_urls || []).length}/8)</Label>
              <input ref={productImageInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadProductImage(f); e.target.value = ""; }} />
              <div className="flex flex-wrap gap-2">
                {(productForm.image_urls || []).map((url: string, idx: number) => (
                  <div key={idx} className="relative group shrink-0">
                    <img src={url} alt={`Product ${idx + 1}`} className="w-20 h-20 rounded-xl object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => removeProductImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-sm"
                    >
                      ×
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-primary text-primary-foreground px-1 rounded">Main</span>
                    )}
                  </div>
                ))}
                {(productForm.image_urls || []).length < 8 && (
                  <button
                    type="button"
                    onClick={() => productImageInputRef.current?.click()}
                    disabled={uploadingProductImage}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1 hover:bg-muted transition-colors shrink-0"
                  >
                    {uploadingProductImage ? (
                      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Upload</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={productForm.category} onChange={e => updateProductField("category", e.target.value)} placeholder="e.g. Snacks" />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={productForm.brand} onChange={e => updateProductField("brand", e.target.value)} />
              </div>
            </div>
            {/* ── Discount Section ── */}
            <div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <Label className="font-semibold text-sm">Discount</Label>
                <Switch
                  checked={!!productForm.discount_type}
                  onCheckedChange={(v) => {
                    if (v) {
                      updateProductField("discount_type", "percentage");
                      updateProductField("discount_value", 0);
                    } else {
                      updateProductField("discount_type", null);
                      updateProductField("discount_value", null);
                      updateProductField("discount_price_khr", null);
                      updateProductField("discount_expires_at", "");
                    }
                  }}
                />
              </div>
              {productForm.discount_type && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={productForm.discount_type === "percentage" ? "default" : "outline"}
                      className="flex-1 gap-1 text-xs"
                      onClick={() => {
                        updateProductField("discount_type", "percentage");
                        // Recalc
                        const val = productForm.discount_value || 0;
                        const discounted = Math.round((productForm.price_khr || 0) * (1 - val / 100));
                        updateProductField("discount_price_khr", discounted);
                      }}
                    >
                      <Percent className="h-3 w-3" /> Percentage
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={productForm.discount_type === "fixed" ? "default" : "outline"}
                      className="flex-1 gap-1 text-xs"
                      onClick={() => {
                        updateProductField("discount_type", "fixed");
                        const val = productForm.discount_value || 0;
                        const discounted = Math.max(0, (productForm.price_khr || 0) - val);
                        updateProductField("discount_price_khr", discounted);
                      }}
                    >
                      <DollarSign className="h-3 w-3" /> Fixed Amount
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">
                        {productForm.discount_type === "percentage" ? "Discount %" : "Discount ៛ KHR"}
                      </Label>
                      <Input
                        type="number"
                        step={productForm.discount_type === "percentage" ? "1" : "100"}
                        value={productForm.discount_value || ""}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          updateProductField("discount_value", val);
                          const origKhr = productForm.price_khr || 0;
                          if (productForm.discount_type === "percentage") {
                            updateProductField("discount_price_khr", Math.round(origKhr * (1 - val / 100)));
                          } else {
                            updateProductField("discount_price_khr", Math.max(0, origKhr - val));
                          }
                        }}
                        placeholder={productForm.discount_type === "percentage" ? "e.g. 10" : "e.g. 500"}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sale Price ៛</Label>
                      <Input
                        type="number"
                        value={productForm.discount_price_khr || ""}
                        readOnly
                        className="bg-muted/50 font-bold text-primary"
                      />
                    </div>
                  </div>
                  {/* Preview */}
                  {(productForm.discount_value || 0) > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-muted-foreground">៛{(productForm.price_khr || 0).toLocaleString()}</span>
                      <span className="font-bold text-primary">→ ៛{(productForm.discount_price_khr || 0).toLocaleString()}</span>
                      {productForm.discount_type === "percentage" && (
                        <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                          -{productForm.discount_value}%
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" /> Discount Expires
                    </Label>
                    <Input
                      type="datetime-local"
                      value={productForm.discount_expires_at ? productForm.discount_expires_at.slice(0, 16) : ""}
                      onChange={e => updateProductField("discount_expires_at", e.target.value ? new Date(e.target.value).toISOString() : "")}
                    />
                    <p className="text-[10px] text-muted-foreground">Leave empty for no expiry</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={productForm.sort_order === 0 ? "0" : productForm.sort_order || ""} onChange={e => updateProductField("sort_order", e.target.value === "" ? "" : parseInt(e.target.value) || 0)} onBlur={e => { if (e.target.value === "") updateProductField("sort_order", 0); }} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={productForm.in_stock} onCheckedChange={v => updateProductField("in_stock", v)} />
                <Label>In Stock</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProductDialog(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!productForm.name || productForm.price <= 0) {
                  toast.error("Name and price are required");
                  return;
                }
                saveProduct.mutate(true);
              }}
              disabled={saveProduct.isPending}
            >
              {saveProduct.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => {
                if (!productForm.name || productForm.price <= 0) {
                  toast.error("Name and price are required");
                  return;
                }
                saveProduct.mutate(false);
              }}
              disabled={saveProduct.isPending}
            >
              {saveProduct.isPending ? "Saving..." : editingProduct ? "Update & Close" : "Add & Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <Dialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProductId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteProductId && deleteProduct.mutate(deleteProductId)} disabled={deleteProduct.isPending}>
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
