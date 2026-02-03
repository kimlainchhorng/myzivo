/**
 * Electronic Communication Consent & TCPA/CAN-SPAM Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Bell, Shield, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNICATIONS_COMPLIANCE_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function CommunicationsConsent() {
  const consent = COMMUNICATIONS_COMPLIANCE_POLICIES.electronicConsent;
  const tcpa = COMMUNICATIONS_COMPLIANCE_POLICIES.tcpaDisclaimer;
  const canSpam = COMMUNICATIONS_COMPLIANCE_POLICIES.canSpamCompliance;

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
              <h1 className="font-display font-bold text-xl">{consent.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {consent.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Consent Notice</p>
                <p className="text-sm text-muted-foreground mt-1">
                  By using ZIVO, you consent to receive electronic communications as described below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Electronic Communication Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{consent.content}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">Communication Types:</h4>
                <ul className="space-y-2">
                  {consent.communicationTypes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">Purposes:</h4>
                <ul className="space-y-2">
                  {consent.purposes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-amber-500" />
              {tcpa.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{tcpa.content}</p>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <h4 className="font-semibold text-foreground mb-2">ZIVO Not Liable For:</h4>
              <ul className="space-y-2">
                {tcpa.notLiableFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {canSpam.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{canSpam.content}</p>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-foreground mb-2">All Marketing Emails Include:</h4>
              <ul className="space-y-2">
                {canSpam.includes.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Communication preferences:{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
