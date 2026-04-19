/**
 * Auto Repair — Invoices Section
 * Two views: Estimates and Invoices, with inline create flow.
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Send, Printer, DollarSign, Trash2, Receipt, ClipboardList, ArrowLeft, ScanSearch, Loader2, Check, CloudUpload, Wrench, Package, Stethoscope, Eye } from "lucide-react";
import { toast } from "sonner";
import AutoRepairDocPreviewDialog from "./AutoRepairDocPreviewDialog";

type LineCategory = "labor" | "part" | "diagnosis";
type LineItem = {
  id: string;
  category: LineCategory;
  description: string;
  qty: number;          // parts: quantity. labor/diagnosis: 1
  price: number;        // parts: unit price. labor: hourly rate. diagnosis: flat fee
  hours?: number;       // labor only
  discount?: number;    // discount value (% or $)
  discountType?: "pct" | "amt"; // % off or flat $ off
};
type Doc = {
  id: string;
  type: "estimate" | "invoice";
  number: string;
  customer: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  transmission: string;
  driveType: string;
  bodyClass: string;
  doors: string;
  fuel: string;
  plant: string;
  vehicle: string;
  items: LineItem[];
  status: "draft" | "sent" | "paid" | "approved";
  createdAt: string;
};

const emptyDraft = (): Doc => ({
  id: "", type: "estimate", number: "", customer: "",
  firstName: "", lastName: "", phone: "", email: "", address: "",
  vin: "", year: "", make: "", model: "", trim: "", engine: "", transmission: "",
  driveType: "", bodyClass: "", doors: "", fuel: "", plant: "",
  vehicle: "",
  items: [{ id: crypto.randomUUID(), category: "labor", description: "", qty: 1, price: 0, hours: 1, discount: 0 }],
  status: "draft", createdAt: new Date().toISOString(),
});

// Compute the dollar amount for a single line item
const lineAmount = (i: LineItem): number => {
  const gross =
    i.category === "labor" ? (i.hours ?? 0) * (i.price ?? 0) :
    i.category === "part" ? (i.qty ?? 0) * (i.price ?? 0) :
    (i.price ?? 0); // diagnosis = flat fee
  const discVal = Math.max(0, i.discount ?? 0);
  if ((i.discountType ?? "pct") === "amt") {
    return Math.max(0, gross - discVal);
  }
  const pct = Math.min(100, discVal);
  return gross * (1 - pct / 100);
};

const seed: Doc[] = [
  { id: "1", type: "estimate", number: "EST-1042", customer: "Maria Lopez", firstName: "Maria", lastName: "Lopez", phone: "(225) 555-0142", email: "maria.lopez@example.com", address: "1420 Highland Rd, Baton Rouge, LA", vin: "4T1B11HK5JU123456", year: "2018", make: "Toyota", model: "Camry", trim: "LE", engine: "2.5L L4 DOHC", transmission: "8-Speed Automatic", driveType: "FWD", bodyClass: "Sedan/Saloon", doors: "4", fuel: "Gasoline", plant: "Georgetown, KY, USA", vehicle: "2018 Toyota Camry", items: [{ id: "a", category: "labor", description: "Brake Pad Replacement (Front)", qty: 1, price: 120, hours: 1.5, discount: 0 }, { id: "b", category: "part", description: "Front Brake Pads (set)", qty: 1, price: 80, discount: 0 }], status: "sent", createdAt: new Date().toISOString() },
  { id: "2", type: "invoice", number: "INV-2031", customer: "James Carter", firstName: "James", lastName: "Carter", phone: "(225) 555-0188", email: "james.carter@example.com", address: "88 Government St, Baton Rouge, LA", vin: "1FTEW1EP5LFA12345", year: "2020", make: "Ford", model: "F-150", trim: "XLT", engine: "3.5L V6 EcoBoost", transmission: "10-Speed Automatic", driveType: "4WD", bodyClass: "Pickup", doors: "4", fuel: "Gasoline", plant: "Dearborn, MI, USA", vehicle: "2020 Ford F-150", items: [{ id: "c", category: "labor", description: "Full Synthetic Oil Change", qty: 1, price: 90, hours: 1, discount: 0 }], status: "paid", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", type: "invoice", number: "INV-2032", customer: "Linda Park", firstName: "Linda", lastName: "Park", phone: "(225) 555-0210", email: "linda.park@example.com", address: "305 Perkins Rd, Baton Rouge, LA", vin: "2HGFC2F59KH512345", year: "2019", make: "Honda", model: "Civic", trim: "LX", engine: "2.0L L4", transmission: "CVT", driveType: "FWD", bodyClass: "Sedan/Saloon", doors: "4", fuel: "Gasoline", plant: "Greensburg, IN, USA", vehicle: "2019 Honda Civic", items: [{ id: "d", category: "diagnosis", description: "AC System Diagnostic", qty: 1, price: 89, discount: 0 }, { id: "e", category: "part", description: "Cabin Air Filter", qty: 1, price: 35, discount: 0 }], status: "sent", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

interface Props { storeId: string }

export default function AutoRepairInvoicesSection({ storeId }: Props) {
  const [docs, setDocs] = useState<Doc[]>(seed);
  const [tab, setTab] = useState<"estimate" | "invoice">("estimate");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Doc>(emptyDraft());
  const [vinLoading, setVinLoading] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [storeInfo, setStoreInfo] = useState<{ name?: string; address?: string; phone?: string }>({});

  useEffect(() => {
    if (!storeId) return;
    (async () => {
      const { data } = await supabase
        .from("store_profiles")
        .select("name, address, phone")
        .eq("id", storeId)
        .maybeSingle();
      if (data) setStoreInfo({ name: data.name || undefined, address: data.address || undefined, phone: data.phone || undefined });
    })();
  }, [storeId]);
  const draftKey = useMemo(() => `autorepair:invoice-draft:${storeId}`, [storeId]);
  const saveTimer = useRef<number | null>(null);
  const skipNextSave = useRef(true);

  const filtered = useMemo(() => docs.filter(d => d.type === tab), [docs, tab]);

  const total = (items: LineItem[]) => items.reduce((s, i) => s + lineAmount(i), 0);
  const subtotalByCat = (items: LineItem[], cat: LineCategory) => items.filter(i => i.category === cat).reduce((s, i) => s + lineAmount(i), 0);

  // Autosave draft to localStorage (debounced) while creating
  useEffect(() => {
    if (!creating) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    setSaveState("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setLastSaved(new Date());
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, 600);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [draft, creating, draftKey]);

  const clearDraft = () => {
    try { localStorage.removeItem(draftKey); } catch {}
    setLastSaved(null);
    setSaveState("idle");
  };

  const startNew = (type: "estimate" | "invoice") => {
    // Try resume saved draft of same type
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw) as Doc;
        if (saved && saved.type === type) {
          skipNextSave.current = true;
          setDraft(saved);
          setLastSaved(new Date());
          setSaveState("saved");
          setCreating(true);
          toast.info("Resumed your saved draft");
          return;
        }
      }
    } catch {}
    const prefix = type === "estimate" ? "EST-" : "INV-";
    const num = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    skipNextSave.current = true;
    setDraft({ ...emptyDraft(), id: crypto.randomUUID(), type, number: num });
    setLastSaved(null);
    setSaveState("idle");
    setCreating(true);
  };

  const discardDraft = () => {
    clearDraft();
    setCreating(false);
    toast.success("Draft discarded");
  };

  const lookupVin = async (vin: string) => {
    const clean = vin.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
    if (clean.length !== 17) { toast.error("VIN must be 17 characters (no I, O, Q)"); return; }
    setVinLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vin-decode", {
        body: { vin: clean },
      });
      if (error) throw new Error(error.message || "Function call failed");
      if (!data?.ok) throw new Error(data?.error || "No vehicle data found");

      setDraft(d => ({
        ...d,
        vin: data.vin || clean,
        year: data.year || "",
        make: data.make || "",
        model: data.model || "",
        trim: data.trim || "",
        engine: data.engine || "",
        transmission: data.transmission || "",
        driveType: data.driveType || "",
        bodyClass: data.bodyClass || "",
        doors: data.doors || "",
        fuel: data.fuel || "",
        plant: data.plant || "",
        vehicle: data.vehicle || [data.year, data.make, data.model].filter(Boolean).join(" "),
      }));

      toast.success(data.partial ? "Vehicle details auto-filled (partial)" : "Vehicle details auto-filled");
    } catch (e: any) {
      toast.error(`VIN lookup failed: ${e?.message || "network error"}`);
    } finally {
      setVinLoading(false);
    }
  };

  const saveDraftNow = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setLastSaved(new Date());
      setSaveState("saved");
      toast.success("Draft saved");
    } catch {
      toast.error("Could not save draft");
    }
  };

  const save = () => {
    if (!draft.firstName || !draft.lastName || !draft.vehicle) { toast.error("First name, last name, and vehicle are required"); return; }
    const customer = `${draft.firstName} ${draft.lastName}`.trim();
    setDocs(d => [{ ...draft, customer }, ...d]);
    clearDraft();
    setCreating(false);
    toast.success(`${draft.type === "estimate" ? "Estimate" : "Invoice"} ${draft.number} created`);
  };

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    setDraft(d => ({ ...d, items: d.items.map(i => i.id === id ? { ...i, ...patch } : i) }));

  const addItem = (category: LineCategory = "labor") => setDraft(d => ({
    ...d,
    items: [
      ...d.items,
      category === "labor"
        ? { id: crypto.randomUUID(), category, description: "", qty: 1, price: 0, hours: 1, discount: 0 }
        : category === "part"
        ? { id: crypto.randomUUID(), category, description: "", qty: 1, price: 0, discount: 0 }
        : { id: crypto.randomUUID(), category, description: "", qty: 1, price: 0, discount: 0 },
    ],
  }));
  const removeItem = (id: string) => setDraft(d => ({ ...d, items: d.items.filter(i => i.id !== id) }));

  if (creating) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCreating(false)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-base flex items-center gap-2">
                {draft.type === "estimate" ? <ClipboardList className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                {draft.type === "estimate" ? "Create Estimate" : "Create Invoice"} · {draft.number}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 mr-1">
                {saveState === "saving" && (<><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>)}
                {saveState === "saved" && (<><Check className="w-3 h-3 text-primary" /> Saved{lastSaved ? ` · ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</>)}
                {saveState === "idle" && (<><CloudUpload className="w-3 h-3" /> Autosave on</>)}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc({ ...draft, customer: `${draft.firstName} ${draft.lastName}`.trim() })} className="gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</Button>
              <Button variant="outline" size="sm" onClick={saveDraftNow}>Save draft</Button>
              <Button variant="ghost" size="sm" onClick={discardDraft} className="text-destructive hover:text-destructive">Discard</Button>
              <Button onClick={save} className="gap-1.5">
                {draft.type === "estimate" ? "Create Estimate" : "Create Invoice"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Customer details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">First name</label>
                  <Input placeholder="First name" value={draft.firstName} onChange={e => setDraft({ ...draft, firstName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Last name</label>
                  <Input placeholder="Last name" value={draft.lastName} onChange={e => setDraft({ ...draft, lastName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Phone</label>
                  <Input type="tel" placeholder="(555) 123-4567" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <Input type="email" placeholder="customer@example.com" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Address</label>
                  <Input placeholder="Street, City, State" value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vehicle details</CardTitle>
              {draft.vin && draft.vin.length === 17 && (
                <span className="text-[10px] text-muted-foreground font-mono">VIN-decoded</span>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">VIN (auto-fills vehicle details)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="17-character VIN"
                    maxLength={17}
                    value={draft.vin}
                    onChange={e => setDraft({ ...draft, vin: e.target.value.toUpperCase() })}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => lookupVin(draft.vin)}
                    disabled={vinLoading || draft.vin.length !== 17}
                    className="gap-1.5 shrink-0"
                  >
                    {vinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanSearch className="w-4 h-4" />}
                    Decode
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Year</label>
                  <Input placeholder="2020" value={draft.year} onChange={e => setDraft({ ...draft, year: e.target.value, vehicle: [e.target.value, draft.make, draft.model].filter(Boolean).join(" ") })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Make</label>
                  <Input placeholder="Toyota" value={draft.make} onChange={e => setDraft({ ...draft, make: e.target.value, vehicle: [draft.year, e.target.value, draft.model].filter(Boolean).join(" ") })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Model</label>
                  <Input placeholder="Camry" value={draft.model} onChange={e => setDraft({ ...draft, model: e.target.value, vehicle: [draft.year, draft.make, e.target.value].filter(Boolean).join(" ") })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Trim</label>
                  <Input placeholder="LE" value={draft.trim} onChange={e => setDraft({ ...draft, trim: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Engine</label>
                  <Input placeholder="2.5L L4" value={draft.engine} onChange={e => setDraft({ ...draft, engine: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Drivetrain</label>
                  <select
                    value={draft.driveType}
                    onChange={e => setDraft({ ...draft, driveType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select…</option>
                    <option value="FWD">FWD · Front-Wheel Drive</option>
                    <option value="RWD">RWD · Rear-Wheel Drive</option>
                    <option value="AWD">AWD · All-Wheel Drive</option>
                    <option value="4WD">4WD · 4x4 / Four-Wheel Drive</option>
                    <option value="2WD">2WD · Two-Wheel Drive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-5 pt-6">
            <Tabs defaultValue="labor" className="w-full">
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="labor" className="gap-1.5"><Wrench className="w-3.5 h-3.5" /> Labor</TabsTrigger>
                  <TabsTrigger value="part" className="gap-1.5"><Package className="w-3.5 h-3.5" /> Parts</TabsTrigger>
                  <TabsTrigger value="diagnosis" className="gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> Diagnosis</TabsTrigger>
                </TabsList>
              </div>

              {(["labor", "part", "diagnosis"] as LineCategory[]).map(cat => {
                const rows = draft.items.filter(i => i.category === cat);
                const catSubtotal = subtotalByCat(draft.items, cat);
                return (
                  <TabsContent key={cat} value={cat} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize">
                        {cat === "labor" ? "Labor services" : cat === "part" ? "Parts & materials" : "Diagnosis & inspection"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => addItem(cat)} className="h-8 gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add {cat === "part" ? "part" : cat === "labor" ? "labor" : "diagnosis"}
                      </Button>
                    </div>

                    {rows.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                        No {cat === "part" ? "parts" : cat === "labor" ? "labor lines" : "diagnosis fees"} yet.
                      </div>
                    )}

                    {/* Headers */}
                    {rows.length > 0 && (
                      <div className={`grid gap-2 px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide ${
                        cat === "labor"
                          ? "grid-cols-[1fr_70px_90px_120px_90px_36px]"
                          : cat === "part"
                          ? "grid-cols-[1fr_70px_90px_120px_90px_36px]"
                          : "grid-cols-[1fr_110px_120px_90px_36px]"
                      }`}>
                        <span>Service detail</span>
                        {cat === "labor" && <><span>Hours</span><span>Hour rate</span><span>Discount</span><span className="text-right">Total</span></>}
                        {cat === "part" && <><span>Qty</span><span>Unit price</span><span>Discount</span><span className="text-right">Total</span></>}
                        {cat === "diagnosis" && <><span>Flat fee</span><span>Discount</span><span className="text-right">Total</span></>}
                        <span></span>
                      </div>
                    )}

                    {rows.map(it => {
                      const dType = it.discountType ?? "pct";
                      const discountField = (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={dType === "pct" ? 100 : undefined}
                            placeholder={dType === "pct" ? "0" : "0.00"}
                            value={it.discount ? it.discount : ""}
                            onChange={e => updateItem(it.id, { discount: e.target.value === "" ? 0 : Number(e.target.value) })}
                            className="flex-1 min-w-0"
                          />
                          <div className="flex rounded-md border border-input overflow-hidden shrink-0">
                            <button
                              type="button"
                              onClick={() => updateItem(it.id, { discountType: "pct" })}
                              className={`px-1.5 text-[11px] font-semibold ${dType === "pct" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                              aria-label="Percent discount"
                            >%</button>
                            <button
                              type="button"
                              onClick={() => updateItem(it.id, { discountType: "amt" })}
                              className={`px-1.5 text-[11px] font-semibold border-l border-input ${dType === "amt" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                              aria-label="Flat amount discount"
                            >$</button>
                          </div>
                        </div>
                      );
                      return (
                      <div
                        key={it.id}
                        className={`grid gap-2 items-center ${
                          cat === "labor"
                            ? "grid-cols-[1fr_70px_90px_120px_90px_36px]"
                            : cat === "part"
                            ? "grid-cols-[1fr_70px_90px_120px_90px_36px]"
                            : "grid-cols-[1fr_110px_120px_90px_36px]"
                        }`}
                      >
                        <Input
                          placeholder={cat === "labor" ? "e.g. Front brake pad replacement" : cat === "part" ? "e.g. Front brake pads (set)" : "e.g. AC system diagnostic"}
                          value={it.description}
                          onChange={e => updateItem(it.id, { description: e.target.value })}
                        />

                        {cat === "labor" && (
                          <>
                            <Input type="number" inputMode="decimal" min={0} step={0.25} placeholder="0" value={it.hours ? it.hours : ""} onChange={e => updateItem(it.id, { hours: e.target.value === "" ? 0 : Number(e.target.value) })} />
                            <Input type="number" inputMode="decimal" min={0} step={0.01} placeholder="0.00" value={it.price ? it.price : ""} onChange={e => updateItem(it.id, { price: e.target.value === "" ? 0 : Number(e.target.value) })} />
                            {discountField}
                          </>
                        )}

                        {cat === "part" && (
                          <>
                            <Input type="number" inputMode="numeric" min={1} placeholder="1" value={it.qty ? it.qty : ""} onChange={e => updateItem(it.id, { qty: e.target.value === "" ? 1 : Number(e.target.value) })} />
                            <Input type="number" inputMode="decimal" min={0} step={0.01} placeholder="0.00" value={it.price ? it.price : ""} onChange={e => updateItem(it.id, { price: e.target.value === "" ? 0 : Number(e.target.value) })} />
                            {discountField}
                          </>
                        )}

                        {cat === "diagnosis" && (
                          <>
                            <Input type="number" inputMode="decimal" min={0} step={0.01} placeholder="0.00" value={it.price ? it.price : ""} onChange={e => updateItem(it.id, { price: e.target.value === "" ? 0 : Number(e.target.value) })} />
                            {discountField}
                          </>
                        )}

                        <span className="text-right text-sm font-semibold tabular-nums">${lineAmount(it).toFixed(2)}</span>
                        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => removeItem(it.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                      );
                    })}

                    {rows.length > 0 && (
                      <div className="flex items-center justify-end pt-2 text-sm">
                        <span className="text-muted-foreground mr-3 capitalize">{cat} subtotal</span>
                        <span className="font-semibold tabular-nums">${catSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
              <Textarea placeholder="Notes for the customer…" rows={3} />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold flex items-center"><DollarSign className="w-5 h-5" />{total(draft.items).toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button onClick={save}>{draft.type === "estimate" ? "Create Estimate" : "Create Invoice"}</Button>
            </div>
          </CardContent>
        </Card>
        <AutoRepairDocPreviewDialog open={!!previewDoc} onOpenChange={(v) => !v && setPreviewDoc(null)} doc={previewDoc} storeName={storeInfo.name} storeAddress={storeInfo.address} storePhone={storeInfo.phone} />
      </div>
    );
  }

  // Read persisted draft (if any) to surface a "Continue editing" banner
  let savedDraftPreview: Doc | null = null;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;
    if (raw) savedDraftPreview = JSON.parse(raw) as Doc;
  } catch { /* ignore */ }

  const continueDraft = () => {
    if (!savedDraftPreview) return;
    skipNextSave.current = true;
    setDraft(savedDraftPreview);
    setLastSaved(new Date());
    setSaveState("saved");
    setCreating(true);
  };

  const deleteSavedDraft = () => {
    clearDraft();
    toast.success("Saved draft removed");
    // force rerender
    setDocs(d => [...d]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Estimates & Invoices</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => startNew("estimate")} className="gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> New Estimate</Button>
          <Button size="sm" onClick={() => startNew("invoice")} className="gap-1.5"><Receipt className="w-3.5 h-3.5" /> New Invoice</Button>
        </div>
      </CardHeader>
      <CardContent>
        {savedDraftPreview && (
          <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {savedDraftPreview.type === "estimate" ? <ClipboardList className="w-4 h-4 text-primary" /> : <Receipt className="w-4 h-4 text-primary" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Unsaved draft · {savedDraftPreview.number}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{savedDraftPreview.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {[savedDraftPreview.firstName, savedDraftPreview.lastName].filter(Boolean).join(" ") || "No customer yet"}
                  {savedDraftPreview.vehicle ? ` · ${savedDraftPreview.vehicle}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={continueDraft}>Continue</Button>
              <Button size="sm" variant="ghost" onClick={deleteSavedDraft} className="text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full max-w-sm grid-cols-2 mb-4">
            <TabsTrigger value="estimate">Estimates</TabsTrigger>
            <TabsTrigger value="invoice">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No {tab}s yet</p>
              </div>
            )}
            {filtered.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/40 transition">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{d.number}</span>
                    <Badge variant={d.status === "paid" ? "default" : d.status === "sent" ? "secondary" : "outline"} className="text-[10px] capitalize">{d.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{d.customer} · {d.vehicle}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-bold text-sm">${total(d.items).toFixed(2)}</p>
                  <div className="flex gap-1 mt-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewDoc(d)} title="Preview"><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewDoc(d)} title="Send"><Send className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewDoc(d)} title="Print"><Printer className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
      <AutoRepairDocPreviewDialog open={!!previewDoc} onOpenChange={(v) => !v && setPreviewDoc(null)} doc={previewDoc} />
    </Card>
  );
}
