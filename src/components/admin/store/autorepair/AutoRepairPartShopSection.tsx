/**
 * Auto Repair — Part Shop
 * Browse common parts catalog with search, filter, add-to-job.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, ShoppingCart, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";

type Part = { id: string; sku: string; name: string; brand: string; category: string; price: number; stock: number };

const CATALOG: Part[] = [
  { id: "1", sku: "BP-2231", name: "Ceramic Brake Pads (Front)", brand: "Akebono", category: "Brakes", price: 89.99, stock: 24 },
  { id: "2", sku: "BR-1102", name: "Brake Rotor 320mm", brand: "Brembo", category: "Brakes", price: 145.00, stock: 12 },
  { id: "3", sku: "OF-001", name: "Oil Filter (Universal)", brand: "Mobil 1", category: "Engine", price: 12.49, stock: 80 },
  { id: "4", sku: "OL-5W30", name: "5W-30 Full Synthetic 5qt", brand: "Castrol", category: "Fluids", price: 32.99, stock: 60 },
  { id: "5", sku: "SP-4101", name: "Iridium Spark Plug (set of 4)", brand: "NGK", category: "Engine", price: 48.00, stock: 35 },
  { id: "6", sku: "BAT-H7", name: "AGM Battery H7", brand: "Bosch", category: "Electrical", price: 219.00, stock: 8 },
  { id: "7", sku: "TIRE-225", name: "All-Season Tire 225/65R17", brand: "Michelin", category: "Tires", price: 189.00, stock: 16 },
  { id: "8", sku: "CAB-AF", name: "Cabin Air Filter", brand: "K&N", category: "HVAC", price: 24.99, stock: 42 },
  { id: "9", sku: "WB-22", name: "Wiper Blade 22\"", brand: "Bosch", category: "Exterior", price: 18.49, stock: 50 },
  { id: "10", sku: "ALT-130", name: "Alternator 130A", brand: "Denso", category: "Electrical", price: 289.00, stock: 5 },
  { id: "11", sku: "SHK-FR", name: "Front Strut Assembly", brand: "Monroe", category: "Suspension", price: 156.00, stock: 10 },
  { id: "12", sku: "COOL-50", name: "Universal Coolant 1gal", brand: "Prestone", category: "Fluids", price: 18.99, stock: 45 },
];

const CATS = ["All", "Brakes", "Engine", "Fluids", "Electrical", "Tires", "HVAC", "Suspension", "Exterior"];

interface Props { storeId: string }

export default function AutoRepairPartShopSection({ storeId: _storeId }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});

  const filtered = useMemo(() => CATALOG.filter(p =>
    (cat === "All" || p.category === cat) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()))
  ), [q, cat]);

  const cartTotal = Object.entries(cart).reduce((s, [id, qty]) => {
    const p = CATALOG.find(x => x.id === id);
    return s + (p ? p.price * qty : 0);
  }, 0);
  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);

  const add = (p: Part) => {
    setCart(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    toast.success(`Added ${p.name}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Wrench className="w-4 h-4" /> Part Shop</CardTitle>
          {cartCount > 0 && (
            <Badge variant="default" className="gap-1.5"><ShoppingCart className="w-3 h-3" /> {cartCount} item{cartCount > 1 ? "s" : ""} · ${cartTotal.toFixed(2)}</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, SKU, or brand" className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATS.map(c => (
              <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)} className="h-7 px-3 text-xs shrink-0">{c}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="p-3 space-y-2">
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{p.brand} · {p.sku}</p>
                <p className="text-sm font-semibold leading-tight">{p.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-bold">${p.price.toFixed(2)}</span>
                  <Badge variant={p.stock > 10 ? "secondary" : "outline"} className="ml-2 text-[10px]">
                    {p.stock > 0 ? `${p.stock} in stock` : "Out"}
                  </Badge>
                </div>
                <Button size="icon" className="h-8 w-8" onClick={() => add(p)} disabled={p.stock === 0}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground text-sm">No parts match your search.</div>
        )}
      </div>
    </div>
  );
}
