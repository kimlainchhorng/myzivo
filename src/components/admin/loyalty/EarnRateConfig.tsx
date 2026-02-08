/**
 * EARN RATE CONFIGURATION
 * Admin component to configure points earning rules
 */

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateLoyaltySettings } from "@/hooks/useLoyalty";
import type { LoyaltySettings } from "@/lib/loyalty";

interface EarnRateConfigProps {
  settings: LoyaltySettings;
}

export default function EarnRateConfig({ settings }: EarnRateConfigProps) {
  const updateMutation = useUpdateLoyaltySettings();
  
  const [earnRate, setEarnRate] = useState(settings.earnRate);
  const [bonusRules, setBonusRules] = useState(settings.bonusRules);
  const [tierThresholds, setTierThresholds] = useState(settings.tierThresholds);
  const [redemptionEnabled, setRedemptionEnabled] = useState(settings.redemptionEnabled);

  const handleSaveEarnRate = () => {
    updateMutation.mutate({ key: "earn_rate", value: earnRate });
  };

  const handleSaveBonusRules = () => {
    updateMutation.mutate({ key: "bonus_rules", value: bonusRules });
  };

  const handleSaveTierThresholds = () => {
    updateMutation.mutate({ key: "tier_thresholds", value: tierThresholds });
  };

  const handleToggleRedemption = (enabled: boolean) => {
    setRedemptionEnabled(enabled);
    updateMutation.mutate({ key: "redemption_enabled", value: enabled });
  };

  return (
    <div className="space-y-6">
      {/* Points Per Dollar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earn Rate</CardTitle>
          <CardDescription>
            Configure how many points customers earn per dollar spent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="points_per_dollar">Points per $1 spent</Label>
              <Input
                id="points_per_dollar"
                type="number"
                min={0}
                value={earnRate.points_per_dollar}
                onChange={(e) =>
                  setEarnRate({ ...earnRate, points_per_dollar: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="earn_enabled"
                checked={earnRate.enabled}
                onCheckedChange={(checked) =>
                  setEarnRate({ ...earnRate, enabled: checked })
                }
              />
              <Label htmlFor="earn_enabled">Enabled</Label>
            </div>
          </div>
          <Button onClick={handleSaveEarnRate} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Earn Rate
          </Button>
        </CardContent>
      </Card>

      {/* Bonus Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bonus Rules</CardTitle>
          <CardDescription>
            Configure bonuses for first orders and membership multipliers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="first_order_bonus">First Order Bonus (points)</Label>
              <Input
                id="first_order_bonus"
                type="number"
                min={0}
                value={bonusRules.first_order}
                onChange={(e) =>
                  setBonusRules({ ...bonusRules, first_order: Number(e.target.value) })
                }
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Bonus points awarded on customer's first completed order
              </p>
            </div>
            <div>
              <Label htmlFor="membership_multiplier">Membership Multiplier</Label>
              <Input
                id="membership_multiplier"
                type="number"
                min={1}
                step={0.1}
                value={bonusRules.membership_multiplier}
                onChange={(e) =>
                  setBonusRules({
                    ...bonusRules,
                    membership_multiplier: Number(e.target.value),
                  })
                }
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Points multiplier for ZIVO+ members (e.g., 1.5 = 50% bonus)
              </p>
            </div>
          </div>
          <Button onClick={handleSaveBonusRules} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Bonus Rules
          </Button>
        </CardContent>
      </Card>

      {/* Tier Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tier Thresholds</CardTitle>
          <CardDescription>
            Set lifetime points required for each tier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="tier_explorer">Explorer (starting tier)</Label>
              <Input
                id="tier_explorer"
                type="number"
                min={0}
                value={tierThresholds.explorer}
                onChange={(e) =>
                  setTierThresholds({ ...tierThresholds, explorer: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tier_traveler">Traveler</Label>
              <Input
                id="tier_traveler"
                type="number"
                min={0}
                value={tierThresholds.traveler}
                onChange={(e) =>
                  setTierThresholds({ ...tierThresholds, traveler: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tier_elite">Elite</Label>
              <Input
                id="tier_elite"
                type="number"
                min={0}
                value={tierThresholds.elite}
                onChange={(e) =>
                  setTierThresholds({ ...tierThresholds, elite: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={handleSaveTierThresholds} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Tier Thresholds
          </Button>
        </CardContent>
      </Card>

      {/* Redemption Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Redemption Settings</CardTitle>
          <CardDescription>
            Control whether customers can redeem points for rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Points Redemption</p>
              <p className="text-sm text-muted-foreground">
                When disabled, customers cannot redeem rewards
              </p>
            </div>
            <Switch
              checked={redemptionEnabled}
              onCheckedChange={handleToggleRedemption}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
