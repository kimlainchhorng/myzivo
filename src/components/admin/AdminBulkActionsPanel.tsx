import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Layers, 
  Users, 
  Car, 
  DollarSign,
  Mail,
  Bell,
  FileCheck,
  Ban,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Zap
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BulkAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  destructive?: boolean;
  count?: number;
}

const AdminBulkActionsPanel = () => {
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const bulkActions: BulkAction[] = [
    {
      id: "approve-documents",
      label: "Approve Pending Documents",
      description: "Approve all pending driver documents",
      icon: FileCheck,
      color: "text-green-500",
      count: 15,
    },
    {
      id: "process-payouts",
      label: "Process All Payouts",
      description: "Process all pending payout requests",
      icon: DollarSign,
      color: "text-emerald-500",
      count: 32,
    },
    {
      id: "send-notification",
      label: "Send Mass Notification",
      description: "Send notification to all active users",
      icon: Bell,
      color: "text-blue-500",
    },
    {
      id: "email-campaign",
      label: "Email Campaign",
      description: "Send promotional email to subscribers",
      icon: Mail,
      color: "text-purple-500",
    },
    {
      id: "activate-drivers",
      label: "Activate Verified Drivers",
      description: "Activate all drivers with verified documents",
      icon: Car,
      color: "text-primary",
      count: 8,
    },
    {
      id: "suspend-inactive",
      label: "Suspend Inactive Users",
      description: "Suspend users inactive for 90+ days",
      icon: Ban,
      color: "text-amber-500",
      destructive: true,
      count: 124,
    },
  ];

  const handleActionClick = (action: BulkAction) => {
    setSelectedAction(action);
    setIsConfirmOpen(true);
  };

  const executeAction = async () => {
    if (!selectedAction) return;
    
    setIsProcessing(true);
    setProgress(0);

    // Simulate bulk action progress
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress((i / steps) * 100);
    }

    // In production, execute actual bulk operations here
    switch (selectedAction.id) {
      case "approve-documents":
        await supabase
          .from("driver_documents")
          .update({ status: "approved", reviewed_at: new Date().toISOString() })
          .eq("status", "pending");
        break;
      case "process-payouts":
        await supabase
          .from("payouts")
          .update({ status: "completed", processed_at: new Date().toISOString() })
          .eq("status", "pending");
        break;
      // Add more cases as needed
    }

    setIsProcessing(false);
    setIsConfirmOpen(false);
    setProgress(0);
    
    queryClient.invalidateQueries();
    toast.success(`${selectedAction.label} completed successfully`);
  };

  return (
    <>
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Bulk Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bulkActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-auto p-4 justify-start gap-3 hover:shadow-md transition-all",
                      action.destructive && "hover:border-destructive/50"
                    )}
                    onClick={() => handleActionClick(action)}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      action.destructive ? "bg-destructive/10" : `${action.color.replace("text-", "bg-")}/10`
                    )}>
                      <Icon className={cn("h-4 w-4", action.destructive ? "text-destructive" : action.color)} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{action.label}</p>
                        {action.count !== undefined && (
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {action.count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <Zap className="h-4 w-4 text-muted-foreground/50" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction?.destructive ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
              Confirm Bulk Action
            </DialogTitle>
            <DialogDescription>
              {selectedAction?.description}
              {selectedAction?.count !== undefined && (
                <span className="block mt-2 font-medium text-foreground">
                  This will affect {selectedAction.count} items.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {isProcessing && (
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing...</span>
                <span className="font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={selectedAction?.destructive ? "destructive" : "default"}
              onClick={executeAction}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Execute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminBulkActionsPanel;
