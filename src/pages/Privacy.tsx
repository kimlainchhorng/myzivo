import { ArrowLeft, Shield, Mail, Database, Share2, Settings, UserCheck } from "lucide-react";
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
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-card/50 rounded-2xl p-6 border border-border">
            <p className="text-foreground leading-relaxed">
              ZIVO collects information you provide (such as name, email, phone, and traveler details when applicable) and technical data (such as device/browser data, cookies, and analytics) to operate and improve the platform.
            </p>
          </section>

          {/* How We Use Data */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Database className="w-5 h-5 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">How We Use Data</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Provide search and referral services
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Prevent fraud and secure the platform
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Customer support
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Analytics and performance improvements
                </li>
              </ul>
            </div>
          </section>

          {/* Sharing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Share2 className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Sharing</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <p className="text-foreground leading-relaxed">
                We may share required booking information with Travel Partners when you proceed to checkout (with consent where required).
              </p>
              <p className="text-foreground leading-relaxed">
                We may share data with vendors who help us run the platform (analytics, hosting), under contracts.
              </p>
            </div>
          </section>

          {/* Your Choices */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Settings className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Your Choices</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  You may request access or deletion of your data where applicable.
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  You can manage cookies in your browser settings.
                </li>
              </ul>
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
                For questions regarding this Privacy Policy:
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

export default Privacy;
