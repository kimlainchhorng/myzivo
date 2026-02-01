import { ArrowLeft, FileText, Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms & Conditions - ZIVO | Travel Search Platform"
        description="Read the terms and conditions for using ZIVO, a travel search and comparison platform. We do not sell tickets or process payments."
        canonical="https://hizivo.com/terms"
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">
            Effective Date: February 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section className="bg-card/50 rounded-2xl p-6 border border-border">
            <p className="text-foreground leading-relaxed">
              Welcome to ZIVO (
              <a href="https://hizivo.com" className="text-primary hover:underline">
                https://hizivo.com
              </a>
              ).
            </p>
            <p className="text-foreground leading-relaxed mt-4">
              By using this website, you agree to the following terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Service Description</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground">
                ZIVO is a travel search and comparison platform.
                We provide tools to search and compare travel options from third-party partners.
              </p>
              <p className="text-foreground font-semibold mt-4">ZIVO does NOT:</p>
              <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
                <li>Sell travel products</li>
                <li>Process payments</li>
                <li>Issue tickets</li>
                <li>Act as a travel agency</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Bookings</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground">
                All bookings and payments are completed on third-party partner websites.
              </p>
              <p className="text-foreground font-semibold mt-4">ZIVO is not responsible for:</p>
              <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
                <li>Pricing changes</li>
                <li>Booking availability</li>
                <li>Cancellations or refunds</li>
                <li>Customer service provided by partners</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">No Guarantees</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground">
                Prices, availability, and travel details may change at any time.
                ZIVO does not guarantee accuracy of pricing or availability.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Affiliate Relationships</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground">
                ZIVO may earn commissions when users book through partner links.
                This does not increase the cost to users.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground font-semibold">ZIVO is not liable for:</p>
              <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
                <li>Travel disruptions</li>
                <li>Booking issues</li>
                <li>Partner service quality</li>
                <li>Losses resulting from third-party services</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Website Use</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground">
                You agree not to misuse this website or attempt unauthorized access.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Changes to Terms</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground">
                ZIVO may update these Terms at any time.
                Continued use of the site indicates acceptance of updated terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground mb-4">
                For questions regarding these Terms:
              </p>
              <div className="flex flex-col gap-3">
                <a 
                  href="mailto:info@hizivo.com" 
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  info@hizivo.com
                </a>
                <a 
                  href="https://hizivo.com" 
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  https://hizivo.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
