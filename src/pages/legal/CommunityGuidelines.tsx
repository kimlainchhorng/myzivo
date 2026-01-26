import { Link } from "react-router-dom";
import { ArrowLeft, Users, Shield, Heart, AlertTriangle, ThumbsUp, ThumbsDown, MessageSquare, Flag, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CommunityGuidelines = () => {
  const lastUpdated = "January 26, 2026";

  const coreValues = [
    {
      icon: Heart,
      title: "Respect",
      description: "Treat everyone with dignity and respect, regardless of background, identity, or beliefs.",
      color: "text-pink-500",
    },
    {
      icon: Shield,
      title: "Safety",
      description: "Prioritize the physical and emotional safety of yourself and others at all times.",
      color: "text-primary",
    },
    {
      icon: Users,
      title: "Inclusivity",
      description: "Welcome and support all members of our diverse community.",
      color: "text-amber-500",
    },
  ];

  const guidelines = [
    {
      title: "For Riders & Customers",
      items: [
        "Be ready at your pickup location when the driver arrives",
        "Treat drivers and delivery partners with respect and courtesy",
        "Keep vehicles clean; report any issues immediately",
        "Never ask drivers to violate traffic laws or speed",
        "Do not discriminate against drivers based on protected characteristics",
        "Tip is optional but appreciated for great service",
        "Provide accurate delivery instructions and be available to receive orders",
      ],
    },
    {
      title: "For Drivers & Delivery Partners",
      items: [
        "Maintain a professional appearance and demeanor",
        "Keep your vehicle clean, safe, and well-maintained",
        "Follow all traffic laws and prioritize passenger safety",
        "Never drive under the influence of drugs or alcohol",
        "Respect passenger privacy; do not record without consent",
        "Do not discriminate against passengers based on protected characteristics",
        "Handle food orders with care to ensure quality delivery",
        "Communicate promptly about delays or issues",
      ],
    },
    {
      title: "For All Users",
      items: [
        "Use your real identity and provide accurate information",
        "Do not engage in fraudulent activity or abuse promotions",
        "Report safety concerns immediately",
        "Respect other users' personal space and boundaries",
        "Do not use offensive, threatening, or discriminatory language",
        "Comply with all applicable laws and regulations",
        "Do not solicit or offer services outside the ZIVO platform",
      ],
    },
  ];

  const prohibitedBehaviors = [
    { behavior: "Physical violence or threats", severity: "Immediate ban" },
    { behavior: "Sexual harassment or assault", severity: "Immediate ban" },
    { behavior: "Discrimination based on protected characteristics", severity: "Immediate ban" },
    { behavior: "Drug or alcohol use while providing services", severity: "Immediate ban" },
    { behavior: "Carrying weapons (where prohibited)", severity: "Immediate ban" },
    { behavior: "Fraud or identity theft", severity: "Immediate ban" },
    { behavior: "Verbal abuse or profanity", severity: "Warning to ban" },
    { behavior: "Unsafe driving", severity: "Warning to ban" },
    { behavior: "Persistent low ratings", severity: "Account review" },
    { behavior: "Cancellation abuse", severity: "Account review" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-rides flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Community Guidelines</h1>
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-eats/10 border-0">
          <CardContent className="p-6">
            <h2 className="font-display font-bold text-2xl mb-3">Building a Safe & Respectful Community</h2>
            <p className="text-muted-foreground leading-relaxed">
              ZIVO connects millions of people every day. These guidelines help ensure every interaction 
              is safe, respectful, and positive. Violations may result in warnings, temporary suspension, 
              or permanent removal from the platform.
            </p>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {coreValues.map((value) => (
            <Card key={value.title}>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4`}>
                  <value.icon className={`h-6 w-6 ${value.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guidelines by Role */}
        <div className="space-y-6 mb-8">
          {guidelines.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ThumbsUp className="h-4 w-4 text-success mt-1 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Prohibited Behaviors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Prohibited Behaviors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prohibitedBehaviors.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <ThumbsDown className="h-4 w-4 text-destructive" />
                    <span>{item.behavior}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.severity === "Immediate ban"
                        ? "bg-destructive/10 text-destructive border-destructive"
                        : item.severity === "Warning to ban"
                        ? "bg-warning/10 text-warning border-warning"
                        : "bg-muted"
                    }
                  >
                    {item.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reporting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              How to Report Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you experience or witness a violation of these guidelines, please report it immediately:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="font-semibold mb-1">In-App</p>
                <p className="text-sm text-muted-foreground">Trip History → Report Issue</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="font-semibold mb-1">Emergency</p>
                <p className="text-sm text-muted-foreground">1-800-ZIVO-SOS</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="font-semibold mb-1">Email</p>
                <p className="text-sm text-muted-foreground">safety@zivo.com</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              All reports are reviewed by our Trust & Safety team. Serious incidents are escalated immediately.
            </p>
          </CardContent>
        </Card>

        {/* Anti-Discrimination */}
        <Card className="mb-8 border-primary/50">
          <CardContent className="p-6">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Anti-Discrimination Policy
            </h3>
            <p className="text-muted-foreground mb-4">
              ZIVO is committed to providing a discrimination-free platform. We do not tolerate discrimination 
              based on:
            </p>
            <div className="flex flex-wrap gap-2">
              {["Race", "Color", "Religion", "National Origin", "Disability", "Sex", "Gender Identity", 
                "Sexual Orientation", "Age", "Marital Status", "Veteran Status"].map((item) => (
                <Badge key={item} variant="outline">{item}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Drivers must accept all ride requests without discrimination. Customers must treat all service 
              providers equally. Violations result in permanent account termination.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Questions About These Guidelines?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our Community Team for clarification or to provide feedback.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/help">
                <Button>Visit Help Center</Button>
              </Link>
              <Link to="/terms-of-service">
                <Button variant="outline">Terms of Service</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CommunityGuidelines;
