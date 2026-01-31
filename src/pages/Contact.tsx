import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageCircle, 
  Mail, 
  Building2,
  Shield,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const contactEmails = [
  {
    label: "General questions & support",
    email: "info@hizivo.com",
    color: "text-sky-500",
  },
  {
    label: "Affiliate payments & billing",
    email: "payment@hizivo.com",
    color: "text-emerald-500",
  },
  {
    label: "Business partnerships & verification",
    email: "kimlain@hizivo.com",
    color: "text-violet-500",
  },
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Contact ZIVO | Get in Touch"
        description="Contact ZIVO for support, partnership inquiries, or billing questions. We're here to help."
        canonical="https://hizivo.com/contact"
      />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
              <MessageCircle className="w-3 h-3 mr-1" />
              Get in Touch
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Contact ZIVO
            </h1>
            <p className="text-lg text-muted-foreground">
              We're here to help.
            </p>
          </div>

          {/* Contact Emails */}
          <div className="space-y-4 mb-12">
            {contactEmails.map((item) => (
              <Card key={item.email} className="border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
                  <a 
                    href={`mailto:${item.email}`}
                    className={`flex items-center gap-2 text-lg font-medium hover:underline ${item.color}`}
                  >
                    <Mail className="w-5 h-5" />
                    {item.email}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Important Disclosure */}
          <div className="mb-12 p-6 rounded-2xl bg-muted/50 border border-border/50">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-foreground">
                  ZIVO is a travel search and comparison platform.
                </p>
                <p className="text-muted-foreground">
                  ZIVO does not sell tickets or process payments.
                </p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <Card className="mb-12 border-border/50 bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Building2 className="w-6 h-6 text-muted-foreground" />
                <div>
                  <h3 className="font-bold text-lg">ZIVO LLC</h3>
                  <p className="text-muted-foreground">
                    Travel Search & Comparison Platform
                  </p>
                  <p className="text-muted-foreground">
                    United States
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Center Link */}
          <Card className="bg-gradient-to-r from-primary/10 to-teal-500/5 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Need Quick Answers?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Check our Help Center for FAQs and guides.
                  </p>
                  <Link to="/help">
                    <Button size="sm" variant="outline" className="gap-2">
                      Visit Help Center
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
