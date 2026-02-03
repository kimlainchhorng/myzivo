/**
 * Data Residency & Cross-Border Transfers Page
 * Global data processing, GDPR compliance, and international transfers
 */

import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Globe, 
  Shield, 
  Server, 
  Users, 
  FileCheck,
  Scale,
  Building2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { COMPANY_INFO } from "@/config/legalContent";

export default function DataResidency() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/privacy">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">Data Residency & Cross-Border Transfers</h1>
              <p className="text-sm text-muted-foreground">
                How ZIVO processes data globally
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Introduction */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Global Data Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              ZIVO operates as a global travel platform, connecting users with travel partners 
              and service providers worldwide. To deliver our services effectively, your data 
              may be processed in multiple countries.
            </p>
            <p>
              This page explains how we handle international data transfers and the safeguards 
              we implement to protect your information.
            </p>
          </CardContent>
        </Card>

        {/* Data Location Disclosure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              Data Location Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ZIVO transparently discloses the following about data storage and processing:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span>Data may be stored and processed in multiple countries to ensure service availability and performance</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span>Our cloud infrastructure providers operate globally with data centers in various regions</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span>Data location may change for performance optimization, disaster recovery, or system resilience</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span>Travel partners and payment processors may process data in their respective jurisdictions</span>
              </li>
            </ul>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <p className="text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong>No Guarantee of Single-Country Storage:</strong> We cannot guarantee 
                  that your data will remain in any specific country or jurisdiction.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cross-Border Data Transfers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Cross-Border Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ZIVO may transfer your data internationally for the following purposes:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium">Booking Fulfillment</h4>
                <p className="text-sm text-muted-foreground">
                  Sharing necessary information with airlines, hotels, and travel partners to complete your bookings
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium">Payment Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Processing payments through international payment gateways and financial institutions
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium">Fraud Prevention</h4>
                <p className="text-sm text-muted-foreground">
                  Using global fraud detection services to protect your account and transactions
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium">Customer Support</h4>
                <p className="text-sm text-muted-foreground">
                  Providing 24/7 support through distributed teams and service providers
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Transfer Protections</h4>
              <p className="text-sm text-muted-foreground">
                All international data transfers are protected using:
              </p>
              <ul className="space-y-2 text-sm ml-4">
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Contractual safeguards with data recipients</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Industry-standard encryption in transit and at rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Access controls and data minimization practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Regular security assessments of data processors</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* GDPR Transfer Safeguards */}
        <Card className="border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-500" />
              GDPR Transfer Safeguards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              For users located in the European Union (EU) or European Economic Area (EEA), 
              ZIVO implements the following protections for international data transfers:
            </p>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">Standard Contractual Clauses (SCCs)</h4>
                <p className="text-sm text-muted-foreground">
                  Where applicable, we use EU-approved Standard Contractual Clauses as a lawful 
                  transfer mechanism for data exported outside the EEA.
                </p>
              </div>
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">GDPR Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  All data transfers comply with applicable GDPR requirements, including 
                  Articles 44-49 governing international transfers.
                </p>
              </div>
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">Supplementary Measures</h4>
                <p className="text-sm text-muted-foreground">
                  Additional technical and organizational safeguards are applied where required 
                  to ensure an essentially equivalent level of data protection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Law Overrides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              Local Law Overrides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Data protection laws vary by jurisdiction. Where local laws impose stricter 
              requirements than our standard practices, ZIVO will adapt data processing 
              to comply with applicable legal obligations.
            </p>
            <p>
              ZIVO reserves the right to modify data handling practices as legally required 
              without incurring liability for such changes, provided we act in good faith 
              to comply with applicable law.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>Examples of local requirements:</strong> Data localization mandates, 
                sector-specific regulations (financial, health), enhanced consent requirements, 
                or government access transparency obligations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Data Processors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Third-Party Data Processors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ZIVO engages vetted third-party processors to deliver our services:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl mb-2">💳</div>
                <h4 className="font-medium text-sm">Payment Processors</h4>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl mb-2">✈️</div>
                <h4 className="font-medium text-sm">Travel Partners</h4>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl mb-2">☁️</div>
                <h4 className="font-medium text-sm">Cloud Providers</h4>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Processor Requirements</h4>
              <p className="text-sm text-muted-foreground">
                All third-party processors are contractually required to:
              </p>
              <ul className="space-y-2 text-sm ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Implement appropriate security measures to protect personal data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Process data only for authorized and documented purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Delete or return data upon termination of services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Assist with data subject rights requests where applicable</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Limitation:</strong> ZIVO is not liable for processor obligations 
                under their respective local laws or for compliance failures beyond our 
                reasonable control and oversight.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Government Access Requests */}
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-500" />
              Government Access Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ZIVO may receive requests from government authorities or law enforcement 
              agencies for user data. Our approach:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Lawful Requests Only</h4>
                  <p className="text-sm text-muted-foreground">
                    We respond only to requests that are legally valid and properly issued
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">User Notification</h4>
                  <p className="text-sm text-muted-foreground">
                    Where permitted by law, we may notify affected users of government requests
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Minimal Disclosure</h4>
                  <p className="text-sm text-muted-foreground">
                    We provide only the data specifically required by the legal process
                  </p>
                </div>
              </li>
            </ul>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <p className="text-sm">
                <strong>Note:</strong> ZIVO is not obligated to challenge every government 
                request. We will comply with valid legal process as required by law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Acknowledgment */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              User Acknowledgment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              By creating an account or using ZIVO's services, you acknowledge and consent to:
            </p>
            <div className="space-y-3 p-4 bg-background rounded-lg border">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span className="text-sm">
                  International transfer of your personal data as described in this policy
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span className="text-sm">
                  Processing of your data in countries outside your country of residence
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span className="text-sm">
                  Sharing of necessary data with travel partners and service providers
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span className="text-sm">
                  Data handling practices that may differ from your local jurisdiction
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              If you do not agree to these data practices, please do not use ZIVO's services. 
              You may contact us to request deletion of your data.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center text-sm text-muted-foreground pt-4 space-y-2">
          <p>
            For questions about data residency or international transfers, contact{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
          <p>
            <Link to="/privacy" className="text-primary hover:underline">
              ← Back to Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
