/**
 * Dispute Resolution Process Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Scale, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADVANCED_PLATFORM_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function DisputeProcess() {
  const massArbitration = ADVANCED_PLATFORM_POLICIES.massArbitrationRules;
  const preDispute = ADVANCED_PLATFORM_POLICIES.preDisputeRequirement;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/legal/terms">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">Dispute Resolution Process</h1>
              <p className="text-sm text-muted-foreground">
                {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Dispute Resolution</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO has a structured process for resolving disputes fairly and efficiently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {preDispute.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{preDispute.content}</p>
            <div className="space-y-3 mt-4">
              {preDispute.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-foreground">{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              {massArbitration.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{massArbitration.content}</p>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <h4 className="font-semibold text-foreground mb-2">Mass Arbitration Rules:</h4>
              <ul className="space-y-2">
                {massArbitration.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Failure to follow the pre-dispute resolution process may result in dismissal 
              of claims. Users must exhaust informal resolution options before proceeding 
              to formal arbitration.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For disputes, contact{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
