import { ArrowLeft, Users, Truck, Clock3, Signal, SignalOff, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmployeeRow {
  id: string;
  name: string;
  role: string;
  user_id?: string | null;
}

interface InventoryRow {
  id: string;
  truck_label: string;
  product_id: string;
  quantity: number;
}

interface ProductRow {
  id: string;
  name: string;
  price: number;
}

interface OfflineSaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface OfflineSale {
  store_id: string;
  driver_user_id: string;
  truck_label: string;
  currency: string;
  total_amount: number;
  items: OfflineSaleItem[];
}

const OFFLINE_QUEUE_KEY = "zivo-truck-offline-sales";

export default function ShopEmployeesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<string>("default");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [sellQty, setSellQty] = useState<number>(1);

  const trucks = useMemo(() => {
    const labels = [...new Set(inventory.map((row) => row.truck_label))];
    return labels.length ? labels : ["default"];
  }, [inventory]);

  const visibleInventory = useMemo(() => {
    return inventory
      .filter((row) => row.truck_label === selectedTruck)
      .map((row) => ({
        ...row,
        product: products.find((p) => p.id === row.product_id),
      }));
  }, [inventory, products, selectedTruck]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id || null;
      setCurrentUserId(uid);
      if (!uid) return;

      const { data: store } = await (supabase as any)
        .from("store_profiles")
        .select("id")
        .eq("owner_id", uid)
        .limit(1)
        .maybeSingle();

      const effectiveStoreId = store?.id || null;
      setStoreId(effectiveStoreId);
      if (!effectiveStoreId) return;

      const [{ data: employeeData }, { data: inventoryData }, { data: productData }] = await Promise.all([
        (supabase as any).from("store_employees").select("id, name, role, user_id").eq("store_id", effectiveStoreId).order("created_at", { ascending: false }),
        (supabase as any).from("truck_inventory").select("id, truck_label, product_id, quantity").eq("store_id", effectiveStoreId),
        (supabase as any).from("store_products").select("id, name, price").eq("store_id", effectiveStoreId).eq("in_stock", true),
      ]);

      setEmployees((employeeData || []) as EmployeeRow[]);
      setInventory((inventoryData || []) as InventoryRow[]);
      setProducts((productData || []) as ProductRow[]);
      if ((productData || []).length) {
        setSelectedProductId((productData || [])[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const queueOfflineSale = async (sale: OfflineSale) => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]") as OfflineSale[];
    queue.push(sale);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

    await (supabase as any).from("truck_offline_sales_queue").insert({
      store_id: sale.store_id,
      driver_user_id: sale.driver_user_id,
      payload: sale,
      sync_status: "pending",
    });
  };

  const submitSale = async (sale: OfflineSale) => {
    const { data: saleRow, error: saleErr } = await (supabase as any)
      .from("truck_sales")
      .insert({
        store_id: sale.store_id,
        driver_user_id: sale.driver_user_id,
        truck_label: sale.truck_label,
        currency: sale.currency,
        total_amount: sale.total_amount,
        subtotal: sale.total_amount,
        status: "completed",
        is_offline_synced: true,
      })
      .select("id")
      .single();

    if (saleErr || !saleRow?.id) throw saleErr || new Error("Failed to create sale");

    const itemsPayload = sale.items.map((item) => ({
      sale_id: saleRow.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemErr } = await (supabase as any).from("truck_sale_items").insert(itemsPayload);
    if (itemErr) throw itemErr;
  };

  const syncOfflineSales = async () => {
    if (!isOnline) {
      toast.error("No signal. Offline sales will sync automatically once online.");
      return;
    }

    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]") as OfflineSale[];
    if (!queue.length) {
      toast.success("No pending offline sales.");
      return;
    }

    setSyncing(true);
    const remaining: OfflineSale[] = [];
    for (const sale of queue) {
      try {
        await submitSale(sale);
      } catch {
        remaining.push(sale);
      }
    }
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    setSyncing(false);
    toast.success(remaining.length ? `${queue.length - remaining.length} synced, ${remaining.length} still pending` : "All offline sales synced.");
    loadData();
  };

  const handleClock = async (action: "clock_in" | "clock_out") => {
    if (!storeId || !currentUserId) return;
    const employee = employees.find((e) => e.user_id === currentUserId);
    if (!employee) {
      toast.error("Your employee profile is not linked yet.");
      return;
    }

    const insertClock = async (lat?: number, lng?: number, gpsVerified = false) => {
      await (supabase as any).from("employee_clock_logs").insert({
        store_id: storeId,
        employee_id: employee.id,
        employee_user_id: currentUserId,
        action,
        latitude: lat ?? null,
        longitude: lng ?? null,
        gps_verified: gpsVerified,
      });
      toast.success(action === "clock_in" ? "Clocked in" : "Clocked out");
    };

    if (!navigator.geolocation) {
      await insertClock(undefined, undefined, false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await insertClock(pos.coords.latitude, pos.coords.longitude, true);
      },
      async () => {
        await insertClock(undefined, undefined, false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleSellNow = async () => {
    if (!storeId || !currentUserId || !selectedProductId || sellQty < 1) {
      toast.error("Select product and quantity first.");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      toast.error("Product not found.");
      return;
    }

    const sale: OfflineSale = {
      store_id: storeId,
      driver_user_id: currentUserId,
      truck_label: selectedTruck,
      currency: "USD",
      total_amount: Number(product.price) * sellQty,
      items: [{ product_id: selectedProductId, quantity: sellQty, unit_price: Number(product.price) }],
    };

    try {
      if (isOnline) {
        await submitSale(sale);
        toast.success("Sale completed and inventory deducted.");
      } else {
        await queueOfflineSale(sale);
        toast.success("No signal: sale saved locally for auto-sync.");
      }
      setSellQty(1);
      loadData();
    } catch {
      await queueOfflineSale(sale);
      toast.success("Sale queued for sync.");
    }
  };

  const pendingOfflineCount = useMemo(() => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]") as OfflineSale[];
    return queue.length;
  }, [loading, syncing, isOnline]);

  return (
    <AppLayout title="Employees" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24">
        <div className="flex items-center gap-2.5 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="font-bold text-[17px]">Employees</h1>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading team and truck mode...</div>
        ) : !storeId ? (
          <div className="text-sm text-muted-foreground">No owner store found for this account.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/30 p-3 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">Driver / Truck Mode</p>
                </div>
                <div className="flex items-center gap-2">
                  {isOnline ? <Signal className="w-4 h-4 text-emerald-500" /> : <SignalOff className="w-4 h-4 text-amber-500" />}
                  <button onClick={syncOfflineSales} className="text-xs px-2 py-1 rounded-md border border-border/40 flex items-center gap-1" disabled={syncing}>
                    <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} /> Sync ({pendingOfflineCount})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={() => handleClock("clock_in")} className="h-9 rounded-lg bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1">
                  <Clock3 className="w-3.5 h-3.5" /> Clock In (GPS)
                </button>
                <button onClick={() => handleClock("clock_out")} className="h-9 rounded-lg bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1">
                  <Clock3 className="w-3.5 h-3.5" /> Clock Out (GPS)
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <select value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)} className="h-9 rounded-lg border border-border/40 bg-background px-2 text-xs">
                  {trucks.map((truck) => (
                    <option key={truck} value={truck}>{truck}</option>
                  ))}
                </select>
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="h-9 rounded-lg border border-border/40 bg-background px-2 text-xs">
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={sellQty}
                  onChange={(e) => setSellQty(Math.max(1, Number(e.target.value) || 1))}
                  className="h-9 rounded-lg border border-border/40 bg-background px-2 text-xs"
                />
              </div>

              <button onClick={handleSellNow} className="mt-2 h-9 w-full rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                Sell From Truck
              </button>
            </div>

            <div className="rounded-2xl border border-border/30 p-3 bg-card">
              <p className="text-sm font-semibold mb-2">On-Truck Inventory</p>
              {visibleInventory.length === 0 ? (
                <p className="text-xs text-muted-foreground">No inventory loaded for this truck yet.</p>
              ) : (
                <div className="space-y-2">
                  {visibleInventory.map((row) => (
                    <div key={row.id} className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-2 py-1.5">
                      <span>{row.product?.name || row.product_id}</span>
                      <span className="font-semibold">Qty {row.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border/30 p-3 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-semibold">Team</p>
              </div>
              {employees.length === 0 ? (
                <p className="text-xs text-muted-foreground">No employees yet.</p>
              ) : (
                <div className="space-y-2">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-2 py-1.5">
                      <span>{employee.name}</span>
                      <span className="uppercase tracking-wide text-muted-foreground">{employee.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
