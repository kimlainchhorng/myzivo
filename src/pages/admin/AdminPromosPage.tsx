// AdminPromosPage — create/edit/disable promo codes for the unified
// service pipeline. Route: /admin/promos

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2, Tag, Power, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminPromos, type PromoDraft, type ZivoServicePromo } from "@/hooks/useAdminPromos";
import { cn } from "@/lib/utils";

const fmt = (cents: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format((cents || 0) / 100);

const EMPTY_DRAFT: PromoDraft = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_percent: 10,
  discount_flat_cents: null,
  max_discount_cents: null,
  min_subtotal_cents: 0,
  applies_to: "all",
  first_order_only: false,
  max_total_redemptions: null,
  max_per_customer: 1,
  starts_at: null,
  ends_at: null,
  is_active: true,
};

export default function AdminPromosPage() {
  const navigate = useNavigate();
  const { promos, isLoading, error, create, toggleActive } = useAdminPromos();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-4 pb-24">
      <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <header className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Promo codes</h1>
          <p className="text-sm text-muted-foreground">Create + manage service-pipeline promos. Live on validation immediately.</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New code
        </Button>
      </header>

      {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : promos.length === 0 ? (
        <Card><CardContent className="pt-10 pb-10 text-center text-muted-foreground">
          <Tag className="mx-auto mb-2 h-8 w-8" />
          <p>No promo codes yet.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {promos.map((p) => (
            <PromoRow key={p.id} promo={p} onToggle={() => toggleActive(p.id, !p.is_active)} />
          ))}
        </div>
      )}

      {drawerOpen && <NewPromoDrawer onClose={() => setDrawerOpen(false)} onCreate={create} />}
    </div>
  );
}

function PromoRow({ promo, onToggle }: { promo: ZivoServicePromo; onToggle: () => void }) {
  const discountText =
    promo.discount_type === "percent"        ? `${promo.discount_percent}% off${promo.max_discount_cents ? ` (max ${fmt(promo.max_discount_cents)})` : ""}`
    : promo.discount_type === "flat"         ? `${fmt(promo.discount_flat_cents ?? 0)} off`
    : promo.discount_type === "free_delivery" ? "Free delivery"
    : "—";

  const expired = promo.ends_at != null && new Date(promo.ends_at) < new Date();
  const exhausted = promo.max_total_redemptions != null && promo.current_redemptions >= promo.max_total_redemptions;
  const status = !promo.is_active ? "disabled"
              : expired ? "expired"
              : exhausted ? "exhausted"
              : "active";

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Tag className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{promo.code}</code>
            <span className={cn(
              "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full",
              status === "active"   && "bg-emerald-500/10 text-emerald-700",
              status === "disabled" && "bg-muted text-muted-foreground",
              status === "expired"  && "bg-amber-500/10 text-amber-700",
              status === "exhausted" && "bg-rose-500/10 text-rose-700",
            )}>{status}</span>
          </div>
          <p className="text-sm text-foreground">{discountText} · {promo.applies_to}</p>
          <p className="text-xs text-muted-foreground">
            {promo.current_redemptions}{promo.max_total_redemptions != null && `/${promo.max_total_redemptions}`} redeemed
            {promo.first_order_only && " · first-order only"}
            {promo.min_subtotal_cents > 0 && ` · min ${fmt(promo.min_subtotal_cents)}`}
            {promo.ends_at && ` · ends ${new Date(promo.ends_at).toLocaleDateString()}`}
          </p>
          {promo.description && <p className="text-xs italic text-muted-foreground truncate mt-0.5">{promo.description}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={onToggle}>
          <Power className="h-3 w-3 mr-1" /> {promo.is_active ? "Disable" : "Enable"}
        </Button>
      </CardContent>
    </Card>
  );
}

