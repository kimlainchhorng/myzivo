/**
 * Travel Rules & IRROPS Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Plane, Cloud, AlertTriangle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FINAL_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function TravelRules() {
  const airlineRules = FINAL_LEGAL_POLICIES.airlineRules;
  const irrops = FINAL_LEGAL_POLICIES.irropsPolicy;

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
              <h1 className="font-display font-bold text-xl">{airlineRules.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {airlineRules.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Plane className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Airline Rules Control</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Airlines set and enforce their own policies for all flight-related matters.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Airline Rules Precedence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{airlineRules.content}</p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Airline-Controlled:</h4>
              <ul className="space-y-2">
                {airlineRules.airlineControlled.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
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
              <Cloud className="h-5 w-5 text-amber-500" />
              {irrops.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{irrops.content}</p>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <h4 className="font-semibold text-foreground mb-2">ZIVO Not Liable For:</h4>
              <ul className="space-y-2">
                {irrops.notLiableFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500">•</span>
                    <span>{item}</span>
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
              ZIVO facilitates flight bookings but does not operate flights or control airline 
              operations. For disruptions, delays, or cancellations, contact the airline directly. 
              ZIVO cannot override airline decisions.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Travel support:{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
