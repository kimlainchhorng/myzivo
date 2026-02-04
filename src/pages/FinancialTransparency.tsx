/**
 * Financial Transparency Page
 * Revenue model and pricing transparency
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Users,
  Building2,
  FileText,
  Scale,
} from "lucide-react";
import { Link } from "react-router-dom";

const revenueExplanation = [
  {
    icon: Building2,
    title: "Partner Commissions",
    description: "When you book through ZIVO, our travel partners pay us a commission for the referral.",
  },
  {
    icon: Users,
    title: "You Pay Partner Price",
    description: "The price you see is the partner's price—ZIVO does not add any fees or markups.",
  },
  {
    icon: DollarSign,
    title: "Transparent Earnings",
    description: "Our commission is built into the partner's pricing, not added on top of what you pay.",
  },
];

const pricingPromises = [
  {
    icon: CheckCircle2,
    title: "No Hidden Fees",
    description: "ZIVO never adds service fees, booking fees, or processing fees to partner prices.",
    positive: true,
  },
  {
    icon: CheckCircle2,
    title: "No Price Markups",
    description: "We display partner prices exactly as provided—no markups, ever.",
    positive: true,
  },
  {
    icon: CheckCircle2,
    title: "Partner Price Guarantee",
    description: "The price you see on ZIVO matches the partner's direct price.",
    positive: true,
  },
  {
    icon: XCircle,
    title: "No Inflated Comparisons",
    description: "We don't artificially inflate competitor prices to make deals look better.",
    positive: false,
  },
];

const commissionModel = [
  {
    service: "Flights",
    description: "Commission from airline booking platforms and consolidators.",
    note: "Tickets issued by licensed partners",
  },
  {
    service: "Hotels",
    description: "Referral commission from hotel booking networks.",
    note: "Booking handled by partner site",
  },
  {
    service: "Car Rentals",
    description: "Commission from car rental aggregators and providers.",
    note: "Rental agreement with provider",
  },
  {
    service: "Travel Extras",
    description: "Affiliate commission from travel insurance, activities, and transfers.",
    note: "Services provided by partners",
  },
];

const complianceItems = [
  {
    title: "Tax-Compliant Revenue",
    description: "All commission revenue is properly reported and taxed according to US regulations.",
  },
  {
    title: "Partner Transparency",
    description: "Clear agreements with partners on commission structures and payment terms.",
  },
  {
    title: "Audit-Ready Records",
    description: "Complete financial records maintained for regulatory compliance and audits.",
  },
  {
    title: "Regular Reviews",
    description: "Quarterly review of pricing practices and partner agreements for compliance.",
  },
];

const FinancialTransparency = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Financial Transparency | ZIVO"
        description="How ZIVO earns money - transparent commission-based model with no hidden fees or price markups."
        canonical="https://hizivo.com/financial-transparency"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
              <DollarSign className="w-3 h-3 mr-1" />
              Financial Transparency
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              How ZIVO Earns Money
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ZIVO earns through transparent partner commissions. 
              We never add hidden fees to the prices you see.
            </p>
          </div>

          {/* Revenue Explanation */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Revenue Sources Explained</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {revenueExplanation.map((item) => (
                <Card key={item.title} className="border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-16">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">How the Commission Model Works</h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold">You Search</p>
                  <p className="text-sm text-muted-foreground">on ZIVO</p>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold">Partner Fulfills</p>
                  <p className="text-sm text-muted-foreground">Booking</p>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="font-semibold">Partner Pays</p>
                  <p className="text-sm text-muted-foreground">Commission</p>
                </div>
              </div>
              <p className="text-center text-muted-foreground mt-6 max-w-xl mx-auto">
                The commission is already factored into the partner's pricing. 
                You pay the same price whether you book on ZIVO or directly with the partner.
              </p>
            </CardContent>
          </Card>

          {/* Pricing Promises */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Pricing Promises</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pricingPromises.map((promise) => (
                <div 
                  key={promise.title} 
                  className={`p-6 rounded-xl border ${
                    promise.positive 
                      ? 'bg-emerald-500/5 border-emerald-500/20' 
                      : 'bg-muted/30 border-border/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <promise.icon className={`w-5 h-5 mt-0.5 ${
                      promise.positive ? 'text-emerald-500' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <h3 className="font-semibold mb-1">{promise.title}</h3>
                      <p className="text-sm text-muted-foreground">{promise.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Commission by Service */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Commission by Service</h2>
            <div className="space-y-4">
              {commissionModel.map((service) => (
                <Card key={service.service} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{service.service}</h3>
                        <p className="text-muted-foreground">{service.description}</p>
                      </div>
                      <Badge variant="secondary" className="w-fit">
                        {service.note}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Compliance */}
          <section className="mb-16">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Compliance & Reporting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {complianceItems.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Trust Statement */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-primary/10 border border-emerald-500/20">
            <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Our Transparency Commitment</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              ZIVO is committed to transparent, honest pricing. We believe travelers 
              deserve to know exactly how we operate and how we earn money. No hidden 
              fees, no inflated prices, no tricks.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FinancialTransparency;
