/**
 * Press & Media Page
 * Press kit, media inquiries, and company information
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Newspaper,
  Mail,
  Download,
  Building2,
  Users,
  Globe,
  Briefcase,
  FileText,
  ExternalLink,
  Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const companyFacts = [
  { label: "Founded", value: "2024" },
  { label: "Headquarters", value: "United States" },
  { label: "Services", value: "Flights, Hotels, Car Rentals, Travel Extras" },
  { label: "Markets", value: "United States (Expanding)" },
];

const pressContacts = [
  {
    label: "Media Inquiries",
    email: "press@hizivo.com",
    description: "For press releases, interviews, and media coverage",
  },
  {
    label: "Business Partnerships",
    email: "partners@hizivo.com",
    description: "For partnership and integration opportunities",
  },
  {
    label: "Corporate Accounts",
    email: "business@hizivo.com",
    description: "For enterprise and corporate travel solutions",
  },
];

const Press = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    outlet: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API
    toast.success("Thank you! We'll respond to your inquiry within 24-48 hours.");
    setFormData({ name: "", email: "", outlet: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Press & Media | ZIVO"
        description="ZIVO press resources, media kit, and contact information for journalists and media outlets."
        canonical="https://hizivo.com/press"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
              <Newspaper className="w-3 h-3 mr-1" />
              Press & Media
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Press Inquiries
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access press resources, brand assets, and contact our media relations team.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Company Facts */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Company Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companyFacts.map((fact) => (
                    <div key={fact.label} className="flex justify-between">
                      <span className="text-muted-foreground">{fact.label}</span>
                      <span className="font-medium">{fact.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Press Contacts */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Press Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pressContacts.map((contact) => (
                    <div key={contact.email} className="space-y-1">
                      <p className="font-medium">{contact.label}</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:underline"
                      >
                        {contact.email}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        {contact.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between" disabled>
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Press Kit (PDF)
                    </span>
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-between" disabled>
                    <span className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Brand Guidelines
                    </span>
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <Link to="/about">
                      <Building2 className="w-4 h-4" />
                      About ZIVO
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact Form */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Media Inquiry Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="jane@publication.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outlet">Media Outlet / Publication</Label>
                    <Input
                      id="outlet"
                      value={formData.outlet}
                      onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
                      placeholder="TechCrunch, Travel Weekly, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Inquiry *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      placeholder="Please describe your inquiry or interview request..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Inquiry
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We typically respond within 24-48 business hours.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Coverage Placeholder */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Recent Coverage</h2>
            <div className="text-center p-12 rounded-2xl bg-muted/30 border border-border/50">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Press coverage will be featured here as it becomes available.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Press;
