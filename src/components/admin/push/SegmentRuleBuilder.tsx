/**
 * Segment Rule Builder
 * Visual rule builder for push notification segments
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
import { useSegmentPreview } from "@/hooks/usePushBroadcast";
import type { SegmentRules } from "@/lib/pushBroadcast";

interface SegmentRuleBuilderProps {
  rules: SegmentRules;
  onChange: (rules: SegmentRules) => void;
  showPreview?: boolean;
}

const CITIES = [
  "Baton Rouge",
  "New Orleans",
  "Lafayette",
  "Shreveport",
  "Lake Charles",
];

export function SegmentRuleBuilder({ 
  rules, 
  onChange,
  showPreview = true,
}: SegmentRuleBuilderProps) {
  const [localRules, setLocalRules] = useState<SegmentRules>(rules);
  const [inactivityEnabled, setInactivityEnabled] = useState(!!rules.last_order_days_ago);
  const [inactivityDays, setInactivityDays] = useState(rules.last_order_days_ago || 14);
  
  const { data: preview, isLoading: previewLoading } = useSegmentPreview(
    localRules,
    showPreview
  );

  useEffect(() => {
    onChange(localRules);
  }, [localRules, onChange]);

  const toggleRole = (role: "customer" | "driver" | "merchant" | "admin") => {
    const currentRoles = localRules.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    setLocalRules({ ...localRules, roles: newRoles.length > 0 ? newRoles : undefined });
  };

  const hasRole = (role: string) => localRules.roles?.includes(role as any) || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Segment Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Roles */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Target Roles</Label>
          <div className="flex flex-wrap gap-4">
            {[
              { id: "customer", label: "Customers" },
              { id: "driver", label: "Drivers" },
              { id: "merchant", label: "Merchants" },
              { id: "admin", label: "Admins" },
            ].map((role) => (
              <div key={role.id} className="flex items-center gap-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={hasRole(role.id)}
                  onCheckedChange={() => toggleRole(role.id as any)}
                />
                <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer">
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Driver-specific options */}
        {hasRole("driver") && (
          <div className="space-y-3 pl-4 border-l-2 border-primary/20">
            <Label className="text-sm font-medium">Driver Status</Label>
            <RadioGroup
              value={
                localRules.driver_is_online === undefined
                  ? "all"
                  : localRules.driver_is_online
                  ? "online"
                  : "offline"
              }
              onValueChange={(value) => {
                if (value === "all") {
                  const { driver_is_online, ...rest } = localRules;
                  setLocalRules(rest);
                } else {
                  setLocalRules({ ...localRules, driver_is_online: value === "online" });
                }
              }}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="driver-all" />
                <Label htmlFor="driver-all" className="text-sm cursor-pointer">All</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="online" id="driver-online" />
                <Label htmlFor="driver-online" className="text-sm cursor-pointer">Online Only</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="offline" id="driver-offline" />
                <Label htmlFor="driver-offline" className="text-sm cursor-pointer">Offline Only</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Customer Activity */}
        {hasRole("customer") && (
          <div className="space-y-3 pl-4 border-l-2 border-primary/20">
            <Label className="text-sm font-medium">Customer Activity</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={inactivityEnabled}
                  onCheckedChange={(checked) => {
                    setInactivityEnabled(checked);
                    if (checked) {
                      setLocalRules({ ...localRules, last_order_days_ago: inactivityDays });
                    } else {
                      const { last_order_days_ago, ...rest } = localRules;
                      setLocalRules(rest);
                    }
                  }}
                />
                <Label className="text-sm">Inactive for at least</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={inactivityDays}
                  onChange={(e) => {
                    const days = parseInt(e.target.value) || 14;
                    setInactivityDays(days);
                    if (inactivityEnabled) {
                      setLocalRules({ ...localRules, last_order_days_ago: days });
                    }
                  }}
                  disabled={!inactivityEnabled}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Checkbox
                  id="has-ordered"
                  checked={localRules.has_ordered_ever || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLocalRules({ ...localRules, has_ordered_ever: true });
                    } else {
                      const { has_ordered_ever, ...rest } = localRules;
                      setLocalRules(rest);
                    }
                  }}
                />
                <Label htmlFor="has-ordered" className="text-sm cursor-pointer">
                  Has placed at least one order
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Membership */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Membership</Label>
          <RadioGroup
            value={
              localRules.has_membership === undefined
                ? "any"
                : localRules.has_membership
                ? "members"
                : "non-members"
            }
            onValueChange={(value) => {
              if (value === "any") {
                const { has_membership, ...rest } = localRules;
                setLocalRules(rest);
              } else {
                setLocalRules({ ...localRules, has_membership: value === "members" });
              }
            }}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="any" id="membership-any" />
              <Label htmlFor="membership-any" className="text-sm cursor-pointer">Any</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="members" id="membership-members" />
              <Label htmlFor="membership-members" className="text-sm cursor-pointer">ZIVO+ Members Only</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="non-members" id="membership-non" />
              <Label htmlFor="membership-non" className="text-sm cursor-pointer">Non-Members</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Location</Label>
          <Select
            value={localRules.city || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                const { city, ...rest } = localRules;
                setLocalRules(rest);
              } else {
                setLocalRules({ ...localRules, city: value });
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Reach */}
        {showPreview && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated Reach:</span>
              {previewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Badge variant="secondary" className="font-mono">
                  ~{preview?.count?.toLocaleString() || 0} users
                </Badge>
              )}
            </div>
            {preview?.users && preview.users.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Preview: {preview.users.map((u) => u.full_name || u.email || "Unknown").join(", ")}
                {(preview.count || 0) > 5 && ` and ${(preview.count || 0) - 5} more...`}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SegmentRuleBuilder;
