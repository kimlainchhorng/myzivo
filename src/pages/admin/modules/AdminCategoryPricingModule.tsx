/**
 * Admin Category Pricing Module
 * Manage recommended price ranges for vehicle categories
 */

import { useState } from "react";
import { DollarSign, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAllCategoryPricing,
  useUpdateCategoryPricing,
  useCreateCategoryPricing,
  useDeleteCategoryPricing,
  type CategoryPricing,
} from "@/hooks/useCategoryPricing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VEHICLE_CATEGORIES = [
  "economy",
  "compact",
  "midsize",
  "fullsize",
  "suv",
  "truck",
  "minivan",
  "luxury",
];

export default function AdminCategoryPricingModule() {
  const { data: pricing, isLoading } = useAllCategoryPricing();
  const updatePricing = useUpdateCategoryPricing();
  const createPricing = useCreateCategoryPricing();
  const deletePricing = useDeleteCategoryPricing();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CategoryPricing>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPricing, setNewPricing] = useState({
    category: "",
    city: "",
    min_daily_price: 40,
    suggested_daily_price: 55,
    max_daily_price: 70,
  });
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);

  // Load suggestions enabled state
  useState(() => {
    supabase
      .from("system_settings")
      .select("value")
      .eq("key", "p2p_price_suggestions_enabled")
      .maybeSingle()
      .then(({ data }) => {
        setSuggestionsEnabled(data?.value === "true" || data?.value === true);
      });
  });

  const handleToggleSuggestions = async (enabled: boolean) => {
    setSuggestionsEnabled(enabled);
    const { error } = await supabase
      .from("system_settings")
      .update({ value: enabled ? "true" : "false" })
      .eq("key", "p2p_price_suggestions_enabled");

    if (error) {
      toast.error("Failed to update setting");
      setSuggestionsEnabled(!enabled);
    } else {
      toast.success(`Price suggestions ${enabled ? "enabled" : "disabled"}`);
    }
  };

  const startEdit = (item: CategoryPricing) => {
    setEditingId(item.id);
    setEditValues({
      min_daily_price: item.min_daily_price,
      suggested_daily_price: item.suggested_daily_price,
      max_daily_price: item.max_daily_price,
      is_active: item.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id: string) => {
    await updatePricing.mutateAsync({ id, updates: editValues });
    setEditingId(null);
    setEditValues({});
  };

  const handleCreate = async () => {
    await createPricing.mutateAsync({
      ...newPricing,
      city: newPricing.city || undefined,
    });
    setShowAddDialog(false);
    setNewPricing({
      category: "",
      city: "",
      min_daily_price: 40,
      suggested_daily_price: 55,
      max_daily_price: 70,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this pricing?")) {
      await deletePricing.mutateAsync(id);
    }
  };

  const formatCategory = (cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Category Pricing
        </h1>
        <p className="text-muted-foreground">
          Configure recommended price ranges for each vehicle category
        </p>
      </div>

      {/* Global Toggle */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Price Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Show recommended prices to owners when listing vehicles
              </p>
            </div>
            <Switch
              checked={suggestionsEnabled}
              onCheckedChange={handleToggleSuggestions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-2xl">{VEHICLE_CATEGORIES.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Pricing Rules</CardDescription>
            <CardTitle className="text-2xl">
              {pricing?.filter((p) => p.is_active).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>City Overrides</CardDescription>
            <CardTitle className="text-2xl">
              {pricing?.filter((p) => p.city).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Suggested</CardDescription>
            <CardTitle className="text-2xl">
              $
              {pricing && pricing.length > 0
                ? Math.round(
                    pricing.reduce((acc, p) => acc + Number(p.suggested_daily_price), 0) /
                      pricing.length
                  )
                : 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pricing Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pricing Rules</CardTitle>
            <CardDescription>
              Set minimum, suggested, and maximum prices per category
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add City Override
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add City-Specific Pricing</DialogTitle>
                <DialogDescription>
                  Create a pricing override for a specific city
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newPricing.category}
                    onValueChange={(v) => setNewPricing({ ...newPricing, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {formatCategory(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="e.g., Los Angeles"
                    value={newPricing.city}
                    onChange={(e) => setNewPricing({ ...newPricing, city: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Min ($)</Label>
                    <Input
                      type="number"
                      value={newPricing.min_daily_price}
                      onChange={(e) =>
                        setNewPricing({ ...newPricing, min_daily_price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Suggested ($)</Label>
                    <Input
                      type="number"
                      value={newPricing.suggested_daily_price}
                      onChange={(e) =>
                        setNewPricing({
                          ...newPricing,
                          suggested_daily_price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max ($)</Label>
                    <Input
                      type="number"
                      value={newPricing.max_daily_price}
                      onChange={(e) =>
                        setNewPricing({ ...newPricing, max_daily_price: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newPricing.category || createPricing.isPending}
                >
                  {createPricing.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Min ($)</TableHead>
                <TableHead className="text-right">Suggested ($)</TableHead>
                <TableHead className="text-right">Max ($)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {formatCategory(item.category)}
                  </TableCell>
                  <TableCell>
                    {item.city || (
                      <span className="text-muted-foreground italic">Default</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        className="w-20 text-right"
                        value={editValues.min_daily_price}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            min_daily_price: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      `$${item.min_daily_price}`
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        className="w-20 text-right"
                        value={editValues.suggested_daily_price}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            suggested_daily_price: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      <span className="font-medium text-primary">
                        ${item.suggested_daily_price}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        className="w-20 text-right"
                        value={editValues.max_daily_price}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            max_daily_price: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      `$${item.max_daily_price}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Switch
                        checked={editValues.is_active}
                        onCheckedChange={(v) =>
                          setEditValues({ ...editValues, is_active: v })
                        }
                      />
                    ) : (
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === item.id ? (
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => saveEdit(item.id)}
                          disabled={updatePricing.isPending}
                        >
                          <Check className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {item.city && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletePricing.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
