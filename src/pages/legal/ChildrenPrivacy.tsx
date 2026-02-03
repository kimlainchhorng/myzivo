/**
 * Children's Privacy (COPPA) Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Baby, Ban, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNICATIONS_COMPLIANCE_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function ChildrenPrivacy() {
  const policy = COMMUNICATIONS_COMPLIANCE_POLICIES.childrenPrivacy;

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
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Ban className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Age Restriction</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO services are strictly for users 18 years of age and older.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-primary" />
              Children's Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{policy.content}</p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Age Requirements:</h4>
              <ul className="space-y-2">
                {policy.ageRequirements.map((item, index) => (
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
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Discovery of Underage Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If ZIVO discovers that a user is under 18 years of age, the account will be 
              immediately terminated and all associated data will be deleted. ZIVO reserves 
              the right to request age verification at any time.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Parental Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Parents or guardians who believe their child has provided personal information 
              to ZIVO may contact us to request review and deletion of any inadvertently 
              collected data. We will promptly investigate and take appropriate action.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Parental inquiries:{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
