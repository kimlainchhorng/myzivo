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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
// PressKitAssets removed

const companyFacts = [
  { label: "Founded", value: "2024" },
  { label: "Headquarters", value: "United States" },
  { label: "Services", value: "Flights, Hotels, Car Rentals, Rides, Eats, Move" },
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
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
              <Newspaper className="w-3 h-3 mr-1" />
              Press & Media
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Press Resources
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access press resources, brand assets, and contact our media relations team.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="contact" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] lg:mx-auto">
              <TabsTrigger value="contact">Media Contact</TabsTrigger>
              <TabsTrigger value="assets">Press Kit</TabsTrigger>
            </TabsList>

            {/* Contact Tab */}
            <TabsContent value="contact">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Company Facts */}
                   <Card className="border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
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
                   <Card className="border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
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
                   <Card className="border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <Link to="/brand">
                          <Palette className="w-4 h-4" />
                          Brand & Mission
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <Link to="/company-profile">
                          <Building2 className="w-4 h-4" />
                          Company Profile
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <Link to="/about">
                          <Users className="w-4 h-4" />
                          About ZIVO
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Contact Form */}
                <Card className="border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
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
                      <Button type="submit" className="w-full shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-shadow">
                        Submit Inquiry
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        We typically respond within 24-48 business hours.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Coverage */}
              <section className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Recent Coverage</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { outlet: "TechCrunch", title: "ZIVO raises seed round to unify travel booking", date: "Jan 2025", category: "Funding", emoji: "💰" },
                    { outlet: "Travel Weekly", title: "How ZIVO is disrupting the OTA landscape", date: "Dec 2024", category: "Industry", emoji: "✈️" },
                    { outlet: "Forbes", title: "10 Travel Startups to Watch in 2025", date: "Nov 2024", category: "Recognition", emoji: "🏆" },
                    { outlet: "Skift", title: "ZIVO launches multi-modal travel platform", date: "Oct 2024", category: "Launch", emoji: "🚀" },
                    { outlet: "The Points Guy", title: "ZIVO Miles: A new loyalty program worth exploring", date: "Sep 2024", category: "Rewards", emoji: "⭐" },
                    { outlet: "Wired", title: "The future of AI-powered trip planning", date: "Aug 2024", category: "Technology", emoji: "🤖" },
                  ].map(a => (
                    <Card key={a.title} className="border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{a.emoji}</span>
                          <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                        </div>
                        <p className="font-semibold text-sm mb-1">{a.title}</p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-primary font-medium">{a.outlet}</p>
                          <p className="text-[10px] text-muted-foreground">{a.date}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Company Milestones */}
              <section className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Company Milestones</h2>
                <div className="space-y-3">
                  {[
                    { year: "2025", event: "Expanded to 50+ team members, launched ZIVO Rides & Eats", icon: "🎯" },
                    { year: "2024", event: "Founded ZIVO, launched flight search and hotel booking", icon: "🏁" },
                    { year: "2024", event: "ZIVO Miles loyalty program launched", icon: "⭐" },
                    { year: "2024", event: "Car rental and multi-city booking added", icon: "🚗" },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 hover:border-primary/20 transition-all">
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{m.event}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{m.year}</Badge>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Facts for Journalists */}
              <section className="mt-12">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-primary" /> Quick Facts for Journalists
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { q: "What is ZIVO?", a: "A unified travel and mobility platform for flights, hotels, car rentals, rides, food delivery, and more." },
                        { q: "Who founded ZIVO?", a: "ZIVO was founded in 2024 with a mission to connect how the world moves." },
                        { q: "Where is ZIVO based?", a: "United States, with a fully remote and global team." },
                        { q: "How does ZIVO make money?", a: "Referral commissions from travel partners, ZIVO+ memberships, and advertising." },
                      ].map(f => (
                        <div key={f.q} className="p-3 rounded-xl bg-card/60 border border-border/30">
                          <p className="text-xs font-bold text-foreground mb-1">{f.q}</p>
                          <p className="text-[11px] text-muted-foreground">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            {/* Press Kit Tab */}
            <TabsContent value="assets">
              <p className="text-muted-foreground text-center py-8">Press kit assets coming soon.</p>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Press;
