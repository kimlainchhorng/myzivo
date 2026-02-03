/**
 * Whistleblower Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquareWarning, Shield, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CORPORATE_IP_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function WhistleblowerPolicy() {
  const whistleblower = CORPORATE_IP_POLICIES.whistleblowerPolicy;
  const internalMisuse = CORPORATE_IP_POLICIES.internalMisuse;

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
              <h1 className="font-display font-bold text-xl">{whistleblower.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {whistleblower.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MessageSquareWarning className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Report Concerns Safely</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO encourages good-faith reporting and protects whistleblowers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareWarning className="h-5 w-5 text-primary" />
              Whistleblower Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{whistleblower.content}</p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Protections:</h4>
              <ul className="space-y-2">
                {whistleblower.protections.map((protection, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{protection}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-amber-500" />
              Reporting Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Concerns can be reported confidentially to:
            </p>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <a href={`mailto:${whistleblower.reportingChannel}`} className="font-medium text-primary hover:underline">
                {whistleblower.reportingChannel}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {internalMisuse.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{internalMisuse.content}</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              False Reports Prohibited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              False or malicious reports made in bad faith are prohibited and may 
              result in disciplinary action or legal consequences. The whistleblower 
              policy protects only good-faith reporters.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Ethics hotline:{" "}
            <a href={`mailto:${whistleblower.reportingChannel}`} className="text-primary hover:underline">
              {whistleblower.reportingChannel}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
