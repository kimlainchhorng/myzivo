/**
 * Legal Response Protocols (Admin)
 * Clauses 184-186: Response templates, legal threat protocol, staff rules
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, FileText, Lock, Ban, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LEGAL_EVIDENCE_POLICIES, LEGAL_EVIDENCE_FAQ, COMPANY_INFO } from "@/config/legalContent";

export default function LegalResponseProtocols() {
  const templates = LEGAL_EVIDENCE_POLICIES.regulatorResponseTemplates;
  const threatProtocol = LEGAL_EVIDENCE_POLICIES.legalThreatProtocol;
  const noOffRecord = LEGAL_EVIDENCE_POLICIES.noOffRecordStatements;
  const survival = LEGAL_EVIDENCE_POLICIES.evidenceSurvival;

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
              <h1 className="font-display font-bold text-xl">Legal Response Protocols</h1>
              <p className="text-sm text-muted-foreground">
                Internal Playbook • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert className="mb-8 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive">Confidential Internal Protocols</AlertTitle>
          <AlertDescription>
            These protocols are for authorized personnel only. Do not share externally.
          </AlertDescription>
        </Alert>

        {/* Legal Threat Protocol */}
        <Card className="mb-8 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {threatProtocol.title}
            </CardTitle>
            <CardDescription>{threatProtocol.content}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threatProtocol.protocolSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  <Badge variant="outline" className="shrink-0 border-destructive text-destructive">
                    Step {index + 1}
                  </Badge>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Templates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {templates.title}
            </CardTitle>
            <CardDescription>{templates.content}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg border bg-primary/5">
                <h5 className="font-semibold mb-2">Template Types</h5>
                <ul className="space-y-1">
                  {templates.templateTypes.map((type, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">•</span>
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-amber-500/5">
                <h5 className="font-semibold mb-2">Template Principles</h5>
                <ul className="space-y-1">
                  {templates.templatePrinciples.map((principle, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-amber-500">•</span>
                      {principle}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Rules */}
        <Card className="mb-8 border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-amber-500" />
              {noOffRecord.title}
            </CardTitle>
            <CardDescription>{noOffRecord.content}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {noOffRecord.prohibitedActions.map((action, index) => (
                <div key={index} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center gap-2">
                  <Ban className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Internal Playbook Q&A */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Internal Playbook Q&A
            </CardTitle>
            <CardDescription>Quick reference for common legal scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {LEGAL_EVIDENCE_FAQ.map((faq, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <p className="font-semibold text-foreground mb-2">Q: {faq.question}</p>
                  <p className="text-sm text-muted-foreground">A: {faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence Survival */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {survival.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{survival.content}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
