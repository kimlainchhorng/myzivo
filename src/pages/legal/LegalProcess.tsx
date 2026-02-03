/**
 * Legal Process & Subpoena Response Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Scale, FileSearch, Ban, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CORPORATE_IP_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function LegalProcess() {
  const subpoena = CORPORATE_IP_POLICIES.subpoenaPolicy;
  const noVoluntary = CORPORATE_IP_POLICIES.noVoluntaryDiscovery;

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
              <h1 className="font-display font-bold text-xl">{subpoena.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {subpoena.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Subpoena Response Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{subpoena.content}</p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Requirements:</h4>
              <ul className="space-y-2">
                {subpoena.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              {noVoluntary.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{noVoluntary.content}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              User Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              When legally permitted, ZIVO will notify affected users of legal 
              process that requires disclosure of their information. However, 
              ZIVO may be prohibited from providing notice in certain circumstances.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Legal process:{" "}
            <a href="mailto:legal@hizivo.com" className="text-primary hover:underline">
              legal@hizivo.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
