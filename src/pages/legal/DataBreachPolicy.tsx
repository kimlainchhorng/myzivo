/**
 * Data Breach Response & Security Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Lock, AlertTriangle, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNICATIONS_COMPLIANCE_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function DataBreachPolicy() {
  const breach = COMMUNICATIONS_COMPLIANCE_POLICIES.dataBreachResponse;
  const security = COMMUNICATIONS_COMPLIANCE_POLICIES.securityLimitation;

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
              <h1 className="font-display font-bold text-xl">{breach.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {breach.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Security Commitment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO maintains security procedures and incident response protocols to protect user data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-primary" />
              Data Breach Response Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{breach.content}</p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Response Steps:</h4>
              <ol className="space-y-2">
                {breach.responseSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-semibold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              {security.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{security.content}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Users play a critical role in security. To protect your account:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use strong, unique passwords</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Enable two-factor authentication when available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Never share login credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Report suspicious activity immediately</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Report security concerns:{" "}
            <a href={`mailto:security@hizivo.com`} className="text-primary hover:underline">
              security@hizivo.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
