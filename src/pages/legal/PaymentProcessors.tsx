/**
 * Payment Processor Reliance Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Building, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ULTRA_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function PaymentProcessors() {
  const policy = ULTRA_LEGAL_POLICIES.paymentProcessors;
  const fundsPolicy = ULTRA_LEGAL_POLICIES.fundsHoldRights;

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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{policy.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Third-Party Processors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {policy.processors.map((processor, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">{processor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Funds Hold & Reserve Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{fundsPolicy.content}</p>
            <ul className="space-y-2">
              {fundsPolicy.actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-amber-500">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Liability Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ZIVO is not liable for processor outages, payment holds, delays, or failures 
              caused by third-party payment systems. Chargebacks are governed by processor 
              and card network rules, not ZIVO policies.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For payment issues, contact{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
