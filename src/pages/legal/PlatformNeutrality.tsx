/**
 * Platform Neutrality Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Scale, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADVANCED_PLATFORM_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function PlatformNeutrality() {
  const neutrality = ADVANCED_PLATFORM_POLICIES.platformNeutrality;
  const noPriceFixing = ADVANCED_PLATFORM_POLICIES.noPriceFixing;
  const competitorPolicy = ADVANCED_PLATFORM_POLICIES.competitorParticipation;

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
              <h1 className="font-display font-bold text-xl">{neutrality.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {neutrality.version} • {COMPANY_INFO.name}
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
              Platform Neutrality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{neutrality.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Neutrality Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {neutrality.principles.map((principle, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Scale className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">{principle}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              No Price Fixing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{noPriceFixing.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Competitor Participation Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{competitorPolicy.content}</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              No Guarantees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ZIVO does not guarantee visibility, placement, minimum earnings, bookings, 
              or revenue to any partner. Platform performance depends on market conditions, 
              user demand, and algorithmic factors beyond ZIVO's control.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For partnership inquiries, contact{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
