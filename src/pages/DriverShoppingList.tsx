/**
 * DriverShoppingList - Driver view for shopping delivery orders
 * Shows the list of items to purchase, allows marking found & uploading receipt
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, Circle, Camera, Package,
  MapPin, Phone, Upload, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ShoppingItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  brand: string;
  found: boolean;
}

// TODO: Replace with real order data from Supabase
const MOCK_ORDER = {
  id: "ZS-00000001",
  store: "Walmart",
  customerName: "Customer",
  deliveryAddress: "Delivery address pending",
  items: [] as ShoppingItem[],
};

export default function DriverShoppingList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShoppingItem[]>(MOCK_ORDER.items);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const toggleFound = (productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, found: !i.found } : i
      )
    );
  };

  const allFound = items.length > 0 && items.every((i) => i.found);
  const foundCount = items.filter((i) => i.found).length;

  const handleReceiptUpload = async () => {
    // TODO: integrate with Supabase storage
    setIsUploading(true);
    setTimeout(() => {
      setReceiptUploaded(true);
      setIsUploading(false);
      toast.success("Receipt uploaded");
    }, 1500);
  };

  const handleConfirmDelivery = () => {
    toast.success("Delivery confirmed!");
    // TODO: update order status in DB
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Shopping List</h1>
            <p className="text-xs text-muted-foreground">
              Order {MOCK_ORDER.id} • {MOCK_ORDER.store}
            </p>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {foundCount}/{items.length}
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-muted/50 border border-border/50">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Deliver to:</span>
          <span className="font-medium truncate">{MOCK_ORDER.deliveryAddress}</span>
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            No shopping orders assigned yet.
          </p>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-2">
          <h3 className="text-sm font-semibold mb-2">
            Shopping List ({items.length} items)
          </h3>
          {items.map((item, i) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => toggleFound(item.productId)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                item.found
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border/50 hover:border-primary/30"
              )}
            >
              {item.found ? (
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", item.found && "line-through text-muted-foreground")}>
                  {item.quantity}x {item.name}
                </p>
                {item.brand && (
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                )}
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Receipt Upload & Confirm */}
      {items.length > 0 && (
        <div className="px-4 mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={handleReceiptUpload}
            disabled={isUploading || receiptUploaded}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : receiptUploaded ? (
              <CheckCircle className="h-4 w-4 mr-2 text-primary" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            {receiptUploaded ? "Receipt Uploaded" : "Upload Receipt Photo"}
          </Button>

          <Button
            className="w-full rounded-xl"
            disabled={!allFound || !receiptUploaded}
            onClick={handleConfirmDelivery}
          >
            Confirm Delivery
          </Button>
        </div>
      )}
    </div>
  );
}
