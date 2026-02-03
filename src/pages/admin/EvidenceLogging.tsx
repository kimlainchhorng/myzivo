/**
 * Evidence Logging System (Admin)
 * Clauses 181-182: User action and partner acknowledgment logging
 */

import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Users, Shield, Clock, Database, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LEGAL_EVIDENCE_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function EvidenceLogging() {
  const userLogging = LEGAL_EVIDENCE_POLICIES.userActionLogging;
  const partnerLogs = LEGAL_EVIDENCE_POLICIES.partnerAcknowledgmentLogs;

  // Mock recent logs
  const recentUserLogs = [
    { id: "log-1", action: "Terms Accepted", user: "user_abc123", timestamp: "2025-02-03 14:32:15", version: "1.5" },
    { id: "log-2", action: "Privacy Policy Viewed", user: "user_def456", timestamp: "2025-02-03 14:28:42", version: "1.3" },
    { id: "log-3", action: "Checkout Confirmed", user: "user_ghi789", timestamp: "2025-02-03 14:25:11", version: "1.5" },
    { id: "log-4", action: "Consent Checkbox Accepted", user: "user_jkl012", timestamp: "2025-02-03 14:21:33", version: "1.3" },
  ];

  const recentPartnerLogs = [
    { id: "plog-1", role: "Driver", policy: "Driver Terms", partner: "driver_abc", timestamp: "2025-02-03 12:15:00", ip: "192.168.1.xxx" },
    { id: "plog-2", role: "Car Owner", policy: "Owner Terms", partner: "owner_def", timestamp: "2025-02-03 11:42:30", ip: "10.0.0.xxx" },
    { id: "plog-3", role: "Restaurant", policy: "Partner Terms", partner: "rest_ghi", timestamp: "2025-02-03 10:33:18", ip: "172.16.0.xxx" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/legal">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">Evidence Logging System</h1>
              <p className="text-sm text-muted-foreground">
                User & Partner Action Logs • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Immutable Evidence Logs</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All logs are immutable, timestamped, and usable as legal evidence.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="user" className="space-y-4">
          <TabsList>
            <TabsTrigger value="user">User Action Logs</TabsTrigger>
            <TabsTrigger value="partner">Partner Acknowledgments</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  {userLogging.title}
                </CardTitle>
                <CardDescription>{userLogging.content}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {userLogging.loggedActions.map((action, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-muted/50">
                      <p className="text-sm">{action}</p>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold mb-3">Recent User Logs</h4>
                <div className="space-y-2">
                  {recentUserLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.user}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{log.version}</Badge>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partner">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {partnerLogs.title}
                </CardTitle>
                <CardDescription>{partnerLogs.content}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg border bg-primary/5">
                    <h5 className="font-semibold mb-2">Partner Types</h5>
                    <ul className="space-y-1">
                      {partnerLogs.partnerTypes.map((type, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {type}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-amber-500/5">
                    <h5 className="font-semibold mb-2">Logged Fields</h5>
                    <ul className="space-y-1">
                      {partnerLogs.loggedFields.map((field, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-amber-500">•</span>
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <h4 className="font-semibold mb-3">Recent Partner Logs</h4>
                <div className="space-y-2">
                  {recentPartnerLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{log.policy}</p>
                          <p className="text-xs text-muted-foreground">{log.partner} • {log.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{log.ip}</Badge>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
