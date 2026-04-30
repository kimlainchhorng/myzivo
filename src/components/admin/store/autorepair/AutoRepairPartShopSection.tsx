/**
 * Auto Repair — Part Shop (AutoZone-style)
 * Vehicle fitment lookup · rich catalog · stock alerts · sort/view toggle
 */
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PARTS_SUPPLIERS, type PartsSupplier } from "@/config/partsSuppliers";
import PartsSupplierLogo from "./PartsSupplierLogo";
import SupplierBrowserModal from "./SupplierBrowserModal";
import Search from "lucide-react/dist/esm/icons/search";
import Package from "lucide-react/dist/esm/icons/package";
import Plus from "lucide-react/dist/esm/icons/plus";
import Wrench from "lucide-react/dist/esm/icons/wrench";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Store from "lucide-react/dist/esm/icons/store";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import KeyRound from "lucide-react/dist/esm/icons/key-round";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import List from "lucide-react/dist/esm/icons/list";
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down";
import Car from "lucide-react/dist/esm/icons/car";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import Download from "lucide-react/dist/esm/icons/download";
import Upload from "lucide-react/dist/esm/icons/upload";
import X from "lucide-react/dist/esm/icons/x";

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
  oem_number?: string | null;
  interchange_number?: string | null;
  condition?: string | null;
  warranty_months?: number | null;
  core_charge_cents?: number | null;
  fitment_notes?: string | null;
  location_in_store?: string | null;
  cost_cents?: number | null;
};

type SortKey = "name" | "price" | "stock" | "brand" | "created";
type ViewMode = "grid" | "list";

const CATS = [
  "All", "Brakes", "Engine", "Fluids", "Electrical", "Tires",
  "HVAC", "Suspension", "Exhaust", "Fuel System", "Transmission",
  "Steering", "Cooling", "Lighting", "Exterior", "Interior", "Other",
];

const CONDITIONS = ["New", "OEM", "Remanufactured", "Aftermarket", "Used"];

const SEED: Array<Omit<Part, "id" | "store_id" | "active" | "image_url">> = [
  { sku: "BP-2231", name: "Ceramic Brake Pads (Front)", brand: "Akebono", category: "Brakes", price_cents: 8999, cost_cents: 5500, stock: 24, condition: "New", warranty_months: 24, oem_number: "D1275", fitment_notes: "Fits most 2015-2023 domestic vehicles" },
  { sku: "BR-1102", name: "Brake Rotor 320mm", brand: "Brembo", category: "Brakes", price_cents: 14500, cost_cents: 9200, stock: 12, condition: "New", warranty_months: 12 },
  { sku: "OF-001", name: "Oil Filter (Universal)", brand: "Mobil 1", category: "Engine", price_cents: 1249, cost_cents: 680, stock: 80, oem_number: "M1-113A" },
  { sku: "OL-5W30", name: "5W-30 Full Synthetic 5qt", brand: "Castrol", category: "Fluids", price_cents: 3299, cost_cents: 2100, stock: 60 },
  { sku: "SP-4101", name: "Iridium Spark Plug (set of 4)", brand: "NGK", category: "Engine", price_cents: 4800, cost_cents: 2900, stock: 35, oem_number: "BKR6EIX-11", warranty_months: 24 },
  { sku: "BAT-H7", name: "AGM Battery H7", brand: "Bosch", category: "Electrical", price_cents: 21900, cost_cents: 14800, stock: 8, core_charge_cents: 2200, warranty_months: 36 },
  { sku: "TIRE-225", name: "All-Season Tire 225/65R17", brand: "Michelin", category: "Tires", price_cents: 18900, cost_cents: 13000, stock: 16, warranty_months: 60 },
  { sku: "CAB-AF", name: "Cabin Air Filter", brand: "K&N", category: "HVAC", price_cents: 2499, cost_cents: 1400, stock: 42, oem_number: "33-2300" },
  { sku: "WB-22", name: 'Wiper Blade 22"', brand: "Bosch", category: "Exterior", price_cents: 1849, cost_cents: 950, stock: 50 },
  { sku: "ALT-130", name: "Alternator 130A Reman", brand: "Denso", category: "Electrical", price_cents: 28900, cost_cents: 19000, stock: 5, condition: "Remanufactured", core_charge_cents: 3500, warranty_months: 18 },
  { sku: "SHK-FR", name: "Front Strut Assembly", brand: "Monroe", category: "Suspension", price_cents: 15600, cost_cents: 10200, stock: 10, warranty_months: 12 },
  { sku: "COOL-50", name: "Universal Coolant 1gal", brand: "Prestone", category: "Cooling", price_cents: 1899, cost_cents: 1000, stock: 45 },
];

