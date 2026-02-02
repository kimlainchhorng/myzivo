/**
 * Partner Disclosure Page
 * Updated for Hizivo hybrid model:
 * - Hotels & Cars: Merchant of Record (direct sale)
 * - Flights: Partner ticketing (referral)
 */
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  ExternalLink,
  Share2,
  HeadphonesIcon,
  Mail,
  CreditCard,
  Plane,
  Building2,
  Car,
  Shield,
  CheckCircle,
} from "lucide-react";

const PartnerDisclosure = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Partner Disclosure – Hizivo Travel"
        description="Understand how Hizivo handles bookings: Hotels & Car Rentals are sold directly by Hizivo. Flights are booked through licensed airline partners."
        canonical="https://hizivo.com/partner-disclosure"
      />
      <NavBar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold mb-4">
              Partner Disclosure
            </h1>
            <p className="text-muted-foreground">
              Understanding how Hizivo handles your bookings
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <section className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Hizivo is an online travel platform that allows users to search, compare, and book 
                flights, hotels, and car rentals. We operate a <strong>hybrid business model</strong> with 
                different handling for each service type.
              </p>
            </section>

            {/* Hotels & Car Rentals - MoR */}
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold">Hotels & Car Rentals (Direct Sale)</h2>
                </div>
                <p className="text-foreground leading-relaxed">
                  For <strong>hotel</strong> and <strong>car rental</strong> bookings, Hizivo is the <strong>merchant of record</strong>. 
                  This means:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                    <span>You pay Hizivo directly via secure checkout (Stripe/Adyen)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                    <span>Hizivo issues your booking confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                    <span>Hizivo handles refunds and cancellations per our policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                    <span>Contact Hizivo support for booking assistance</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Inventory is sourced from licensed B2B wholesaler partners. Final service is delivered by 
                  the hotel property or rental company.
                </p>
              </CardContent>
            </Card>

            {/* Flights - Partner Ticketing */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Plane className="w-5 h-5 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-bold">Flights (Partner Ticketing)</h2>
                </div>
                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-foreground font-medium">
                    ⚠️ Hizivo does NOT issue airline tickets.
                  </p>
                </div>
                <p className="text-foreground leading-relaxed">
                  Flight bookings are completed with <strong>licensed airline partners</strong>. When you 
                  select a flight and proceed to book:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                    <span>You are redirected to the airline partner's secure checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                    <span>The airline partner processes your payment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                    <span>The airline partner issues your ticket and confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                    <span>Changes, cancellations, and refunds are handled by the partner</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  For flight booking support, please contact the airline partner listed in your 
                  confirmation email.
                </p>
              </CardContent>
            </Card>

            {/* Pricing Notice */}
            <section>
              <p className="text-muted-foreground leading-relaxed">
                Prices and availability shown on Hizivo may change before you complete checkout. 
                For hotels and car rentals, the final price is confirmed at Hizivo checkout. 
                For flights, the final price is confirmed on the airline partner's checkout page.
              </p>
            </section>

            {/* Information Sharing */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Information Sharing</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Hotels & Car Rentals:</strong> Your booking details are shared with the 
                  property/rental company to fulfill your reservation.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Flights:</strong> If you proceed to partner checkout, Hizivo may share 
                  necessary information (traveler details, contact information) with the airline 
                  partner to complete your booking. This information is shared only with your consent.
                </p>
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card className="bg-muted/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <HeadphonesIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold">Customer Support</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Hotels & Car Rentals</p>
                      <p className="text-sm text-muted-foreground">
                        Contact Hizivo for booking changes, cancellations, refunds, or issues.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Plane className="w-5 h-5 text-sky-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Flights</p>
                      <p className="text-sm text-muted-foreground">
                        Contact the airline partner listed in your confirmation email. Hizivo can 
                        only assist with website-related issues.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <a 
                    href="mailto:support@hizivo.com" 
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    support@hizivo.com
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Related Links */}
            <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-border">
              <Link 
                to="/terms" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                to="/privacy" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                to="/refund-policy" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Refund Policy
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                to="/cookies" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PartnerDisclosure;
