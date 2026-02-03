/**
 * Platform Governance & Enforcement Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Zap, AlertTriangle, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADVANCED_PLATFORM_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function PlatformGovernance() {
  const ruleEnforcement = ADVANCED_PLATFORM_POLICIES.ruleEnforcement;
  const emergencyAction = ADVANCED_PLATFORM_POLICIES.emergencyAction;
  const survival = ADVANCED_PLATFORM_POLICIES.advancedProtectionSurvival;

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
              <h1 className="font-display font-bold text-xl">Platform Governance</h1>
              <p className="text-sm text-muted-foreground">
                {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {ruleEnforcement.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{ruleEnforcement.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Zap className="h-5 w-5" />
              {emergencyAction.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{emergencyAction.content}</p>
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
              <h4 className="font-semibold text-foreground mb-2">Emergency Actions Include:</h4>
              <ul className="space-y-2">
                {emergencyAction.emergencyActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-primary/50 bg-primary/5">
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

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Enforcement Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ZIVO reserves full discretion in enforcing platform rules. Decisions may be 
              made automatically, manually, or retroactively. Users and partners accept 
              ZIVO's governance authority by using the platform.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For governance inquiries, contact{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
