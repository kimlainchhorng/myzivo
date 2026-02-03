/**
 * Safety Incident Disclaimer Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, UserX, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GOVERNMENT_SHUTDOWN_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function SafetyDisclaimer() {
  const safety = GOVERNMENT_SHUTDOWN_POLICIES.safetyIncidentDisclaimer;
  const background = GOVERNMENT_SHUTDOWN_POLICIES.noBackgroundGuarantee;

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
              <h1 className="font-display font-bold text-xl">{safety.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {safety.version} • {COMPANY_INFO.name}
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
                <p className="font-medium text-foreground">Important Safety Notice</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO is a technology platform. Users are responsible for their own safety.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Safety Incident Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{safety.content}</p>
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <h4 className="font-semibold text-foreground mb-2">Excluded Liability:</h4>
              <ul className="space-y-2">
                {safety.excludedLiability.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-500" />
              {background.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{background.content}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              User Responsibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Users are encouraged to exercise caution, use good judgment, and take 
              appropriate safety precautions when using ZIVO services. Report safety 
              concerns immediately to support and local authorities when appropriate.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Safety concerns:{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
