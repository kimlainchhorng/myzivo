/**
 * Enforcement & Survival Rights Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Gavel, AlertTriangle, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GOVERNMENT_SHUTDOWN_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function EnforcementRights() {
  const unilateral = GOVERNMENT_SHUTDOWN_POLICIES.unilateralEnforcement;
  const noDuty = GOVERNMENT_SHUTDOWN_POLICIES.noDutyToWarn;
  const survival = GOVERNMENT_SHUTDOWN_POLICIES.companyEventSurvival;

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
              <h1 className="font-display font-bold text-xl">Enforcement & Survival Rights</h1>
              <p className="text-sm text-muted-foreground">
                {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Gavel className="h-5 w-5" />
              {unilateral.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{unilateral.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {noDuty.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{noDuty.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {survival.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{survival.content}</p>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-foreground mb-2">Surviving Events:</h4>
              <ul className="space-y-2">
                {survival.survivingEvents.map((event, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Binding Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All terms, protections, and obligations in ZIVO's legal agreements remain 
              in effect regardless of corporate changes, and bind all successors, assigns, 
              and future owners of the platform.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Legal inquiries:{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
