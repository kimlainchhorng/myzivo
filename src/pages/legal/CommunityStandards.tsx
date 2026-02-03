/**
 * Community Standards Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Users, Heart, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXTENDED_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function CommunityStandards() {
  const standards = EXTENDED_LEGAL_POLICIES.communityStandards;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/legal/terms">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">Community Standards</h1>
              <p className="text-sm text-muted-foreground">
                Version {standards.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Our Community Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ZIVO is committed to building a safe, respectful, and inclusive community for all users,
              drivers, vehicle owners, and restaurant partners. These standards apply to all interactions
              on and off our platform.
            </p>
          </CardContent>
        </Card>

        {/* Standards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Community Standards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {standards.standards.map((standard, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-foreground">{standard}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Zero Tolerance */}
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zero Tolerance Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>ZIVO has zero tolerance for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Discrimination based on race, religion, gender, sexual orientation, or disability</li>
              <li>Hate speech, slurs, or derogatory language</li>
              <li>Threats of violence or physical harm</li>
              <li>Sexual harassment or unwanted advances</li>
              <li>Stalking or repeated unwanted contact</li>
            </ul>
          </CardContent>
        </Card>

        {/* Enforcement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{standards.enforcement}</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Reporting violations:</strong> If you experience or witness a violation of these
                standards, please report it immediately through the app or contact{" "}
                <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
                  {COMPANY_INFO.supportEmail}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
