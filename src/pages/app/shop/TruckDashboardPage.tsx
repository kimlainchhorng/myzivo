/**
 * TruckDashboardPage — Mobile driver dashboard for truck inventory + nearby customers
 * GPS-powered, real-time inventory sync, barcode scanning
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, MapPin, Package, Scan, Truck, Users, RefreshCw,
  Navigation, Minus, Plus, CheckCircle, Loader2, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  truck_label: string;
}

interface NearbyCustomer {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance_km: number;
  last_order?: string;
}

export default function TruckDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [nearbyCustomers, setNearbyCustomers] = useState<NearbyCustomer[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [truckLabel, setTruckLabel] = useState("default");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [scanMode, setScanMode] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [syncing, setSyncing] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  // Get GPS position
  useEffect(() => {
    navigator.geolocation.watchPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => toast.error("GPS required for truck dashboard"),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  }, []);

  // Load store + inventory
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data: store } = await (supabase as any)
          .from("store_profiles")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (!store) {
          toast.error("No store found");
          setLoading(false);
          return;
        }
        setStoreId(store.id);

        const [{ data: inv }, { data: prods }] = await Promise.all([
          (supabase as any)
            .from("truck_inventory")
            .select("id, truck_label, product_id, quantity")
            .eq("store_id", store.id),
          (supabase as any)
            .from("store_products")
            .select("id, name, price")
            .eq("store_id", store.id)
            .eq("in_stock", true),
        ]);

        const prodMap = new Map((prods || []).map((p: any) => [p.id, p]));
        setInventory(
          (inv || []).map((row: any) => {
            const prod = prodMap.get(row.product_id);
            return {
              ...row,
              product_name: prod?.name || "Unknown",
              price: prod?.price || 0,
            };
          })
        );
      } catch {
        toast.error("Failed to load dashboard");
      }
      setLoading(false);
    })();
  }, [user]);

  // Simulate nearby customers based on GPS
  useEffect(() => {
    if (!userLat || !userLng || !storeId) return;
    // In production, query store_orders with customer locations
    // For now, show demo data
    setNearbyCustomers([
      { id: "1", name: "Customer nearby", lat: userLat + 0.002, lng: userLng + 0.001, distance_km: 0.3 },
      { id: "2", name: "Regular buyer", lat: userLat - 0.005, lng: userLng + 0.003, distance_km: 0.7 },
      { id: "3", name: "New customer", lat: userLat + 0.008, lng: userLng - 0.004, distance_km: 1.1 },
    ]);
  }, [userLat, userLng, storeId]);

  const handleBarcodeScan = useCallback(async () => {
    if (!barcodeInput.trim() || !storeId) return;
    setSyncing(true);
    try {
      // Look up product by barcode/SKU
      const { data: product } = await (supabase as any)
        .from("store_products")
        .select("id, name, price")
        .eq("store_id", storeId)
        .or(`barcode.eq.${barcodeInput},sku.eq.${barcodeInput}`)
        .maybeSingle();

      if (!product) {
        toast.error(`No product found for barcode: ${barcodeInput}`);
        setBarcodeInput("");
        setSyncing(false);
        return;
      }

      // Decrement inventory
      const existing = inventory.find((i) => i.product_id === product.id && i.truck_label === truckLabel);
      if (existing && existing.quantity > 0) {
        await (supabase as any)
          .from("truck_inventory")
          .update({ quantity: existing.quantity - 1 })
          .eq("id", existing.id);

        setInventory((prev) =>
          prev.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity - 1 } : i
          )
        );
        toast.success(`Sold 1x ${product.name} — ${existing.quantity - 1} left`);
      } else {
        toast.error("Out of stock on this truck");
      }
    } catch {
      toast.error("Scan failed");
    }
    setBarcodeInput("");
    setSyncing(false);
  }, [barcodeInput, storeId, inventory, truckLabel]);

  const totalItems = inventory.filter((i) => i.truck_label === truckLabel).reduce((s, i) => s + i.quantity, 0);
  const totalValue = inventory
    .filter((i) => i.truck_label === truckLabel)
    .reduce((s, i) => s + i.quantity * i.price, 0);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Truck className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold flex-1">Truck Dashboard</h1>
            <Badge variant="outline" className="text-[10px]">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
              GPS Active
            </Badge>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border/30">
              <CardContent className="p-3 text-center">
                <Package className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">{totalItems}</p>
                <p className="text-[10px] text-muted-foreground">Items</p>
              </CardContent>
            </Card>
            <Card className="border-border/30">
              <CardContent className="p-3 text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold">{nearbyCustomers.length}</p>
                <p className="text-[10px] text-muted-foreground">Nearby</p>
              </CardContent>
            </Card>
            <Card className="border-border/30">
              <CardContent className="p-3 text-center">
                <MapPin className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                <p className="text-lg font-bold">${totalValue.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">Value</p>
              </CardContent>
            </Card>
          </div>

          {/* Barcode Scanner */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Scan className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold">Quick Scan Sale</p>
              </div>
              <div className="flex gap-2">
                <Input
                  ref={barcodeRef}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or enter SKU..."
                  className="flex-1 rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleBarcodeScan()}
                />
                <Button
                  onClick={handleBarcodeScan}
                  disabled={syncing || !barcodeInput}
                  size="sm"
                  className="rounded-xl"
                >
                  {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Scan updates inventory in real-time on the Shop Map
              </p>
            </CardContent>
          </Card>

          {/* Nearby Customers */}
          <div>
            <p className="text-sm font-bold mb-2 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              Nearby Customers
            </p>
            <div className="space-y-2">
              {nearbyCustomers.map((c) => (
                <Card key={c.id} className="border-border/30">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.distance_km < 1
                          ? `${Math.round(c.distance_km * 1000)}m away`
                          : `${c.distance_km.toFixed(1)}km away`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-xl"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`,
                          "_blank"
                        );
                      }}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Navigate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Inventory List */}
          <div>
            <p className="text-sm font-bold mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Truck Inventory
            </p>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : inventory.filter((i) => i.truck_label === truckLabel).length === 0 ? (
              <Card className="border-border/30">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  No inventory loaded on this truck
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {inventory
                  .filter((i) => i.truck_label === truckLabel)
                  .map((item) => (
                    <Card key={item.id} className="border-border/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{item.product_name}</p>
                          <p className="text-[11px] text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.quantity > 5 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {item.quantity} left
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
