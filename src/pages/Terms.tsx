import { ArrowLeft, FileText, Mail, Shield, ExternalLink, Ban, Scale, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Service - ZIVO | Travel Search Platform"
        description="Read the terms of service for using ZIVO, a travel search and comparison platform. We do not sell tickets or process payments."
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Effective Date: February 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-card/50 rounded-2xl p-6 border border-border">
            <p className="text-foreground leading-relaxed">
              By using ZIVO, you agree to these Terms. ZIVO provides an online platform to search and compare travel options and, where available, links you to third-party providers to complete purchases.
            </p>
          </section>

          {/* No Travel Seller Relationship */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Shield className="w-5 h-5 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">No Travel Seller Relationship</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                ZIVO does not sell travel, issue tickets, or process travel payments unless explicitly stated. Travel purchases are completed with third-party Travel Partners who are the merchant of record.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <ExternalLink className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Third-Party Services</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                Your use of Travel Partner websites/services is governed by their terms. ZIVO is not responsible for Travel Partner content, availability, pricing, service delivery, or booking fulfillment.
              </p>
            </div>
          </section>

          {/* Accuracy of Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <AlertTriangle className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Accuracy of Information</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                ZIVO displays information provided by third parties. We strive to keep it accurate, but we do not guarantee prices, availability, or completeness.
              </p>
            </div>
          </section>

          {/* Prohibited Use */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Ban className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Prohibited Use</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                You agree not to misuse the platform, attempt unauthorized access, scrape content at scale, or violate any laws.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Scale className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Limitation of Liability</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                To the maximum extent permitted by law, ZIVO will not be liable for indirect or consequential damages or losses related to travel bookings completed with Travel Partners.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Contact</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground mb-4">
                For questions regarding these Terms:
              </p>
              <a 
                href="mailto:support@hizivo.com" 
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <Mail className="w-4 h-4" />
                support@hizivo.com
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
