import { ArrowLeft, Shield, Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy - ZIVO | Travel Search & Comparison"
        description="Learn how ZIVO handles your data. We are a travel search platform that does not process payments or store sensitive information."
        canonical="https://hizivo.com/privacy"
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
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Effective Date: February 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section className="bg-card/50 rounded-2xl p-6 border border-border">
            <p className="text-foreground leading-relaxed">
              ZIVO ("we", "our", "us") operates the website{" "}
              <a href="https://hizivo.com" className="text-primary hover:underline">
                https://hizivo.com
              </a>.
            </p>
            <p className="text-foreground leading-relaxed mt-4">
              ZIVO is a travel search and comparison platform. We help users search and compare 
              flights, hotels, car rentals, and travel services from third-party partners.
            </p>
            <p className="text-foreground leading-relaxed mt-4 font-semibold">
              ZIVO does not sell tickets, process payments, or handle bookings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground">We may collect limited information such as:</p>
              <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
                <li>Device type and browser</li>
                <li>Pages visited</li>
                <li>Anonymous usage data</li>
              </ul>
              <p className="text-foreground mt-4 font-semibold">We do NOT collect:</p>
              <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
                <li>Credit card information</li>
                <li>Booking or payment details</li>
                <li>Sensitive personal data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Cookies & Tracking</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground">ZIVO may use cookies and tracking technologies to:</p>
              <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
                <li>Improve user experience</li>
                <li>Measure site performance</li>
                <li>Track outbound clicks to travel partners</li>
              </ul>
              <p className="text-foreground mt-4">
                Affiliate partners may use cookies to track bookings completed on their websites.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Partners</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground">
                When you click a link on ZIVO, you are redirected to a third-party website.
                Each partner has its own privacy policy and terms.
              </p>
              <p className="text-foreground font-semibold">
                ZIVO is not responsible for the privacy practices of third-party websites.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Affiliate Disclosure</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground">
                ZIVO may earn a commission when users book through partner links.
                This does not affect the price you pay.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground">
                We take reasonable measures to protect website data.
                However, no online platform can guarantee 100% security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact</h2>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground mb-4">
                If you have questions about this Privacy Policy, contact us:
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

export default Privacy;
