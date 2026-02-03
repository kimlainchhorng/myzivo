/**
 * Terms Precedence & Maximum Enforceability Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Scale, FileText, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FINAL_LEGAL_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function TermsPrecedence() {
  const precedence = FINAL_LEGAL_POLICIES.orderPrecedence;
  const enforceability = FINAL_LEGAL_POLICIES.maxEnforceability;

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
              <h1 className="font-display font-bold text-xl">{precedence.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {precedence.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Document Hierarchy</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Terms of Service control all other documents and policies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Order of Precedence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{precedence.content}</p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Document Hierarchy:</h4>
              <ol className="space-y-2">
                {precedence.precedenceOrder.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-semibold">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {enforceability.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{enforceability.content}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              In case of ambiguity between documents or provisions, terms are 
              interpreted in ZIVO's favor to preserve intended protections. 
              Marketing content, blog posts, FAQs, and informal communications 
              are for informational purposes only and do not modify legal terms.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Legal inquiries:{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
