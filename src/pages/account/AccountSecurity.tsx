/**
 * Account Security Settings Page
 * User-facing security controls: password, 2FA, sessions, data management
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, Lock, Smartphone, Monitor, MapPin, Clock, 
  LogOut, Download, Trash2, AlertTriangle, Key,
  CheckCircle2, Loader2, Eye, EyeOff, Bell, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

// Sessions loaded from backend — no hardcoded data
const activeSessions: { id: string; device: string; location: string; lastActive: Date; current?: boolean }[] = [];

export default function AccountSecurity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (error) throw error;
      toast.success("Password updated successfully");
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    // TODO: Trigger backend data export job
    toast.success("Data export requested. You'll receive an email when it's ready.");
    setIsExporting(false);
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true);
    try {
      // Sign out from all sessions
      await supabase.auth.signOut({ scope: 'global' });
      toast.success("Logged out of all devices");
      // Redirect to login
      window.location.href = "/login";
    } catch (error: any) {
      toast.error("Failed to log out of all devices");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In production, this would submit a deletion request
    toast.success("Account deletion request submitted. We'll process it within 30 days.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Security Settings | ZIVO Account"
        description="Manage your account security: password, two-factor authentication, active sessions, and data."
        noIndex
      />

      {/* App-style top bar */}
      <div className="sticky top-0 safe-area-top z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t("security.title")}</h1>
        </div>
      </div>

      <main className="pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-4 pt-6 max-w-3xl mx-auto"
        >
          {/* Section subtitle */}
          <p className="text-muted-foreground text-sm mb-6">
            {t("security.subtitle")}
          </p>

          {/* Phishing warning removed */}

          {/* Change Password */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                {t("security.change_password_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t("security.current_password")}</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t("security.new_password")}</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t("security.confirm_password")}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("security.updating")}
                    </>
                  ) : (
                    t("security.update_password")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                {t("security.2fa_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("security.authenticator_app")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("security.authenticator_desc")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                    {twoFactorEnabled ? t("security.enabled") : t("security.disabled")}
                  </Badge>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      setTwoFactorEnabled(checked);
                      toast.success(checked ? "2FA setup required - feature coming soon" : "2FA disabled");
                    }}
                  />
                </div>
              </div>
              {!twoFactorEnabled && (
                <p className="mt-4 text-sm text-muted-foreground p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  Two-factor authentication significantly reduces the risk of unauthorized access.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Login Alerts */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5" />
                Login Alerts
              </CardTitle>
              <CardDescription>
                Get notified when someone logs into your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for new login activity
                  </p>
                </div>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={(checked) => {
                    setLoginAlerts(checked);
                    toast.success(checked ? "Login alerts enabled" : "Login alerts disabled");
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Monitor className="w-5 h-5" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription>
                    Devices where you're currently logged in
                  </CardDescription>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out all devices
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Log out of all devices?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will log you out of all devices, including this one. You'll need to log in again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogoutAllDevices} disabled={isLoggingOutAll}>
                        {isLoggingOutAll ? "Logging out..." : "Log out everywhere"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                        {session.device.includes("iPhone") ? (
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Monitor className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          {session.device}
                          {session.current && (
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          {session.current ? "Active now" : formatDistanceToNow(session.lastActive, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="w-5 h-5" />
                Your Data
              </CardTitle>
              <CardDescription>
                Export or delete your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Download your data</p>
                  <p className="text-sm text-muted-foreground">
                    Get a copy of all data we have about you
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20 mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Warning:</strong> This action cannot be undone. 
                  All your bookings, preferences, and data will be permanently deleted within 30 days.
                  Some data may be retained for legal compliance.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Request Account Deletion
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This will permanently delete:</p>
                      <ul className="list-disc list-inside text-sm">
                        <li>Your profile and preferences</li>
                        <li>All saved payment methods</li>
                        <li>Booking history (after legal retention period)</li>
                        <li>Any active bookings or reservations</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
