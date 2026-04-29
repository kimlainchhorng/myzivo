/**
 * Auto Repair — Part Shop
 * Wired to ar_parts: store-owned catalog with search/filter and full CRUD.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Search from "lucide-react/dist/esm/icons/search";
import Package from "lucide-react/dist/esm/icons/package";
import Plus from "lucide-react/dist/esm/icons/plus";
import Wrench from "lucide-react/dist/esm/icons/wrench";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Store from "lucide-react/dist/esm/icons/store";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import { toast } from "sonner";
import { PARTS_SUPPLIERS, type PartsSupplier } from "@/config/partsSuppliers";
import PartsSupplierLogo from "./PartsSupplierLogo";
import SupplierBrowserModal from "./SupplierBrowserModal";

interface Props { storeId: string }
type Part = {
  id: string;
  store_id: string;
  sku: string;
  name: string;
  brand: string | null;
  category: string | null;
  price_cents: number;
  stock: number;
  active: boolean;
  image_url: string | null;
};

const SEED: Array<Omit<Part, "id" | "store_id" | "active" | "image_url">> = [
  { sku: "BP-2231", name: "Ceramic Brake Pads (Front)", brand: "Akebono", category: "Brakes", price_cents: 8999, stock: 24 },
  { sku: "BR-1102", name: "Brake Rotor 320mm", brand: "Brembo", category: "Brakes", price_cents: 14500, stock: 12 },
  { sku: "OF-001", name: "Oil Filter (Universal)", brand: "Mobil 1", category: "Engine", price_cents: 1249, stock: 80 },
  { sku: "OL-5W30", name: "5W-30 Full Synthetic 5qt", brand: "Castrol", category: "Fluids", price_cents: 3299, stock: 60 },
  { sku: "SP-4101", name: "Iridium Spark Plug (set of 4)", brand: "NGK", category: "Engine", price_cents: 4800, stock: 35 },
  { sku: "BAT-H7", name: "AGM Battery H7", brand: "Bosch", category: "Electrical", price_cents: 21900, stock: 8 },
  { sku: "TIRE-225", name: "All-Season Tire 225/65R17", brand: "Michelin", category: "Tires", price_cents: 18900, stock: 16 },
  { sku: "CAB-AF", name: "Cabin Air Filter", brand: "K&N", category: "HVAC", price_cents: 2499, stock: 42 },
  { sku: "WB-22", name: 'Wiper Blade 22"', brand: "Bosch", category: "Exterior", price_cents: 1849, stock: 50 },
  { sku: "ALT-130", name: "Alternator 130A", brand: "Denso", category: "Electrical", price_cents: 28900, stock: 5 },
  { sku: "SHK-FR", name: "Front Strut Assembly", brand: "Monroe", category: "Suspension", price_cents: 15600, stock: 10 },
  { sku: "COOL-50", name: "Universal Coolant 1gal", brand: "Prestone", category: "Fluids", price_cents: 1899, stock: 45 },
];

const CATS = ["All", "Brakes", "Engine", "Fluids", "Electrical", "Tires", "HVAC", "Suspension", "Exterior", "Other"];
const blank = { sku: "", name: "", brand: "", category: "Brakes", price_cents: 0, stock: 0 };

export default function AutoRepairPartShopSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...blank, price: "0.00" });

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["ar-parts", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_parts")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Part[];
    },
  });

  const filtered = useMemo(() => parts.filter(p =>
    (cat === "All" || p.category === cat) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase())
      || p.sku.toLowerCase().includes(q.toLowerCase())
      || (p.brand ?? "").toLowerCase().includes(q.toLowerCase()))
  ), [parts, q, cat]);

  const seedCatalog = useMutation({
    mutationFn: async () => {
      const rows = SEED.map(s => ({ ...s, store_id: storeId, active: true }));
      const { error } = await supabase.from("ar_parts").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("12 starter parts added");
      qc.invalidateQueries({ queryKey: ["ar-parts", storeId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Could not seed catalog"),
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (!form.sku.trim() || !form.name.trim()) throw new Error("SKU and name are required");
      const payload = {
        store_id: storeId,
        sku: form.sku.trim(),
        name: form.name.trim(),
        brand: form.brand.trim() || null,
        category: form.category,
        price_cents: Math.round((Number(form.price) || 0) * 100),
        stock: form.stock,
        active: true,
      };
      if (editId) {
        const { error } = await supabase.from("ar_parts").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ar_parts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Part updated" : "Part added");
      qc.invalidateQueries({ queryKey: ["ar-parts", storeId] });
      setOpen(false); setEditId(null); setForm({ ...blank, price: "0.00" });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_parts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["ar-parts", storeId] });
    },
  });

  const startEdit = (p: Part) => {
    setEditId(p.id);
    setForm({
      sku: p.sku, name: p.name, brand: p.brand ?? "", category: p.category ?? "Other",
      price_cents: p.price_cents, stock: p.stock,
      price: (p.price_cents / 100).toFixed(2),
    });
    setOpen(true);
  };

  const startNew = () => {
    setEditId(null);
    setForm({ ...blank, price: "0.00" });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Part Shop
            <Badge variant="secondary" className="ml-1">{parts.length}</Badge>
          </CardTitle>
          <Button size="sm" className="gap-1.5" onClick={startNew}>
            <Plus className="w-3.5 h-3.5" /> Add Part
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, SKU, or brand" className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATS.map(c => (
              <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)} className="h-7 px-3 text-xs shrink-0">{c}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <SuppliersNetworkCard query={q} storeId={storeId} />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[0,1,2,3,4,5].map(i => <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : parts.length === 0 ? (
        <Card><CardContent className="py-12 text-center space-y-3">
          <Package className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No parts in your catalog yet.</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add a part</Button>
            <Button size="sm" variant="outline" onClick={() => seedCatalog.mutate()} disabled={seedCatalog.isPending} className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {seedCatalog.isPending ? "Adding..." : "Seed 12 starter parts"}
            </Button>
          </div>
        </CardContent></Card>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No parts match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="p-3 space-y-2">
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-8 h-8 text-muted-foreground/40" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{p.brand || "—"} · {p.sku}</p>
                  <p className="text-sm font-semibold leading-tight">{p.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold">${(p.price_cents / 100).toFixed(2)}</span>
                    <Badge variant={p.stock > 10 ? "secondary" : "outline"} className="ml-2 text-[10px]">
                      {p.stock > 0 ? `${p.stock} in stock` : "Out"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { if (confirm(`Remove ${p.name}?`)) remove.mutate(p.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Edit Part" : "Add Part"}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="SKU *" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
              <Input placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
            </div>
            <Input placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {CATS.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Price (USD)"
                inputMode="decimal"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, "") })}
              />
              <Input
                placeholder="Stock"
                inputMode="numeric"
                value={String(form.stock)}
                onChange={e => setForm({ ...form, stock: parseInt(e.target.value.replace(/\D/g, "") || "0", 10) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => upsert.mutate()} disabled={upsert.isPending}>
              {upsert.isPending ? "Saving..." : editId ? "Save changes" : "Add part"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Suppliers Network ---------------- */

