import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  DollarSign, 
  Plane, 
  Shield, 
  ExternalLink,
  FileText,
  Scale,
  Heart
} from "lucide-react";

const AffiliateDisclosure = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
              <Scale className="w-3 h-3 mr-1" />
              Transparency Notice
            </Badge>
            <h1 className="font-display text-4xl font-bold mb-4">
              Affiliate Disclosure
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in full transparency. Here's how we earn revenue and how it affects your experience.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: January 30, 2026
            </p>
          </div>

          {/* Quick Summary */}
          <Card className="mb-8 border-sky-500/30 bg-sky-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                  <Info className="w-6 h-6 text-sky-500" />
                </div>
              <div>
                  <h2 className="text-xl font-bold mb-2">Quick Summary</h2>
                  <p className="text-muted-foreground">
                    <strong>ZIVO does not sell airline tickets.</strong> ZIVO Flights is a flight search and 
                    comparison platform. We help you find and compare flights from 500+ airlines, and then 
                    redirect you to our trusted travel partners to complete your booking. When you book a 
                    flight through our partner links, we may earn a commission at no additional cost to you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            {/* How We Earn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  How We Earn Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  ZIVO Flights operates as an affiliate comparison platform. We partner with 
                  leading travel booking sites and airlines to provide you with comprehensive 
                  flight search results. Our revenue model works as follows:
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 mt-1">•</span>
                    <span><strong>Affiliate Commissions:</strong> When you click through our links and complete a booking on a partner site, we receive a small commission (typically 1-3% of the booking value).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 mt-1">•</span>
                    <span><strong>Click Referrals:</strong> Some partners pay us a small fee for qualified referrals, regardless of whether a booking is completed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 mt-1">•</span>
                    <span><strong>Advertising:</strong> We may display promotional content from airline partners.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Our Partners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-sky-500" />
                  Our Affiliate Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We work with trusted travel industry partners to bring you the best flight options:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: "Skyscanner", type: "Meta-search" },
                    { name: "Kayak", type: "Meta-search" },
                    { name: "Google Flights", type: "Meta-search" },
                    { name: "Expedia", type: "OTA" },
                    { name: "Booking.com", type: "OTA" },
                    { name: "Direct Airlines", type: "Carrier" },
                  ].map((partner) => (
                    <div key={partner.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">{partner.name}</span>
                      <Badge variant="outline">{partner.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Your Guarantee */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  Your Guarantee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <h3 className="font-semibold mb-2 text-emerald-500">No Extra Cost</h3>
                    <p className="text-sm text-muted-foreground">
                      You pay the same price whether you book through us or directly. 
                      Our commission comes from the partner, not you.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
                    <h3 className="font-semibold mb-2 text-sky-500">Unbiased Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Our search results are sorted by price and value, not by 
                      commission rates. We show you the best deals first.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <h3 className="font-semibold mb-2 text-purple-500">Transparency</h3>
                    <p className="text-sm text-muted-foreground">
                      All affiliate links are clearly marked. You always know when 
                      you're being redirected to a partner site.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <h3 className="font-semibold mb-2 text-amber-500">Your Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      We never sell your personal information. See our Privacy 
                      Policy for details on data handling.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How Links Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-sky-500" />
                  How Affiliate Links Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  When you search for flights on ZIVO:
                </p>
                <ol className="space-y-3 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-sm flex items-center justify-center shrink-0">1</span>
                    <span>We query multiple booking platforms to find available flights and prices.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-sm flex items-center justify-center shrink-0">2</span>
                    <span>Results are displayed sorted by price, showing you the cheapest options first.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-sm flex items-center justify-center shrink-0">3</span>
                    <span>When you click "Book" or "Continue to Booking," you're redirected to the partner site.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-sm flex items-center justify-center shrink-0">4</span>
                    <span>The partner site handles your booking. We receive a commission if you complete the purchase.</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* FTC Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  FTC Compliance Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  In accordance with the Federal Trade Commission's guidelines on endorsements 
                  and testimonials (16 CFR Part 255), we disclose that ZIVO Flights may receive 
                  compensation for clicks and bookings made through affiliate links on our 
                  platform. This disclosure is made in good faith to ensure transparency with 
                  our users. Our editorial content and flight rankings are not influenced by 
                  our affiliate relationships.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Questions?</h3>
                    <p className="text-muted-foreground mb-3">
                      If you have any questions about our affiliate relationships or how we 
                      make money, please don't hesitate to contact us.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email: <a href="mailto:affiliates@zivo.travel" className="text-sky-500 hover:underline">affiliates@zivo.travel</a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AffiliateDisclosure;
