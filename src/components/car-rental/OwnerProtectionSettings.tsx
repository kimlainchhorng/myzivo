/**
 * Owner Protection Settings
 * Configure minimum protection tier and insurance requirements
 */

import { useState } from "react";
import { Shield, AlertCircle, Check, Upload, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OwnerProtectionSettingsProps {
  vehicleId: string;
  currentSettings: {
    minimum_protection_tier: string;
    owner_insurance_policy: string | null;
    owner_insurance_verified: boolean;
    owner_insurance_expiry: string | null;
  };
  className?: string;
}

const protectionTiers = [
  {
    value: "basic",
    label: "Basic Protection",
    description: "Accept renters with any protection level",
    deductible: "$2,500",
  },
  {
    value: "standard",
    label: "Standard or Higher",
    description: "Require at least Standard protection ($1,000 deductible)",
    deductible: "$1,000",
  },
  {
    value: "premium",
    label: "Premium Only",
    description: "Only accept renters with Premium protection ($250 deductible)",
    deductible: "$250",
  },
];

export default function OwnerProtectionSettings({
  vehicleId,
  currentSettings,
  className,
}: OwnerProtectionSettingsProps) {
  const queryClient = useQueryClient();
  const [minimumTier, setMinimumTier] = useState(
    currentSettings.minimum_protection_tier || "basic"
  );
  const [insurancePolicy, setInsurancePolicy] = useState(
    currentSettings.owner_insurance_policy || ""
  );
  const [insuranceExpiry, setInsuranceExpiry] = useState(
    currentSettings.owner_insurance_expiry || ""
  );

  const updateSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("p2p_vehicles")
        .update({
          minimum_protection_tier: minimumTier,
          owner_insurance_policy: insurancePolicy || null,
          owner_insurance_expiry: insuranceExpiry || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vehicleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      toast.success("Protection settings updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Protection Requirements
        </CardTitle>
        <CardDescription>
          Set the minimum protection level renters must have to book your vehicle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Minimum Protection Tier */}
        <div className="space-y-3">
          <Label>Minimum Protection Level</Label>
          <RadioGroup
            value={minimumTier}
            onValueChange={setMinimumTier}
            className="space-y-3"
          >
            {protectionTiers.map((tier) => (
              <div
                key={tier.value}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                  minimumTier === tier.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={tier.value} id={tier.value} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={tier.value} className="font-medium cursor-pointer">
                    {tier.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Deductible: {tier.deductible}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Owner's Insurance Policy */}
        <div className="space-y-3">
          <Label>Your Insurance Policy (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Add your own insurance policy number for backup coverage verification
          </p>
          <Input
            placeholder="Policy number (e.g., POL-123456)"
            value={insurancePolicy}
            onChange={(e) => setInsurancePolicy(e.target.value)}
          />
          
          {insurancePolicy && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-sm">Policy Expiration</Label>
                <Input
                  type="date"
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Badge
                variant={currentSettings.owner_insurance_verified ? "default" : "secondary"}
                className="mt-6"
              >
                {currentSettings.owner_insurance_verified ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Verified
                  </>
                ) : (
                  "Pending Verification"
                )}
              </Badge>
            </div>
          )}
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            ZIVO does not provide insurance coverage. Protection plans are offered 
            by licensed third-party providers. Your personal insurance should cover 
            peer-to-peer rentals as a baseline.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        <Button
          onClick={() => updateSettings.mutate()}
          disabled={updateSettings.isPending}
          className="w-full"
        >
          {updateSettings.isPending ? "Saving..." : "Save Protection Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
