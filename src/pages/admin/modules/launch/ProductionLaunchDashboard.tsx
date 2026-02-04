/**
 * ZIVO Production Launch Dashboard
 * Comprehensive Go-Live & Scale System for admin users
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Rocket,
  Settings,
  ClipboardCheck,
  TestTube2,
  BarChart3,
  History,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { EnvironmentVerificationPanel } from "@/components/launch/EnvironmentVerificationPanel";
import { LaunchChecklistPanel } from "@/components/launch/LaunchChecklistPanel";
import { TestBookingRunner } from "@/components/launch/TestBookingRunner";
import { PostLaunchMonitoringPanel } from "@/components/launch/PostLaunchMonitoringPanel";
import { LaunchPhaseControl } from "@/components/launch/LaunchPhaseControl";
import {
  useLaunchStatus,
  useLaunchReadiness,
  useLaunchMonitoringAlerts,
} from "@/hooks/useProductionLaunch";

const PHASE_LABELS = {
  pre_launch: 'Pre-Launch',
  soft_launch: 'Soft Launch',
  full_launch: 'Full Launch',
  scaling: 'Scaling',
};

export default function ProductionLaunchDashboard() {
  const { data: status, isLoading: statusLoading } = useLaunchStatus();
  const readiness = useLaunchReadiness();
  const { data: alerts } = useLaunchMonitoringAlerts();

  const activeAlerts = alerts?.filter((a) => !a.is_resolved) || [];
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Rocket className="h-8 w-8" />
              Production Launch Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Go-live verification, testing, and monitoring for ZIVO
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status?.is_paused && (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                PAUSED
              </Badge>
            )}
            {status && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                {PHASE_LABELS[status.current_phase]}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {!statusLoading && readiness && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Launch Readiness</p>
                    <p className="text-2xl font-bold">{readiness.overallPercentage}%</p>
                  </div>
                  <Progress value={readiness.overallPercentage} className="w-16 h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical Items</p>
                    <p className="text-2xl font-bold">
                      {readiness.categorySummaries.reduce((acc, c) => acc + c.criticalVerified, 0)} / {' '}
                      {readiness.categorySummaries.reduce((acc, c) => acc + c.critical, 0)}
                    </p>
                  </div>
                  {readiness.criticalBlockers.length === 0 ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Blockers</p>
                    <p className="text-2xl font-bold">{readiness.criticalBlockers.length}</p>
                  </div>
                  {readiness.criticalBlockers.length > 0 ? (
                    <Badge variant="destructive">Action Required</Badge>
                  ) : (
                    <Badge className="bg-green-500">Ready</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl font-bold">{activeAlerts.length}</p>
                  </div>
                  {criticalAlerts.length > 0 ? (
                    <Badge variant="destructive">{criticalAlerts.length} Critical</Badge>
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="environment" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Environment</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            <span className="hidden sm:inline">Testing</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <LaunchPhaseControl />

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
              <CardDescription>Related admin dashboards and external resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/admin/compliance">⚖️ Compliance</a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/admin/dr">🔄 Disaster Recovery</a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/admin/automation">🤖 Automation</a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/admin/support">💬 Support</a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a
                    href="https://supabase.com/dashboard/project/slirphzzwcogdbkeicff"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Supabase
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Stripe
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment">
          <EnvironmentVerificationPanel />
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <LaunchChecklistPanel />
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing">
          <TestBookingRunner />
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring">
          <PostLaunchMonitoringPanel />
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <LaunchPhaseControl />
        </TabsContent>
      </Tabs>
    </div>
  );
}
