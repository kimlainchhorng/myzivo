/**
 * Public Security Page
 * Trust-building page explaining ZIVO's security practices
 */

import { Link } from "react-router-dom";
import { 
  Shield, Lock, Eye, CreditCard, AlertTriangle, 
  Mail, CheckCircle2, Server, Users, FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { COMPANY_INFO } from "@/config/legalContent";

const securityPractices = [
  {
    icon: Lock,
    title: "Encryption in Transit",
    description: "All data transmitted between your browser and ZIVO is encrypted using TLS 1.3, the latest industry standard for secure communications.",
  },
  {
    icon: Server,
    title: "Encryption at Rest",
    description: "Your personal information is encrypted using AES-256 encryption when stored in our databases, protecting it even in the unlikely event of unauthorized access.",
  },
  {
    icon: Users,
    title: "Least-Privilege Access",
    description: "Our staff only have access to the minimum data necessary to perform their duties. All access is logged and regularly audited.",
  },
  {
    icon: Eye,
    title: "Monitoring & Anomaly Detection",
    description: "We continuously monitor our systems for suspicious activity and employ automated anomaly detection to identify potential threats before they become breaches.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments via Stripe",
    description: "We partner with Stripe for payment processing. Your card details are never stored on ZIVO servers—they're tokenized and secured by Stripe's PCI DSS Level 1 certified infrastructure.",
  },
  {
    icon: FileSearch,
    title: "Regular Security Audits",
    description: "We conduct regular security assessments and penetration testing to identify and address vulnerabilities proactively.",
  },
];

export default function Security() {
  return (
    <>
      <SEOHead
        title="Security at ZIVO | How We Protect Your Data"
        description="Learn about ZIVO's enterprise-grade security practices, data encryption, secure payments, and how we protect your personal information."
      />
      <Header />

      <main className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero */}
          <div className="text-center py-12 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Security at ZIVO</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Protecting your data and privacy is our top priority. Learn about the measures we take to keep your information safe.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "TLS 1.3", sublabel: "Encryption" },
              { label: "AES-256", sublabel: "Data Protection" },
              { label: "PCI DSS", sublabel: "Payment Security" },
              { label: "24/7", sublabel: "Monitoring" },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-2xl font-bold text-primary">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.sublabel}</p>
              </div>
            ))}
          </div>

          {/* Security Practices */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {securityPractices.map((practice) => (
              <Card key={practice.title} className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <practice.icon className="w-5 h-5 text-primary" />
                    </div>
                    {practice.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{practice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* What We Don't Do */}
          <Card className="mb-12 border-green-500/30 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                What We Don't Do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Store your credit card numbers on our servers",
                  "Share your personal data with third parties for marketing",
                  "Access your data without a legitimate business need",
                  "Sell your information to data brokers",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Responsible Disclosure */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Responsible Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We believe in working with security researchers to keep ZIVO safe. If you discover a security vulnerability, 
                we encourage you to report it responsibly. We will acknowledge your contribution and work to address the issue promptly.
              </p>
              <div className="p-4 rounded-lg bg-background border border-border">
                <p className="font-medium mb-2">Report a security issue:</p>
                <a 
                  href="mailto:security@hizivo.com" 
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  security@hizivo.com
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Please include a detailed description of the vulnerability, steps to reproduce, and any potential impact. 
                We ask that you give us reasonable time to address the issue before public disclosure.
              </p>
            </CardContent>
          </Card>

          {/* Advanced Security */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Enterprise Security Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ZIVO implements a Zero-Trust security model with advanced protections against 
                hackers, data theft, insider threats, and account takeovers.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Zero-Trust Architecture",
                  "Data Loss Prevention (DLP)",
                  "Account Takeover Protection",
                  "Insider Threat Controls",
                  "API & Backend Hardening",
                  "Breach Containment Protocols",
                  "Anti-Bot & Scraping Defense",
                  "Fraud & Payment Protection",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button asChild>
                  <Link to="/security/zero-trust">Zero-Trust Controls</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/security/scale-protection">Scale & Fraud Protection</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Links */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Learn more about how we handle your data:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/privacy-security">Privacy & Data Protection</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/security/report">Report a Vulnerability</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/legal/security-incident">Incident Response</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
