/**
 * SetupPage - Admin setup and environment check page
 */

import { useState, useEffect } from "react";
import { Settings, CheckCircle, XCircle, Database, Code, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { REQUIRED_ENV_VARS, PLATFORM_COMMISSION_RATE, DRIVER_SHARE_RATE } from "@/config/adminConfig";
import { cn } from "@/lib/utils";

const SetupPage = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const { error } = await supabase.from("drivers").select("id").limit(1);
      setIsConnected(!error);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const envVarStatus = REQUIRED_ENV_VARS.map((env) => ({
    ...env,
    isSet: !!import.meta.env[env.key],
    value: import.meta.env[env.key] ? "Set ✓" : "Not set",
  }));

  const payoutsTableSQL = `-- Payouts table (already exists in this project)
-- Run this SQL in Supabase SQL Editor if needed

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id),
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payout_method TEXT,
  reference_id TEXT,
  notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view all payouts"
  ON public.payouts FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert payouts"
  ON public.payouts FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update payouts"
  ON public.payouts FOR UPDATE
  USING (public.is_admin(auth.uid()));`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Admin Setup
            </h1>
            <p className="text-muted-foreground text-sm">
              Environment configuration and database setup
            </p>
          </div>
          <Button onClick={checkConnection} variant="outline" size="sm" disabled={isChecking}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isChecking && "animate-spin")} />
            Recheck
          </Button>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Supabase Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {isConnected === null ? (
                <Badge variant="outline">Checking...</Badge>
              ) : isConnected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-600">Connected</span>
                  <Badge variant="outline" className="ml-auto">
                    Using anon key
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-600">Not connected</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Required variables for the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {envVarStatus.map((env) => (
              <div
                key={env.key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  env.isSet ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                )}
              >
                <div>
                  <code className="text-sm font-mono font-medium">{env.key}</code>
                  <p className="text-xs text-muted-foreground mt-1">{env.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {env.isSet ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Badge variant={env.isSet ? "default" : "destructive"}>
                    {env.value}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Settings</CardTitle>
            <CardDescription>Current platform fee configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold text-primary">
                  {(PLATFORM_COMMISSION_RATE * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">Platform Commission</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(DRIVER_SHARE_RATE * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">Driver Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SQL Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Payouts Table SQL
            </CardTitle>
            <CardDescription>
              Reference SQL for the payouts table (already exists in this project)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs">
                <code>{payoutsTableSQL}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => navigator.clipboard.writeText(payoutsTableSQL)}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/admin/rides"
                className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-center"
              >
                <p className="font-medium">Rides</p>
                <p className="text-xs text-muted-foreground">Manage rides</p>
              </a>
              <a
                href="/admin/drivers"
                className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-center"
              >
                <p className="font-medium">Drivers</p>
                <p className="text-xs text-muted-foreground">View drivers</p>
              </a>
              <a
                href="/admin/payouts"
                className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-center"
              >
                <p className="font-medium">Payouts</p>
                <p className="text-xs text-muted-foreground">Process payouts</p>
              </a>
              <a
                href="/admin"
                className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-center"
              >
                <p className="font-medium">Dashboard</p>
                <p className="text-xs text-muted-foreground">Overview</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupPage;
