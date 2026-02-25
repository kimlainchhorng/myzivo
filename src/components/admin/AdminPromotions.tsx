import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Ticket, Plus, Edit, Trash2, Percent, DollarSign, Truck, Copy, 
  CheckCircle, Clock, Zap, Search, Calendar, TrendingUp, Users,
  Gift, Tag, AlertCircle, RefreshCw, FlaskConical
} from "lucide-react";
import PromotionABTesting from "./promotions/PromotionABTesting";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isPast } from "date-fns";

interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  applicable_services: string[];
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

const discountTypeIcons: Record<string, any> = {
  percentage: Percent,
  fixed: DollarSign,
  free_delivery: Truck,
};

const AdminPromotions = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: 10,
    min_order_amount: 0,
    max_discount: 0,
    usage_limit: 0,
    per_user_limit: 1,
    is_active: true,
    ends_at: "",
  });
  const queryClient = useQueryClient();

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Promotion[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("promotions").insert({
        ...data,
        max_discount: data.max_discount || null,
        usage_limit: data.usage_limit || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast.success("Promotion created");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create promotion");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Promotion> }) => {
      const { error } = await supabase.from("promotions").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast.success("Promotion updated");
      setEditingPromo(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast.success("Promotion deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: 10,
      min_order_amount: 0,
      max_discount: 0,
      usage_limit: 0,
      per_user_limit: 1,
      is_active: true,
      ends_at: "",
    });
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description || "",
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      min_order_amount: promo.min_order_amount,
      max_discount: promo.max_discount || 0,
      usage_limit: promo.usage_limit || 0,
      per_user_limit: promo.per_user_limit,
      is_active: promo.is_active,
      ends_at: promo.ends_at || "",
    });
  };

  // Filter promotions
  const filteredPromotions = promotions?.filter((promo) => {
    const matchesSearch = promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && promo.is_active && (!promo.ends_at || !isPast(new Date(promo.ends_at)));
    if (statusFilter === "inactive") return matchesSearch && !promo.is_active;
    if (statusFilter === "expired") return matchesSearch && promo.ends_at && isPast(new Date(promo.ends_at));
    
    return matchesSearch;
  }) || [];

  const getPromoStatus = (promo: Promotion) => {
    if (promo.ends_at && isPast(new Date(promo.ends_at))) return "expired";
    if (!promo.is_active) return "inactive";
    if (promo.usage_limit && promo.usage_count >= promo.usage_limit) return "exhausted";
    return "active";
  };

  const getUsagePercent = (promo: Promotion) => {
    if (!promo.usage_limit) return 0;
    return Math.min((promo.usage_count / promo.usage_limit) * 100, 100);
  };

  const handleSubmit = () => {
    if (editingPromo) {
      updateMutation.mutate({ id: editingPromo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const activeCount = promotions?.filter(p => p.is_active).length || 0;
  const totalUsage = promotions?.reduce((acc, p) => acc + p.usage_count, 0) || 0;

  const formatDiscount = (promo: Promotion) => {
    switch (promo.discount_type) {
      case "percentage":
        return `${promo.discount_value}%`;
      case "fixed":
        return `$${promo.discount_value}`;
      case "free_delivery":
        return "Free Delivery";
      default:
        return promo.discount_value.toString();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
            <Ticket className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Promotions & Coupons</h1>
            <p className="text-muted-foreground">Create and manage discount codes</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Promotion
        </Button>
      </div>

      <Tabs defaultValue="promotions" className="space-y-6">
        <TabsList className="bg-card/50">
          <TabsTrigger value="promotions" className="gap-2">
            <Ticket className="h-4 w-4" />
            All Promotions
          </TabsTrigger>
          <TabsTrigger value="ab-testing" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            A/B Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-6 mt-0">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Ticket className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">{promotions?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-lg font-semibold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Usage</p>
              <p className="text-lg font-semibold">{totalUsage}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-lg font-semibold">
                {promotions?.filter(p => {
                  if (!p.ends_at) return false;
                  const daysLeft = (new Date(p.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                  return daysLeft > 0 && daysLeft < 7;
                }).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Table */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                All Promotions
              </CardTitle>
              <CardDescription>Manage discount codes and offers</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promotions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : !filteredPromotions.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No promotions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromotions.map((promo) => {
                    const Icon = discountTypeIcons[promo.discount_type] || Percent;
                    const status = getPromoStatus(promo);
                    const usagePercent = getUsagePercent(promo);
                    const daysUntilExpiry = promo.ends_at ? differenceInDays(new Date(promo.ends_at), new Date()) : null;
                    return (
                      <TableRow key={promo.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-muted font-mono text-sm font-semibold">
                              {promo.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyCode(promo.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{promo.name}</p>
                          {promo.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {promo.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className="gap-1.5 bg-primary/10 text-primary border-transparent">
                            <Icon className="h-3 w-3" />
                            {formatDiscount(promo)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">
                              {promo.usage_count}
                              {promo.usage_limit && ` / ${promo.usage_limit}`}
                            </span>
                            {promo.usage_limit && (
                              <Progress value={usagePercent} className="h-1.5 w-16" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {daysUntilExpiry !== null ? (
                            <span className={cn(
                              "text-sm",
                              daysUntilExpiry < 0 ? "text-red-500" :
                              daysUntilExpiry < 7 ? "text-amber-500" : "text-muted-foreground"
                            )}>
                              {daysUntilExpiry < 0 ? "Expired" :
                               daysUntilExpiry === 0 ? "Today" :
                               `${daysUntilExpiry}d left`}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">No expiry</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "border-transparent",
                            status === "active" ? "bg-green-500/10 text-green-500" :
                            status === "expired" ? "bg-red-500/10 text-red-500" :
                            status === "exhausted" ? "bg-amber-500/10 text-amber-500" :
                            "bg-slate-500/10 text-slate-500"
                          )}>
                            {status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {status === "expired" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(promo)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(promo.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingPromo} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingPromo(null);
          resetForm();
        }
      }}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              {editingPromo ? "Edit Promotion" : "New Promotion"}
            </DialogTitle>
            <DialogDescription>
              {editingPromo ? "Update this promotion" : "Create a new discount code"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="20% Off"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Get 20% off your first order"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Type</label>
                <Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_delivery">Free Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Value</label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Order ($)</label>
                <Input
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Discount ($)</label>
                <Input
                  type="number"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                  placeholder="No limit"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Usage Limit</label>
                <Input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Per User Limit</label>
                <Input
                  type="number"
                  value={formData.per_user_limit}
                  onChange={(e) => setFormData({ ...formData, per_user_limit: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Enable this promotion</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setEditingPromo(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.code || !formData.name}>
              {editingPromo ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="ab-testing" className="mt-0">
          <PromotionABTesting />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPromotions;
