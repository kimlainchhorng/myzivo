/**
 * Targeting Rules Builder
 * Visual rule builder for campaign audience targeting
 */
import { useState } from "react";
import { Users, Clock, MapPin, ShoppingBag, Crown, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CampaignTargetCriteria, MarketingCampaign } from "@/lib/marketing";

interface TargetingRulesBuilderProps {
  value: CampaignTargetCriteria;
  onChange: (criteria: CampaignTargetCriteria) => void;
  campaignType?: MarketingCampaign["campaign_type"];
}

const RULE_TYPES = [
  {
    id: "inactive",
    label: "Inactive Users",
    description: "Users who haven't ordered in X days",
    icon: Clock,
    color: "text-amber-400",
  },
  {
    id: "city",
    label: "By City",
    description: "Target users in a specific city",
    icon: MapPin,
    color: "text-blue-400",
  },
  {
    id: "orders",
    label: "Order Count",
    description: "Filter by total order history",
    icon: ShoppingBag,
    color: "text-emerald-400",
  },
  {
    id: "membership",
    label: "Membership Status",
    description: "Target specific membership levels",
    icon: Crown,
    color: "text-purple-400",
  },
];

export default function TargetingRulesBuilder({
  value,
  onChange,
  campaignType,
}: TargetingRulesBuilderProps) {
  const [activeRules, setActiveRules] = useState<string[]>(() => {
    const rules: string[] = [];
    if (value.last_order_days_ago) rules.push("inactive");
    if (value.city) rules.push("city");
    if (value.min_total_orders || value.max_total_orders) rules.push("orders");
    if (value.membership_status) rules.push("membership");
    return rules;
  });

  const addRule = (ruleId: string) => {
    if (!activeRules.includes(ruleId)) {
      setActiveRules([...activeRules, ruleId]);
    }
  };

  const removeRule = (ruleId: string) => {
    setActiveRules(activeRules.filter(r => r !== ruleId));
    
    // Clear corresponding criteria
    const updates: Partial<CampaignTargetCriteria> = {};
    if (ruleId === "inactive") updates.last_order_days_ago = undefined;
    if (ruleId === "city") updates.city = undefined;
    if (ruleId === "orders") {
      updates.min_total_orders = undefined;
      updates.max_total_orders = undefined;
    }
    if (ruleId === "membership") updates.membership_status = undefined;
    
    onChange({ ...value, ...updates });
  };

  const updateCriteria = (updates: Partial<CampaignTargetCriteria>) => {
    onChange({ ...value, ...updates });
  };

  const availableRules = RULE_TYPES.filter(r => !activeRules.includes(r.id));

  return (
    <div className="space-y-6">
      {/* Active Rules */}
      {activeRules.length > 0 && (
        <div className="space-y-3">
          {activeRules.map(ruleId => {
            const rule = RULE_TYPES.find(r => r.id === ruleId);
            if (!rule) return null;
            const Icon = rule.icon;

            return (
              <Card key={ruleId} className="bg-zinc-900/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${rule.color}`} />
                      <span className="font-medium text-white">{rule.label}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeRule(ruleId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Inactive Users Rule */}
                  {ruleId === "inactive" && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">No orders in the last</span>
                      <Input
                        type="number"
                        min={1}
                        placeholder="30"
                        value={value.last_order_days_ago || ""}
                        onChange={(e) => updateCriteria({ 
                          last_order_days_ago: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        className="w-20 bg-zinc-800 border-white/10"
                      />
                      <span className="text-sm text-white/60">days</span>
                    </div>
                  )}

                  {/* City Rule */}
                  {ruleId === "city" && (
                    <div>
                      <Input
                        placeholder="Enter city name"
                        value={value.city || ""}
                        onChange={(e) => updateCriteria({ city: e.target.value || undefined })}
                        className="bg-zinc-800 border-white/10"
                      />
                    </div>
                  )}

                  {/* Order Count Rule */}
                  {ruleId === "orders" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-white/60">Between</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={value.min_total_orders || ""}
                        onChange={(e) => updateCriteria({ 
                          min_total_orders: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        className="w-20 bg-zinc-800 border-white/10"
                      />
                      <span className="text-sm text-white/60">and</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="100"
                        value={value.max_total_orders || ""}
                        onChange={(e) => updateCriteria({ 
                          max_total_orders: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        className="w-20 bg-zinc-800 border-white/10"
                      />
                      <span className="text-sm text-white/60">orders</span>
                    </div>
                  )}

                  {/* Membership Rule */}
                  {ruleId === "membership" && (
                    <Select
                      value={value.membership_status || ""}
                      onValueChange={(val) => updateCriteria({ membership_status: val || undefined })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-white/10">
                        <SelectValue placeholder="Select membership level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="zivo_plus">ZIVO Plus</SelectItem>
                        <SelectItem value="zivo_pro">ZIVO Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Rule */}
      {availableRules.length > 0 && (
        <div>
          <Label className="text-white/60 text-sm mb-2 block">Add Targeting Rule</Label>
          <div className="flex flex-wrap gap-2">
            {availableRules.map(rule => {
              const Icon = rule.icon;
              return (
                <Button
                  key={rule.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addRule(rule.id)}
                  className="gap-2 bg-zinc-900/60 border-white/10 hover:bg-zinc-800"
                >
                  <Icon className={`h-4 w-4 ${rule.color}`} />
                  {rule.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* No Rules = All Users */}
      {activeRules.length === 0 && (
        <Card className="bg-zinc-900/40 border-white/10 border-dashed">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-white/20 mb-2" />
            <p className="text-white/60">No targeting rules added</p>
            <p className="text-sm text-white/40">Campaign will be sent to all users</p>
          </CardContent>
        </Card>
      )}

      {/* Active Criteria Summary */}
      {activeRules.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <Label className="text-white/60 text-sm mb-2 block">Active Filters</Label>
          <div className="flex flex-wrap gap-2">
            {value.last_order_days_ago && (
              <Badge variant="secondary">
                Inactive {value.last_order_days_ago}+ days
              </Badge>
            )}
            {value.city && (
              <Badge variant="secondary">
                City: {value.city}
              </Badge>
            )}
            {(value.min_total_orders || value.max_total_orders) && (
              <Badge variant="secondary">
                Orders: {value.min_total_orders || 0} - {value.max_total_orders || "∞"}
              </Badge>
            )}
            {value.membership_status && (
              <Badge variant="secondary">
                Membership: {value.membership_status}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
