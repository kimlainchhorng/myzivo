import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Percent, 
  Plus, 
  Pencil, 
  Trash2, 
  DollarSign,
  Car,
  Utensils,
  Package,
  Save,
  AlertCircle,
  Check,
  X,
  Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommissionSetting {
  id: string;
  name: string;
  service_type: string;
  vehicle_type: string | null;
  commission_percentage: number;
  minimum_fee: number | null;
  maximum_fee: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const defaultFormData = {
  name: "",
  service_type: "rides",
  vehicle_type: "",
  commission_percentage: 20,
  minimum_fee: 1,
  maximum_fee: null as number | null,
  is_active: true
};

const AdminCommissionSettings = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<CommissionSetting | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["commission-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_settings")
        .select("*")
        .order("commission_percentage", { ascending: true })
        .order("minimum_fee", { ascending: true });

      if (error) throw error;
      return data as CommissionSetting[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("commission_settings")
          .update({
            name: data.name,
            service_type: data.service_type,
            vehicle_type: data.vehicle_type || null,
            commission_percentage: data.commission_percentage,
            minimum_fee: data.minimum_fee,
            maximum_fee: data.maximum_fee,
            is_active: data.is_active,
            updated_at: new Date().toISOString()
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("commission_settings")
          .insert({
            name: data.name,
            service_type: data.service_type,
            vehicle_type: data.vehicle_type || null,
            commission_percentage: data.commission_percentage,
            minimum_fee: data.minimum_fee,
            maximum_fee: data.maximum_fee,
            is_active: data.is_active
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-settings"] });
      toast.success(editingSetting ? "Commission setting updated" : "Commission setting created");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save commission setting");
    },
  });

  // Inline field update mutation
  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: any }) => {
      const { error } = await supabase
        .from("commission_settings")
        .update({ 
          [field]: value,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-settings"] });
      toast.success("Updated successfully");
      setEditingRowId(null);
      setEditingField(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update");
      setEditingRowId(null);
      setEditingField(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("commission_settings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-settings"] });
      toast.success("Commission setting deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete commission setting");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("commission_settings")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-settings"] });
      toast.success("Status updated");
    },
  });

  const handleOpenDialog = (setting?: CommissionSetting) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData({
        name: setting.name,
        service_type: setting.service_type,
        vehicle_type: setting.vehicle_type || "",
        commission_percentage: setting.commission_percentage,
        minimum_fee: setting.minimum_fee || 0,
        maximum_fee: setting.maximum_fee,
        is_active: setting.is_active
      });
    } else {
      setEditingSetting(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSetting(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    saveMutation.mutate(editingSetting ? { ...formData, id: editingSetting.id } : formData);
  };

  // Handle inline edit start
  const startInlineEdit = (rowId: string, field: string, currentValue: any) => {
    setEditingRowId(rowId);
    setEditingField(field);
    setEditValue(String(currentValue ?? ""));
  };

  // Handle inline edit save
  const saveInlineEdit = (id: string, field: string) => {
    let value: any = editValue;
    
    // Convert to appropriate type based on field
    if (field === "commission_percentage") {
      value = parseFloat(editValue) || 0;
      if (value < 0 || value > 100) {
        toast.error("Commission must be between 0 and 100");
        return;
      }
    } else if (field === "minimum_fee" || field === "maximum_fee") {
      value = editValue ? parseFloat(editValue) : null;
      if (value !== null && value < 0) {
        toast.error("Fee cannot be negative");
        return;
      }
    }
    
    updateFieldMutation.mutate({ id, field, value });
  };

  // Handle inline edit cancel
  const cancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingField(null);
    setEditValue("");
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "rides": return <Car className="h-4 w-4" />;
      case "food_delivery": return <Utensils className="h-4 w-4" />;
      case "package_delivery": return <Package className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case "rides": return "bg-primary/10 text-primary border-primary/20";
      case "food_delivery": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "package_delivery": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  // Calculate summary stats
  const activeSettings = settings?.filter(s => s.is_active) || [];
  const avgCommission = activeSettings.length > 0 
    ? activeSettings.reduce((acc, s) => acc + s.commission_percentage, 0) / activeSettings.length
    : 0;
  const byService = {
    rides: settings?.filter(s => s.service_type === "rides").length || 0,
    food_delivery: settings?.filter(s => s.service_type === "food_delivery").length || 0,
    package_delivery: settings?.filter(s => s.service_type === "package_delivery").length || 0,
  };

  // Render editable cell
  const renderEditableCell = (
    setting: CommissionSetting, 
    field: string, 
    value: any, 
    prefix: string = "",
    suffix: string = ""
  ) => {
    const isEditing = editingRowId === setting.id && editingField === field;
    const isSaving = updateFieldMutation.isPending && editingRowId === setting.id && editingField === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 w-20 text-right"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") saveInlineEdit(setting.id, field);
              if (e.key === "Escape") cancelInlineEdit();
            }}
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 text-green-500"
            onClick={() => saveInlineEdit(setting.id, field)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 text-red-500"
            onClick={cancelInlineEdit}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    const displayValue = value !== null && value !== undefined 
      ? `${prefix}${typeof value === 'number' ? value.toFixed(field.includes('fee') ? 2 : 0) : value}${suffix}`
      : "—";

    return (
      <span 
        className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors inline-block"
        onClick={() => startInlineEdit(setting.id, field, value)}
        title="Click to edit"
      >
        {displayValue}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rates</p>
                <p className="text-2xl font-bold text-green-500">{activeSettings.length}</p>
              </div>
              <div className="p-2 rounded-xl bg-green-500/10">
                <Percent className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Commission</p>
                <p className="text-2xl font-bold text-blue-500">{avgCommission.toFixed(1)}%</p>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ride Rates</p>
                <p className="text-2xl font-bold text-primary">{byService.rides}</p>
              </div>
              <div className="p-2 rounded-xl bg-primary/10">
                <Car className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-500/10 to-pink-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rates</p>
                <p className="text-2xl font-bold text-rose-500">{byService.food_delivery + byService.package_delivery}</p>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10">
                <Utensils className="h-5 w-5 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10">
                <Percent className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Commission Settings</CardTitle>
                <CardDescription>Click on any value to edit inline • Toggle switch to activate/deactivate</CardDescription>
              </div>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Rate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead className="text-right">Commission %</TableHead>
                <TableHead className="text-right">Min Fee</TableHead>
                <TableHead className="text-right">Max Fee</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : !settings?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">No commission settings configured</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => handleOpenDialog()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Rate
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                settings.map((setting) => (
                  <TableRow key={setting.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{setting.name}</TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1.5 capitalize", getServiceColor(setting.service_type))}>
                        {getServiceIcon(setting.service_type)}
                        {setting.service_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {setting.vehicle_type || "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {renderEditableCell(setting, "commission_percentage", setting.commission_percentage, "", "%")}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {renderEditableCell(setting, "minimum_fee", setting.minimum_fee, "$")}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {renderEditableCell(setting, "maximum_fee", setting.maximum_fee, "$")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={setting.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: setting.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(setting)}
                          title="Edit all fields"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this commission setting?")) {
                              deleteMutation.mutate(setting.id);
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              {editingSetting ? "Edit Commission Rate" : "Add Commission Rate"}
            </DialogTitle>
            <DialogDescription>
              Configure commission rates for different services and vehicle types
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Economy Rides"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Service Type</label>
                <Select 
                  value={formData.service_type} 
                  onValueChange={(v) => setFormData({ ...formData, service_type: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rides">Rides</SelectItem>
                    <SelectItem value="food_delivery">Food Delivery</SelectItem>
                    <SelectItem value="package_delivery">Package Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Vehicle Type (optional)</label>
                <Select 
                  value={formData.vehicle_type || "_all"} 
                  onValueChange={(v) => setFormData({ ...formData, vehicle_type: v === "_all" ? "" : v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="All vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All vehicles</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="comfort">Comfort</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Commission %</label>
                <div className="relative mt-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) || 0 })}
                    className="pr-8"
                  />
                  <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Min Fee</label>
                <div className="relative mt-1.5">
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={formData.minimum_fee || ""}
                    onChange={(e) => setFormData({ ...formData, minimum_fee: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="pl-6"
                  />
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Max Fee (optional)</label>
                <div className="relative mt-1.5">
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={formData.maximum_fee ?? ""}
                    onChange={(e) => setFormData({ ...formData, maximum_fee: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="No limit"
                    className="pl-6"
                  />
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Enable this commission rate</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingSetting ? "Save Changes" : "Create Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommissionSettings;
