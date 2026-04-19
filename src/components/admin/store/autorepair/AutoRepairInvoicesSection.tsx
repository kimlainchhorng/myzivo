/**
 * Auto Repair — Invoices Section
 * Two views: Estimates and Invoices, with inline create flow.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Plus, Send, Printer, DollarSign, Trash2, Receipt, ClipboardList, ArrowLeft, ScanSearch, Loader2 } from "lucide-react";
import { toast } from "sonner";

type LineItem = { id: string; description: string; qty: number; price: number };
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
  vehicle: string;
  items: LineItem[];
  status: "draft" | "sent" | "paid" | "approved";
  createdAt: string;
};

const seed: Doc[] = [
  { id: "1", type: "estimate", number: "EST-1042", customer: "Maria Lopez", firstName: "Maria", lastName: "Lopez", phone: "(225) 555-0142", email: "maria.lopez@example.com", address: "1420 Highland Rd, Baton Rouge, LA", vin: "4T1B11HK5JU123456", year: "2018", make: "Toyota", model: "Camry", trim: "LE", engine: "2.5L L4 DOHC", transmission: "8-Speed Automatic", vehicle: "2018 Toyota Camry", items: [{ id: "a", description: "Brake Pad Replacement (Front)", qty: 1, price: 180 }, { id: "b", description: "Rotor Resurface", qty: 2, price: 45 }], status: "sent", createdAt: new Date().toISOString() },
  { id: "2", type: "invoice", number: "INV-2031", customer: "James Carter", firstName: "James", lastName: "Carter", phone: "(225) 555-0188", email: "james.carter@example.com", address: "88 Government St, Baton Rouge, LA", vin: "1FTEW1EP5LFA12345", year: "2020", make: "Ford", model: "F-150", trim: "XLT", engine: "3.5L V6 EcoBoost", transmission: "10-Speed Automatic", vehicle: "2020 Ford F-150", items: [{ id: "c", description: "Full Synthetic Oil Change", qty: 1, price: 89.99 }], status: "paid", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", type: "invoice", number: "INV-2032", customer: "Linda Park", firstName: "Linda", lastName: "Park", phone: "(225) 555-0210", email: "linda.park@example.com", address: "305 Perkins Rd, Baton Rouge, LA", vin: "2HGFC2F59KH512345", year: "2019", make: "Honda", model: "Civic", trim: "LX", engine: "2.0L L4", transmission: "CVT", vehicle: "2019 Honda Civic", items: [{ id: "d", description: "AC Recharge", qty: 1, price: 149 }, { id: "e", description: "Cabin Air Filter", qty: 1, price: 35 }], status: "sent", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

interface Props { storeId: string }

export default function AutoRepairInvoicesSection({ storeId: _storeId }: Props) {
  const [docs, setDocs] = useState<Doc[]>(seed);
  const [tab, setTab] = useState<"estimate" | "invoice">("estimate");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Doc>({
    id: "", type: "estimate", number: "", customer: "",
    firstName: "", lastName: "", phone: "", email: "", address: "",
    vehicle: "",
    items: [{ id: crypto.randomUUID(), description: "", qty: 1, price: 0 }],
    status: "draft", createdAt: new Date().toISOString(),
  });

  const filtered = useMemo(() => docs.filter(d => d.type === tab), [docs, tab]);

  const total = (items: LineItem[]) => items.reduce((s, i) => s + i.qty * i.price, 0);

  const startNew = (type: "estimate" | "invoice") => {
    const prefix = type === "estimate" ? "EST-" : "INV-";
    const num = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    setDraft({
      id: crypto.randomUUID(), type, number: num, customer: "",
      firstName: "", lastName: "", phone: "", email: "", address: "",
      vehicle: "",
      items: [{ id: crypto.randomUUID(), description: "", qty: 1, price: 0 }],
      status: "draft", createdAt: new Date().toISOString(),
    });
    setCreating(true);
  };

  const save = () => {
    if (!draft.firstName || !draft.lastName || !draft.vehicle) { toast.error("First name, last name, and vehicle are required"); return; }
    const customer = `${draft.firstName} ${draft.lastName}`.trim();
    setDocs(d => [{ ...draft, customer }, ...d]);
    setCreating(false);
    toast.success(`${draft.type === "estimate" ? "Estimate" : "Invoice"} ${draft.number} created`);
  };

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    setDraft(d => ({ ...d, items: d.items.map(i => i.id === id ? { ...i, ...patch } : i) }));

  const addItem = () => setDraft(d => ({ ...d, items: [...d.items, { id: crypto.randomUUID(), description: "", qty: 1, price: 0 }] }));
  const removeItem = (id: string) => setDraft(d => ({ ...d, items: d.items.filter(i => i.id !== id) }));

  if (creating) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCreating(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-base flex items-center gap-2">
              {draft.type === "estimate" ? <ClipboardList className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
              {draft.type === "estimate" ? "Create Estimate" : "Create Invoice"} · {draft.number}
            </CardTitle>
          </div>
          <Button onClick={save} className="gap-1.5">
            {draft.type === "estimate" ? "Create Estimate" : "Create Invoice"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer details</div>
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
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Vehicle</label>
                <Input placeholder="Year / Make / Model" value={draft.vehicle} onChange={e => setDraft({ ...draft, vehicle: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Line items</span>
              <Button size="sm" variant="outline" onClick={addItem} className="h-8 gap-1"><Plus className="w-3.5 h-3.5" /> Add item</Button>
            </div>
            <div className="grid grid-cols-[1fr_80px_110px_36px] gap-2 px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              <span>Description</span>
              <span>Qty</span>
              <span>Price</span>
              <span></span>
            </div>
            {draft.items.map(it => (
              <div key={it.id} className="grid grid-cols-[1fr_80px_110px_36px] gap-2 items-center">
                <Input placeholder="Service or part" value={it.description} onChange={e => updateItem(it.id, { description: e.target.value })} />
                <Input type="number" min={1} value={it.qty} onChange={e => updateItem(it.id, { qty: Number(e.target.value) || 1 })} />
                <Input type="number" min={0} step={0.01} value={it.price} onChange={e => updateItem(it.id, { price: Number(e.target.value) || 0 })} />
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => removeItem(it.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            ))}
          </div>

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
    );
  }

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
                    <Button size="icon" variant="ghost" className="h-7 w-7"><Send className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7"><Printer className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
