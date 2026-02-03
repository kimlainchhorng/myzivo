/**
 * AI Bias & Automated Decisions Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Scale, AlertTriangle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADVANCED_PLATFORM_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function AIBiasPolicy() {
  const aiBias = ADVANCED_PLATFORM_POLICIES.aiBiasDisclaimer;
  const noSolelyAutomated = ADVANCED_PLATFORM_POLICIES.noSolelyAutomated;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/legal/ai-disclosure">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">{aiBias.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {aiBias.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">AI Transparency</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO uses AI systems that may have inherent limitations. This page explains 
                  our approach to AI fairness and automated decision-making.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              AI Bias Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{aiBias.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Human Review Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{noSolelyAutomated.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Algorithm Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              ZIVO algorithms may consider various factors including:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                <span>User behavior and preferences</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                <span>Market conditions and demand</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                <span>Historical patterns and trends</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                <span>Service availability and location</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                <span>Quality and performance metrics</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              No Guarantee of Fairness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ZIVO does not guarantee neutrality, fairness, or absence of bias in AI outcomes. 
              AI systems are continuously improved but may contain inherent limitations. 
              Users remain responsible for their own decisions.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Questions about AI? Contact{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
