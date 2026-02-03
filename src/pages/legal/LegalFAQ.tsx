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
import { LEGAL_FAQ, SERVICE_DISCLAIMERS, COMPANY_INFO, EXTREME_LEGAL_POLICIES, ULTRA_LEGAL_FAQ, ADVANCED_LEGAL_FAQ, EXTREME_LEGAL_FAQ_EXTENDED, CORPORATE_LEGAL_FAQ, FINAL_LEGAL_FAQ, COMMUNICATIONS_COMPLIANCE_FAQ, ONGOING_COMPLIANCE_FAQ, FINANCIAL_COMPLIANCE_FAQ } from "@/config/legalContent";
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

        {/* Ultra FAQ - Critical Questions */}
        <Card className="mb-8 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Critical Legal Questions
            </CardTitle>
            <CardDescription>
              Ultra-clear answers to the most important liability questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {ULTRA_LEGAL_FAQ.map((faq, index) => (
                <AccordionItem key={index} value={`ultra-${index}`} className="border-destructive/20">
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

        {/* Advanced FAQ - Edge Cases */}
        <Card className="mb-8 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Labor & Platform Questions
            </CardTitle>
            <CardDescription>
              Questions about employment status, platform neutrality, and governance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {ADVANCED_LEGAL_FAQ.map((faq, index) => (
                <AccordionItem key={index} value={`advanced-${index}`} className="border-primary/20">
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

        {/* Extreme FAQ - Government & Shutdown */}
        <Card className="mb-8 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Government & Emergency Powers
            </CardTitle>
            <CardDescription>
              Questions about government compliance, shutdowns, and safety
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {EXTREME_LEGAL_FAQ_EXTENDED.map((faq, index) => (
                <AccordionItem key={index} value={`extreme-${index}`} className="border-destructive/20">
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

        {/* Corporate FAQ */}
        <Card className="mb-8 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Corporate & IP Protection
            </CardTitle>
            <CardDescription>
              Questions about intellectual property, subpoenas, and corporate structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {CORPORATE_LEGAL_FAQ.map((faq, index) => (
                <AccordionItem key={index} value={`corporate-${index}`} className="border-primary/20">
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

        {/* Final Legal FAQ */}
        <Card className="mb-8 border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              Payments, Travel & Rental
            </CardTitle>
            <CardDescription>
              Questions about payments, travel rules, and rental compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FINAL_LEGAL_FAQ.map((faq, index) => (
                <AccordionItem key={index} value={`final-${index}`} className="border-amber-500/20">
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

        {/* Communications Compliance FAQ */}
        <Card className="mb-8 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Communications & Privacy Compliance
            </CardTitle>
            <CardDescription>
              Questions about messaging, data protection, and regulatory compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {COMMUNICATIONS_COMPLIANCE_FAQ.map((faq, index) => (
                <AccordionItem key={index} value={`comm-${index}`} className="border-primary/20">
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

        {/* Ongoing Compliance FAQ */}
        <Card className="mb-8 border-emerald-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Ongoing Compliance & Operations
            </CardTitle>
            <CardDescription>
              Questions about monitoring, enforcement, and regulatory compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {ONGOING_COMPLIANCE_FAQ.map((faq, index) => (
                <AccordionItem key={index} value={`ops-${index}`} className="border-emerald-500/20">
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

        {/* Financial Compliance FAQ */}
        <Card className="mb-8 border-rose-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-500" />
              Financial Crime & KYC/AML
            </CardTitle>
            <CardDescription>
              Questions about identity verification, anti-money laundering, and financial compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FINANCIAL_COMPLIANCE_FAQ.map((faq, index) => (
                <AccordionItem key={index} value={`fin-${index}`} className="border-rose-500/20">
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

        {/* High-Risk Disclaimers */}
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              High-Risk Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">No Professional Advice</h4>
              <p className="text-sm text-muted-foreground">
                {EXTREME_LEGAL_POLICIES.highRiskDisclaimers.noProfessionalAdvice}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Safety Equipment</h4>
              <p className="text-sm text-muted-foreground">
                {EXTREME_LEGAL_POLICIES.highRiskDisclaimers.safetyEquipment}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Weather & Environment</h4>
              <p className="text-sm text-muted-foreground">
                {EXTREME_LEGAL_POLICIES.highRiskDisclaimers.weatherEnvironment}
              </p>
            </div>
          </CardContent>
        </Card>

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
