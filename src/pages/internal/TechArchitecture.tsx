/**
 * TECH ARCHITECTURE PAGE
 * Internal documentation of ZIVO's technical infrastructure
 */

import {
  Cloud,
  Code2,
  Database,
  Globe,
  Layout,
  Lock,
  Monitor,
  Server,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TECH_STACK = {
  frontend: [
    { name: "React 18", purpose: "UI Framework", icon: "⚛️" },
    { name: "TypeScript", purpose: "Type Safety", icon: "📘" },
    { name: "Vite", purpose: "Build Tool", icon: "⚡" },
    { name: "Tailwind CSS", purpose: "Styling", icon: "🎨" },
    { name: "shadcn/ui", purpose: "Component Library", icon: "🧩" },
    { name: "TanStack Query", purpose: "Data Fetching", icon: "🔄" },
    { name: "React Router", purpose: "Routing", icon: "🛤️" },
    { name: "Framer Motion", purpose: "Animations", icon: "✨" },
  ],
  backend: [
    { name: "Supabase", purpose: "Backend Platform", icon: "🔥" },
    { name: "PostgreSQL", purpose: "Database", icon: "🐘" },
    { name: "Edge Functions", purpose: "Serverless APIs", icon: "⚡" },
    { name: "Row Level Security", purpose: "Data Protection", icon: "🔒" },
  ],
  infrastructure: [
    { name: "Lovable Cloud", purpose: "Hosting", icon: "☁️" },
    { name: "CDN", purpose: "Global Delivery", icon: "🌍" },
    { name: "SSL/TLS", purpose: "Encryption", icon: "🔐" },
    { name: "Auto-scaling", purpose: "Performance", icon: "📈" },
  ],
  integrations: [
    { name: "Stripe", purpose: "Payments", icon: "💳" },
    { name: "Travelpayouts", purpose: "Affiliate Network", icon: "✈️" },
    { name: "Mapbox", purpose: "Maps", icon: "🗺️" },
    { name: "Analytics", purpose: "Tracking", icon: "📊" },
  ],
};

const ARCHITECTURE_FEATURES = [
  {
    title: "Multi-Vertical Platform",
    description: "Unified codebase supporting flights, hotels, cars, and activities",
    icon: Layout,
  },
  {
    title: "Mobile-First Design",
    description: "Responsive PWA with native-like experience on all devices",
    icon: Smartphone,
  },
  {
    title: "Real-Time Data",
    description: "Live pricing and availability from partner APIs",
    icon: Zap,
  },
  {
    title: "Secure by Default",
    description: "Row-level security, encrypted data, and compliance-first design",
    icon: Shield,
  },
  {
    title: "Global CDN",
    description: "Edge-optimized delivery for fast load times worldwide",
    icon: Globe,
  },
  {
    title: "Scalable Infrastructure",
    description: "Auto-scaling serverless architecture handles traffic spikes",
    icon: Cloud,
  },
];

export default function TechArchitecture() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">Tech Architecture</h1>
                <p className="text-xs text-muted-foreground">
                  ZIVO Technical Overview
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              CONFIDENTIAL
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview */}
        <section className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            Modern Tech Stack
          </Badge>
          <h2 className="font-display text-3xl font-bold mb-4">
            Built for Scale & Speed
          </h2>
          <p className="text-muted-foreground">
            ZIVO is built on a modern, scalable architecture designed for 
            reliability, security, and rapid iteration. Our tech choices 
            prioritize developer productivity and user experience.
          </p>
        </section>

        {/* Architecture Features */}
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARCHITECTURE_FEATURES.map((feature) => (
              <Card key={feature.title} className="border-border/50">
                <CardContent className="pt-6">
                  <feature.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Frontend */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                Frontend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {TECH_STACK.frontend.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-lg">{tech.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Backend */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Backend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {TECH_STACK.backend.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-lg">{tech.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {TECH_STACK.infrastructure.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-lg">{tech.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Key Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {TECH_STACK.integrations.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-lg">{tech.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Architecture Diagram */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              System Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative p-6 rounded-lg bg-muted/20 border border-border/50">
              {/* Simplified architecture visualization */}
              <div className="grid grid-cols-3 gap-8 text-center">
                {/* Users */}
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground uppercase">Users</p>
                  <div className="space-y-2">
                    <ArchBlock icon="🌐" label="Web App" />
                    <ArchBlock icon="📱" label="Mobile PWA" />
                  </div>
                </div>

                {/* Application */}
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground uppercase">Application</p>
                  <div className="space-y-2">
                    <ArchBlock icon="⚛️" label="React Frontend" />
                    <ArchBlock icon="⚡" label="Edge Functions" />
                    <ArchBlock icon="🐘" label="PostgreSQL" />
                  </div>
                </div>

                {/* External */}
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground uppercase">Partners</p>
                  <div className="space-y-2">
                    <ArchBlock icon="✈️" label="Travel APIs" />
                    <ArchBlock icon="💳" label="Stripe" />
                    <ArchBlock icon="📊" label="Analytics" />
                  </div>
                </div>
              </div>

              {/* Connection lines (simplified) */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L9,3 z" fill="currentColor" className="text-border" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <SecurityCard
                title="Data Protection"
                items={[
                  "Row-Level Security (RLS)",
                  "Encrypted at rest & transit",
                  "PII minimization",
                  "GDPR/CCPA compliant",
                ]}
              />
              <SecurityCard
                title="Access Control"
                items={[
                  "Role-based permissions",
                  "Multi-factor authentication",
                  "Session management",
                  "Audit logging",
                ]}
              />
              <SecurityCard
                title="Infrastructure"
                items={[
                  "SSL/TLS everywhere",
                  "DDoS protection",
                  "Regular security scans",
                  "Automated backups",
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Technical documentation for authorized parties only.
            <br />
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}

function ArchBlock({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="p-3 rounded-lg bg-card border border-border/50">
      <span className="text-xl">{icon}</span>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}

function SecurityCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
      <p className="font-medium text-sm mb-3">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
            <Shield className="w-3 h-3 text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
