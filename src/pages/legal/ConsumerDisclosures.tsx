/**
 * Consumer Disclosure Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ULTRA_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function ConsumerDisclosures() {
  const policy = ULTRA_LEGAL_POLICIES.consumerDisclosures;

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
              <h1 className="font-display font-bold text-xl">{policy.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {policy.version} • {COMPANY_INFO.name}
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
                <p className="font-medium text-foreground">Transparency Commitment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO is committed to providing clear, accurate disclosures before you complete any booking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Disclosure Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{policy.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              What We Disclose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {policy.disclosures.map((disclosure, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">{disclosure}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-amber-500" />
              Your Responsibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Users are responsible for reviewing all prices, fees, terms, and policies before 
              completing any purchase. ZIVO is not liable for user misunderstanding after 
              acceptance of terms at checkout.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Questions? Contact{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
