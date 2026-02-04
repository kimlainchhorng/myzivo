/**
 * Careers Page
 * Join ZIVO - talent attraction and culture
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Globe,
  Laptop,
  Lightbulb,
  Users,
  Heart,
  Plane,
  GraduationCap,
  Clock,
  DollarSign,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const cultureValues = [
  {
    icon: Globe,
    title: "Global-First Mindset",
    description: "We build for travelers worldwide, embracing diverse perspectives and markets.",
  },
  {
    icon: Laptop,
    title: "Remote-Ready Structure",
    description: "Work from anywhere. Our distributed team collaborates across time zones.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Culture",
    description: "We move fast, experiment boldly, and aren't afraid to challenge conventions.",
  },
  {
    icon: Heart,
    title: "Transparency",
    description: "Open communication, honest feedback, and clear expectations at all levels.",
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    description: "Salary and equity packages that reflect your impact and contribution.",
  },
  {
    icon: Clock,
    title: "Remote Flexibility",
    description: "Work from home, coffee shop, or anywhere with reliable internet.",
  },
  {
    icon: GraduationCap,
    title: "Learning & Development",
    description: "Budget for courses, conferences, and professional growth.",
  },
  {
    icon: Plane,
    title: "Travel Perks",
    description: "Discounts and credits on ZIVO platform for personal travel.",
  },
];

const departments = [
  {
    name: "Engineering",
    description: "Build the platform that powers millions of travel bookings.",
    roles: ["Full-Stack Engineers", "Backend Engineers", "Mobile Developers", "DevOps"],
  },
  {
    name: "Product",
    description: "Define the future of travel search and booking experiences.",
    roles: ["Product Managers", "Product Designers", "UX Researchers"],
  },
  {
    name: "Design",
    description: "Create beautiful, intuitive interfaces for global travelers.",
    roles: ["UI/UX Designers", "Brand Designers", "Motion Designers"],
  },
  {
    name: "Operations",
    description: "Keep the business running smoothly and efficiently.",
    roles: ["Partner Operations", "Customer Support", "Finance"],
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Careers | ZIVO"
        description="Join ZIVO and help build the future of travel. Remote-first, global-minded, innovation-driven."
        canonical="https://hizivo.com/careers"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Briefcase className="w-3 h-3 mr-1" />
              Careers
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Build the Future of Travel
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join a global team building the next generation of travel and 
              mobility experiences.
            </p>
          </div>

          {/* Mission Banner */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-sky-500/5 mb-16">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ZIVO connects how the world moves. We're building a unified platform 
                for travel and mobility that makes booking flights, hotels, cars, rides, 
                and more as simple as tapping a button.
              </p>
            </CardContent>
          </Card>

          {/* Culture Values */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Culture</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cultureValues.map((value) => (
                <Card key={value.title} className="border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Benefits & Perks</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-center">
                  <benefit.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Departments */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Teams</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {departments.map((dept) => (
                <Card key={dept.name} className="border-border/50">
                  <CardHeader>
                    <CardTitle>{dept.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{dept.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {dept.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Open Positions */}
          <section className="mb-16">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Open Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Open Positions</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    We don't have any open positions at this time. Sign up to be 
                    notified when new opportunities become available.
                  </p>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href="mailto:careers@hizivo.com">
                      <Mail className="w-4 h-4" />
                      Get Notified
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Section */}
          <section className="text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-sky-500/10 border border-primary/20">
            <Mail className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Don't see a role that fits? We're always looking for exceptional 
              talent. Send us your resume and tell us how you'd contribute.
            </p>
            <Button size="lg" className="gap-2" asChild>
              <a href="mailto:careers@hizivo.com">
                <Mail className="w-4 h-4" />
                careers@hizivo.com
              </a>
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
