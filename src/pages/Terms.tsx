import { ArrowLeft, FileText, Mail, Shield, ExternalLink, Ban, Scale, AlertTriangle, RefreshCw, Search } from "lucide-react";
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
            Last updated: February 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-card/50 rounded-2xl p-6 border border-border">
            <p className="text-foreground leading-relaxed">
              By accessing or using Hizivo, you agree to these Terms of Service.
            </p>
          </section>

          {/* 1. Hizivo Services */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Search className="w-5 h-5 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">1. Hizivo Services</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                Hizivo operates an online platform that allows users to search, compare, and discover travel and mobility services. Hizivo does not sell or provide travel services unless explicitly stated.
              </p>
            </div>
          </section>

          {/* 2. No Merchant of Record */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">2. No Merchant of Record</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                Hizivo is not an airline, hotel, car rental company, or travel agency, and is not the merchant of record for travel bookings. All travel bookings are fulfilled by third-party providers who are responsible for payment processing, fulfillment, customer service, and refunds.
              </p>
            </div>
          </section>

          {/* 3. Third-Party Providers */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <ExternalLink className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">3. Third-Party Providers</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                When you leave Hizivo to complete a booking, you are subject to the terms and policies of the third-party provider. Hizivo is not responsible for the actions, content, pricing, availability, or services of third parties.
              </p>
            </div>
          </section>

          {/* 4. Accuracy of Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <AlertTriangle className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">4. Accuracy of Information</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                Hizivo displays information provided by third parties. While we strive for accuracy, we do not guarantee pricing, availability, or completeness of information.
              </p>
            </div>
          </section>

          {/* 5. Prohibited Use */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Ban className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">5. Prohibited Use</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                You agree not to misuse the platform, attempt unauthorized access, scrape data, or use Hizivo for unlawful purposes.
              </p>
            </div>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Scale className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">6. Limitation of Liability</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                To the maximum extent permitted by law, Hizivo shall not be liable for any indirect, incidental, or consequential damages related to travel bookings or third-party services.
              </p>
            </div>
          </section>

          {/* 7. Changes */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <RefreshCw className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">7. Changes</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                Hizivo may update these Terms at any time. Continued use of the platform constitutes acceptance of the updated Terms.
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
