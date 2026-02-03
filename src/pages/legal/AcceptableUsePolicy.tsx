/**
 * Acceptable Use Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, Ban, Bot, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXTENDED_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function AcceptableUsePolicy() {
  const aup = EXTENDED_LEGAL_POLICIES.acceptableUse;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/legal/terms">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">Acceptable Use Policy</h1>
              <p className="text-sm text-muted-foreground">
                Version {aup.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This Acceptable Use Policy governs your use of the ZIVO platform. By using our services,
              you agree to comply with these rules. Violations may result in immediate account suspension
              or termination.
            </p>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The following activities are strictly prohibited on the ZIVO platform:
            </p>
            <ul className="space-y-3">
              {aup.prohibitions.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Automated Access */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Automated Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              You may not use bots, scrapers, crawlers, or any automated means to access the platform
              without prior written authorization from ZIVO. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Data scraping or harvesting</li>
              <li>Automated booking or purchasing</li>
              <li>Price monitoring or comparison tools</li>
              <li>Automated account creation</li>
              <li>Load testing or stress testing</li>
            </ul>
          </CardContent>
        </Card>

        {/* Enforcement */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-destructive" />
              Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive font-medium">{aup.enforcement}</p>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            To report violations, contact{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
