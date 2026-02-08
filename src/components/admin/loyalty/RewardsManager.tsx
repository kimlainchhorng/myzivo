/**
 * REWARDS MANAGER
 * Admin component to create, edit, and manage platform rewards
 */

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Gift,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import {
  useAllRewards,
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
} from "@/hooks/useLoyalty";
import type { PlatformReward } from "@/lib/loyalty";

const REWARD_TYPES = [
  { value: "discount", label: "Discount ($)" },
  { value: "free_delivery", label: "Free Delivery" },
  { value: "credits", label: "Wallet Credits" },
  { value: "perk", label: "Perk/Feature" },
];

export default function RewardsManager() {
  const { data: rewards = [], isLoading } = useAllRewards();
  const createMutation = useCreateReward();
  const updateMutation = useUpdateReward();
  const deleteMutation = useDeleteReward();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<PlatformReward | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointsRequired: 100,
    rewardType: "discount" as PlatformReward["rewardType"],
    rewardValue: 5,
    isActive: true,
    maxRedemptions: null as number | null,
  });

  const openCreateDialog = () => {
    setEditingReward(null);
    setFormData({
      name: "",
      description: "",
      pointsRequired: 100,
      rewardType: "discount",
      rewardValue: 5,
      isActive: true,
      maxRedemptions: null,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (reward: PlatformReward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || "",
      pointsRequired: reward.pointsRequired,
      rewardType: reward.rewardType,
      rewardValue: reward.rewardValue,
      isActive: reward.isActive,
      maxRedemptions: reward.maxRedemptions,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingReward) {
      updateMutation.mutate(
        { id: editingReward.id, updates: formData },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this reward?")) {
      deleteMutation.mutate(id);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Rewards</h3>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Create Reward
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No rewards created yet</p>
            <Button onClick={openCreateDialog} className="mt-4">
              Create Your First Reward
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">{reward.name}</h4>
                      {reward.isActive ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {reward.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline">
                        {reward.pointsRequired.toLocaleString()} pts
                      </Badge>
                      <span className="text-muted-foreground">
                        Type: {reward.rewardType}
                      </span>
                      {reward.rewardValue > 0 && (
                        <span className="text-muted-foreground">
                          Value: ${reward.rewardValue}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        Redeemed: {reward.currentRedemptions}
                        {reward.maxRedemptions && `/${reward.maxRedemptions}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(reward)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reward.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? "Edit Reward" : "Create New Reward"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Reward Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., $5 Discount"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this reward..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pointsRequired">Points Required</Label>
                <Input
                  id="pointsRequired"
                  type="number"
                  min={1}
                  value={formData.pointsRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, pointsRequired: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="rewardType">Reward Type</Label>
                <Select
                  value={formData.rewardType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      rewardType: value as PlatformReward["rewardType"],
                    })
                  }
                >
                  <SelectTrigger id="rewardType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REWARD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rewardValue">Value ($)</Label>
                <Input
                  id="rewardValue"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.rewardValue}
                  onChange={(e) =>
                    setFormData({ ...formData, rewardValue: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="maxRedemptions">Max Redemptions (optional)</Label>
                <Input
                  id="maxRedemptions"
                  type="number"
                  min={0}
                  value={formData.maxRedemptions || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxRedemptions: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !formData.name}>
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingReward ? "Update Reward" : "Create Reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
