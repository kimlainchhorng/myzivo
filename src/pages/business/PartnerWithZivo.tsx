import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Handshake, Plane, Hotel, Car, DollarSign, BarChart3, Users, CheckCircle, ChevronRight, Mail, Building2, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PARTNER_TYPES = [
  {
    icon: Plane,
    title: "Airlines",
    description: "List your flights on ZIVO and reach millions of travelers",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: Hotel,
    title: "Hotels",
    description: "Showcase your properties to travelers booking complete trips",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Car,
    title: "Car Rentals",
    description: "Connect with travelers looking for ground transportation",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Building2,
    title: "Travel Agencies",
    description: "Distribute your inventory through our platform",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const BENEFITS = [
  { icon: Users, title: "Millions of Users", description: "Access our growing base of travelers" },
  { icon: DollarSign, title: "Competitive Commission", description: "Transparent revenue sharing" },
  { icon: BarChart3, title: "Real-Time Analytics", description: "Track performance and optimize" },
  { icon: Globe, title: "Global Reach", description: "Expand to new markets" },
];

export default function PartnerWithZivo() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission would go here
    alert("Thank you for your interest! Our partnerships team will contact you within 2-3 business days.");
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-lg">Partner with ZIVO</h1>
            <p className="text-xs text-muted-foreground">Grow your business with us</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <section className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
            <Handshake className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Become a ZIVO Partner
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Join our network of travel providers and connect with millions of travelers
            searching for their next adventure.
          </p>
        </section>

        {/* Partner Types */}
        <section>
          <h3 className="font-display text-2xl font-bold text-center mb-8">
            Who We Partner With
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNER_TYPES.map((type) => (
              <Card key={type.title} className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <type.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{type.title}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gradient-to-br from-card/90 to-card rounded-3xl p-8 shadow-xl">
          <h3 className="font-display text-2xl font-bold text-center mb-8">
            Why Partner with ZIVO?
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partnership Form */}
        <section className="max-w-2xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Get Started
              </CardTitle>
              <CardDescription>
                Fill out the form below and our partnerships team will contact you within 2-3 business days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input required placeholder="Your company name" />
                  </div>
                  <div>
                    <Label>Partner Type *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airline">Airline</SelectItem>
                        <SelectItem value="hotel">Hotel / Accommodation</SelectItem>
                        <SelectItem value="car">Car Rental</SelectItem>
                        <SelectItem value="agency">Travel Agency</SelectItem>
                        <SelectItem value="affiliate">Affiliate Marketer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Name *</Label>
                    <Input required placeholder="Full name" />
                  </div>
                  <div>
                    <Label>Job Title</Label>
                    <Input placeholder="Your role" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input required type="email" placeholder="business@company.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                <div>
                  <Label>Website</Label>
                  <Input type="url" placeholder="https://yourcompany.com" />
                </div>

                <div>
                  <Label>Tell us about your business</Label>
                  <Textarea
                    placeholder="Brief description of your offerings and why you'd like to partner with ZIVO..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-teal-400 text-primary-foreground h-12"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Submit Partnership Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Disclaimer */}
        <section className="text-center">
          <div className="bg-muted/20 rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Partner Disclosure:</strong> ZIVO acts as a booking facilitator
              and sub-agent. Travel services are provided by licensed partners. All partnerships are subject to
              review and approval based on ZIVO's quality and compliance standards.
            </p>
          </div>
          <div className="mt-4">
            <Link to="/partner-disclosure" className="text-primary text-sm hover:underline inline-flex items-center gap-1">
              Read full Partner Disclosure
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
