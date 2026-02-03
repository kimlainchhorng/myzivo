/**
 * Admin Legal Control Dashboard
 * Manage policies, consent logs, and SOT status
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  Users, 
  Download, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Scale,
  Eye,
  Edit2,
  BookOpen,
  Gavel,
  ShieldX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useLegalPolicies,
  useLegalSummary,
  useSOTStatus,
  useAllConsentLogs,
  useLegalDisputes,
  useLegalAuditLogs,
} from "@/hooks/useLegalCompliance";
import { 
  ADVANCED_CLAUSES_LIST, 
  LEGAL_PROTECTION_SUMMARY, 
  EXTENDED_POLICIES_LIST,
  EXTREME_POLICIES_LIST,
  ULTRA_POLICIES_LIST,
  ADVANCED_POLICIES_LIST,
  GOVERNMENT_POLICIES_LIST,
  CORPORATE_POLICIES_LIST,
  FINAL_POLICIES_LIST,
  COMMUNICATIONS_POLICIES_LIST,
  ONGOING_COMPLIANCE_POLICIES_LIST,
  FINANCIAL_COMPLIANCE_POLICIES_LIST,
  GOVERNANCE_POLICIES_LIST,
  LEGAL_FAQ
} from "@/config/legalContent";
import { format } from "date-fns";

export default function LegalControlDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: policies, isLoading: policiesLoading, refetch: refetchPolicies } = useLegalPolicies(false);
  const { data: summary } = useLegalSummary();
  const { data: sotStatus } = useSOTStatus();
  const { data: consentLogs, isLoading: logsLoading } = useAllConsentLogs(200);
  const { data: disputes } = useLegalDisputes();
  const { data: auditLogs } = useLegalAuditLogs(50);

  const exportConsentLogs = () => {
    if (!consentLogs?.length) {
      toast.error("No consent logs to export");
      return;
    }

    const headers = ["User ID", "Policy Type", "Version", "Consent Given", "Method", "IP Address", "Device", "Date"];
    const csvContent = [
      headers.join(","),
      ...consentLogs.map(log => [
        log.user_id,
        log.policy_type,
        log.policy_version,
        log.consent_given ? "Yes" : "No",
        log.consent_method,
        log.ip_address || "N/A",
        log.device_type || "N/A",
        log.created_at,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zivo-consent-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Consent logs exported");
  };

  const filteredLogs = consentLogs?.filter(log => 
    log.policy_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gavel className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Legal Control Center</h1>
                <p className="text-sm text-muted-foreground">Manage policies, consents & compliance</p>
              </div>
            </div>
          </div>
          <Button onClick={() => refetchPolicies()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.activePolicies || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Policies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consentLogs?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Consent Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.openDisputes || 0}</p>
                  <p className="text-xs text-muted-foreground">Open Disputes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.sotStatesActive || 0}</p>
                  <p className="text-xs text-muted-foreground">SOT Active States</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="protections" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="protections">Protections</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="consents">Consents</TabsTrigger>
            <TabsTrigger value="sot">SOT Status</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Legal Protections Overview */}
          <TabsContent value="protections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Maximum Liability Shield
                </CardTitle>
                <CardDescription>
                  Advanced legal protections active across all ZIVO services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Liability Shield */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Scale className="h-4 w-4 text-emerald-500" />
                      Liability Protection
                    </h4>
                    <ul className="space-y-2">
                      {LEGAL_PROTECTION_SUMMARY.liabilityShield.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dispute Resolution */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-blue-500" />
                      Dispute Resolution
                    </h4>
                    <ul className="space-y-2">
                      {LEGAL_PROTECTION_SUMMARY.disputeResolution.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Operational Protection */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Operational Protection
                    </h4>
                    <ul className="space-y-2">
                      {LEGAL_PROTECTION_SUMMARY.operationalProtection.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Content Protection */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-violet-500" />
                      Content Protection
                    </h4>
                    <ul className="space-y-2">
                      {LEGAL_PROTECTION_SUMMARY.contentProtection.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Community Compliance */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-pink-500" />
                      Community Compliance
                    </h4>
                    <ul className="space-y-2">
                      {LEGAL_PROTECTION_SUMMARY.communityCompliance.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Clauses */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Legal Clauses (13-30)</CardTitle>
                <CardDescription>
                  Enterprise-grade legal protections implemented
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ADVANCED_CLAUSES_LIST.map((clause) => (
                    <div
                      key={clause.id}
                      className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{clause.title}</h5>
                        <Badge variant="outline" className="text-xs shrink-0">
                          v{clause.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {clause.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extended Policies (31-40) */}
            <Card>
              <CardHeader>
                <CardTitle>Extended Policies (31-40)</CardTitle>
                <CardDescription>
                  Additional legal protections and community standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {EXTENDED_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="outline" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         (policy as any).enforcement?.substring(0, 80) || 
                         "Policy configured"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extreme Policies (43-57) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Extreme Legal Safeguards (43-57)
                </CardTitle>
                <CardDescription>
                  Maximum protection policies for lawsuit prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {EXTREME_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 hover:border-destructive/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="destructive" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Maximum protection policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ultra Policies (58-74) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Ultra-Level Protections (58-74)
                </CardTitle>
                <CardDescription>
                  Consumer, payment, AI, and cross-border protection policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ULTRA_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Ultra-level protection policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Policies (75-92) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Advanced Platform Policies (75-92)
                </CardTitle>
                <CardDescription>
                  Labor, antitrust, accessibility, AI law, and platform governance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ADVANCED_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 hover:border-green-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Advanced platform protection policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Government & Shutdown Policies (93-108) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldX className="h-5 w-5 text-destructive" />
                  Government & Shutdown Policies (93-108)
                </CardTitle>
                <CardDescription>
                  Government enforcement, emergency shutdown, content law, and safety protections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {GOVERNMENT_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 hover:border-destructive/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Government & shutdown protection policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Corporate & IP Policies (109-122) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Corporate & IP Policies (109-122)
                </CardTitle>
                <CardDescription>
                  Intellectual property, subpoena, whistleblower, and corporate protections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CORPORATE_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Corporate & IP protection policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Final Legal Policies (123-135) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  Final Legal Policies (123-135)
                </CardTitle>
                <CardDescription>
                  Payments, travel, rental, and platform neutrality protections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FINAL_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Final legal protection policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Communications Compliance Policies (136-146) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Communications & Compliance Policies (136-146)
                </CardTitle>
                <CardDescription>
                  Messaging, data breach, privacy, and insurance compliance protections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {COMMUNICATIONS_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Communications compliance policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ongoing Compliance Policies (147-157) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  Ongoing Compliance & Operations (147-157)
                </CardTitle>
                <CardDescription>
                  Monitoring, enforcement, documentation, and operational protections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ONGOING_COMPLIANCE_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Ongoing compliance policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Compliance Policies (158-169) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-rose-500" />
                  Financial Crime & KYC/AML (158-169)
                </CardTitle>
                <CardDescription>
                  KYC, AML, sanctions, complaints, and recordkeeping protections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FINANCIAL_COMPLIANCE_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Financial compliance policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Governance Policies (170-179) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  Corporate Governance & Ethics (170-179)
                </CardTitle>
                <CardDescription>
                  Governance, ethics, and regulator communication framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {GOVERNANCE_POLICIES_LIST.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-1">{policy.title}</h5>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          v{policy.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(policy as any).content?.substring(0, 80) || 
                         "Governance policy"}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Policy Versions</CardTitle>
                <CardDescription>
                  Manage active and historical policy versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policiesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
                ) : policies?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Policy Type</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policies.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-medium capitalize">
                            {policy.policy_type.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell>v{policy.version}</TableCell>
                          <TableCell>
                            {format(new Date(policy.effective_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={policy.is_active ? "default" : "secondary"}>
                              {policy.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No policies configured. Policies are defined in legalContent.ts
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consents Tab */}
          <TabsContent value="consents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Consent Logs</CardTitle>
                    <CardDescription>
                      Audit trail of user policy acceptances
                    </CardDescription>
                  </div>
                  <Button onClick={exportConsentLogs} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search by user ID or policy type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />

                {logsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading consent logs...</div>
                ) : filteredLogs?.length ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Policy</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.slice(0, 50).map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {log.user_id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="capitalize">
                              {log.policy_type.replace(/_/g, " ")}
                            </TableCell>
                            <TableCell>v{log.policy_version}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.consent_method}</Badge>
                            </TableCell>
                            <TableCell className="capitalize">{log.device_type || "—"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No consent logs found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOT Status Tab */}
          <TabsContent value="sot">
            <Card>
              <CardHeader>
                <CardTitle>Seller of Travel Registration Status</CardTitle>
                <CardDescription>
                  State-by-state registration tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sotStatus?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>State</TableHead>
                        <TableHead>Registration #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sotStatus.map((state) => (
                        <TableRow key={state.id}>
                          <TableCell className="font-medium">{state.state_name}</TableCell>
                          <TableCell className="font-mono">
                            {state.registration_number || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                state.status === "active"
                                  ? "default"
                                  : state.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {state.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {state.expiry_date
                              ? format(new Date(state.expiry_date), "MMM d, yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No SOT registrations configured
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Legal Audit Log</CardTitle>
                <CardDescription>
                  Recent legal actions and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogs?.length ? (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{log.action_type}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {log.description || `${log.target_type} - ${log.target_id}`}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {format(new Date(log.created_at), "MMM d, HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
