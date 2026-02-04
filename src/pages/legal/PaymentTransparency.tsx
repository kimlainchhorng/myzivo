/**
 * Payment Transparency - Clear documentation for banks and payment processors
 */

import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  RefreshCw, 
  Lock,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plane,
  Hotel,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANY_INFO } from "@/config/legalContent";

const paymentFlowSteps = [
  {
    step: 1,
    title: "User Initiates Booking",
    description: "User selects travel product and proceeds to checkout on ZIVO",
  },
  {
    step: 2,
    title: "Secure Payment Form",
    description: "Stripe's PCI-compliant payment form collects card details",
  },
  {
    step: 3,
    title: "Tokenization",
    description: "Card data is tokenized by Stripe - ZIVO never sees raw card numbers",
  },
  {
    step: 4,
    title: "Transaction Processing",
    description: "Payment is processed through Stripe (PCI-DSS Level 1 certified)",
  },
  {
    step: 5,
    title: "Confirmation",
    description: "User receives booking confirmation with transaction details",
  },
];

const merchantOfRecord = [
  {
    service: "Flights",
    icon: Plane,
    merchant: "Partner Airline / OTA",
    descriptor: "Partner's statement descriptor",
    refundHandler: "Partner handles refunds per fare rules",
    model: "redirect",
  },
  {
    service: "Hotels",
    icon: Hotel,
    merchant: "Booking Partner",
    descriptor: "Partner's statement descriptor",
    refundHandler: "Partner handles refunds per booking terms",
    model: "redirect",
  },
  {
    service: "Car Rental",
    icon: Car,
    merchant: "Rental Partner",
    descriptor: "Partner's statement descriptor",
    refundHandler: "Partner handles refunds per rental terms",
    model: "redirect",
  },
];

export default function PaymentTransparency() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/compliance">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">Payment Transparency</h1>
              <p className="text-sm text-muted-foreground">
                How payments are processed on {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Key Statement */}
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">Secure Payment Processing</h2>
                <p className="text-muted-foreground">
                  Payments are processed by PCI-compliant providers. ZIVO does not store card data. 
                  Your payment information is tokenized and securely handled by Stripe (PCI-DSS Level 1).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Flow */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              How Payments Work
            </CardTitle>
            <CardDescription>
              Step-by-step payment processing flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentFlowSteps.map((step, index) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    {index < paymentFlowSteps.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-4">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Merchant of Record */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Who Charges Your Card
            </CardTitle>
            <CardDescription>
              Understanding statement descriptors by service type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {merchantOfRecord.map((item) => (
                <div key={item.service} className="p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.service}</h4>
                      <Badge variant="outline" className="text-xs">
                        {item.model === "redirect" ? "Partner Redirect" : "Direct Booking"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Merchant</p>
                      <p className="font-medium">{item.merchant}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Statement</p>
                      <p className="font-medium">{item.descriptor}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Refunds</p>
                      <p className="font-medium">{item.refundHandler}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Refund Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Refund Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Important: Partner-Handled Refunds</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For affiliate/redirect bookings, refunds are processed by the travel partner, 
                    not ZIVO. Refund timelines and policies are determined by the partner.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Flights</p>
                  <p className="text-sm text-muted-foreground">
                    Subject to airline fare rules. Refunds processed by airline or OTA partner.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Hotels</p>
                  <p className="text-sm text-muted-foreground">
                    Per booking terms. Contact booking partner for cancellation/refund.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Car Rental</p>
                  <p className="text-sm text-muted-foreground">
                    Per rental agreement. Contact rental partner for modifications.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Payment Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                <p className="font-medium text-sm">No Card Storage</p>
                <p className="text-xs text-muted-foreground">
                  ZIVO never stores raw credit card numbers
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                <p className="font-medium text-sm">Tokenization</p>
                <p className="text-xs text-muted-foreground">
                  All card data is tokenized by Stripe
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                <p className="font-medium text-sm">PCI-DSS Level 1</p>
                <p className="text-xs text-muted-foreground">
                  Stripe is PCI-DSS Level 1 certified
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                <p className="font-medium text-sm">TLS Encryption</p>
                <p className="text-xs text-muted-foreground">
                  All data transmitted over TLS 1.3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/legal/payment-processors">
            <Button variant="outline" className="gap-2">
              Payment Processors
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/security/enterprise">
            <Button variant="outline" className="gap-2">
              Enterprise Security
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For payment questions, contact{" "}
            <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-primary hover:underline">
              {COMPANY_INFO.supportEmail}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
