/**
 * DMCA & Copyright Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CORPORATE_IP_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function DMCAPolicy() {
  const dmca = CORPORATE_IP_POLICIES.dmcaPolicy;

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
              <h1 className="font-display font-bold text-xl">{dmca.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {dmca.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              DMCA Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{dmca.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Takedown Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-foreground mb-2">Required Steps:</h4>
              <ol className="space-y-2">
                {dmca.process.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
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
              <Mail className="h-5 w-5 text-amber-500" />
              DMCA Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              DMCA takedown notices should be sent to our designated agent:
            </p>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <p className="font-medium text-foreground">{dmca.dmcaAgent}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Repeat Infringer Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ZIVO maintains a repeat infringer policy. Users who repeatedly 
              infringe copyrights will have their accounts terminated. Counter-notices 
              may be submitted according to DMCA procedures.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Copyright inquiries:{" "}
            <a href="mailto:legal@hizivo.com" className="text-primary hover:underline">
              legal@hizivo.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
