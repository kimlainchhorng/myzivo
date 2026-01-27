import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckSquare, Trash2, Download, Send, RefreshCw, 
  DollarSign, CheckCircle, XCircle, Clock, AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BatchItem {
  id: string;
  type: string;
  name: string;
  amount: number;
  status: string;
  date: string;
}

const statusColors: Record<string, { color: string; bg: string }> = {
  pending: { color: "text-amber-500", bg: "bg-amber-500/10" },
  processing: { color: "text-blue-500", bg: "bg-blue-500/10" },
  completed: { color: "text-green-500", bg: "bg-green-500/10" },
  failed: { color: "text-red-500", bg: "bg-red-500/10" },
};

interface AdminBatchActionsProps {
  entityType: "payouts" | "users" | "drivers";
}

const AdminBatchActions = ({ entityType }: AdminBatchActionsProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: [`admin-batch-${entityType}`],
    queryFn: async () => {
      if (entityType === "payouts") {
        const { data, error } = await supabase
          .from("payouts")
          .select(`
            id, amount, status, created_at,
            driver:drivers(full_name),
            restaurant:restaurants(name)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(50);
        
        if (error) throw error;
        return data?.map(p => ({
          id: p.id,
          type: p.driver ? "driver" : "restaurant",
          name: p.driver?.full_name || p.restaurant?.name || "Unknown",
          amount: p.amount,
          status: p.status,
          date: p.created_at,
        })) || [];
      }
      return [];
    },
  });

  const handleSelectAll = () => {
    if (selectedItems.length === items?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items?.map(i => i.id) || []);
    }
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleBatchAction = async () => {
    if (!selectedAction || selectedItems.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      if (entityType === "payouts") {
        const updates: Record<string, string> = {};
        if (selectedAction === "approve") {
          await supabase
            .from("payouts")
            .update({ status: "processing" })
            .in("id", selectedItems);
        } else if (selectedAction === "reject") {
          await supabase
            .from("payouts")
            .update({ status: "failed" })
            .in("id", selectedItems);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: [`admin-batch-${entityType}`] });
      toast.success(`${selectedItems.length} items updated successfully`);
      setSelectedItems([]);
      setIsActionDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to process batch action");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSelected = items?.filter(i => selectedItems.includes(i.id)).reduce((acc, i) => acc + i.amount, 0) || 0;

  const actions = entityType === "payouts" 
    ? [
        { value: "approve", label: "Approve Selected", icon: CheckCircle, color: "text-green-500" },
        { value: "reject", label: "Reject Selected", icon: XCircle, color: "text-red-500" },
        { value: "export", label: "Export to CSV", icon: Download, color: "text-blue-500" },
      ]
    : [
        { value: "activate", label: "Activate Selected", icon: CheckCircle, color: "text-green-500" },
        { value: "deactivate", label: "Deactivate Selected", icon: XCircle, color: "text-red-500" },
        { value: "notify", label: "Send Notification", icon: Send, color: "text-purple-500" },
      ];

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Batch Operations
            </CardTitle>
            <CardDescription>Select multiple items to perform bulk actions</CardDescription>
          </div>
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {selectedItems.length} selected
              </Badge>
              {entityType === "payouts" && (
                <Badge className="bg-green-500/10 text-green-500 border-transparent">
                  Total: ${totalSelected.toFixed(2)}
                </Badge>
              )}
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select action..." />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      <span className={cn("flex items-center gap-2", action.color)}>
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setIsActionDialogOpen(true)}
                disabled={!selectedAction}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === items?.length && items.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No pending items</p>
                  </TableCell>
                </TableRow>
              ) : (
                items?.map((item) => {
                  const statusConfig = statusColors[item.status] || statusColors.pending;
                  return (
                    <TableRow 
                      key={item.id} 
                      className={cn(
                        "transition-colors",
                        selectedItems.includes(item.id) && "bg-primary/5"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-500">
                        ${item.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize border-transparent", statusConfig.bg, statusConfig.color)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Batch Action
            </DialogTitle>
            <DialogDescription>
              You are about to {selectedAction} {selectedItems.length} items.
              {entityType === "payouts" && ` Total amount: $${totalSelected.toFixed(2)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBatchAction}
              disabled={isProcessing}
              className={selectedAction === "reject" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${selectedAction}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminBatchActions;
