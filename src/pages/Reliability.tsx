/**
 * Reliability - Public-facing business continuity and service reliability page
 */

import { 
  Server, 
  Shield, 
  RefreshCw, 
  Activity,
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  Clock,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";

const reliabilityFeatures = [
  {
    title: "Service Monitoring",
    icon: Activity,
    description: "Continuous monitoring of all platform services and partner integrations",
    details: [
      "Real-time partner API health checks",
      "Automated availability monitoring",
      "Performance metric tracking",
      "Instant alerting for degradation",
    ],
  },
  {
    title: "Partner Redundancy",
    icon: RefreshCw,
    description: "Multiple provider integrations ensure service continuity",
    details: [
      "Multiple flight search providers",
      "Backup hotel booking sources",
      "Alternative payment processing",
      "Automatic failover routing",
    ],
  },
  {
    title: "Data Protection",
    icon: Database,
    description: "Comprehensive backup and disaster recovery procedures",
    details: [
      "Automated daily backups",
      "Encrypted storage at rest",
      "Multi-region redundancy",
      "Point-in-time recovery",
    ],
  },
  {
    title: "Infrastructure",
    icon: Cloud,
    description: "Enterprise-grade cloud infrastructure with high availability",
    details: [
      "Cloud-native architecture",
      "Auto-scaling capabilities",
      "Load balancing",
      "DDoS protection",
    ],
  },
];

const uptimeStats = [
  { label: "Platform Uptime Target", value: "99.9%", description: "Annual availability goal" },
  { label: "API Response Time", value: "<500ms", description: "Average search response" },
  { label: "Backup Frequency", value: "Hourly", description: "Incremental data backups" },
  { label: "Recovery Time", value: "<4 hours", description: "Target RTO for critical services" },
];

export default function Reliability() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4">
            <Server className="w-3 h-3 mr-1" />
            Platform Reliability
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Built for Reliability
          </h1>
          <p className="text-lg text-muted-foreground">
            We continuously monitor partner availability to ensure reliable service. 
            If one provider experiences issues, our system automatically routes to alternatives.
          </p>
        </div>

        {/* Uptime Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {uptimeStats.map((stat) => (
            <Card key={stat.label} className="text-center hover:border-primary/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="font-medium text-sm">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Statement */}
        <Card className="mb-12 border-primary/50 bg-primary/5 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">Continuous Service Availability</h2>
                <p className="text-muted-foreground">
                  Our platform is designed with redundancy at every level. From search to booking, 
                  we maintain multiple provider integrations and automatic failover mechanisms to 
                  ensure you can always find and book your travel needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reliability Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {reliabilityFeatures.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <Card className="mb-12 max-w-4xl mx-auto border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Important Notice</h3>
                <p className="text-sm text-muted-foreground">
                  While we strive for maximum uptime, ZIVO does not guarantee uninterrupted service. 
                  Third-party provider availability may affect search results and booking capabilities. 
                  See our Terms of Service for complete details on service availability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Links */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Related Resources</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/status">
              <Button variant="outline" className="gap-2">
                <Activity className="w-4 h-4" />
                System Status
              </Button>
            </Link>
            <Link to="/security/disaster-recovery">
              <Button variant="outline" className="gap-2">
                <Shield className="w-4 h-4" />
                Disaster Recovery
              </Button>
            </Link>
            <Link to="/security/enterprise">
              <Button variant="outline" className="gap-2">
                <Server className="w-4 h-4" />
                Enterprise Security
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
