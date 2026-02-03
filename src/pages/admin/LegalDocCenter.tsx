/**
 * Legal Document Center (Admin)
 * Clause 180: Store, version, export, and lock legal documents
 */

import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Lock, Download, Clock, Archive, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LEGAL_EVIDENCE_POLICIES, COMPANY_INFO } from "@/config/legalContent";

export default function LegalDocCenter() {
  const docCenter = LEGAL_EVIDENCE_POLICIES.legalDocCenter;

  // Mock document versions
  const documentVersions = [
    { id: "terms-v1.5", type: "Terms of Service", version: "1.5", date: "2025-01-15", status: "active", locked: true },
    { id: "privacy-v1.3", type: "Privacy Policy", version: "1.3", date: "2025-01-10", status: "active", locked: true },
    { id: "seller-v1.0", type: "Seller of Travel", version: "1.0", date: "2025-01-01", status: "active", locked: true },
    { id: "terms-v1.4", type: "Terms of Service", version: "1.4", date: "2024-12-01", status: "archived", locked: true },
    { id: "privacy-v1.2", type: "Privacy Policy", version: "1.2", date: "2024-11-15", status: "archived", locked: true },
  ];

  const activeDocuments = documentVersions.filter(d => d.status === "active");
  const archivedDocuments = documentVersions.filter(d => d.status === "archived");

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
              <h1 className="font-display font-bold text-xl">{docCenter.title}</h1>
              <p className="text-sm text-muted-foreground">
                Version {docCenter.version} • {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Archive className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Document Management</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {docCenter.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              System Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {docCenter.capabilities.map((cap, index) => (
                <div key={index} className="p-3 rounded-lg border bg-muted/50">
                  <p className="text-sm">{cap}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Documents ({activeDocuments.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedDocuments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Legal Documents</CardTitle>
                <CardDescription>Currently effective policy versions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border bg-green-500/5 border-green-500/30">
                      <div className="flex items-center gap-4">
                        <FileText className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{doc.type}</p>
                          <p className="text-sm text-muted-foreground">Version {doc.version} • {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.locked && (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                        <Badge className="bg-green-500">Active</Badge>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archived">
            <Card>
              <CardHeader>
                <CardTitle>Archived Documents</CardTitle>
                <CardDescription>Historical policy versions for legal reference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {archivedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.type}</p>
                          <p className="text-sm text-muted-foreground">Version {doc.version} • {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Archived</Badge>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
