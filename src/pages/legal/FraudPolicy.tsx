/**
 * Fraud Zero-Tolerance Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Ban, AlertTriangle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ULTRA_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function FraudPolicy() {
  const fraudPolicy = ULTRA_LEGAL_POLICIES.fraudPolicy;
  const antiCircumvention = ULTRA_LEGAL_POLICIES.antiCircumvention;

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
              <h1 className="font-display font-bold text-xl">{fraudPolicy.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {fraudPolicy.version} • {COMPANY_INFO.name}
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
                <p className="font-medium text-destructive">Zero Tolerance Policy</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO maintains a strict zero-tolerance policy for all forms of fraud, 
                  abuse, and platform circumvention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Fraud Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{fraudPolicy.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Scale className="h-5 w-5" />
              Consequences of Fraud
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {fraudPolicy.consequences.map((consequence, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <span className="text-foreground">{consequence}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              {antiCircumvention.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{antiCircumvention.content}</p>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <h4 className="font-semibold text-foreground mb-2">Prohibited Activities:</h4>
              <ul className="space-y-2">
                {antiCircumvention.prohibitions.map((prohibition, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500">•</span>
                    <span>{prohibition}</span>
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
              Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive font-medium">
              Fraudulent activity will result in immediate permanent ban from the platform, 
              seizure of any pending funds, and potential referral to law enforcement. 
              ZIVO actively cooperates with authorities to prosecute fraud.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Report fraud to{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
