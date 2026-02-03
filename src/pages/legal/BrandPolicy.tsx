/**
 * Brand & Trademark Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Ban, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CORPORATE_IP_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function BrandPolicy() {
  const trademark = CORPORATE_IP_POLICIES.trademarkPolicy;
  const impersonation = CORPORATE_IP_POLICIES.impersonationProtection;

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
              <h1 className="font-display font-bold text-xl">{trademark.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {trademark.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Brand Protection</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO actively protects its intellectual property and brand identity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Trademark & Brand Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{trademark.content}</p>
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <h4 className="font-semibold text-foreground mb-2">Prohibited Uses:</h4>
              <ul className="space-y-2">
                {trademark.prohibitedUses.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Globe className="h-5 w-5" />
              {impersonation.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{impersonation.content}</p>
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
              <h4 className="font-semibold text-foreground mb-2">Enforcement Actions:</h4>
              <ul className="space-y-2">
                {impersonation.actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Violation Consequences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Violations of ZIVO's brand and trademark policies may result in immediate 
              takedown requests, cease and desist letters, civil litigation, and 
              cooperation with law enforcement when appropriate.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Brand inquiries:{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
