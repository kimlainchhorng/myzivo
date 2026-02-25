import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Handshake,
  Mail,
  Plane,
  Hotel,
  Car,
  MapPin,
  Ticket,
  CheckCircle2,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function Partners() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Partners | ZIVO"
        description="Partner with ZIVO to reach qualified travel shoppers. We send ready-to-book traffic to airlines, hotels, car rental companies, and travel services."
        canonical="https://hizivo.com/partners"
      />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Handshake className="w-3 h-3 mr-1" />
              Partner Program
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Partners
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ZIVO is a travel search and comparison platform that connects users with trusted travel partners worldwide.
            </p>
          </div>

          {/* We help travelers discover */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">We help travelers discover and compare:</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground p-3 rounded-xl hover:bg-muted/40 transition-colors">
                <Plane className="w-5 h-5 text-primary" />
                Flights
              </li>
              <li className="flex items-center gap-3 text-muted-foreground p-3 rounded-xl hover:bg-muted/40 transition-colors">
                <Hotel className="w-5 h-5 text-primary" />
                Hotels & accommodations
              </li>
              <li className="flex items-center gap-3 text-muted-foreground p-3 rounded-xl hover:bg-muted/40 transition-colors">
                <Car className="w-5 h-5 text-primary" />
                Car rentals
              </li>
              <li className="flex items-center gap-3 text-muted-foreground p-3 rounded-xl hover:bg-muted/40 transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
                Airport transfers
              </li>
              <li className="flex items-center gap-3 text-muted-foreground p-3 rounded-xl hover:bg-muted/40 transition-colors">
                <Ticket className="w-5 h-5 text-primary" />
                Activities & travel services
              </li>
            </ul>
          </div>

          {/* Important Disclosure */}
          <div className="mb-12 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground font-medium mb-2">
                  ZIVO does not sell travel products, issue tickets, or process payments.
                </p>
                <p className="text-muted-foreground">
                  All bookings are completed securely on our partners' websites.
                </p>
              </div>
            </div>
          </div>

          {/* How we work with partners */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">How we work with partners:</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                We send high-intent users who are actively searching and comparing
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                We do not interfere with partner checkout or pricing
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                We focus on transparency and compliance
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                We clearly disclose affiliate relationships
              </li>
            </ul>
          </div>

          {/* Traffic sources */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Traffic sources used by ZIVO:</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                Organic search (SEO)
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                Direct traffic
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                Social media
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                Email notifications (opt-in only)
              </li>
            </ul>
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground font-medium mb-2">We do NOT use:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>❌ Incentivized traffic</li>
                <li>❌ Trademark bidding</li>
                <li>❌ Spam or pop-ups</li>
              </ul>
            </div>
          </div>

          {/* Partner Description - Standard Answer */}
          <div className="mb-12 p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-lg font-bold mb-4">About ZIVO (Partner Description)</h2>
            <p className="text-muted-foreground leading-relaxed">
              "ZIVO is a travel search and booking platform that compares flights, hotels, and car rentals 
              from licensed travel providers. ZIVO acts as a booking facilitator and sub-agent. 
              All bookings are fulfilled by authorized partners."
            </p>
          </div>

          {/* Launch Status */}
          <div className="mb-12 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Launch Status
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Yes, the site is live in soft-launch mode with real users and compliant traffic sources.
            </p>
          </div>

          {/* Contact CTA */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-background to-teal-500/10 border border-primary/20 text-center">
            <p className="text-lg text-foreground mb-6">
              If you're interested in partnering with ZIVO, please contact us:
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-teal-400 gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-shadow"
              onClick={() => window.location.href = "mailto:kimlain@hizivo.com"}
            >
              <Mail className="w-5 h-5" />
              kimlain@hizivo.com
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
