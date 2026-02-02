import { ArrowLeft, Cookie, Settings, BarChart3, Megaphone, Shield, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Cookie Policy - ZIVO | Travel Search Platform"
        description="Learn how ZIVO uses cookies and similar technologies to improve your experience on our travel search platform."
        canonical="https://hizivo.com/cookies"
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
            <Cookie className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">
            Effective Date: February 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-card/50 rounded-2xl p-6 border border-border">
            <p className="text-foreground leading-relaxed">
              ZIVO uses cookies and similar technologies to enhance your experience on our travel search platform.
            </p>
          </section>

          {/* How We Use Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Cookie className="w-5 h-5 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">How We Use Cookies</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Keep the site working properly
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Remember preferences
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Measure performance and improve user experience
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Support marketing attribution (where enabled)
                </li>
              </ul>
            </div>
          </section>

          {/* Types of Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Settings className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Types of Cookies</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <p className="font-semibold text-foreground">Essential Cookies</p>
                </div>
                <p className="text-sm text-muted-foreground">Required for core site functionality. Cannot be disabled.</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-sky-500" />
                  <p className="font-semibold text-foreground">Functional Cookies</p>
                </div>
                <p className="text-sm text-muted-foreground">Remember your preferences and enhance features.</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <p className="font-semibold text-foreground">Analytics Cookies</p>
                </div>
                <p className="text-sm text-muted-foreground">Help us understand usage patterns and improve performance.</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-amber-500" />
                  <p className="font-semibold text-foreground">Marketing Cookies</p>
                </div>
                <p className="text-sm text-muted-foreground">Used for marketing attribution where enabled.</p>
              </div>
            </div>
          </section>

          {/* Managing Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Settings className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Managing Cookies</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed">
                You can control cookies through your browser settings. Some cookies are required for core site functionality and cannot be disabled.
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
                For questions regarding this Cookie Policy:
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

export default CookiePolicy;
