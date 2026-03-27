/**
 * Store Setup Wizard — Multi-step onboarding for store owners.
 * Steps: 1) Owner Profile  2) Store Details  3) Payment Setup  4) Review
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Store, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Loader2, Upload, X, MapPin, Phone, Clock } from "lucide-react";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import { useQuery } from "@tanstack/react-query";

const STEPS = [
  { id: 1, label: "Owner Profile", icon: User },
  { id: 2, label: "Store Details", icon: Store },
  { id: 3, label: "Payment Setup", icon: CreditCard },
  { id: 4, label: "Review", icon: CheckCircle },
];

export default function StoreSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  // Owner profile fields
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  // Store detail fields
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storeCategory, setStoreCategory] = useState("grocery");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeHours, setStoreHours] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  // Payment fields
  const [abaAccount, setAbaAccount] = useState("");
  const [abaHolder, setAbaHolder] = useState("");
  const [wingAccount, setWingAccount] = useState("");
  const [wingHolder, setWingHolder] = useState("");
  const [acledaAccount, setAcledaAccount] = useState("");
  const [acledaHolder, setAcledaHolder] = useState("");

  // Fetch the user's store
  const { data: myStore, isLoading: loadingStore } = useQuery({
    queryKey: ["my-store", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("*")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Pre-fill from existing data
  useEffect(() => {
    if (user) {
      setOwnerEmail(user.email || "");
      setOwnerName(user.user_metadata?.full_name || "");
    }
  }, [user]);

  useEffect(() => {
    if (myStore) {
      if (myStore.setup_complete) {
        navigate(`/admin/stores/${myStore.id}`, { replace: true });
        return;
      }
      setStoreName(myStore.name || "");
      setStoreSlug(myStore.slug || "");
      setStoreDesc(myStore.description || "");
      setStoreCategory(myStore.category || "grocery");
      setStoreAddress(myStore.address || "");
      setStorePhone(myStore.phone || "");
      setStoreHours(myStore.hours || "");
      setLogoUrl(myStore.logo_url || "");
      setBannerUrl(myStore.banner_url || "");
    }
  }, [myStore, navigate]);

  // Auto-generate slug from name
  useEffect(() => {
    if (storeName && !myStore?.slug) {
      setStoreSlug(storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [storeName, myStore?.slug]);

  const uploadImage = async (file: File, type: "logo" | "banner") => {
    const isLogo = type === "logo";
    isLogo ? setUploadingLogo(true) : setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `setup/${user!.id}/${type}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
      isLogo ? setLogoUrl(urlData.publicUrl) : setBannerUrl(urlData.publicUrl);
      toast.success(`${isLogo ? "Logo" : "Banner"} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingBanner(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return ownerName.trim().length > 0 && ownerEmail.trim().length > 0;
    if (step === 2) return storeName.trim().length > 0 && storeSlug.trim().length > 0;
    return true;
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update profile
      await supabase.from("profiles").update({
        full_name: ownerName,
        phone: ownerPhone || null,
      }).eq("user_id", user.id);

      // Upsert store
      const storeData = {
        name: storeName,
        slug: storeSlug,
        description: storeDesc || null,
        category: storeCategory,
        address: storeAddress || null,
        phone: storePhone || null,
        hours: storeHours || null,
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        owner_id: user.id,
        setup_complete: true,
        is_active: true,
        market: "KH",
      };

      let storeId = myStore?.id;

      if (storeId) {
        const { error } = await supabase.from("store_profiles").update(storeData).eq("id", storeId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("store_profiles").insert(storeData).select("id").single();
        if (error) throw error;
        storeId = data.id;
      }

      // Save payment methods if provided
      if (abaAccount || wingAccount) {
        const payments = [];
        if (abaAccount) {
          payments.push({
            store_id: storeId!,
            provider: "aba",
            account_number: abaAccount,
            account_holder_name: abaHolder,
            is_enabled: true,
            qr_code_url: "",
          });
        }
        if (wingAccount) {
          payments.push({
            store_id: storeId!,
            provider: "wing",
            account_number: wingAccount,
            account_holder_name: wingHolder,
            is_enabled: true,
            qr_code_url: "",
          });
        }
        for (const pm of payments) {
          await supabase.from("store_payment_methods").upsert(pm, { onConflict: "store_id,provider" });
        }
      }

      toast.success("Store setup complete! 🎉");
      navigate(`/admin/stores/${storeId}`, { replace: true });
    } catch (err: any) {
      console.error("Store setup error:", err);
      toast.error(err?.message || "Failed to complete setup");
    } finally {
      setSaving(false);
    }
  };

  if (loadingStore) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#0d2137]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const storeId = myStore?.id || "new";
  const displayId = `CBD${(storeId === "new" ? "00000000" : storeId.replace(/-/g, "").slice(0, 8)).toUpperCase()}`;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0a1628] to-[#0d2137] px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Store Account Setup</h1>
          <p className="text-white/50 text-sm mt-1">Set up your store in a few easy steps</p>
          <p className="text-white/30 text-xs font-mono mt-1">ID: {displayId}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive ? "bg-primary text-primary-foreground" :
                  isDone ? "bg-primary/20 text-primary" :
                  "bg-white/10 text-white/40"
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 ${isDone ? "bg-primary" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="bg-white/[0.08] backdrop-blur-2xl border-white/[0.15]">
          <CardContent className="p-6 sm:p-8">
            {/* Step 1: Owner Profile */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Owner Profile</h2>
                  <p className="text-white/40 text-sm">Tell us about yourself</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Full Name *</Label>
                    <Input
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      placeholder="Your full name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Email</Label>
                    <Input
                      value={ownerEmail}
                      disabled
                      className="bg-white/5 border-white/10 text-white/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Phone Number</Label>
                    <Input
                      value={ownerPhone}
                      onChange={e => setOwnerPhone(e.target.value)}
                      placeholder="+855 12 345 678"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Store Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Store Details</h2>
                  <p className="text-white/40 text-sm">Set up your store information</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Store Name *</Label>
                      <Input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="My Store" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">URL Slug *</Label>
                      <Input value={storeSlug} onChange={e => setStoreSlug(e.target.value)} placeholder="my-store" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Description</Label>
                    <Textarea value={storeDesc} onChange={e => setStoreDesc(e.target.value)} placeholder="What does your store sell?" rows={2} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Category</Label>
                    <select value={storeCategory} onChange={e => setStoreCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      {STORE_CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-[#0d2137] text-white">{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Logo & Banner uploads */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Logo</Label>
                      <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, "logo"); e.target.value = ""; }} />
                      {logoUrl ? (
                        <div className="relative w-20 h-20 rounded-xl border border-white/20 overflow-hidden group">
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button type="button" onClick={() => logoRef.current?.click()} className="h-6 w-6 rounded-full bg-white/80 flex items-center justify-center"><Upload className="h-3 w-3 text-foreground" /></button>
                            <button type="button" onClick={() => setLogoUrl("")} className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => logoRef.current?.click()} disabled={uploadingLogo} className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-white/40 hover:text-primary transition-colors cursor-pointer">
                          {uploadingLogo ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /><span className="text-[10px]">Upload</span></>}
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Banner</Label>
                      <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, "banner"); e.target.value = ""; }} />
                      {bannerUrl ? (
                        <div className="relative w-full h-20 rounded-xl border border-white/20 overflow-hidden group">
                          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button type="button" onClick={() => bannerRef.current?.click()} className="h-6 w-6 rounded-full bg-white/80 flex items-center justify-center"><Upload className="h-3 w-3 text-foreground" /></button>
                            <button type="button" onClick={() => setBannerUrl("")} className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => bannerRef.current?.click()} disabled={uploadingBanner} className="w-full h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-white/40 hover:text-primary transition-colors cursor-pointer">
                          {uploadingBanner ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /><span className="text-[10px]">Upload</span></>}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</Label>
                    <Input value={storeAddress} onChange={e => setStoreAddress(e.target.value)} placeholder="Store address" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Store Phone</Label>
                      <Input value={storePhone} onChange={e => setStorePhone(e.target.value)} placeholder="023 900 888" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Hours</Label>
                      <Input value={storeHours} onChange={e => setStoreHours(e.target.value)} placeholder="7am–10pm" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment Setup */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Payment Setup</h2>
                  <p className="text-white/40 text-sm">Add your payment accounts (optional, can be done later)</p>
                </div>
                <div className="space-y-4">
                  {/* ABA */}
                  <div className="rounded-xl border border-white/15 p-4 space-y-3">
                    <h3 className="text-white font-medium">ABA PayWay</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Account Number</Label>
                        <Input value={abaAccount} onChange={e => setAbaAccount(e.target.value)} placeholder="000 123 456" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Account Holder</Label>
                        <Input value={abaHolder} onChange={e => setAbaHolder(e.target.value)} placeholder="Name on account" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm" />
                      </div>
                    </div>
                  </div>
                  {/* Wing */}
                  <div className="rounded-xl border border-white/15 p-4 space-y-3">
                    <h3 className="text-white font-medium">Wing Bank</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Account Number</Label>
                        <Input value={wingAccount} onChange={e => setWingAccount(e.target.value)} placeholder="000 123 456" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Account Holder</Label>
                        <Input value={wingHolder} onChange={e => setWingHolder(e.target.value)} placeholder="Name on account" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Review & Confirm</h2>
                  <p className="text-white/40 text-sm">Make sure everything looks good</p>
                </div>
                <div className="space-y-4">
                  {/* Owner */}
                  <div className="rounded-xl border border-white/15 p-4">
                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">Owner</h3>
                    <p className="text-white font-medium">{ownerName}</p>
                    <p className="text-white/50 text-sm">{ownerEmail}</p>
                    {ownerPhone && <p className="text-white/50 text-sm">{ownerPhone}</p>}
                  </div>
                  {/* Store */}
                  <div className="rounded-xl border border-white/15 p-4">
                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">Store</h3>
                    <div className="flex items-center gap-3 mb-2">
                      {logoUrl && <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <p className="text-white font-medium">{storeName}</p>
                        <p className="text-white/50 text-sm">/{storeSlug} · {STORE_CATEGORY_OPTIONS.find(o => o.value === storeCategory)?.label}</p>
                      </div>
                    </div>
                    {storeDesc && <p className="text-white/40 text-sm">{storeDesc}</p>}
                    {storeAddress && <p className="text-white/40 text-sm mt-1">📍 {storeAddress}</p>}
                    {storePhone && <p className="text-white/40 text-sm">📞 {storePhone}</p>}
                    {storeHours && <p className="text-white/40 text-sm">🕐 {storeHours}</p>}
                  </div>
                  {/* Payment */}
                  <div className="rounded-xl border border-white/15 p-4">
                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">Payment</h3>
                    {abaAccount || wingAccount ? (
                      <div className="space-y-1">
                        {abaAccount && <p className="text-white/70 text-sm">ABA: {abaHolder} — {abaAccount}</p>}
                        {wingAccount && <p className="text-white/70 text-sm">Wing: {wingHolder} — {wingAccount}</p>}
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm">No payment methods added (can be configured later)</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              {step > 1 ? (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-white/60 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : <div />}

              {step < 4 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Complete Setup <CheckCircle className="w-4 h-4 ml-2" /></>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
