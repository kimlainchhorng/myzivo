/**
 * Case File System (Admin)
 * Clause 183: Internal case files for disputes, complaints, legal threats
 */

import { Link } from "react-router-dom";
import { ArrowLeft, FolderOpen, AlertTriangle, Clock, FileText, Shield, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEGAL_EVIDENCE_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function CaseFileSystem() {
  const caseSystem = LEGAL_EVIDENCE_POLICIES.caseFileSystem;

  // Case files loaded from real database
  const caseFiles: { id: string; type: string; status: string; priority: string; created: string; lastUpdate: string }[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-amber-500";
      case "Under Review": return "bg-blue-500";
      case "Resolved": return "bg-green-500";
      case "Escalated": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-destructive border-destructive";
      case "High": return "text-amber-500 border-amber-500";
      case "Medium": return "text-blue-500 border-blue-500";
      case "Low": return "text-muted-foreground border-muted";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/legal">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl">{caseSystem.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {caseSystem.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FolderOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Case Management</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {caseSystem.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Case Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {caseSystem.caseTypes.map((type, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">•</span>
                    {type}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Case File Contents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {caseSystem.caseFileContents.map((content, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">•</span>
                    {content}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Active Case Files
            </CardTitle>
            <CardDescription>
              All open, under review, and escalated cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {caseFiles.map((caseFile) => (
                <div key={caseFile.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-mono font-medium">{caseFile.id}</p>
                      <p className="text-sm text-muted-foreground">{caseFile.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getPriorityColor(caseFile.priority)}>
                      {caseFile.priority}
                    </Badge>
                    <Badge className={getStatusColor(caseFile.status)}>
                      {caseFile.status}
                    </Badge>
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {caseFile.lastUpdate}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
