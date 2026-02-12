import { useState } from "react";
import { Bell, Shield, TrendingUp, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AlertRule {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  enabled: boolean;
}

const DEFAULT_RULES: AlertRule[] = [
  { id: "service_down", label: "Service Down", description: "Alert when any service goes offline", icon: Zap, enabled: true },
  { id: "error_spike", label: "Error Rate Spike", description: "Alert when error rate exceeds 20%", icon: TrendingUp, enabled: true },
  { id: "slow_response", label: "Slow Response Time", description: "Alert when response time >2s", icon: Shield, enabled: true },
  { id: "payment_failure", label: "Payment Failures", description: "Alert on repeated payment errors", icon: Bell, enabled: true },
];

export default function HealthAlertRules() {
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_RULES);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="space-y-3">
      {rules.map((rule) => {
        const Icon = rule.icon;
        return (
          <div
            key={rule.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-colors",
              rule.enabled
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-border/50 bg-card/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={cn("h-4 w-4", rule.enabled ? "text-emerald-400" : "text-muted-foreground")} />
              <div>
                <p className="text-sm font-medium text-foreground">{rule.label}</p>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
              </div>
            </div>
            <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
          </div>
        );
      })}
    </div>
  );
}
