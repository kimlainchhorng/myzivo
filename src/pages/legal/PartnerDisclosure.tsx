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
  Plane, 
  CreditCard,
  RefreshCw,
  Shield,
  FileText,
  Mail,
  AlertCircle,
  Check,
  HeadphonesIcon,
} from "lucide-react";

const PartnerDisclosure = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Partner Disclosure – Hizovo Travel"
        description="Hizovo is not the merchant of record. Travel bookings are fulfilled by licensed third-party providers."
        canonical="https://hizovo.com/partner-disclosure"
      />
      <NavBar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-flights/20 text-flights border-flights/30">
              <Plane className="w-3 h-3 mr-1" />
              Travel Bookings
            </Badge>
            <h1 className="font-display text-4xl font-bold mb-2">
              Partner Disclosure
            </h1>
            <p className="text-muted-foreground mb-2">
              How ZIVO works with travel partners
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: February 1, 2026
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Introduction Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  ZIVO provides travel search and referral services that help you compare flight, 
                  hotel, and car rental options. When you choose an offer and continue to checkout, 
                  you will be redirected to (or complete checkout with) a third-party travel provider 
                  ("<strong>Travel Partner</strong>") that processes your payment, issues tickets or 
                  confirmations, and fulfills your reservation.
                </p>
              </CardContent>
            </Card>

            {/* Merchant of Record */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Merchant of Record</h2>
                </div>
                <p className="text-muted-foreground">
                  For travel bookings, <strong>ZIVO is NOT the merchant of record</strong>. 
                  The Travel Partner handles all aspects of your booking:
                </p>
                <ul className="space-y-2 ml-1">
                  {[
                    "Pricing & payment processing",
                    "Booking fulfillment",
                    "Customer service for reservations",
                    "Changes & cancellations",
                    "Ticket/confirmation issuance",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pricing & Availability */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-bold">Pricing & Availability</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Prices and availability may change between the time you view results on ZIVO 
                  and the time you complete checkout with the Travel Partner. Final pricing and 
                  booking terms are shown on the Travel Partner's checkout page.
                </p>
              </CardContent>
            </Card>

            {/* Booking Terms */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold">Booking Terms</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Your booking is subject to the Travel Partner's terms and conditions, 
                  privacy policy, and cancellation/refund rules. Please review these 
                  carefully during checkout.
                </p>
              </CardContent>
            </Card>

            {/* Information Sharing - Important Callout */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold">Information Sharing</h2>
                  </div>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Important
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  If you proceed to checkout, certain information you provide (such as 
                  traveler/guest details and contact information) may be shared with the 
                  Travel Partner to complete your booking. <strong>We will ask for your 
                  consent when required.</strong>
                </p>
              </CardContent>
            </Card>

            {/* Support - Two Column */}
            <Card className="bg-muted/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <HeadphonesIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold">Need Help?</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Reservation Support */}
                  <div className="p-4 rounded-lg bg-background border">
                    <p className="font-medium mb-1">Reservation Issues</p>
                    <p className="text-sm text-muted-foreground">
                      Contact the Travel Partner directly. Their support information 
                      will be in your confirmation email.
                    </p>
                  </div>
                  
                  {/* Website Support */}
                  <div className="p-4 rounded-lg bg-background border">
                    <p className="font-medium mb-1">Website Issues</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      For navigation or search problems:
                    </p>
                    <a 
                      href="mailto:support@hizivo.com" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Mail className="w-3 h-3" />
                      support@hizovo.com
                    </a>
                  </div>
                </div>
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
