/**
 * Customer Complaints Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, FileText, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FINANCIAL_COMPLIANCE_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function ComplaintsPolicy() {
  const complaints = FINANCIAL_COMPLIANCE_POLICIES.complaintHandling;
  const noAdmission = FINANCIAL_COMPLIANCE_POLICIES.noAdmission;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/legal/terms">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">{complaints.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {complaints.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">We Listen</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ZIVO provides a complaints process to address user concerns fairly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Complaint Handling Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{complaints.content}</p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">How Complaints Are Handled:</h4>
              <ol className="space-y-3">
                {complaints.complaintProcess.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              {noAdmission.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{noAdmission.content}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Submit a Complaint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>To submit a complaint, please contact us:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span>Email: <a href="mailto:support@hizivo.com" className="text-primary hover:underline">support@hizivo.com</a></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span>In-app: Use the Support section in the app</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Include your account email, transaction details (if applicable), and a clear description of your concern.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            General inquiries:{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