const YEARS = Array.from({ length: 35 }, (_, i) => String(2024 - i));
const MAKES = ["Acura","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge","Ford","GMC","Honda","Hyundai","Infiniti","Jeep","Kia","Lexus","Lincoln","Mazda","Mercedes-Benz","Mitsubishi","Nissan","Ram","Subaru","Tesla","Toyota","Volkswagen","Volvo"];

const blank: Omit<Part, "id" | "store_id" | "active" | "image_url"> & { price: string; cost: string; core: string } = {
  sku: "", name: "", brand: "", category: "Brakes", price_cents: 0, stock: 0,
  price: "0.00", cost: "0.00", core: "0.00",
  oem_number: "", interchange_number: "", condition: "New",
  warranty_months: 12, core_charge_cents: 0, fitment_notes: "", location_in_store: "", cost_cents: 0,
};

function stockBadge(stock: number) {
  if (stock === 0) return <Badge variant="destructive" className="text-[10px] px-1.5">Out of stock</Badge>;
  if (stock <= 5) return <Badge className="text-[10px] px-1.5 bg-amber-500 hover:bg-amber-500 text-white">{stock} low stock</Badge>;
  if (stock <= 10) return <Badge variant="outline" className="text-[10px] px-1.5 text-amber-600 border-amber-300">{stock} in stock</Badge>;
  return <Badge variant="secondary" className="text-[10px] px-1.5">{stock} in stock</Badge>;
}

