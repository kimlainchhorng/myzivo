/**
 * Partner Overview Page
 * Public page explaining Hizovo's business model for partner approval
 */

import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Search, 
  ArrowRight, 
  ExternalLink, 
  Shield, 
  CheckCircle, 
  Mail,
  FileText,
  Users,
  TrendingUp,
  Globe,
  Lock,
  Plane,
  Hotel,
  Car
} from "lucide-react";

const businessModelSteps = [
  {
    step: 1,
    icon: Search,
    title: "User Searches",
    description: "Travelers search for flights, hotels, or car rentals on Hizovo.",
  },
  {
    step: 2,
    icon: TrendingUp,
    title: "We Compare",
    description: "We aggregate and display options from our travel partners.",
  },
  {
    step: 3,
    icon: ExternalLink,
    title: "Partner Handoff",
    description: "Users are redirected to the partner's secure checkout to complete booking.",
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "Partner Fulfills",
    description: "The travel partner processes payment and issues tickets/confirmations.",
  },
];

const compliancePoints = [
  "Hizovo does not process payments for travel bookings",
  "Hizovo does not issue tickets or confirmations",
  "All bookings are fulfilled by licensed travel partners",
  "Users consent to data sharing before partner handoff",
  "Clear affiliate disclosures on all pages",
  "Partner attribution maintained via tracking parameters",
];

const supportBoundaries = [
  {
    party: "Travel Partner",
    responsibilities: [
      "Booking confirmations and e-tickets",
      "Payment processing and refunds",
      "Booking changes and cancellations",
      "Customer service for reservations",
    ],
  },
  {
    party: "Hizovo",
    responsibilities: [
      "Website navigation support",
      "Account and login issues",
      "Technical problems with search",
      "General inquiries about our platform",
    ],
  },
];

export default function PartnerOverview() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Partner Overview – ZIVO Business Model"
        description="Learn about Hizovo's travel search and referral business model. We connect travelers with licensed travel partners."
        canonical="https://hizivo.com/partner/overview"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Building2 className="w-3 h-3 mr-1" />
              Partner Information
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Hizovo Partner Overview
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding our travel search and referral business model.
            </p>
          </div>

          {/* Key Statement */}
          <Card className="mb-12 border-primary/30 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Hizovo is NOT the Merchant of Record
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hizovo operates as a travel search and comparison platform. We help travelers 
                discover and compare options, then redirect them to our licensed travel partners 
                to complete their bookings. All payments, ticketing, and fulfillment are handled 
                by the travel partner.
              </p>
            </CardContent>
          </Card>

          {/* Business Model */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                How Hizovo Works
              </CardTitle>
              <CardDescription>Our search → compare → handoff model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {businessModelSteps.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="relative">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {idx < businessModelSteps.length - 1 && (
                        <ArrowRight className="hidden lg:block absolute top-8 -right-3 w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-500" />
                Travel Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-sky-500/5 border border-sky-500/20 text-center hover:border-sky-500/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <Plane className="w-10 h-10 text-sky-500 mx-auto mb-3" />
                  <h3 className="font-semibold">Flights</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Search and compare flights from multiple airlines and OTAs.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center hover:border-violet-500/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <Hotel className="w-10 h-10 text-violet-500 mx-auto mb-3" />
                  <h3 className="font-semibold">Hotels</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Compare hotel rates and availability from booking partners.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <Car className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold">Car Rentals</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Find car rental deals from leading rental companies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Points */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                Compliance & Transparency
              </CardTitle>
              <CardDescription>Our commitment to clear disclosure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {compliancePoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Boundaries */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Support Boundaries
              </CardTitle>
              <CardDescription>Clear responsibility for customer support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {supportBoundaries.map((item) => (
                  <div key={item.party} className="p-6 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                    <h3 className="font-semibold mb-4">{item.party} Handles:</h3>
                    <ul className="space-y-2">
                      {item.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legal Pages */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-500" />
                Legal & Policy Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Terms of Service", path: "/terms" },
                  { name: "Privacy Policy", path: "/privacy" },
                  { name: "Cookie Policy", path: "/cookies" },
                  { name: "Partner Disclosure", path: "/partner-disclosure" },
                ].map((doc) => (
                  <Link 
                    key={doc.path} 
                    to={doc.path}
                    className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="font-medium text-sm">{doc.name}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Partnership Inquiries</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Interested in partnering with Hizovo? We're always looking to expand our 
                network of trusted travel partners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <a href="mailto:kimlain@hizivo.com" className="gap-2">
                    <Mail className="w-4 h-4" />
                    kimlain@hizivo.com
                  </a>
                </Button>
                <Button asChild>
                  <Link to="/contact" className="gap-2">
                    Contact Us
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                ZIVO LLC • Travel Search & Comparison Platform • United States
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
