import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageCircle, 
  Building2, 
  Clock,
  AlertCircle,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ContactForm from "@/components/shared/ContactForm";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
              <MessageCircle className="w-3 h-3 mr-1" />
              Get in Touch
            </Badge>
            <h1 className="font-display text-4xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about ZIVO? We're here to help.
            </p>
          </div>

          {/* Important Notice */}
          <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-amber-500">Before You Contact Us</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    <strong>ZIVO is a travel search and comparison platform.</strong> We do not process 
                    bookings, payments, or issue tickets.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• For flight changes → Contact your airline</li>
                    <li>• For hotel modifications → Contact your booking site or hotel</li>
                    <li>• For car rental issues → Contact the rental company</li>
                    <li>• For refunds → Contact where you completed your booking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <ContactForm />

            {/* Contact Info & Help */}
            <div className="space-y-6">
              {/* Email Options */}
              <Card className="border-sky-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-sky-500" />
                    Email Us Directly
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">General Inquiries</p>
                      <a 
                        href="mailto:support@zivo.com" 
                        className="flex items-center gap-2 text-sky-500 hover:underline text-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        support@zivo.com
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Partnership & Business</p>
                      <a 
                        href="mailto:partners@zivo.com" 
                        className="flex items-center gap-2 text-purple-500 hover:underline text-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        partners@zivo.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <Clock className="w-3.5 h-3.5" />
                    We respond within 24-48 hours
                  </div>
                </CardContent>
              </Card>

              {/* What We Can Help With */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What We Can Help With</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-emerald-500 text-sm">We CAN help with:</h4>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500">✓</span>
                          Questions about how ZIVO works
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500">✓</span>
                          Technical issues with our website
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500">✓</span>
                          Partnership and affiliate inquiries
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500">✓</span>
                          Feedback and suggestions
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-400 text-sm">We CANNOT help with:</h4>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">✕</span>
                          Booking modifications or cancellations
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">✕</span>
                          Refunds or payment disputes
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">✕</span>
                          Boarding passes or check-in issues
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Center Link */}
              <Card className="bg-gradient-to-r from-primary/10 to-teal-500/5 border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">Need Quick Answers?</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Check our Help Center for FAQs and guides.
                      </p>
                      <Link to="/help">
                        <Button size="sm" variant="outline" className="gap-1">
                          Visit Help Center
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card className="bg-muted/30">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-bold">ZIVO LLC</h3>
                      <p className="text-sm text-muted-foreground">
                        Travel Search & Comparison Platform
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        United States
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/help">
                <Button variant="outline" size="sm">Help Center</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="sm">About ZIVO</Button>
              </Link>
              <Link to="/affiliate-disclosure">
                <Button variant="outline" size="sm">Affiliate Disclosure</Button>
              </Link>
              <Link to="/privacy-policy">
                <Button variant="outline" size="sm">Privacy Policy</Button>
              </Link>
              <Link to="/terms-of-service">
                <Button variant="outline" size="sm">Terms of Service</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
