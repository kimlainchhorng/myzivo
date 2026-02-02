/**
 * Partner Disclosure Page
 * Required legal disclosure for Hizovo Travel affiliate/partner model
 */
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Scale, 
  Building2,
  ArrowRightLeft,
  Shield,
  CreditCard,
  HeadphonesIcon,
  Mail
} from "lucide-react";

const PartnerDisclosure = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Partner Disclosure – Hizovo Travel"
        description="Hizovo is not the merchant of record. Travel bookings are fulfilled by licensed third-party providers."
        canonical="https://hizivo.com/partner-disclosure"
      />
      <NavBar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Scale className="w-3 h-3 mr-1" />
              Legal Disclosure
            </Badge>
            <h1 className="font-display text-4xl font-bold mb-4">
              Partner Disclosure
            </h1>
            <p className="text-sm text-muted-foreground">
              Effective Date: February 1, 2026
            </p>
          </div>

          {/* Main Disclosure Banner */}
          <Card className="border-primary/30 bg-primary/5 mb-8">
            <CardContent className="p-6">
              <p className="text-lg font-medium text-center">
                Hizovo is not the merchant of record. Travel bookings are fulfilled by 
                licensed third-party providers.
              </p>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            {/* What Hizovo Is */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">What is Hizovo?</h2>
                </div>
                <p className="text-muted-foreground">
                  Hizovo Travel is a search and comparison platform that helps users find 
                  flights, hotels, and car rentals from multiple travel partners. We display 
                  options from various providers so you can compare and choose the best option 
                  for your needs.
                </p>
                <p className="text-muted-foreground">
                  <strong>Hizovo does not:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Sell travel products directly</li>
                  <li>Issue airline tickets, hotel confirmations, or rental agreements</li>
                  <li>Process payments for travel bookings</li>
                  <li>Act as your travel agent or booking agent</li>
                </ul>
              </CardContent>
            </Card>

            {/* Partner Booking Flow */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">How Booking Works</h2>
                </div>
                <p className="text-muted-foreground">
                  When you click "Continue to secure checkout" or similar booking buttons on Hizovo, 
                  you will be redirected to our travel partner's website to complete your booking.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Search for flights, hotels, or cars on Hizovo</li>
                    <li>Compare options and select your preferred choice</li>
                    <li>Review traveler information (collected with your consent)</li>
                    <li>Redirect to partner checkout to complete payment</li>
                    <li>Receive confirmation directly from the travel partner</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Payment & Ticketing */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Payment & Ticketing</h2>
                </div>
                <p className="text-muted-foreground">
                  All payments are processed directly by our travel partners (the merchant of record). 
                  Hizovo does not collect, store, or process credit card information for travel bookings.
                </p>
                <p className="text-muted-foreground">
                  The travel partner is responsible for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Processing your payment securely</li>
                  <li>Issuing tickets, confirmations, and vouchers</li>
                  <li>Fulfilling your travel service</li>
                  <li>Providing final pricing (which may vary from estimates shown on Hizovo)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <HeadphonesIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Customer Support</h2>
                </div>
                <p className="text-muted-foreground">
                  For booking changes, cancellations, refunds, or ticketing issues, 
                  please contact the travel partner directly. Their support information 
                  will be provided in your booking confirmation.
                </p>
                <p className="text-muted-foreground">
                  Hizovo can assist with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Website navigation and search issues</li>
                  <li>General questions about our service</li>
                  <li>Directing you to the correct partner support</li>
                </ul>
              </CardContent>
            </Card>

            {/* Affiliate Disclosure */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Affiliate Compensation</h2>
                </div>
                <p className="text-muted-foreground">
                  Hizovo may receive a commission from travel partners when you complete 
                  a booking through our platform. This compensation helps us maintain and 
                  improve our free search service.
                </p>
                <p className="text-muted-foreground">
                  Important: This commission is paid by the partner and does not increase 
                  the price you pay. The final booking price is determined entirely by the 
                  travel partner.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Questions?</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this disclosure or our partner relationships, 
                  please contact us:
                </p>
                <p className="text-sm">
                  <strong>Email:</strong>{" "}
                  <a 
                    href="mailto:support@hizivo.com" 
                    className="text-primary hover:underline"
                  >
                    support@hizivo.com
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Related Links */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
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
