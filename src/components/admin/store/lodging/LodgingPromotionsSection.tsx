import { useState } from "react";
import { Tag, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LoadingPanel, NextActions, SectionShell, StatCard } from "./LodgingOperationsShared";
import { CatalogTable, EditorDialog } from "./CatalogTable";
import { useLodgingCatalog } from "@/hooks/lodging/useLodgingCatalog";

interface Promotion {
  id: string;
  store_id: string;
  code?: string | null;
  name: string;
  promo_type: string;
  discount_value: number;
  rule_type: string;
  min_nights?: number | null;
  max_nights?: number | null;
  days_in_advance?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  redemptions_total?: number | null;
  redemptions_used: number;
  active: boolean;
}

const PROMO_TYPES = ["percent", "fixed", "free_night", "upgrade"];
const RULE_TYPES = [
  { v: "general", label: "General code / discount" },
  { v: "early_bird", label: "Early bird (book in advance)" },
  { v: "last_minute", label: "Last minute (close to arrival)" },
  { v: "length_of_stay", label: "Length of stay" },
  { v: "mobile", label: "Mobile-only rate" },
  { v: "member", label: "Member-only rate" },
];
const blank: Partial<Promotion> = { name: "Early Bird 15%", promo_type: "percent", discount_value: 15, rule_type: "early_bird", days_in_advance: 30, redemptions_used: 0, active: true };

export default function LodgingPromotionsSection({ storeId }: { storeId: string }) {
  const { list, upsert, remove, toggleActive } = useLodgingCatalog<Promotion>("lodging_promotions", storeId);
  const [editing, setEditing] = useState<Partial<Promotion> | null>(null);
  const rows = list.data || [];
  const active = rows.filter((r) => r.active !== false);

  return (
    <SectionShell title="Promotions & Discounts" subtitle="Promo codes, early-bird, last-minute, length-of-stay, and member-only rates." icon={Tag}>
      {list.isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Active promos" value={String(active.length)} icon={Tag} />
          <StatCard label="Total redemptions" value={String(rows.reduce((s, r) => s + (r.redemptions_used || 0), 0))} icon={Percent} />
          <StatCard label="Code-based" value={String(rows.filter((r) => r.code).length)} icon={Tag} />
        </div>

        <CatalogTable
          rows={rows}
          isLoading={list.isLoading}
          emptyTitle="No promotions yet"
          emptyBody="Create promo codes, early-bird discounts, last-minute deals, and length-of-stay savings."
          addLabel="Add promotion"
          onAddClick={() => setEditing({ ...blank })}
          onEdit={(r) => setEditing(r)}
          onDelete={(id) => remove.mutate(id)}
          onToggleActive={(r) => toggleActive.mutate({ id: r.id, active: r.active === false })}
          columns={[
            { key: "name", label: "Promotion", render: (r) => (
              <>
                <span className="font-semibold">{r.name}</span>
                <p className="text-xs text-muted-foreground">
                  {r.code ? <Badge variant="outline" className="mr-1.5">{r.code}</Badge> : null}
                  <span className="capitalize">{r.rule_type.replace(/_/g, " ")}</span>
                </p>
              </>
            )},
            { key: "discount", label: "Discount", className: "w-28", render: (r) => r.promo_type === "percent" ? `${r.discount_value}% off` : r.promo_type === "fixed" ? `$${r.discount_value} off` : r.promo_type === "free_night" ? `${r.discount_value} free night${r.discount_value > 1 ? "s" : ""}` : "Upgrade" },
            { key: "redemp", label: "Used", className: "w-24", render: (r) => `${r.redemptions_used}${r.redemptions_total ? `/${r.redemptions_total}` : ""}` },
            { key: "ends", label: "Ends", className: "w-28", render: (r) => r.ends_at ? new Date(r.ends_at).toLocaleDateString() : "No expiry" },
          ]}
        />

        <NextActions actions={[
          { label: "Tune room rates", tab: "lodge-rate-plans", hint: "Confirm base rates leave room for discounts." },
          { label: "Highlight in property profile", tab: "lodge-property", hint: "Promote signature offers in property highlights." },
          { label: "Track in reports", tab: "lodge-reports", hint: "Monitor promotion performance over time." },
        ]} />

        {editing && (
          <EditorDialog
            open
            onOpenChange={(v) => !v && setEditing(null)}
            title={editing.id ? "Edit promotion" : "New promotion"}
            saving={upsert.isPending}
            onSave={() => {
              if (!editing.name?.trim()) return;
              upsert.mutate(editing as Promotion, { onSuccess: () => setEditing(null) });
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Name</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Summer 2026 — 15% off" />
              </div>
              <div>
                <Label>Promo code (optional)</Label>
                <Input value={editing.code || ""} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="SUMMER15" />
              </div>
              <div>
                <Label>Rule</Label>
                <Select value={editing.rule_type} onValueChange={(v) => setEditing({ ...editing, rule_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{RULE_TYPES.map((r) => <SelectItem key={r.v} value={r.v}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount type</Label>
                <Select value={editing.promo_type} onValueChange={(v) => setEditing({ ...editing, promo_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROMO_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input type="number" min={0} step="0.01" value={editing.discount_value || 0} onChange={(e) => setEditing({ ...editing, discount_value: parseFloat(e.target.value || "0") })} />
              </div>
              {editing.rule_type === "early_bird" && (
                <div>
                  <Label>Days in advance</Label>
                  <Input type="number" min={1} value={editing.days_in_advance || 30} onChange={(e) => setEditing({ ...editing, days_in_advance: parseInt(e.target.value || "0", 10) })} />
                </div>
              )}
              {editing.rule_type === "last_minute" && (
                <div>
                  <Label>Within days of arrival</Label>
                  <Input type="number" min={1} value={editing.days_in_advance || 7} onChange={(e) => setEditing({ ...editing, days_in_advance: parseInt(e.target.value || "0", 10) })} />
                </div>
              )}
              {editing.rule_type === "length_of_stay" && (
                <>
                  <div>
                    <Label>Min nights</Label>
                    <Input type="number" min={1} value={editing.min_nights || 1} onChange={(e) => setEditing({ ...editing, min_nights: parseInt(e.target.value || "0", 10) })} />
                  </div>
                  <div>
                    <Label>Max nights (optional)</Label>
                    <Input type="number" min={1} value={editing.max_nights || ""} onChange={(e) => setEditing({ ...editing, max_nights: e.target.value ? parseInt(e.target.value, 10) : null })} />
                  </div>
                </>
              )}
              <div>
                <Label>Starts</Label>
                <Input type="date" value={editing.starts_at?.slice(0, 10) || ""} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
              </div>
              <div>
                <Label>Ends</Label>
                <Input type="date" value={editing.ends_at?.slice(0, 10) || ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Max total redemptions (optional)</Label>
                <Input type="number" min={1} value={editing.redemptions_total || ""} onChange={(e) => setEditing({ ...editing, redemptions_total: e.target.value ? parseInt(e.target.value, 10) : null })} />
              </div>
            </div>
          </EditorDialog>
        )}
      </>}
    </SectionShell>
  );
}