function NewPromoDrawer({ onClose, onCreate }: { onClose: () => void; onCreate: (draft: PromoDraft) => Promise<boolean> }) {
  const [draft, setDraft] = useState<PromoDraft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const submit = async () => {
    setErrMsg(null);
    if (!draft.code.trim()) { setErrMsg("Code required"); return; }
    if (draft.discount_type === "percent" && !(draft.discount_percent && draft.discount_percent > 0)) {
      setErrMsg("Percent discount must be > 0"); return;
    }
    if (draft.discount_type === "flat" && !(draft.discount_flat_cents && draft.discount_flat_cents > 0)) {
      setErrMsg("Flat discount must be > 0"); return;
    }
    setBusy(true);
    const ok = await onCreate(draft);
    setBusy(false);
    if (ok) onClose();
    else setErrMsg("Save failed (see console).");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-card border-l border-border shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="font-medium">New promo code</p>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4 space-y-4 text-sm">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              placeholder="WELCOME10" maxLength={32} />
          </div>
          <div>
            <Label htmlFor="desc">Description (optional)</Label>
            <Textarea id="desc" rows={2}
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div>
            <Label>Discount type</Label>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {(["percent","flat","free_delivery"] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => setDraft({ ...draft, discount_type: t })}
                  className={cn(
                    "rounded-md border px-2 py-2 text-xs",
                    draft.discount_type === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
                  )}>
                  {t === "percent" ? "%" : t === "flat" ? "Flat" : "Free deliv."}
                </button>
              ))}
            </div>
          </div>
          {draft.discount_type === "percent" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pct">Percent</Label>
                <Input id="pct" type="number" min={1} max={100} value={draft.discount_percent ?? ""}
                  onChange={(e) => setDraft({ ...draft, discount_percent: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="cap">Max cap (USD)</Label>
                <Input id="cap" type="number" min={0} placeholder="—"
                  value={draft.max_discount_cents != null ? (draft.max_discount_cents / 100).toFixed(2) : ""}
                  onChange={(e) => setDraft({ ...draft, max_discount_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })} />
              </div>
            </div>
          )}
          {draft.discount_type === "flat" && (
            <div>
              <Label htmlFor="flat">Flat amount (USD)</Label>
              <Input id="flat" type="number" min={0}
                value={draft.discount_flat_cents != null ? (draft.discount_flat_cents / 100).toFixed(2) : ""}
                onChange={(e) => setDraft({ ...draft, discount_flat_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Applies to</Label>
              <select value={draft.applies_to}
                onChange={(e) => setDraft({ ...draft, applies_to: e.target.value as PromoDraft["applies_to"] })}
                className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="all">All</option>
                <option value="ride">Rides</option>
                <option value="delivery">Deliveries</option>
              </select>
            </div>
            <div>
              <Label htmlFor="min">Min subtotal (USD)</Label>
              <Input id="min" type="number" min={0}
                value={(draft.min_subtotal_cents / 100).toFixed(2)}
                onChange={(e) => setDraft({ ...draft, min_subtotal_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="max-per-cust">Max per customer</Label>
              <Input id="max-per-cust" type="number" min={1} value={draft.max_per_customer}
                onChange={(e) => setDraft({ ...draft, max_per_customer: Math.max(1, Number(e.target.value || 1)) })} />
            </div>
            <div>
              <Label htmlFor="max-total">Max total redemptions</Label>
              <Input id="max-total" type="number" min={0} placeholder="—"
                value={draft.max_total_redemptions ?? ""}
                onChange={(e) => setDraft({ ...draft, max_total_redemptions: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="starts">Starts at (optional)</Label>
              <Input id="starts" type="datetime-local"
                value={draft.starts_at ? draft.starts_at.slice(0, 16) : ""}
                onChange={(e) => setDraft({ ...draft, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            </div>
            <div>
              <Label htmlFor="ends">Ends at (optional)</Label>
              <Input id="ends" type="datetime-local"
                value={draft.ends_at ? draft.ends_at.slice(0, 16) : ""}
                onChange={(e) => setDraft({ ...draft, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="first-only" checked={draft.first_order_only}
              onCheckedChange={(v) => setDraft({ ...draft, first_order_only: v === true })} />
            <Label htmlFor="first-only" className="cursor-pointer text-xs text-muted-foreground">First-order customers only</Label>
          </div>

          {errMsg && <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{errMsg}</div>}

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button className="flex-1" onClick={submit} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Check className="h-4 w-4 mr-1" /> Create
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
