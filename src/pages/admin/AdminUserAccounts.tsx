/**
 * Admin User Accounts — Support staff can create new user accounts (email + password)
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccess } from "@/hooks/useUserAccess";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus, AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminUserAccounts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: access } = useUserAccess(user?.id);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState<
    { email: string; createdAt: string }[]
  >([]);

  const isAuthorized =
    access?.isSupport || access?.isAdmin || user?.email === "chhorngkimlain1@gmail.com";

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to manage user accounts.
          </p>
          <Button onClick={() => navigate("/feed")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Missing fields", description: "Email and password are required.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
          // Don't redirect — support staff is creating this account on behalf of a user
          emailRedirectTo: undefined,
        },
      });

      if (error) throw error;

      if (data.user) {
        setCreatedAccounts((prev) => [
          { email: email.trim(), createdAt: new Date().toLocaleString() },
          ...prev,
        ]);
        toast({
          title: "Account created",
          description: `Account for ${email} has been created successfully.`,
        });
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (err: any) {
      toast({
        title: "Failed to create account",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="User Accounts" brandLabel="ZIVO Support">
      <div className="max-w-2xl space-y-8">
        {/* Create Account Form */}
        <div className="bg-card rounded-2xl border border-border/40 p-6">
          <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Create New Account
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Create a new user account with email and password. No Gmail or social login required.
          </p>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (optional)</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Recently Created */}
        {createdAccounts.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/40 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Recently Created Accounts
            </h2>
            <div className="space-y-2">
              {createdAccounts.map((acc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                >
                  <span className="text-sm font-medium text-foreground">{acc.email}</span>
                  <span className="text-[10px] text-muted-foreground">{acc.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