function conditionBadge(condition?: string | null) {
  if (!condition || condition === "New") return null;
  const colors: Record<string, string> = {
    OEM: "bg-blue-100 text-blue-700 border-blue-200",
    Remanufactured: "bg-purple-100 text-purple-700 border-purple-200",
    Aftermarket: "bg-green-100 text-green-700 border-green-200",
    Used: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${colors[condition] ?? "bg-muted"}`}>{condition}</span>;
}

export default function AutoRepairPartShopSection({ storeId }: Props) {
  const qc = useQueryClient();

  // Catalog state
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<ViewMode>("grid");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Vehicle fitment filter
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleExpanded, setVehicleExpanded] = useState(false);

  // Dialog
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...blank });

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

  const vehicleActive = !!(vehicleYear || vehicleMake || vehicleModel);
  const lowStock = parts.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = parts.filter(p => p.stock === 0).length;

  const filtered = useMemo(() => {
    let list = parts.filter(p =>
      (cat === "All" || p.category === cat) &&
      (!q || p.name.toLowerCase().includes(q.toLowerCase())
        || p.sku.toLowerCase().includes(q.toLowerCase())
        || (p.brand ?? "").toLowerCase().includes(q.toLowerCase())
        || (p.oem_number ?? "").toLowerCase().includes(q.toLowerCase())
        || (p.interchange_number ?? "").toLowerCase().includes(q.toLowerCase())) &&
      (!lowStockOnly || p.stock <= 5) &&
      (!vehicleActive || (p.fitment_notes?.toLowerCase().includes(vehicleMake.toLowerCase()) ?? !vehicleMake))
    );
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sort === "name") cmp = a.name.localeCompare(b.name);
      else if (sort === "price") cmp = a.price_cents - b.price_cents;
      else if (sort === "stock") cmp = a.stock - b.stock;
      else if (sort === "brand") cmp = (a.brand ?? "").localeCompare(b.brand ?? "");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [parts, q, cat, sort, sortDir, lowStockOnly, vehicleActive, vehicleMake]);

  const toggleSort = (key: SortKey) => {
    if (sort === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSort(key); setSortDir("asc"); }
  };

  const seedCatalog = useMutation({
    mutationFn: async () => {
      const rows = SEED.map(s => ({ ...s, store_id: storeId, active: true }));
      const { error } = await supabase.from("ar_parts").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("12 starter parts added"); qc.invalidateQueries({ queryKey: ["ar-parts", storeId] }); },
    onError: (e: any) => toast.error(e.message ?? "Could not seed catalog"),
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (!form.sku.trim() || !form.name.trim()) throw new Error("SKU and name are required");
      const payload = {
        store_id: storeId,
        sku: form.sku.trim(),
        name: form.name.trim(),
        brand: form.brand?.trim() || null,
        category: form.category,
        price_cents: Math.round((Number(form.price) || 0) * 100),
        cost_cents: Math.round((Number(form.cost) || 0) * 100),
        core_charge_cents: Math.round((Number(form.core) || 0) * 100),
        stock: form.stock,
        condition: form.condition || "New",
        oem_number: form.oem_number?.trim() || null,
        interchange_number: form.interchange_number?.trim() || null,
        warranty_months: form.warranty_months || null,
        fitment_notes: form.fitment_notes?.trim() || null,
        location_in_store: form.location_in_store?.trim() || null,
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
      setOpen(false); setEditId(null); setForm({ ...blank });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_parts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Part removed"); qc.invalidateQueries({ queryKey: ["ar-parts", storeId] }); },
  });

  const startEdit = (p: Part) => {
    setEditId(p.id);
    setForm({
      sku: p.sku, name: p.name, brand: p.brand ?? "", category: p.category ?? "Other",
      price_cents: p.price_cents, stock: p.stock,
      price: (p.price_cents / 100).toFixed(2),
      cost: ((p.cost_cents ?? 0) / 100).toFixed(2),
      core: ((p.core_charge_cents ?? 0) / 100).toFixed(2),
      oem_number: p.oem_number ?? "", interchange_number: p.interchange_number ?? "",
      condition: p.condition ?? "New", warranty_months: p.warranty_months ?? 12,
      core_charge_cents: p.core_charge_cents ?? 0, cost_cents: p.cost_cents ?? 0,
      fitment_notes: p.fitment_notes ?? "", location_in_store: p.location_in_store ?? "",
    });
    setOpen(true);
  };

  const startNew = () => { setEditId(null); setForm({ ...blank }); setOpen(true); };

  const exportCsv = useCallback(() => {
    const header = "SKU,Name,Brand,Category,Condition,Price,Cost,Core Charge,Stock,OEM#,Interchange#,Warranty(mo),Location,Fitment Notes";
    const rows = parts.map(p =>
      [p.sku, p.name, p.brand ?? "", p.category ?? "", p.condition ?? "New",
       (p.price_cents / 100).toFixed(2), ((p.cost_cents ?? 0) / 100).toFixed(2),
       ((p.core_charge_cents ?? 0) / 100).toFixed(2), p.stock,
       p.oem_number ?? "", p.interchange_number ?? "", p.warranty_months ?? "",
       p.location_in_store ?? "", p.fitment_notes ?? ""]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `parts-catalog-${storeId.slice(0, 8)}.csv`; a.click();
  }, [parts, storeId]);

  return (
    <div className="space-y-4">
      {/* Stock alert banner */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
            {outOfStock > 0 && <span><strong>{outOfStock}</strong> part{outOfStock > 1 ? "s" : ""} out of stock · </span>}
            {lowStock > 0 && <span><strong>{lowStock}</strong> part{lowStock > 1 ? "s" : ""} running low</span>}
          </p>
          <button onClick={() => setLowStockOnly(s => !s)} className="text-xs font-semibold text-amber-700 dark:text-amber-300 underline-offset-2 hover:underline">
            {lowStockOnly ? "Show all" : "View low stock"}
          </button>
        </div>
      )}

      {/* Vehicle fitment selector */}
      <Card>
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-left"
          onClick={() => setVehicleExpanded(s => !s)}
        >
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Shop by Vehicle</span>
            {vehicleActive && (
              <Badge variant="secondary" className="text-[10px]">
                {[vehicleYear, vehicleMake, vehicleModel].filter(Boolean).join(" ")}
              </Badge>
            )}
          </div>
          {vehicleExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {vehicleExpanded && (
          <CardContent className="pt-0 pb-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[11px] mb-1 block">Year</Label>
                <select value={vehicleYear} onChange={e => setVehicleYear(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">Any year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Make</Label>
                <select value={vehicleMake} onChange={e => setVehicleMake(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">Any make</option>
                  {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Model</Label>
                <Input placeholder="e.g. Camry" className="h-9" value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)} />
              </div>
            </div>
            {vehicleActive && (
              <button onClick={() => { setVehicleYear(""); setVehicleMake(""); setVehicleModel(""); }}
                className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" /> Clear vehicle
              </button>
            )}
          </CardContent>
        )}
      </Card>

      {/* Search + toolbar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Parts Catalog
            <Badge variant="secondary" className="ml-1">{parts.length}</Badge>
            {lowStockOnly && <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-[10px]">Low stock filter</Badge>}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs hidden sm:flex" onClick={exportCsv} disabled={parts.length === 0}>
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={startNew}>
              <Plus className="w-3.5 h-3.5" /> Add Part
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, brand, or OEM/interchange number..."
              className="pl-9"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATS.map(c => (
              <Button key={c} size="sm" variant={cat === c ? "default" : "outline"}
                onClick={() => setCat(c)} className="h-7 px-3 text-xs shrink-0">{c}</Button>
            ))}
          </div>

          {/* Sort + view */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Sort:</span>
              {(["name", "price", "stock", "brand"] as SortKey[]).map(k => (
                <button key={k} onClick={() => toggleSort(k)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors shrink-0 ${sort === k ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                  {sort === k && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </button>
              ))}
            </div>
            <div className="flex border rounded-md overflow-hidden shrink-0">
              <button onClick={() => setView("grid")}
                className={`p-1.5 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setView("list")}
                className={`p-1.5 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[0,1,2,3,4,5].map(i => <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : parts.length === 0 ? (
        <Card><CardContent className="py-12 text-center space-y-3">
          <Package className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Your parts catalog is empty</p>
          <p className="text-sm text-muted-foreground">Add parts manually or seed starter inventory to get going.</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add a part</Button>
            <Button size="sm" variant="outline" onClick={() => seedCatalog.mutate()} disabled={seedCatalog.isPending} className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {seedCatalog.isPending ? "Adding..." : "Seed 12 starter parts"}
            </Button>
          </div>
        </CardContent></Card>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No parts match your filters.</div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => <PartCard key={p.id} part={p} onEdit={startEdit} onRemove={(id) => { if (confirm(`Remove ${p.name}?`)) remove.mutate(id); }} />)}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-border/50">
            {/* List header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Part</span><span>Brand</span><span>Price</span><span>Stock</span><span></span>
            </div>
            {filtered.map(p => (
              <div key={p.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-4 py-2.5 items-center hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium leading-tight">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.sku}{p.oem_number ? ` · OEM: ${p.oem_number}` : ""}</p>
                  <div className="flex gap-1 mt-0.5">{conditionBadge(p.condition)}</div>
                </div>
                <span className="text-sm">{p.brand ?? "—"}</span>
                <div>
                  <span className="text-sm font-bold">${(p.price_cents / 100).toFixed(2)}</span>
                  {p.core_charge_cents ? <p className="text-[10px] text-muted-foreground">+${(p.core_charge_cents / 100).toFixed(2)} core</p> : null}
                </div>
                {stockBadge(p.stock)}
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm(`Remove ${p.name}?`)) remove.mutate(p.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Suppliers */}
      <SuppliersNetworkCard query={q} storeId={storeId} />

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Part" : "Add Part"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {/* Row 1: SKU + Brand */}
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">SKU *</Label><Input className="mt-1" placeholder="BP-2231" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
              <div><Label className="text-xs">Brand</Label><Input className="mt-1" placeholder="Akebono" value={form.brand ?? ""} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
            </div>
            {/* Row 2: Name */}
            <div><Label className="text-xs">Part Name *</Label><Input className="mt-1" placeholder="Ceramic Brake Pads (Front)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            {/* Row 3: Category + Condition */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Category</Label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  {CATS.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Condition</Label>
                <select value={form.condition ?? "New"} onChange={e => setForm({ ...form, condition: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {/* Row 4: OEM + Interchange */}
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">OEM Part #</Label><Input className="mt-1" placeholder="D1275" value={form.oem_number ?? ""} onChange={e => setForm({ ...form, oem_number: e.target.value })} /></div>
              <div><Label className="text-xs">Interchange #</Label><Input className="mt-1" placeholder="Cross-ref number" value={form.interchange_number ?? ""} onChange={e => setForm({ ...form, interchange_number: e.target.value })} /></div>
            </div>
            {/* Row 5: Price + Cost + Core */}
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">Retail Price ($)</Label><Input className="mt-1" inputMode="decimal" placeholder="89.99" value={form.price} onChange={e => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, "") })} /></div>
              <div><Label className="text-xs">Your Cost ($)</Label><Input className="mt-1" inputMode="decimal" placeholder="55.00" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value.replace(/[^0-9.]/g, "") })} /></div>
              <div><Label className="text-xs">Core Charge ($)</Label><Input className="mt-1" inputMode="decimal" placeholder="0.00" value={form.core} onChange={e => setForm({ ...form, core: e.target.value.replace(/[^0-9.]/g, "") })} /></div>
            </div>
            {/* Row 6: Stock + Warranty + Location */}
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">Stock Qty</Label><Input className="mt-1" inputMode="numeric" placeholder="0" value={String(form.stock)} onChange={e => setForm({ ...form, stock: parseInt(e.target.value.replace(/\D/g, "") || "0", 10) })} /></div>
              <div><Label className="text-xs">Warranty (months)</Label><Input className="mt-1" inputMode="numeric" placeholder="12" value={String(form.warranty_months ?? "")} onChange={e => setForm({ ...form, warranty_months: parseInt(e.target.value.replace(/\D/g, "") || "0", 10) })} /></div>
              <div><Label className="text-xs">Shelf / Location</Label><Input className="mt-1" placeholder="Aisle B-3" value={form.location_in_store ?? ""} onChange={e => setForm({ ...form, location_in_store: e.target.value })} /></div>
            </div>
            {/* Fitment notes */}
            <div>
              <Label className="text-xs">Fitment Notes</Label>
              <textarea
                rows={2}
                placeholder="Fits 2015-2023 Toyota Camry, Honda Accord..."
                value={form.fitment_notes ?? ""}
                onChange={e => setForm({ ...form, fitment_notes: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
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

/* ─── Part Card ─────────────────────────────────────────────── */
function PartCard({ part: p, onEdit, onRemove }: { part: Part; onEdit: (p: Part) => void; onRemove: (id: string) => void }) {
  const margin = p.cost_cents && p.price_cents > p.cost_cents
    ? Math.round(((p.price_cents - p.cost_cents) / p.price_cents) * 100)
    : null;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center relative">
          {p.image_url
            ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
            : <Package className="w-10 h-10 text-muted-foreground/30" />}
          <div className="absolute top-1.5 left-1.5 flex gap-1 flex-wrap">
            {conditionBadge(p.condition)}
          </div>
          <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-7 w-7 shadow-sm" onClick={() => onEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="icon" variant="secondary" className="h-7 w-7 shadow-sm text-destructive" onClick={() => onRemove(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 space-y-1.5">
          <div>
            <p className="text-[11px] text-muted-foreground truncate">{p.brand || "—"} · <span className="font-mono">{p.sku}</span></p>
            <p className="text-sm font-semibold leading-tight line-clamp-2">{p.name}</p>
          </div>

          {p.oem_number && (
            <p className="text-[10px] text-muted-foreground">OEM: <span className="font-mono">{p.oem_number}</span></p>
          )}

          {p.fitment_notes && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{p.fitment_notes}</p>
          )}

          <div className="flex items-end justify-between pt-0.5">
            <div>
              <span className="text-base font-bold">${(p.price_cents / 100).toFixed(2)}</span>
              {p.core_charge_cents ? (
                <p className="text-[10px] text-muted-foreground">+${(p.core_charge_cents / 100).toFixed(2)} core</p>
              ) : null}
              {margin !== null && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{margin}% margin</p>
              )}
            </div>
            <div className="text-right">
              {stockBadge(p.stock)}
              {p.warranty_months ? (
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.warranty_months}mo warranty</p>
              ) : null}
            </div>
          </div>

          {p.location_in_store && (
            <p className="text-[10px] text-muted-foreground/70">📍 {p.location_in_store}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Suppliers Network ──────────────────────────────────────── */
const SUPPLIER_CATEGORIES = ["All", "Retail Chain", "OE / Dealer", "Wholesale Distributor", "Online Marketplace", "Specialty"] as const;

function SuppliersNetworkCard({ query, storeId }: { query: string; storeId: string }) {
  const [supCat, setSupCat] = useState<(typeof SUPPLIER_CATEGORIES)[number]>("All");
  const [supQ, setSupQ] = useState("");
  const [activeSupplier, setActiveSupplier] = useState<PartsSupplier | null>(null);
  const [savedSupplierIds, setSavedSupplierIds] = useState<Set<string>>(() => new Set(
    PARTS_SUPPLIERS.filter(s => {
      try { return !!localStorage.getItem(`zivo.supplierCreds.${storeId}.${s.id}`); } catch { return false; }
    }).map(s => s.id)
  ));

  const refreshSaved = () => setSavedSupplierIds(new Set(
    PARTS_SUPPLIERS.filter(s => {
      try { return !!localStorage.getItem(`zivo.supplierCreds.${storeId}.${s.id}`); } catch { return false; }
    }).map(s => s.id)
  ));

  const list = useMemo(() => {
    const q = supQ.trim().toLowerCase();
    return PARTS_SUPPLIERS.filter(s =>
      (supCat === "All" || s.category === supCat) &&
      (!q || s.name.toLowerCase().includes(q) || (s.shortName?.toLowerCase().includes(q) ?? false))
    );
  }, [supCat, supQ]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Store className="w-4 h-4" /> Parts Suppliers
          <Badge variant="outline" className="ml-1 text-[10px]">{PARTS_SUPPLIERS.length}</Badge>
          {query && <Badge variant="secondary" className="ml-1 text-[10px]">Search: {query}</Badge>}
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">Click a supplier to open their ordering portal. Credentials are saved on this device only.</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input className="pl-8 h-9" placeholder="Search suppliers (AutoZone, NAPA, RockAuto...)" value={supQ} onChange={e => setSupQ(e.target.value)} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUPPLIER_CATEGORIES.map(c => (
            <Button key={c} size="sm" variant={supCat === c ? "default" : "outline"}
              onClick={() => setSupCat(c)} className="h-7 px-3 text-xs shrink-0">{c}</Button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1.5 max-h-[320px] overflow-auto">
          {list.map(s => (
            <button key={s.id} onClick={() => setActiveSupplier(s)}
              className="flex items-center gap-2.5 text-left text-[12px] border border-border rounded-lg px-2.5 py-2 hover:border-primary hover:bg-primary/5 transition-colors group">
              <PartsSupplierLogo supplier={s} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{s.shortName ?? s.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {savedSupplierIds.has(s.id) ? "✓ Account saved" : (s.description ?? s.category)}
                </p>
              </div>
              {savedSupplierIds.has(s.id)
                ? <KeyRound className="w-3 h-3 text-primary shrink-0" />
                : <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          ))}
          {list.length === 0 && <p className="text-xs text-muted-foreground col-span-full text-center py-4">No suppliers match.</p>}
        </div>
      </CardContent>

      <SupplierBrowserModal
        storeId={storeId}
        supplier={activeSupplier}
        query={query}
        open={!!activeSupplier}
        onOpenChange={o => { if (!o) { refreshSaved(); setActiveSupplier(null); } }}
      />
    </Card>
  );
}
