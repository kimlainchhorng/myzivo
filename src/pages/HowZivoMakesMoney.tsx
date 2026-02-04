/**
 * How ZIVO Makes Money - Transparency Page
 * Explains revenue model with full disclosure
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Eye,
  Plane,
  Building2,
  Car,
  Shield,
  CheckCircle2,
  DollarSign,
  Users,
  ArrowRight,
  Handshake,
  TrendingUp,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";

const revenueSources = [
  {
    icon: Plane,
    title: "Flight Bookings",
    description: "We earn a commission from our ticketing partners when you book a flight through ZIVO.",
    model: "Commission-based",
    note: "Price you pay = Partner price. No markup.",
  },
  {
    icon: Building2,
    title: "Hotel Bookings",
    description: "Hotels pay us a referral fee for successful bookings made through our platform.",
    model: "Referral commission",
    note: "You see the same rates as booking direct.",
  },
  {
    icon: Car,
    title: "Car Rentals",
    description: "We receive a commission from car rental providers for bookings facilitated through ZIVO.",
    model: "Commission-based",
    note: "Compare prices across multiple providers.",
  },
  {
    icon: Shield,
    title: "Travel Insurance & Add-ons",
    description: "When you purchase optional travel protection, our insurance partners share a portion of the premium.",
    model: "Partner commission",
    note: "Insurance is always optional.",
  },
];

const commitments = [
  {
    icon: DollarSign,
    title: "Your Price = Partner Price",
    description: "We don't add hidden fees or markups. The price you see comes directly from our partners.",
  },
  {
    icon: TrendingUp,
    title: "No Hidden Costs",
    description: "All fees, taxes, and charges are displayed transparently before you book.",
  },
  {
    icon: Users,
    title: "User-First Approach",
    description: "Our business model aligns our success with yours—we succeed when you find great deals.",
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description: "We never sell your personal data. Your information is used only to improve your experience.",
  },
];

const faqs = [
  {
    question: "Does ZIVO charge extra fees?",
    answer: "No. ZIVO does not add service fees or markups to the prices shown by our partners. The price you see is the price you pay.",
  },
  {
    question: "Are prices on ZIVO higher than booking directly?",
    answer: "No. Our partners offer us the same rates as their direct channels. In some cases, you may find exclusive deals through ZIVO.",
  },
  {
    question: "How does commission affect which results I see?",
    answer: "Results are sorted by price and relevance by default, not by commission. You always see the best deal first.",
  },
  {
    question: "Is travel insurance required?",
    answer: "No. Travel insurance is always optional. We offer it because many travelers find it valuable, but you can skip it at checkout.",
  },
  {
    question: "What happens to my data?",
    answer: "Your data is used to process bookings and improve your experience. We never sell personal data to third parties. See our Privacy Policy for details.",
  },
];

const HowZivoMakesMoney = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="How ZIVO Makes Money | Transparency"
        description="Learn how ZIVO generates revenue. We believe in full transparency about our business model and commitment to fair pricing."
        canonical="https://hizivo.com/how-zivo-makes-money"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Eye className="w-3 h-3 mr-1" />
              Full Transparency
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              How ZIVO Makes Money
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe you deserve to know how we operate. Here's a clear breakdown 
              of our revenue model and our commitments to you.
            </p>
          </div>

          {/* Revenue Sources */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Handshake className="w-6 h-6 text-primary" />
              Our Revenue Sources
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {revenueSources.map((source) => (
                <Card key={source.title} className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <source.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-lg">{source.title}</span>
                        <p className="text-xs text-muted-foreground font-normal">
                          {source.model}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      {source.description}
                    </p>
                    <p className="text-sm font-medium text-primary flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {source.note}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Our Commitments */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Commitments to You</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {commitments.map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`faq-${index}`}
                      className="border-border/50 px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Related Links */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/affiliate-disclosure" className="gap-2">
                Affiliate Disclosure
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/partner-disclosure" className="gap-2">
                Partner Disclosure
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/privacy" className="gap-2">
                Privacy Policy
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowZivoMakesMoney;
