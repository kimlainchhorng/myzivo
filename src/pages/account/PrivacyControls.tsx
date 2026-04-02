/**
 * Privacy Controls Page (DSAR Automation)
 * User data access, download, deletion, and consent management
 * GDPR/CCPA compliant self-service privacy controls
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, Navigate, useLocation } from "react-router-dom";
import { withRedirectParam } from "@/lib/authRedirect";
import {
  ArrowLeft, Shield, Download, Trash2, Eye, Mail, Clock,
  CheckCircle2, AlertTriangle, FileText, Lock, RefreshCw,
  Ban, UserX, Database, History, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useUserConsents, useRecordConsent, useLegalPolicies } from "@/hooks/useLegalCompliance";
import { toast } from "sonner";

// DSAR request types
const dsarRequestTypes = [
  {
    id: "access",
    title: "Access My Data",
    description: "Request a copy of all personal data we hold about you",
    icon: Eye,
    timeline: "30 days",
    buttonText: "Request Access",
  },
  {
    id: "download",
    title: "Download My Data",
    description: "Download a portable copy of your data in machine-readable format",
    icon: Download,
    timeline: "30 days",
    buttonText: "Request Download",
  },
  {
    id: "correct",
    title: "Correct My Data",
    description: "Request corrections to inaccurate personal information",
    icon: RefreshCw,
    timeline: "30 days",
    buttonText: "Request Correction",
  },
  {
    id: "delete",
    title: "Delete My Data",
    description: "Request deletion of your personal data (subject to legal requirements)",
    icon: Trash2,
    timeline: "30 days",
    buttonText: "Request Deletion",
    variant: "destructive" as const,
  },
  {
    id: "restrict",
    title: "Restrict Processing",
    description: "Limit how we process your data while a dispute is resolved",
    icon: Ban,
    timeline: "30 days",
    buttonText: "Request Restriction",
  },
];

// Consent categories
const consentCategories = [
  {
    id: "marketing_email",
    title: "Marketing Emails",
    description: "Promotional offers, deals, and travel inspiration",
    required: false,
  },
  {
    id: "marketing_sms",
    title: "SMS Notifications",
    description: "Text messages about deals and booking reminders",
    required: false,
  },
  {
    id: "personalization",
    title: "Personalized Recommendations",
    description: "Tailored search results and suggestions based on your activity",
    required: false,
  },
  {
    id: "analytics",
    title: "Analytics Cookies",
    description: "Help us improve our services by analyzing usage patterns",
    required: false,
  },
  {
    id: "essential",
    title: "Essential Services",
    description: "Required for core functionality and security",
    required: true,
  },
];

export default function PrivacyControls() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: consents } = useUserConsents();
  const { data: policies } = useLegalPolicies(true);
  const recordConsent = useRecordConsent();
  
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof dsarRequestTypes[0] | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  
  // Consent state (would be loaded from backend in production)
  const [consentState, setConsentState] = useState<Record<string, boolean>>({
    marketing_email: false,
    marketing_sms: false,
    personalization: true,
    analytics: true,
    essential: true,
  });

  const location = useLocation();
  // Redirect if not logged in
  if (!authLoading && !user) {
    const redirectTarget = `${location.pathname}${location.search ?? ""}`;
    return <Navigate to={withRedirectParam("/login", redirectTarget)} replace />;
  }

  const handleRequestSubmit = async () => {
    if (!selectedRequest) return;
    
    // In production, this would submit to an edge function that logs the request
    setPendingRequests(prev => [...prev, selectedRequest.id]);
    setRequestDialogOpen(false);
    setRequestReason("");
    
    toast.success(`${selectedRequest.title} request submitted`, {
      description: `We'll process your request within ${selectedRequest.timeline}.`,
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    
    setPendingRequests(prev => [...prev, "delete_account"]);
    setDeleteConfirmOpen(false);
    setDeleteConfirmText("");
    
    toast.success("Account deletion request submitted", {
      description: "We'll process your request within 30 days. You'll receive confirmation via email.",
    });
  };

  const handleConsentChange = async (category: string, enabled: boolean) => {
    setConsentState(prev => ({ ...prev, [category]: enabled }));
    
    // In production, this would log the consent change
    toast.success(`${enabled ? "Enabled" : "Disabled"} ${category.replace("_", " ")}`);
  };

  const openRequestDialog = (request: typeof dsarRequestTypes[0]) => {
    if (request.id === "delete") {
      setDeleteConfirmOpen(true);
    } else {
      setSelectedRequest(request);
      setRequestDialogOpen(true);
    }
  };

  return (
    <>
      <SEOHead
        title="Privacy Controls | ZIVO Account"
        description="Manage your privacy settings, data access requests, and consent preferences. GDPR and CCPA compliant self-service privacy controls."
      />
      <Header />

      <main className="min-h-screen pt-20 pb-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 max-w-4xl"
        >
          {/* Back Link */}
          <div className="mb-6">
            <Link to="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
          </div>

          {/* Header */}
          <div className="text-center py-8 mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Privacy Controls</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your data, exercise your privacy rights, and control how we use your information.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-center hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
              <History className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{consents?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Consent Records</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-center hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
              <Database className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-center hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
              <Lock className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">Protected</p>
              <p className="text-xs text-muted-foreground">Data Status</p>
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="requests" className="mb-12">
            <TabsList className="grid w-full grid-cols-3 h-auto mb-6">
              <TabsTrigger value="requests" className="text-xs md:text-sm">Data Requests</TabsTrigger>
              <TabsTrigger value="consents" className="text-xs md:text-sm">Consent Settings</TabsTrigger>
              <TabsTrigger value="history" className="text-xs md:text-sm">Request History</TabsTrigger>
            </TabsList>

            {/* Data Requests Tab */}
            <TabsContent value="requests">
              <div className="space-y-4">
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Response Timeline</p>
                        <p className="text-sm text-muted-foreground">
                          GDPR requests are processed within 30 days. CCPA requests follow legal timeframes.
                          Extensions may apply for complex requests.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {dsarRequestTypes.map((request) => (
                    <Card key={request.id} className="hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <request.icon className={`w-5 h-5 ${request.variant === "destructive" ? "text-destructive" : "text-primary"}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.title}</h3>
                              <p className="text-sm text-muted-foreground">{request.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Response time: {request.timeline}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={request.variant || "outline"}
                            size="sm"
                            onClick={() => openRequestDialog(request)}
                            disabled={pendingRequests.includes(request.id)}
                          >
                            {pendingRequests.includes(request.id) ? "Pending" : request.buttonText}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Delete Account Section */}
                <Card className="border-destructive/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <UserX className="w-5 h-5" />
                      Delete Account
                    </CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-destructive">This action is irreversible</p>
                          <ul className="mt-2 space-y-1 text-muted-foreground">
                            <li>• Personal data will be erased or anonymized</li>
                            <li>• Financial records retained for legal compliance</li>
                            <li>• Fraud and security logs preserved as required by law</li>
                            <li>• Active bookings must be completed or cancelled first</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={pendingRequests.includes("delete_account")}
                    >
                      {pendingRequests.includes("delete_account") ? "Deletion Pending" : "Request Account Deletion"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Consent Settings Tab */}
            <TabsContent value="consents">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Communication Preferences
                    </CardTitle>
                    <CardDescription>
                      Control how we communicate with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {consentCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/20 hover:bg-muted/70 transition-all duration-200"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={category.id} className="font-medium cursor-pointer">
                              {category.title}
                            </Label>
                            {category.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <Switch
                          id={category.id}
                          checked={consentState[category.id]}
                          onCheckedChange={(checked) => handleConsentChange(category.id, checked)}
                          disabled={category.required}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      Withdraw All Marketing Consent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Opt out of all non-essential communications at once.
                      You'll still receive booking confirmations and security alerts.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setConsentState(prev => ({
                          ...prev,
                          marketing_email: false,
                          marketing_sms: false,
                        }));
                        toast.success("Marketing consent withdrawn");
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Withdraw Marketing Consent
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Request History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Request History
                  </CardTitle>
                  <CardDescription>
                    Track the status of your privacy requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-3">
                      {pendingRequests.map((requestId) => {
                        const request = dsarRequestTypes.find(r => r.id === requestId);
                        return (
                          <div key={requestId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <div>
                                <p className="font-medium text-sm">
                                  {request?.title || "Account Deletion"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Submitted {new Date().toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              Processing
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No privacy requests yet</p>
                      <p className="text-sm">Submit a request from the Data Requests tab</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Consent Logs */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Consent History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {consents && consents.length > 0 ? (
                    <div className="space-y-2">
                      {consents.slice(0, 5).map((consent) => (
                        <div key={consent.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                          <div>
                            <p className="font-medium capitalize">{consent.policy_type.replace("_", " ")}</p>
                            <p className="text-xs text-muted-foreground">
                              Version {consent.policy_version}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Accepted
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(consent.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground text-sm">
                      No consent records found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Legal Links */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Learn more about how we protect your privacy:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/privacy">Privacy Policy</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/cookies">Cookie Policy</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/security/data-protection">Data Protection</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              {selectedRequest?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for request (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Provide any additional details..."
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              We may contact you to verify your identity before processing this request.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestSubmit}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account and data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="confirm">Type DELETE to confirm</Label>
            <Input
              id="confirm"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
            >
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
