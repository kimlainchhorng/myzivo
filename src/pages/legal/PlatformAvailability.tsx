/**
 * Platform Availability & Maintenance Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Server, Clock, AlertTriangle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXTREME_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function PlatformAvailability() {
  const policy = EXTREME_LEGAL_POLICIES.platformAvailability;

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
              <Server className="h-5 w-5 text-primary" />
              Platform Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{policy.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" />
              Maintenance Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <p className="text-foreground font-medium">{policy.notice}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              No SLA Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              ZIVO does not provide any Service Level Agreement (SLA) to users or partners. 
              There is no guaranteed uptime, availability, or response time.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>No guaranteed uptime percentage</li>
              <li>No guaranteed response times</li>
              <li>No compensation for downtime</li>
              <li>No liability for missed bookings due to outages</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For status updates, visit our support page or contact{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
