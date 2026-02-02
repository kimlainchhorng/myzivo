/**
 * Partner Disclosure Page
 * Required legal disclosure for Hizivo Travel affiliate/partner model
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
} from "lucide-react";

const PartnerDisclosure = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Partner Disclosure – Hizivo Travel"
        description="Hizivo is not the merchant of record. Travel bookings are fulfilled by licensed third-party providers."
        canonical="https://hizovo.com/partner-disclosure"
      />
      <NavBar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold mb-4">
              Partner Disclosure
            </h1>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <section className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Hizivo provides a travel search and referral platform that allows users to search 
                and compare flights, hotels, and car rental options.
              </p>
            </section>

            {/* Merchant of Record */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed">
                  Hizivo is <strong>NOT</strong> the merchant of record for travel services. When you choose 
                  an offer and continue to checkout, your booking is completed directly with a licensed 
                  third-party travel provider ("<strong>Travel Partner</strong>"). The Travel Partner is 
                  responsible for pricing, payment processing, ticketing, confirmations, changes, 
                  cancellations, refunds, and customer support related to your reservation.
                </p>
              </CardContent>
            </Card>

            {/* Pricing Notice */}
            <section>
              <p className="text-muted-foreground leading-relaxed">
                Prices and availability shown on Hizivo may change before you complete checkout with 
                the Travel Partner. Final prices, terms, and conditions are displayed on the Travel 
                Partner's checkout page.
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
                  If you proceed to checkout, Hizivo may share necessary information (such as traveler 
                  or guest details and contact information) with the Travel Partner to complete your 
                  booking. This information is shared only with your consent.
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
                <p className="text-muted-foreground leading-relaxed">
                  For questions about an existing booking (including changes, cancellations, refunds, 
                  or confirmations), please contact the Travel Partner listed in your confirmation email. 
                  Hizivo can assist only with issues related to the use of our website.
                </p>
                <div className="pt-2">
                  <a 
                    href="mailto:support@hizivo.com" 
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Contact: support@hizivo.com
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
                to="/cookies" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Policy
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                to="/affiliate-disclosure" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Affiliate Disclosure
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
