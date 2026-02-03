/**
 * Admin Commissions Management Page
 * Configure service and partner commission rates
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Percent, DollarSign, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useServiceCommissions,
  useUpdateServiceCommission,
  usePartnerCommissions,
  type ServiceCommission,
} from "@/hooks/useCommissions";
import { SERVICE_LABELS, SERVICE_COLORS } from "@/hooks/useRevenue";
import { toast } from "sonner";

function CommissionEditor({
  commission,
  onSave,
}: {
  commission: ServiceCommission;
  onSave: (updates: Partial<ServiceCommission>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(commission.commission_value.toString());
  const [fee, setFee] = useState(commission.service_fee.toString());
  const [type, setType] = useState(commission.commission_type);

  const handleSave = () => {
    onSave({
      commission_type: type,
      commission_value: parseFloat(value),
      service_fee: parseFloat(fee),
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
        Edit
      </Button>
    );
  }

  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {SERVICE_LABELS[commission.service_type]} Commission</DialogTitle>
          <DialogDescription>
            Configure commission rate and service fees
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Commission Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                <SelectItem value="margin">Margin (built-in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Commission Value</Label>
            <div className="relative">
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                step="0.01"
                min="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {type === "percentage" ? "%" : "$"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Service Fee (additional)</Label>
            <div className="relative">
              <Input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                step="0.01"
                min="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Fixed fee added on top of percentage commission
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CommissionsPage() {
  const { data: commissions, isLoading } = useServiceCommissions();
  const updateCommission = useUpdateServiceCommission();

  const handleSave = (serviceType: string, updates: Partial<ServiceCommission>) => {
    updateCommission.mutate({ serviceType, updates });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/revenue">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Commission Settings</h1>
              <p className="text-sm text-muted-foreground">
                Configure platform commission rates
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Commission Structure
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                These are default rates. You can set custom rates for individual partners
                (drivers, car owners, restaurants, fleets) in their management pages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Commissions */}
        <Card>
          <CardHeader>
            <CardTitle>Service Commissions</CardTitle>
            <CardDescription>
              Default commission rates per service type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Service Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions?.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-8 rounded-full"
                            style={{ backgroundColor: SERVICE_COLORS[c.service_type] }}
                          />
                          <span className="font-medium">
                            {SERVICE_LABELS[c.service_type] || c.service_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {c.commission_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {c.commission_type === "percentage" ? (
                          <span>{c.commission_value}%</span>
                        ) : c.commission_type === "margin" ? (
                          <span className="text-muted-foreground">N/A</span>
                        ) : (
                          <span>${c.commission_value}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {c.service_fee > 0 ? `$${c.service_fee}` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.is_active ? "default" : "secondary"}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <CommissionEditor
                          commission={c}
                          onSave={(updates) => handleSave(c.service_type, updates)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Commission Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Examples</CardTitle>
            <CardDescription>
              How commissions are calculated for each service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Rides Example (25%)</p>
                <p className="text-sm text-muted-foreground">
                  Fare: $20.00 → ZIVO: $5.00 → Driver: $15.00
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Flights Example ($9.99 fee)</p>
                <p className="text-sm text-muted-foreground">
                  Ticket: $350.00 → ZIVO: $9.99 service fee
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">P2P Cars Example (20%)</p>
                <p className="text-sm text-muted-foreground">
                  Rental: $150.00 → ZIVO: $30.00 → Owner: $120.00
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Eats Example (25%)</p>
                <p className="text-sm text-muted-foreground">
                  Order: $40.00 → ZIVO: $10.00 → Restaurant: $30.00
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
