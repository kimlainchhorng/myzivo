/**
 * Rental Compliance & Traffic Law Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Car, Wrench, AlertTriangle, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FINAL_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function RentalCompliance() {
  const mechanical = FINAL_LEGAL_POLICIES.mechanicalDisclaimer;
  const traffic = FINAL_LEGAL_POLICIES.trafficCompliance;

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
              <h1 className="font-display font-bold text-xl">Vehicle Rental Compliance</h1>
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
              <Wrench className="h-5 w-5 text-primary" />
              {mechanical.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{mechanical.content}</p>
            <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <h4 className="font-semibold text-foreground mb-2">Owner Responsible For:</h4>
              <ul className="space-y-2">
                {mechanical.ownerResponsible.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Receipt className="h-5 w-5" />
              {traffic.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{traffic.content}</p>
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
              <h4 className="font-semibold text-foreground mb-2">Renter Responsible For:</h4>
              <ul className="space-y-2">
                {traffic.renterResponsible.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive">•</span>
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
              <Car className="h-5 w-5 text-primary" />
              Pre-Rental Inspection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Renters should thoroughly inspect vehicles before use and document any 
              pre-existing damage. Report mechanical issues immediately to the owner 
              and ZIVO support. Continuing to drive with known issues may result in 
              liability for additional damage.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Rental support:{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