const SUPPLIER_CATEGORIES = ["All", "Retail Chain", "OE / Dealer", "Wholesale Distributor", "Online Marketplace", "Specialty"] as const;

function SuppliersNetworkCard({ query, storeId }: { query: string; storeId: string }) {
  const [supCat, setSupCat] = useState<(typeof SUPPLIER_CATEGORIES)[number]>("All");
  const [supQ, setSupQ] = useState("");
  const [activeSupplier, setActiveSupplier] = useState<PartsSupplier | null>(null);

  const list = useMemo(() => {
    const q = supQ.trim().toLowerCase();
    return PARTS_SUPPLIERS.filter(s =>
      (supCat === "All" || s.category === supCat) &&
      (!q || s.name.toLowerCase().includes(q) || (s.shortName?.toLowerCase().includes(q) ?? false))
    );
  }, [supCat, supQ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Store className="w-4 h-4" /> Parts Suppliers
          <Badge variant="outline" className="ml-1 text-[10px]">{PARTS_SUPPLIERS.length}</Badge>
          {query && <Badge variant="secondary" className="ml-1 text-[10px]">Search: {query}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9"
            placeholder="Search suppliers (AutoZone, NAPA, RockAuto...)"
            value={supQ}
            onChange={(e) => setSupQ(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {SUPPLIER_CATEGORIES.map(c => (
            <Button
              key={c}
              size="sm"
              variant={supCat === c ? "default" : "outline"}
              onClick={() => setSupCat(c)}
              className="h-7 px-3 text-xs shrink-0"
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1.5 max-h-[320px] overflow-auto">
          {list.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSupplier(s)}
              className="flex items-center gap-2.5 text-left text-[12px] border border-border rounded-md px-2 py-1.5 hover:border-primary hover:bg-primary/5 transition-colors group"
            >
              <PartsSupplierLogo supplier={s} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{s.shortName ?? s.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {s.description ?? s.category}
                </p>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          {list.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-full text-center py-4">No suppliers match.</p>
          )}
        </div>
      </CardContent>

      <SupplierBrowserModal
        storeId={storeId}
        supplier={activeSupplier}
        query={query}
        open={!!activeSupplier}
        onOpenChange={(o) => !o && setActiveSupplier(null)}
      />
    </Card>
  );
}

