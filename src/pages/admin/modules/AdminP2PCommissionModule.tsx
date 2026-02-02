/**
 * Admin P2P Commission Settings Module
 * Configure platform commission rates and fees
 */

import { useState } from "react";
import { Percent, DollarSign, Settings, Plus, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAllP2PCommissionSettings,
  useUpdateP2PCommissionSettings,
  useCreateP2PCommissionSettings,
  useToggleP2PCommissionActive,
  calculateFeePreview,
} from "@/hooks/useP2PCommission";
import { formatPrice } from "@/lib/currency";

export default function AdminP2PCommissionModule() {
  const { data: settings, isLoading } = useAllP2PCommissionSettings();
  const updateSettings = useUpdateP2PCommissionSettings();
  const createSettings = useCreateP2PCommissionSettings();
  const toggleActive = useToggleP2PCommissionActive();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    owner_commission_pct: number;
    renter_service_fee_pct: number;
    insurance_daily_fee: number;
  } | null>(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSettings, setNewSettings] = useState({
    name: "",
    owner_commission_pct: 20,
    renter_service_fee_pct: 10,
    insurance_daily_fee: 15,
  });

  // Preview calculation
  const previewDailyRate = 75;
  const previewDays = 3;
  const activeSettings = settings?.find((s) => s.is_active) || null;
  const preview = calculateFeePreview(previewDailyRate, previewDays, activeSettings);

  const handleEdit = (setting: any) => {
    setEditingId(setting.id);
    setEditValues({
      owner_commission_pct: setting.owner_commission_pct,
      renter_service_fee_pct: setting.renter_service_fee_pct || 0,
      insurance_daily_fee: setting.insurance_daily_fee || 0,
    });
  };

  const handleSave = async () => {
    if (!editingId || !editValues) return;

    await updateSettings.mutateAsync({
      id: editingId,
      updates: editValues,
    });

    setEditingId(null);
    setEditValues(null);
  };

  const handleCreate = async () => {
    await createSettings.mutateAsync({
      ...newSettings,
      is_active: false,
    });

    setShowCreateDialog(false);
    setNewSettings({
      name: "",
      owner_commission_pct: 20,
      renter_service_fee_pct: 10,
      insurance_daily_fee: 15,
    });
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await toggleActive.mutateAsync({ id, isActive: !currentActive });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fee Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Fee Preview
          </CardTitle>
          <CardDescription>
            Example: {formatPrice(previewDailyRate)}/day × {previewDays} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Renter Pays</p>
              <p className="text-2xl font-bold">{formatPrice(preview.total)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Subtotal + fees
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/5">
              <p className="text-sm text-muted-foreground">Owner Receives</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(preview.ownerPayout)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                After {activeSettings?.owner_commission_pct || 0}% commission
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5">
              <p className="text-sm text-muted-foreground">ZIVO Revenue</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(preview.platformFee + preview.serviceFee)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Commission + service fee
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Commission Settings
            </CardTitle>
            <CardDescription>
              Configure platform commission and fee rates
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Setting
          </Button>
        </CardHeader>
        <CardContent>
          {!settings || settings.length === 0 ? (
            <div className="text-center py-8">
              <Percent className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No commission settings configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => {
                const isEditing = editingId === setting.id;

                return (
                  <div
                    key={setting.id}
                    className={`p-4 rounded-lg border ${
                      setting.is_active ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{setting.name}</h4>
                        {setting.is_active && (
                          <Badge className="bg-green-500/10 text-green-500">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={setting.is_active}
                          onCheckedChange={() =>
                            handleToggleActive(setting.id, setting.is_active)
                          }
                          disabled={toggleActive.isPending}
                        />
                        {isEditing ? (
                          <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(setting)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Platform Commission
                        </Label>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              min={15}
                              max={30}
                              value={editValues?.owner_commission_pct}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues!,
                                  owner_commission_pct: Number(e.target.value),
                                })
                              }
                              className="w-24"
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          <p className="text-lg font-semibold mt-1">
                            {setting.owner_commission_pct}%
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">15-30%</p>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">
                          Renter Service Fee
                        </Label>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              min={0}
                              max={25}
                              value={editValues?.renter_service_fee_pct}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues!,
                                  renter_service_fee_pct: Number(e.target.value),
                                })
                              }
                              className="w-24"
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          <p className="text-lg font-semibold mt-1">
                            {setting.renter_service_fee_pct || 0}%
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-muted-foreground">
                          Insurance (per day)
                        </Label>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span>$</span>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={editValues?.insurance_daily_fee}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues!,
                                  insurance_daily_fee: Number(e.target.value),
                                })
                              }
                              className="w-24"
                            />
                          </div>
                        ) : (
                          <p className="text-lg font-semibold mt-1">
                            {formatPrice(setting.insurance_daily_fee || 0)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How fees work:</p>
              <ul className="space-y-1">
                <li>
                  • <strong>Platform Commission:</strong> Deducted from owner's earnings (15-30%)
                </li>
                <li>
                  • <strong>Renter Service Fee:</strong> Added on top of rental price for renter
                </li>
                <li>
                  • <strong>Insurance:</strong> Daily fee added to renter's total
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Commission Setting</DialogTitle>
            <DialogDescription>
              Add a new commission configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="e.g., Premium, Holiday, Standard"
                value={newSettings.name}
                onChange={(e) =>
                  setNewSettings({ ...newSettings, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Commission %</Label>
                <Input
                  type="number"
                  min={15}
                  max={30}
                  value={newSettings.owner_commission_pct}
                  onChange={(e) =>
                    setNewSettings({
                      ...newSettings,
                      owner_commission_pct: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Service Fee %</Label>
                <Input
                  type="number"
                  min={0}
                  max={25}
                  value={newSettings.renter_service_fee_pct}
                  onChange={(e) =>
                    setNewSettings({
                      ...newSettings,
                      renter_service_fee_pct: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Insurance $/day</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={newSettings.insurance_daily_fee}
                  onChange={(e) =>
                    setNewSettings({
                      ...newSettings,
                      insurance_daily_fee: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newSettings.name || createSettings.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
