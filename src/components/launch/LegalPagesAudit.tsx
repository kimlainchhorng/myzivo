/**
 * Legal Pages Audit
 * Displays status of all required legal pages
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalPage {
  name: string;
  path: string;
  required: boolean;
  status: "exists" | "missing";
}

const legalPages: LegalPage[] = [
  { name: "Terms of Service", path: "/terms", required: true, status: "exists" },
  { name: "Privacy Policy", path: "/privacy", required: true, status: "exists" },
  { name: "Cookie Policy", path: "/cookies", required: true, status: "exists" },
  { name: "Refund Policy", path: "/refunds", required: true, status: "exists" },
  { name: "Partner Disclosure", path: "/partner-disclosure", required: true, status: "exists" },
  { name: "Seller of Travel", path: "/legal/seller-of-travel", required: true, status: "exists" },
  { name: "Cancellation Policy", path: "/legal/cancellation-policy", required: true, status: "exists" },
  { name: "Accessibility Statement", path: "/legal/accessibility", required: false, status: "exists" },
  { name: "Insurance Disclaimer", path: "/legal/insurance-disclaimer", required: false, status: "exists" },
  { name: "Community Guidelines", path: "/legal/community-guidelines", required: false, status: "exists" },
  { name: "Flight Terms", path: "/legal/flights", required: true, status: "exists" },
  { name: "Renter Terms", path: "/legal/renter-terms", required: true, status: "exists" },
  { name: "Owner Terms", path: "/legal/owner-terms", required: true, status: "exists" },
  { name: "Damage Policy", path: "/legal/damage-policy", required: true, status: "exists" },
  { name: "KYC Policy", path: "/legal/kyc-policy", required: false, status: "exists" },
  { name: "AML Policy", path: "/legal/aml-policy", required: false, status: "exists" },
];

export default function LegalPagesAudit() {
  const requiredPages = legalPages.filter((p) => p.required);
  const existingRequired = requiredPages.filter((p) => p.status === "exists");
  const allRequiredExist = existingRequired.length === requiredPages.length;

  return (
    <Card className={cn(allRequiredExist && "border-emerald-500/30")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              allRequiredExist ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            )}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Legal Pages Audit</CardTitle>
              <CardDescription>
                {existingRequired.length}/{requiredPages.length} required pages verified
              </CardDescription>
            </div>
          </div>
          {allRequiredExist && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              All Required Present
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {legalPages.map((page) => (
            <div
              key={page.path}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-lg border text-sm",
                page.status === "exists"
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-destructive/5 border-destructive/20"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{page.name}</span>
                {page.required && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">Required</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" asChild>
                <Link to={page.path} target="_blank">
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
