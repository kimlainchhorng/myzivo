/**
 * AI & Recommendation Disclaimer Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Cpu, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ULTRA_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function AIDisclosure() {
  const policy = ULTRA_LEGAL_POLICIES.aiDisclosure;
  const automatedPolicy = ULTRA_LEGAL_POLICIES.automatedDecisionDisclaimer;

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
              <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">AI Transparency</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO uses artificial intelligence to enhance your experience. This page explains 
                  how AI is used and its limitations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI & Machine Learning Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{policy.content}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              AI-Powered Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {policy.aiFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-amber-500" />
              Automated Decision Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{automatedPolicy.content}</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Important Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI features provide suggestions only, not guarantees</li>
              <li>AI decisions may be incorrect, incomplete, or biased</li>
              <li>AI systems may not be suited to all user needs</li>
              <li>Users remain solely responsible for all final decisions</li>
              <li>ZIVO is not liable for outcomes based on AI recommendations</li>
            </ul>
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
