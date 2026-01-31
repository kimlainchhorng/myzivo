import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageCircle, 
  Building2, 
  Clock,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
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
              Have questions about ZIVO Flights? We're here to help.
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
                  <p className="text-muted-foreground text-sm">
                    <strong>ZIVO is a flight search and comparison platform.</strong> We do not process 
                    bookings, payments, or issue tickets. If you have questions about a flight booking, 
                    cancellation, or refund, please contact the airline or travel agency where you 
                    completed your purchase directly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Email */}
            <Card className="border-sky-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-sky-500" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  For general inquiries, partnerships, or feedback:
                </p>
                <div className="space-y-2">
                  <a 
                    href="mailto:hello@zivo.travel" 
                    className="flex items-center gap-2 text-sky-500 hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    hello@zivo.travel
                  </a>
                  <p className="text-xs text-muted-foreground">
                    We typically respond within 24-48 business hours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Business Inquiries */}
            <Card className="border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-500" />
                  Business Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  For partnership and affiliate opportunities:
                </p>
                <div className="space-y-2">
                  <a 
                    href="mailto:partners@zivo.travel" 
                    className="flex items-center gap-2 text-purple-500 hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    partners@zivo.travel
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Airlines, travel agencies, and affiliate partners welcome
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What We Can Help With */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What We Can Help With</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-emerald-500">We CAN help with:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
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
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      Privacy and data requests
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-400">We CANNOT help with:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✕</span>
                      Flight booking modifications or cancellations
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✕</span>
                      Refunds or payment disputes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✕</span>
                      Boarding passes or check-in issues
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✕</span>
                      Baggage claims or in-flight issues
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✕</span>
                      Any issues with completed bookings
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="mb-8 bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">ZIVO LLC</h3>
                  <p className="text-muted-foreground mb-4">
                    Flight Search & Comparison Platform
                  </p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>United States</p>
                    <p>
                      Email: <a href="mailto:hello@zivo.travel" className="text-sky-500 hover:underline">hello@zivo.travel</a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time */}
          <div className="text-center p-6 rounded-xl bg-muted/50 border border-border">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Response Time</h3>
            <p className="text-sm text-muted-foreground">
              We aim to respond to all inquiries within 24-48 business hours.
              <br />
              Business hours: Monday - Friday, 9am - 5pm EST
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/about">
              <Button variant="outline" size="sm">
                About ZIVO
              </Button>
            </Link>
            <Link to="/affiliate-disclosure">
              <Button variant="outline" size="sm">
                Affiliate Disclosure
              </Button>
            </Link>
            <Link to="/privacy-policy">
              <Button variant="outline" size="sm">
                Privacy Policy
              </Button>
            </Link>
            <Link to="/terms-of-service">
              <Button variant="outline" size="sm">
                Terms of Service
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
