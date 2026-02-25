/**
 * Admin Security Settings Page
 * Configure rate limits, CAPTCHA, 2FA, and view audit logs
 */
import { useState, useEffect } from "react";
import {
  Shield, Settings, History, AlertTriangle, Lock,
  Save, RotateCcw, CheckCircle, Eye, Download, Filter,
  Loader2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { fetchAuditLogs, type AuditLogEntry } from "@/lib/security/auditLog";
import { format } from "date-fns";

interface SecuritySettings {
  // CAPTCHA
  captchaEnabled: boolean;
  captchaSiteKey: string;
  captchaThreshold: number; // Bot score threshold to trigger

  // Rate Limits
  flightsSearchLimit: number;
  hotelsSearchLimit: number;
  carsSearchLimit: number;
  contactFormLimit: number;
  adminActionLimit: number;
  loginAttemptLimit: number;

  // Admin 2FA
  admin2faEnabled: boolean;
  admin2faMethod: "email" | "totp";

  // Session
  sessionTimeoutMinutes: number;
  lockoutThreshold: number;
  lockoutDurationMinutes: number;
}

const defaultSettings: SecuritySettings = {
  captchaEnabled: false,
  captchaSiteKey: "",
  captchaThreshold: 70,
  flightsSearchLimit: 30,
  hotelsSearchLimit: 30,
  carsSearchLimit: 30,
  contactFormLimit: 5,
  adminActionLimit: 20,
  loginAttemptLimit: 10,
  admin2faEnabled: false,
  admin2faMethod: "email",
  sessionTimeoutMinutes: 60,
  lockoutThreshold: 5,
  lockoutDurationMinutes: 15,
};

const AdminSecurity = () => {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<string>("all");

  // Load settings and logs on mount
  useEffect(() => {
    loadSettings();
    loadAuditLogs();
  }, []);

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem("hizovo-security-settings");
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error("[Security] Error loading settings:", e);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const result = await fetchAuditLogs({
        limit: 100,
        action: logFilter !== "all" ? logFilter as any : undefined,
      });
      setAuditLogs(result.logs);
    } catch (e) {
      console.error("[Security] Error loading audit logs:", e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const updateSetting = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    localStorage.setItem("hizovo-security-settings", JSON.stringify(settings));
    setIsSaving(false);
    setHasChanges(false);
    toast.success("Security settings saved successfully");
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const exportAuditLogs = () => {
    const csv = [
      ["Timestamp", "Action", "Entity Type", "Entity ID", "User ID", "IP Address"].join(","),
      ...auditLogs.map(log => [
        log.created_at,
        log.action,
        log.entity_type,
        log.entity_id || "",
        log.user_id || "",
        log.ip_address || "",
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit logs exported");
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("login")) return "bg-blue-500/20 text-blue-500";
    if (action.includes("rate_limit")) return "bg-orange-500/20 text-orange-500";
    if (action.includes("suspicious")) return "bg-red-500/20 text-red-500";
    if (action.includes("change")) return "bg-purple-500/20 text-purple-500";
    return "bg-muted text-muted-foreground";
  };

  return (
    <>
      <SEOHead
        title="Security Settings | Admin"
        description="Configure security settings for Hizovo"
        noIndex
      />
      <Header />

      <main className="min-h-screen pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Security Settings</h1>
                <p className="text-muted-foreground text-sm">
                  Configure rate limits, CAPTCHA, and admin security
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="protection" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="protection" className="gap-2">
                <Lock className="w-4 h-4" />
                Protection
              </TabsTrigger>
              <TabsTrigger value="limits" className="gap-2">
                <Settings className="w-4 h-4" />
                Rate Limits
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Admin Security
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <History className="w-4 h-4" />
                Audit Logs
              </TabsTrigger>
            </TabsList>

            {/* Protection Tab */}
            <TabsContent value="protection" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CAPTCHA Protection</CardTitle>
                  <CardDescription>
                    Enable hCaptcha to protect against bots and automated abuse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="captcha-enabled">Enable CAPTCHA</Label>
                      <p className="text-sm text-muted-foreground">
                        Show CAPTCHA for suspicious traffic
                      </p>
                    </div>
                    <Switch
                      id="captcha-enabled"
                      checked={settings.captchaEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("captchaEnabled", checked)
                      }
                    />
                  </div>

                  {settings.captchaEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="captcha-key">hCaptcha Site Key</Label>
                        <Input
                          id="captcha-key"
                          placeholder="Enter your hCaptcha site key"
                          value={settings.captchaSiteKey}
                          onChange={(e) =>
                            updateSetting("captchaSiteKey", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="captcha-threshold">
                          Bot Score Threshold ({settings.captchaThreshold})
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          CAPTCHA will be triggered when bot score exceeds this value (0-100)
                        </p>
                        <Input
                          id="captcha-threshold"
                          type="number"
                          min={0}
                          max={100}
                          value={settings.captchaThreshold}
                          onChange={(e) =>
                            updateSetting("captchaThreshold", parseInt(e.target.value) || 70)
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rate Limits Tab */}
            <TabsContent value="limits" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search Rate Limits</CardTitle>
                  <CardDescription>
                    Maximum requests per minute per IP/session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Flights Search</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={settings.flightsSearchLimit}
                        onChange={(e) =>
                          updateSetting("flightsSearchLimit", parseInt(e.target.value) || 30)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hotels Search</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={settings.hotelsSearchLimit}
                        onChange={(e) =>
                          updateSetting("hotelsSearchLimit", parseInt(e.target.value) || 30)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cars Search</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={settings.carsSearchLimit}
                        onChange={(e) =>
                          updateSetting("carsSearchLimit", parseInt(e.target.value) || 30)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Other Rate Limits</CardTitle>
                  <CardDescription>
                    Limits for sensitive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Contact Form</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={settings.contactFormLimit}
                        onChange={(e) =>
                          updateSetting("contactFormLimit", parseInt(e.target.value) || 5)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Admin Actions</Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={settings.adminActionLimit}
                        onChange={(e) =>
                          updateSetting("adminActionLimit", parseInt(e.target.value) || 20)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Login Attempts (15 min)</Label>
                      <Input
                        type="number"
                        min={3}
                        max={20}
                        value={settings.loginAttemptLimit}
                        onChange={(e) =>
                          updateSetting("loginAttemptLimit", parseInt(e.target.value) || 10)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Security Tab */}
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Require 2FA for admin accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="2fa-enabled">Enable Admin 2FA</Label>
                      <p className="text-sm text-muted-foreground">
                        Require verification code for admin login
                      </p>
                    </div>
                    <Switch
                      id="2fa-enabled"
                      checked={settings.admin2faEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("admin2faEnabled", checked)
                      }
                    />
                  </div>

                  {settings.admin2faEnabled && (
                    <div className="space-y-2">
                      <Label>2FA Method</Label>
                      <Select
                        value={settings.admin2faMethod}
                        onValueChange={(value: "email" | "totp") =>
                          updateSetting("admin2faMethod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email OTP</SelectItem>
                          <SelectItem value="totp">Authenticator App (TOTP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session & Lockout</CardTitle>
                  <CardDescription>
                    Configure session timeout and account lockout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Session Timeout (min)</Label>
                      <Input
                        type="number"
                        min={15}
                        max={480}
                        value={settings.sessionTimeoutMinutes}
                        onChange={(e) =>
                          updateSetting("sessionTimeoutMinutes", parseInt(e.target.value) || 60)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lockout Threshold</Label>
                      <Input
                        type="number"
                        min={3}
                        max={10}
                        value={settings.lockoutThreshold}
                        onChange={(e) =>
                          updateSetting("lockoutThreshold", parseInt(e.target.value) || 5)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lockout Duration (min)</Label>
                      <Input
                        type="number"
                        min={5}
                        max={60}
                        value={settings.lockoutDurationMinutes}
                        onChange={(e) =>
                          updateSetting("lockoutDurationMinutes", parseInt(e.target.value) || 15)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Audit Logs</CardTitle>
                      <CardDescription>
                        Security-relevant events and actions
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={logFilter} onValueChange={setLogFilter}>
                        <SelectTrigger className="w-40">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="admin_login">Admin Login</SelectItem>
                          <SelectItem value="rate_limit_triggered">Rate Limits</SelectItem>
                          <SelectItem value="security_settings_change">Settings Changes</SelectItem>
                          <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={loadAuditLogs}
                        disabled={isLoadingLogs}
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button variant="outline" onClick={exportAuditLogs} className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {isLoadingLogs ? (
                      <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : auditLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <History className="w-8 h-8 mb-2" />
                        <p>No audit logs found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {auditLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <Badge className={getActionBadgeColor(log.action)}>
                              {log.action.replace(/_/g, " ")}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">
                                  {log.entity_type}
                                </span>
                                {log.entity_id && (
                                  <span className="text-xs font-mono bg-muted px-1 rounded">
                                    {log.entity_id}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                                {log.ip_address && ` · ${log.ip_address}`}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-6">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>Saving...</>
              ) : hasChanges ? (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminSecurity;
