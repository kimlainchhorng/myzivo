import { ArrowLeft, Cookie, Mail } from "lucide-react";
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
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Cookie className="w-5 h-5 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">How We Use Cookies</h2>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border">
              <p className="text-foreground leading-relaxed mb-4">
                Hizivo uses cookies and similar technologies to:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Enable core site functionality
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Remember preferences
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Analyze traffic and performance
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                  Support marketing attribution
                </li>
              </ul>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="bg-muted/30 rounded-2xl p-6 border border-border">
            <p className="text-foreground leading-relaxed">
              Some cookies are required for the site to function properly. You can manage cookies through your browser settings.
            </p>
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

export default CookiePolicy;
