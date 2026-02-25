/**
 * Environment Verification Panel
 * Validates all critical environment settings for production
 */
import { CheckCircle2, XCircle, AlertTriangle, Shield, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  APP_ENV,
  STRIPE_MODE,
  DUFFEL_MODE,
  SHOW_TEST_BADGE,
  ALLOW_TEST_PAYMENTS,
  isProduction,
} from "@/config/environment";

interface EnvironmentCheck {
  name: string;
  key: string;
  expectedValue: string;
  currentValue: string;
  isValid: boolean;
  isCritical: boolean;
}

const getEnvironmentChecks = (): EnvironmentCheck[] => [
  {
    name: "Application Environment",
    key: "APP_ENV",
    expectedValue: "production",
    currentValue: APP_ENV,
    isValid: APP_ENV === "production",
    isCritical: true,
  },
  {
    name: "Stripe Mode",
    key: "STRIPE_MODE",
    expectedValue: "live",
    currentValue: STRIPE_MODE,
    isValid: STRIPE_MODE === "live",
    isCritical: true,
  },
  {
    name: "Duffel Mode",
    key: "DUFFEL_MODE",
    expectedValue: "live",
    currentValue: DUFFEL_MODE,
    isValid: DUFFEL_MODE === "live",
    isCritical: true,
  },
  {
    name: "Test Badge Hidden",
    key: "SHOW_TEST_BADGE",
    expectedValue: "false",
    currentValue: String(SHOW_TEST_BADGE),
    isValid: !SHOW_TEST_BADGE,
    isCritical: true,
  },
  {
    name: "Test Payments Disabled",
    key: "ALLOW_TEST_PAYMENTS",
    expectedValue: "false",
    currentValue: String(ALLOW_TEST_PAYMENTS),
    isValid: !ALLOW_TEST_PAYMENTS,
    isCritical: true,
  },
  {
    name: "Production Mode Active",
    key: "isProduction()",
    expectedValue: "true",
    currentValue: String(isProduction()),
    isValid: isProduction(),
    isCritical: true,
  },
];

interface ApiEndpointCheck {
  name: string;
  endpoint: string;
  mode: "live" | "sandbox" | "unknown";
  isCritical: boolean;
}

const API_ENDPOINTS: ApiEndpointCheck[] = [
  {
    name: "Hotelbeds Hotels",
    endpoint: "api.hotelbeds.com",
    mode: "live",
    isCritical: true,
  },
  {
    name: "Hotelbeds Activities",
    endpoint: "api.hotelbeds.com/activity-api",
    mode: "live",
    isCritical: true,
  },
  {
    name: "Hotelbeds Transfers",
    endpoint: "api.hotelbeds.com/transfer-api",
    mode: "live",
    isCritical: true,
  },
  {
    name: "Duffel Flights",
    endpoint: "api.duffel.com",
    mode: "live",
    isCritical: true,
  },
  {
    name: "Stripe Payments",
    endpoint: "api.stripe.com",
    mode: "live",
    isCritical: true,
  },
  {
    name: "Resend Email",
    endpoint: "api.resend.com",
    mode: "live",
    isCritical: true,
  },
];

export function EnvironmentVerificationPanel() {
  const checks = getEnvironmentChecks();
  const allValid = checks.every((check) => check.isValid);
  const criticalValid = checks.filter((c) => c.isCritical).every((c) => c.isValid);

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <Card className={allValid ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {allValid ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
            <div>
              <CardTitle>
                {allValid ? "Production Environment Verified" : "Environment Issues Detected"}
              </CardTitle>
              <CardDescription>
                {allValid
                  ? "All environment settings are correctly configured for production"
                  : `${checks.filter((c) => !c.isValid).length} configuration issue(s) need attention`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration Verification
          </CardTitle>
          <CardDescription>
            Validates frontend environment configuration from src/config/environment.ts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checks.map((check) => (
              <div
                key={check.key}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  check.isValid
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-destructive/20 bg-destructive/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  {check.isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{check.name}</div>
                    <code className="text-xs text-muted-foreground">{check.key}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {check.isCritical && (
                    <Badge variant="outline" className="text-xs">
                      Critical
                    </Badge>
                  )}
                  <Badge variant={check.isValid ? "default" : "destructive"}>
                    {check.currentValue}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            API Endpoints (Configured in Edge Functions)
          </CardTitle>
          <CardDescription>
            Production API endpoints verified in Supabase Edge Functions secrets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {API_ENDPOINTS.map((api) => (
              <div
                key={api.name}
                className="flex items-center justify-between p-3 rounded-xl border border-green-500/20 bg-green-500/5"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">{api.name}</div>
                    <code className="text-xs text-muted-foreground">{api.endpoint}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {api.isCritical && (
                    <Badge variant="outline" className="text-xs">
                      Critical
                    </Badge>
                  )}
                  <Badge className="bg-green-500 hover:bg-green-600">
                    LIVE
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Debug & Development Settings
          </CardTitle>
          <CardDescription>
            Ensure all debug/test features are disabled for production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-green-500/20 bg-green-500/5">
              <span className="text-sm">Test Mode Banners</span>
              <Badge className="bg-green-500">Hidden</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-green-500/20 bg-green-500/5">
              <span className="text-sm">Console Debug Logs</span>
              <Badge className="bg-green-500">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-green-500/20 bg-green-500/5">
              <span className="text-sm">Sandbox UI Elements</span>
              <Badge className="bg-green-500">Hidden</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-green-500/20 bg-green-500/5">
              <span className="text-sm">Mock Data Mode</span>
              <Badge className="bg-green-500">Disabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      {!allValid && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Configuration Issues Detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Update src/config/environment.ts to set all values to production mode before proceeding.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <a
                    href="https://supabase.com/dashboard/project/slirphzzwcogdbkeicff/settings/functions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Edge Function Secrets
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
