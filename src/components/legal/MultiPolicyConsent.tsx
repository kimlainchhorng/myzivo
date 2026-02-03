/**
 * Multi-Policy Consent Component
 * Collects consent for multiple policies at once
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, CheckCircle2 } from "lucide-react";
import PolicyConsentCheckbox from "./PolicyConsentCheckbox";
import { PolicyType } from "@/types/legal";
import { useRecordConsent, useLegalPolicies } from "@/hooks/useLegalCompliance";
import { CONSENT_REQUIREMENTS } from "@/config/legalContent";

interface MultiPolicyConsentProps {
  serviceType: keyof typeof CONSENT_REQUIREMENTS;
  onAllAccepted: () => void;
  title?: string;
  description?: string;
}

export default function MultiPolicyConsent({
  serviceType,
  onAllAccepted,
  title = "Required Agreements",
  description = "Please review and accept the following to continue.",
}: MultiPolicyConsentProps) {
  const requiredPolicies = CONSENT_REQUIREMENTS[serviceType] as readonly PolicyType[];
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const { data: policies } = useLegalPolicies(true);
  const recordConsent = useRecordConsent();

  useEffect(() => {
    // Initialize consent state
    const initial: Record<string, boolean> = {};
    requiredPolicies.forEach((p) => (initial[p] = false));
    setConsents(initial);
  }, [requiredPolicies]);

  const allAccepted = requiredPolicies.every((p) => consents[p]);

  const handleSubmit = async () => {
    if (!allAccepted) return;

    // Record consent for each policy
    for (const policyType of requiredPolicies) {
      const policy = policies?.find((p) => p.policy_type === policyType);
      if (policy) {
        await recordConsent.mutateAsync({
          policyType,
          policyVersion: policy.version,
        });
      }
    }

    onAllAccepted();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiredPolicies.map((policyType) => (
          <PolicyConsentCheckbox
            key={policyType}
            policyType={policyType}
            checked={consents[policyType] || false}
            onCheckedChange={(checked) =>
              setConsents((prev) => ({ ...prev, [policyType]: checked }))
            }
            disabled={recordConsent.isPending}
          />
        ))}

        <Button
          onClick={handleSubmit}
          disabled={!allAccepted || recordConsent.isPending}
          className="w-full gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {recordConsent.isPending ? "Recording..." : "Accept and Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}
