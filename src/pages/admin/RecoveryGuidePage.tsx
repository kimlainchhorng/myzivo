/**
 * Recovery Guide Page
 * Step-by-step disaster recovery procedures
 */
import { motion } from "framer-motion";
import {
  Database,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  ExternalLink,
  FileText,
  Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const RecoveryGuidePage = () => {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Disaster Recovery Guide</h1>
          </div>
          <p className="text-muted-foreground">
            Step-by-step procedures for restoring ZIVO services after an incident
          </p>
        </motion.div>

        {/* Quick Reference Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                RTO Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">4 hours</div>
              <p className="text-xs text-muted-foreground">
                Recovery Time Objective
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-500/30 bg-teal-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                RPO Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-500">1 hour</div>
              <p className="text-xs text-muted-foreground">
                Recovery Point Objective
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Backup Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">Daily</div>
              <p className="text-xs text-muted-foreground">
                02:00 UTC (DB) / 03:00 UTC (Storage)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Phone className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Level 1: On-Call Admin</p>
                  <p className="text-sm text-muted-foreground">
                    First response, initial triage
                  </p>
                </div>
                <Badge>ops@zivo.com</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Level 2: Engineering Lead</p>
                  <p className="text-sm text-muted-foreground">
                    Database/infrastructure issues
                  </p>
                </div>
                <Badge>engineering@zivo.com</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Level 3: Supabase Support</p>
                  <p className="text-sm text-muted-foreground">
                    Platform-level emergencies
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://supabase.com/dashboard/support"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Supabase Dashboard
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recovery Procedures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recovery Procedures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {/* Database Restore */}
                <AccordionItem value="database">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary" />
                      Database Restore
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">1</Badge>
                        <div>
                          <p className="font-medium">Download Latest Backup</p>
                          <p className="text-sm text-muted-foreground">
                            Navigate to{" "}
                            <Link to="/admin/backups" className="text-primary underline">
                              /admin/backups
                            </Link>
                            {" "}and download the most recent successful database backup.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">2</Badge>
                        <div>
                          <p className="font-medium">Access Supabase SQL Editor</p>
                          <p className="text-sm text-muted-foreground">
                            Open the Supabase Dashboard → SQL Editor for direct database access.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">3</Badge>
                        <div>
                          <p className="font-medium">Parse and Restore Data</p>
                          <p className="text-sm text-muted-foreground">
                            The backup JSON contains table data. Use INSERT statements to restore
                            each table. Handle foreign key constraints by restoring in correct order.
                          </p>
                          <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs">
                            -- Disable triggers temporarily{"\n"}
                            SET session_replication_role = replica;{"\n"}
                            {"\n"}
                            -- Run INSERT statements from backup{"\n"}
                            INSERT INTO profiles (id, ...) VALUES (...);{"\n"}
                            {"\n"}
                            -- Re-enable triggers{"\n"}
                            SET session_replication_role = DEFAULT;
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">4</Badge>
                        <div>
                          <p className="font-medium">Verify Data Integrity</p>
                          <p className="text-sm text-muted-foreground">
                            Compare row counts with backup metadata. Run spot checks on critical tables.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">5</Badge>
                        <div>
                          <p className="font-medium">Notify Stakeholders</p>
                          <p className="text-sm text-muted-foreground">
                            Update status page and notify affected users of any data loss window.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Storage Restore */}
                <AccordionItem value="storage">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-teal-500" />
                      Storage Restore
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">1</Badge>
                        <div>
                          <p className="font-medium">Download Storage Manifest</p>
                          <p className="text-sm text-muted-foreground">
                            Get the latest storage manifest from{" "}
                            <Link to="/admin/backups" className="text-primary underline">
                              /admin/backups
                            </Link>
                            . This contains file listings for all backed-up buckets.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">2</Badge>
                        <div>
                          <p className="font-medium">Access System Backups Bucket</p>
                          <p className="text-sm text-muted-foreground">
                            Supabase Dashboard → Storage → system-backups bucket contains
                            all backup files.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">3</Badge>
                        <div>
                          <p className="font-medium">Re-upload Missing Files</p>
                          <p className="text-sm text-muted-foreground">
                            Use the manifest to identify missing files. Re-upload to original
                            buckets maintaining folder structure.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">4</Badge>
                        <div>
                          <p className="font-medium">Verify File Access</p>
                          <p className="text-sm text-muted-foreground">
                            Test signed URLs and direct access to ensure files are retrievable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Service Restart */}
                <AccordionItem value="services">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-orange-500" />
                      Service Restart
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">1</Badge>
                        <div>
                          <p className="font-medium">Pause Affected Services</p>
                          <p className="text-sm text-muted-foreground">
                            Use{" "}
                            <Link to="/admin/recovery" className="text-primary underline">
                              /admin/recovery
                            </Link>
                            {" "}to pause services undergoing maintenance.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">2</Badge>
                        <div>
                          <p className="font-medium">Clear Caches (if needed)</p>
                          <p className="text-sm text-muted-foreground">
                            Invalidate relevant cache keys in Redis/edge if data has changed.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">3</Badge>
                        <div>
                          <p className="font-medium">Redeploy Edge Functions</p>
                          <p className="text-sm text-muted-foreground">
                            Force redeploy edge functions if code changes were reverted.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">4</Badge>
                        <div>
                          <p className="font-medium">Resume Services</p>
                          <p className="text-sm text-muted-foreground">
                            Unpause services one by one, monitoring for errors.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">5</Badge>
                        <div>
                          <p className="font-medium">Monitor Health</p>
                          <p className="text-sm text-muted-foreground">
                            Watch error rates, latency, and user reports for 30 minutes post-recovery.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Escalation */}
                <AccordionItem value="escalation">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Escalation Path
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-yellow-500">Minor Incident (30 min response)</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Single service degradation, &lt;5% users affected. On-call admin handles.
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-orange-500">Major Incident (15 min response)</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Multiple services affected, &gt;5% users impacted. Engineering lead engaged.
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-red-500">Critical Incident (5 min response)</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Full platform outage, data loss risk, payment failures. All hands + Supabase support.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/backups">
                    <Database className="w-4 h-4 mr-2" />
                    View Backups
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/recovery">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recovery Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Supabase Dashboard
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/status">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Status Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            Last updated: February 2026 | Document owner: Engineering
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RecoveryGuidePage;
