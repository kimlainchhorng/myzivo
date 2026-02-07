/**
 * DispatchBatchNew Page
 * Create a new batch by selecting orders
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package, Loader2, Sparkles } from "lucide-react";
import BatchOrderSelector from "@/components/batch/BatchOrderSelector";
import { useCreateBatch, useOptimizeBatch } from "@/hooks/useBatches";
import { useRegions } from "@/hooks/useRegions";
import { toast } from "sonner";

const DispatchBatchNew = () => {
  const navigate = useNavigate();
  const { data: regions } = useRegions();

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [notes, setNotes] = useState("");

  const createBatch = useCreateBatch();
  const optimizeBatch = useOptimizeBatch();

  const handleCreateBatch = async (autoOptimize: boolean = false) => {
    if (selectedOrderIds.length === 0) {
      toast.error("Please select at least one order");
      return;
    }

    try {
      const batchId = await createBatch.mutateAsync({
        orderIds: selectedOrderIds,
        regionId: selectedRegion || undefined,
        notes: notes || undefined,
      });

      if (autoOptimize && batchId) {
        await optimizeBatch.mutateAsync({ batchId });
      }

      navigate(`/dispatch/batches/${batchId}`);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const isCreating = createBatch.isPending || optimizeBatch.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dispatch/batches")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6" />
            Create Batch
          </h1>
          <p className="text-muted-foreground">
            Select orders to combine into a multi-stop delivery batch
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <BatchOrderSelector
                selectedOrderIds={selectedOrderIds}
                onSelectionChange={setSelectedOrderIds}
              />
            </CardContent>
          </Card>
        </div>

        {/* Batch Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Zone (Optional)</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect from orders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-detect</SelectItem>
                    {(regions || []).map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes for this batch..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders selected</span>
                <span className="font-bold">{selectedOrderIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total stops</span>
                <span className="font-bold">{selectedOrderIds.length * 2}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Each order creates 2 stops: pickup + dropoff
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  onClick={() => handleCreateBatch(true)}
                  disabled={selectedOrderIds.length === 0 || isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Create & Optimize
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCreateBatch(false)}
                  disabled={selectedOrderIds.length === 0 || isCreating}
                >
                  Create Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DispatchBatchNew;
