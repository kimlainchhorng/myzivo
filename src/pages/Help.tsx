/**
 * Help Center Page
 * Public support hub with sections for Flights, Hotels, Cars, Account, Technical
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Plane, 
  Hotel, 
  Car, 
  User, 
  Monitor, 
  Search,
  ExternalLink,
  Shield,
  MessageCircle,
  ChevronRight,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";

const helpSections = [
  {
    id: "flights",
    icon: Plane,
    title: "Flights",
    description: "Flight search, booking, and changes",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    faqs: [
      {
        q: "How do I search for flights?",
        a: "Enter your departure and arrival cities, dates, and number of passengers on our Flights page. We'll compare options from our travel partners."
      },
      {
        q: "How do I change or cancel my flight?",
        a: "Flight changes and cancellations are handled by the travel partner who processed your booking. Check your confirmation email for their contact details."
      },
      {
        q: "Why did I get redirected to another site?",
        a: "Hizovo is a travel search platform. We help you find and compare options, then redirect you to our trusted travel partners to complete your booking securely."
      },
      {
        q: "Is my payment secure?",
        a: "Yes. All payments are processed directly by our licensed travel partners using industry-standard security. Hizovo never handles your payment information."
      },
    ],
  },
  {
    id: "hotels",
    icon: Hotel,
    title: "Hotels",
    description: "Hotel search, reservations, and policies",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    faqs: [
      {
        q: "How do I book a hotel?",
        a: "Search for hotels by destination and dates. Click 'View Deal' on any result to continue to our partner's checkout page."
      },
      {
        q: "Can I modify my hotel reservation?",
        a: "Reservation changes must be made through the travel partner who completed your booking. Check your confirmation email for their support contact."
      },
      {
        q: "What is the cancellation policy?",
        a: "Cancellation policies vary by hotel and rate. The policy is shown during booking on the partner site. Check your confirmation for specific terms."
      },
    ],
  },
  {
    id: "cars",
    icon: Car,
    title: "Car Rentals",
    description: "Car rental search and reservations",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    faqs: [
      {
        q: "How do I rent a car?",
        a: "Enter your pickup location, dates, and times. We'll show you options from rental partners. Click 'View Deal' to complete your booking."
      },
      {
        q: "What documents do I need?",
        a: "Typically you'll need a valid driver's license and credit card. Requirements vary by rental company and destination. Check with the partner directly."
      },
      {
        q: "How do I cancel a car rental?",
        a: "Contact the rental company directly using the information in your booking confirmation email."
      },
    ],
  },
  {
    id: "account",
    icon: User,
    title: "Account",
    description: "Account settings and preferences",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    faqs: [
      {
        q: "Do I need an account to search?",
        a: "No. You can search and compare travel options without an account. Creating an account lets you save searches and view your search history."
      },
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot Password' on the sign-in page and follow the email instructions."
      },
    ],
  },
  {
    id: "technical",
    icon: Monitor,
    title: "Technical Issues",
    description: "Site issues and troubleshooting",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    faqs: [
      {
        q: "The site isn't loading properly",
        a: "Try clearing your browser cache, disabling browser extensions, or using a different browser. For persistent issues, contact us."
      },
      {
        q: "I'm getting an error message",
        a: "Take a screenshot of the error and contact us through our support form. Include details about what you were trying to do."
      },
    ],
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filteredSections = helpSections.filter(section => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.faqs.some(faq => 
        faq.q.toLowerCase().includes(query) || 
        faq.a.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Help Center – ZIVO"
        description="Get help with flights, hotels, car rentals, and technical issues. Find answers to common questions about booking travel on Hizovo."
        canonical="https://hizivo.com/help"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <HelpCircle className="w-3 h-3 mr-1" />
              Help Center
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              How can we help?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions or contact us for support.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl"
            />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Link to="/support/travel-bookings">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Booking Support</p>
                    <p className="text-sm text-muted-foreground">Changes & cancellations</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/support/site-issues">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Site Issues</p>
                    <p className="text-sm text-muted-foreground">Troubleshooting</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/contact">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Contact Us</p>
                    <p className="text-sm text-muted-foreground">Get in touch</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Section Cards */}
          <div className="grid gap-6">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Card key={section.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setActiveSection(isActive ? null : section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${section.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${section.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                  
                  {isActive && (
                    <CardContent className="pt-0">
                      <Accordion type="single" collapsible className="w-full">
                        {section.faqs.map((faq, idx) => (
                          <AccordionItem key={idx} value={`faq-${idx}`}>
                            <AccordionTrigger className="text-left">
                              {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Partner Disclosure */}
          <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border/50">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-2">Important Notice</p>
                <p className="text-muted-foreground text-sm">
                  Hizovo is a travel search and comparison platform. We help you find and compare options 
                  from trusted travel partners. All bookings, payments, and fulfillment are handled by 
                  our licensed travel partners. For booking changes, cancellations, or refunds, please 
                  contact the travel partner directly using the information in your confirmation email.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Still need help?</p>
            <Button asChild>
              <Link to="/contact" className="gap-2">
                <Mail className="w-4 h-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
