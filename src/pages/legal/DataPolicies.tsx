/**
 * Data Policies Page (Minimization, Portability, Deletion)
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Database, Download, Trash2, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADVANCED_PLATFORM_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function DataPolicies() {
  const minimization = ADVANCED_PLATFORM_POLICIES.dataMinimization;
  const portability = ADVANCED_PLATFORM_POLICIES.dataPortability;
  const deletion = ADVANCED_PLATFORM_POLICIES.dataDeletionLimits;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/legal/privacy">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">Data Policies</h1>
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
              <Database className="h-5 w-5 text-primary" />
              {minimization.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{minimization.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              {portability.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{portability.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-amber-500" />
              {deletion.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{deletion.content}</p>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <h4 className="font-semibold text-foreground mb-2">Data Retention Reasons:</h4>
              <ul className="space-y-2">
                {deletion.retentionReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500">•</span>
                    <span>{reason}</span>
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
              While ZIVO respects your data rights, certain data must be retained for legal, 
              regulatory, and fraud prevention purposes. We will inform you of any limitations 
              when processing your data requests.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For data requests, contact{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
