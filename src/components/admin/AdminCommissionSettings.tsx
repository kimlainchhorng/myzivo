import { useState } from "react";
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
  AlertCircle
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
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["commission-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_settings")
        .select("*")
        .order("service_type", { ascending: true });

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
                <CardDescription>Configure platform fees and driver commissions</CardDescription>
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
                      {setting.commission_percentage}%
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {setting.minimum_fee ? `$${setting.minimum_fee.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {setting.maximum_fee ? `$${setting.maximum_fee.toFixed(2)}` : "—"}
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
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(setting.id)}
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
                <Input
                  type="number"
                  value={formData.commission_percentage}
                  onChange={(e) => setFormData({ ...formData, commission_percentage: Number(e.target.value) })}
                  min={0}
                  max={100}
                  step={0.5}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Min Fee ($)</label>
                <Input
                  type="number"
                  value={formData.minimum_fee || ""}
                  onChange={(e) => setFormData({ ...formData, minimum_fee: Number(e.target.value) || 0 })}
                  min={0}
                  step={0.25}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Fee ($)</label>
                <Input
                  type="number"
                  value={formData.maximum_fee || ""}
                  onChange={(e) => setFormData({ ...formData, maximum_fee: e.target.value ? Number(e.target.value) : null })}
                  min={0}
                  step={0.25}
                  placeholder="No limit"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label htmlFor="active" className="text-sm">Active</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {editingSetting ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommissionSettings;
