/**
 * Regulatory Status - Consolidated view of all regulatory statuses
 */

import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Scale, 
  Globe, 
  Shield, 
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  FileText,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANY_INFO } from "@/config/legalContent";

const sellerOfTravelStatus = [
  { state: "California", status: "pending", registration: "Application submitted", notes: "SOT registration pending" },
  { state: "Florida", status: "pending", registration: "Application submitted", notes: "SOT registration pending" },
  { state: "Washington", status: "exempt", registration: "N/A", notes: "Sub-agent exemption applicable" },
  { state: "Hawaii", status: "exempt", registration: "N/A", notes: "Sub-agent exemption applicable" },
  { state: "Other States", status: "varies", registration: "N/A", notes: "Exempt or not required in most states" },
];

const dataProtectionStatus = [
  {
    regulation: "GDPR",
    region: "European Union",
    status: "compliant",
    description: "Full compliance with EU General Data Protection Regulation",
    rights: ["Access", "Rectification", "Erasure", "Portability", "Objection"],
  },
  {
    regulation: "CCPA",
    region: "California, USA",
    status: "compliant",
    description: "Compliance with California Consumer Privacy Act",
    rights: ["Know", "Delete", "Opt-out", "Non-discrimination"],
  },
  {
    regulation: "UK GDPR",
    region: "United Kingdom",
    status: "compliant",
    description: "Compliance with UK data protection requirements",
    rights: ["Access", "Rectification", "Erasure", "Portability", "Objection"],
  },
];

const consumerProtection = [
  {
    title: "Sub-Agent Model",
    description: "ZIVO operates as a sub-agent of licensed travel providers and ticketing partners.",
    link: "/legal/seller-of-travel",
  },
  {
    title: "Consumer Refund Rights",
    description: "Refunds are subject to partner policies. ZIVO assists with refund coordination where applicable.",
    link: "/refunds",
  },
  {
    title: "Complaint Process",
    description: "Users may file complaints through our support team or escalate to relevant regulatory bodies.",
    link: "/legal/complaints-policy",
  },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "compliant":
    case "active":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "exempt":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
          <Shield className="w-3 h-3 mr-1" />
          Exempt
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <AlertCircle className="w-3 h-3 mr-1" />
          Varies
        </Badge>
      );
  }
}

export default function RegulatoryStatus() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/compliance">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">Regulatory Status</h1>
              <p className="text-sm text-muted-foreground">
                {COMPANY_INFO.name} compliance overview
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Seller of Travel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Seller of Travel Status
            </CardTitle>
            <CardDescription>
              Registration status by state jurisdiction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sellerOfTravelStatus.map((item) => (
                <div key={item.state} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.state}</p>
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> ZIVO acts as a booking facilitator and sub-agent for licensed travel providers. 
                Where required, we maintain appropriate registrations or operate under applicable exemptions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Data Protection Compliance
            </CardTitle>
            <CardDescription>
              Privacy regulation compliance by region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dataProtectionStatus.map((item) => (
                <div key={item.regulation} className="p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{item.regulation}</h4>
                      <p className="text-sm text-muted-foreground">{item.region}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.rights.map((right) => (
                      <Badge key={right} variant="outline" className="text-xs">
                        {right}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consumer Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Consumer Protection
            </CardTitle>
            <CardDescription>
              User rights and protections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consumerProtection.map((item) => (
                <Link
                  key={item.title}
                  to={item.link}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/legal/seller-of-travel">
            <Button variant="outline" className="gap-2">
              Seller of Travel Details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/account/privacy">
            <Button variant="outline" className="gap-2">
              Privacy Controls
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For regulatory inquiries, contact{" "}
            <a href={`mailto:legal@hizivo.com`} className="text-primary hover:underline">
              legal@hizivo.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
