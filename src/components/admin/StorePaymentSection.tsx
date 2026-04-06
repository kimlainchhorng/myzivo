import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CreditCard, QrCode, DollarSign, Loader2, Edit, Save, X, ShieldCheck, Upload, ClipboardCheck, Landmark, Link2, Banknote } from "lucide-react";
import PaymentVerificationDialog from "./PaymentVerificationDialog";

import abaLogo from "@/assets/payments/aba-logo.png";
import abaBanner from "@/assets/payments/aba-banner.jpg";
import wingLogo from "@/assets/payments/wing-logo.png";
import wingBanner from "@/assets/payments/wing-banner.jpg";
import acledaLogo from "@/assets/payments/acleda-logo.webp";
import acledaBanner from "@/assets/payments/acleda-banner.jpg";

interface PaymentMethod {
  id?: string;
  store_id: string;
  provider: string;
  is_enabled: boolean;
  account_number: string;
  account_holder_name: string;
  qr_code_url: string;
}

// Cambodia-specific providers
const KH_PROVIDERS = [
  {
    key: "aba",
    name: "ABA PayWay",
    desc: "Accept payments via ABA mobile & KHQR",
    logo: abaLogo,
    banner: abaBanner,
    bannerAlt: "ABA KHQR",
    hasQR: true,
  },
  {
    key: "wing",
    name: "Wing Bank",
    desc: "Accept payments via Wing mobile wallet",
    logo: wingLogo,
    banner: wingBanner,
    bannerAlt: "Wing Bank",
    hasQR: true,
  },
  {
    key: "acleda",
    name: "ACLEDA Bank",
    desc: "Accept payments via ACLEDA mobile & KHQR",
    logo: acledaLogo,
    banner: acledaBanner,
    bannerAlt: "ACLEDA Bank",
    hasQR: true,
  },
];

