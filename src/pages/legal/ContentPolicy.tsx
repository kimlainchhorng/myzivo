/**
 * Content & Communication Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Trash2, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GOVERNMENT_SHUTDOWN_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function ContentPolicy() {
  const communication = GOVERNMENT_SHUTDOWN_POLICIES.communicationDisclaimer;
  const contentRemoval = GOVERNMENT_SHUTDOWN_POLICIES.contentRemoval;
  const defamation = GOVERNMENT_SHUTDOWN_POLICIES.defamationDisclaimer;

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
              <h1 className="font-display font-bold text-xl">Content & Communication Policy</h1>
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
              <MessageSquare className="h-5 w-5 text-primary" />
              {communication.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{communication.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {contentRemoval.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{contentRemoval.content}</p>
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
              <h4 className="font-semibold text-foreground mb-2">Removal Scope:</h4>
              <ul className="space-y-2">
                {contentRemoval.removalScope.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
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
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {defamation.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{defamation.content}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              User Responsibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Users are solely responsible for the content they create, share, and 
              communicate on the platform. ZIVO provides a neutral platform and does 
              not endorse or verify user-generated content.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Content inquiries:{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
