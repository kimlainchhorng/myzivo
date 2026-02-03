/**
 * Legal FAQ Page - Dispute Prevention Q&A
 */

import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Shield, Scale, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LEGAL_FAQ, SERVICE_DISCLAIMERS, COMPANY_INFO } from "@/config/legalContent";
import FAQSchema from "@/components/shared/FAQSchema";

export default function LegalFAQ() {
  return (
    <div className="min-h-screen bg-background">
      {/* FAQ Schema for SEO */}
      <FAQSchema faqs={LEGAL_FAQ} pageType="general" />

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
              <h1 className="font-display font-bold text-xl">Legal FAQ</h1>
              <p className="text-sm text-muted-foreground">
                Common questions about ZIVO's legal structure
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Important Notice */}
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Understanding ZIVO's Role</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO is a technology platform that connects customers with independent service providers.
                  We do not operate airlines, own vehicles, employ drivers, or operate restaurants.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Clear answers to common legal questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {LEGAL_FAQ.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Service-Specific Disclaimers */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Service-Specific Disclaimers
        </h2>

        <div className="grid gap-4 mb-8">
          {Object.entries(SERVICE_DISCLAIMERS).map(([key, disclaimer]) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{disclaimer.title}</CardTitle>
                  <Badge variant="outline" className="capitalize">{key}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {disclaimer.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{disclaimer.summary}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dispute Resolution Summary */}
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              By using ZIVO, you agree that any disputes will be resolved through binding arbitration
              as outlined in our Terms of Service. Key points:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Binding arbitration is required for most disputes</li>
              <li>Class action lawsuits are waived</li>
              <li>Jury trials are waived</li>
              <li>You have 30 days from first use to opt out of arbitration</li>
              <li>Small claims court remains available for qualifying disputes</li>
            </ul>
            <div className="pt-4">
              <Link to="/legal/terms">
                <Button variant="outline" size="sm">
                  Read Full Terms of Service
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For legal inquiries, contact{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