export default function StorePaymentSection({ storeId, market = "KH" }: { storeId: string; market?: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [pendingEditProvider, setPendingEditProvider] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [editForms, setEditForms] = useState<Record<string, Partial<PaymentMethod>>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isUS = market === "US";
  const isKH = market === "KH";

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ["store-payment-methods", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_payment_methods")
        .select("*")
        .eq("store_id", storeId);
      if (error) throw error;
      return (data || []) as PaymentMethod[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (method: Partial<PaymentMethod> & { store_id: string; provider: string }) => {
      const { data, error } = await supabase
        .from("store_payment_methods")
        .upsert(method, { onConflict: "store_id,provider" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-payment-methods", storeId] });
    },
  });

  const getMethod = (provider: string): PaymentMethod | undefined =>
    paymentMethods?.find((m) => m.provider === provider);

  const handleEditClick = (provider: string) => {
    if (verified) {
      setEditing(provider);
      const existing = getMethod(provider);
      setEditForms((prev) => ({
        ...prev,
        [provider]: {
          account_number: existing?.account_number || "",
          account_holder_name: existing?.account_holder_name || "",
          qr_code_url: existing?.qr_code_url || "",
        },
      }));
    } else {
      setPendingEditProvider(provider);
      setVerifyDialogOpen(true);
    }
  };

  const handleVerified = () => {
    setVerified(true);
    if (pendingEditProvider) {
      setEditing(pendingEditProvider);
      const existing = getMethod(pendingEditProvider);
      setEditForms((prev) => ({
        ...prev,
        [pendingEditProvider!]: {
          account_number: existing?.account_number || "",
          account_holder_name: existing?.account_holder_name || "",
          qr_code_url: existing?.qr_code_url || "",
        },
      }));
      setPendingEditProvider(null);
    }
    setTimeout(() => setVerified(false), 30 * 60 * 1000);
  };

  const handleSave = async (provider: string) => {
    const form = editForms[provider];
    if (!form) return;

    try {
      await upsertMutation.mutateAsync({
        store_id: storeId,
        provider,
        account_number: form.account_number || "",
        account_holder_name: form.account_holder_name || "",
        qr_code_url: form.qr_code_url || "",
        is_enabled: getMethod(provider)?.is_enabled ?? false,
      });
      setEditing(null);
      toast.success("Payment details saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleToggle = async (provider: string, enabled: boolean) => {
    const existing = getMethod(provider);
    try {
      await upsertMutation.mutateAsync({
        store_id: storeId,
        provider,
        is_enabled: enabled,
        account_number: existing?.account_number || "",
        account_holder_name: existing?.account_holder_name || "",
        qr_code_url: existing?.qr_code_url || "",
      });
      toast.success(`${provider.toUpperCase()} ${enabled ? "enabled" : "disabled"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleQRUpload = async (provider: string, file: File) => {
    try {
      const ext = file.name.split(".").pop();
      const filePath = `payment-qr/${storeId}/${provider}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("store-posts")
        .upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("store-posts")
        .getPublicUrl(filePath);

      setEditForms((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], qr_code_url: urlData.publicUrl },
      }));
      toast.success("QR code uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  };

  const updateEditForm = (provider: string, field: string, value: string) => {
    setEditForms((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], [field]: value },
    }));
  };

  // Render a simple toggle card (no banner, no QR)
  const renderSimpleToggle = (
    key: string,
    icon: React.ReactNode,
    name: string,
    desc: string,
    iconBg: string
  ) => {
    const method = getMethod(key);
    return (
      <div key={key} className="rounded-lg border border-border/60 px-3 py-2.5 bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className={`h-7 w-7 rounded-md flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">{name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
          </div>
          <Switch
            checked={method?.is_enabled ?? false}
            onCheckedChange={(checked) => handleToggle(key, checked)}
            className="scale-90"
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage how this store receives payments from customers and how payouts are processed.
          </p>

          {/* Card Payment — All markets */}
          {renderSimpleToggle(
            "card",
            <CreditCard className="h-3.5 w-3.5 text-primary" />,
            "Card Payment",
            "Visa, Mastercard & more via Stripe",
            "bg-primary/10"
          )}

          {/* Confirmed Payment Order — All markets */}
          {renderSimpleToggle(
            "confirmed_order",
            <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />,
            "Confirmed Payment Order",
            "Require payment confirmation before processing orders",
            "bg-emerald-500/10"
          )}

          {/* US-specific payment methods */}
          {!isKH && (
            <>
              {renderSimpleToggle(
                "bank_transfer",
                <Landmark className="h-3.5 w-3.5 text-blue-600" />,
                "Bank Transfer (ACH)",
                "Accept direct bank transfers & ACH payments",
                "bg-blue-500/10"
              )}

              {renderSimpleToggle(
                "stripe_connect",
                <Link2 className="h-3.5 w-3.5 text-violet-600" />,
                "Stripe Connect",
                "Connect your Stripe account for direct payouts",
                "bg-violet-500/10"
              )}

              {renderSimpleToggle(
                "invoice",
                <Banknote className="h-3.5 w-3.5 text-amber-600" />,
                "Invoice Payment",
                "Send invoices and accept payment on terms",
                "bg-amber-500/10"
              )}
            </>
          )}

          {/* Cambodia-specific bank providers */}
          {isKH && KH_PROVIDERS.map((prov) => {
            const method = getMethod(prov.key);
            const isEditing = editing === prov.key;
            const form = editForms[prov.key] || {};

            return (
              <div key={prov.key} className="rounded-xl border border-border overflow-hidden space-y-0">
                <div className="relative h-24 w-full">
                  <img src={prov.banner} alt={prov.bannerAlt} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                      <img src={prov.logo} alt={prov.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{prov.name}</p>
                      <p className="text-xs text-muted-foreground">{prov.desc}</p>
                    </div>
                    <Switch
                      checked={method?.is_enabled ?? false}
                      onCheckedChange={(checked) => handleToggle(prov.key, checked)}
                    />
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <Input
                        placeholder={`${prov.name} Account Number`}
                        className="text-sm"
                        value={form.account_number || ""}
                        onChange={(e) => updateEditForm(prov.key, "account_number", e.target.value)}
                      />
                      <Input
                        placeholder="Account Holder Name"
                        className="text-sm"
                        value={form.account_holder_name || ""}
                        onChange={(e) => updateEditForm(prov.key, "account_holder_name", e.target.value)}
                      />

                      {form.qr_code_url ? (
                        <div className="relative rounded-lg overflow-hidden border border-border">
                          <img src={form.qr_code_url} alt="QR Code" className="w-full max-h-48 object-contain bg-white" />
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 gap-1"
                            onClick={() => fileInputRefs.current[prov.key]?.click()}
                          >
                            <Upload className="h-3 w-3" />
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-sm"
                          onClick={() => fileInputRefs.current[prov.key]?.click()}
                        >
                          <QrCode className="h-4 w-4" />
                          Upload QR Code
                        </Button>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[prov.key] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleQRUpload(prov.key, file);
                          e.target.value = "";
                        }}
                      />

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleSave(prov.key)}
                          disabled={upsertMutation.isPending}
                        >
                          {upsertMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                        {method?.account_number || "No account number set"}
                      </div>
                      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                        {method?.account_holder_name || "No account holder name"}
                      </div>

                      {method?.qr_code_url ? (
                        <div className="rounded-lg overflow-hidden border border-border">
                          <img src={method.qr_code_url} alt="QR Code" className="w-full max-h-48 object-contain bg-white" />
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5 text-center">
                          No QR code uploaded
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full gap-2 text-sm"
                        onClick={() => handleEditClick(prov.key)}
                      >
                        <Edit className="h-4 w-4" />
                        {verified ? "Edit Payment Details" : (
                          <>
                            <ShieldCheck className="h-4 w-4" />
                            Verify & Edit Payment Details
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Cash on Delivery — All markets */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Customers pay in cash upon receiving their order</p>
              </div>
              <Switch
                checked={getMethod("cash")?.is_enabled ?? false}
                onCheckedChange={(checked) => handleToggle("cash", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <PaymentVerificationDialog
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        storeId={storeId}
        onVerified={handleVerified}
      />
    </>
  );
}
