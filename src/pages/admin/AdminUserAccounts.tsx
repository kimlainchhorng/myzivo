/**
 * Admin User Accounts — Support staff can create new user accounts with just a username
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccess } from "@/hooks/useUserAccess";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus, AlertTriangle, CheckCircle2, Loader2, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

function generatePassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

interface CreatedAccount {
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export default function AdminUserAccounts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: access } = useUserAccess(user?.id);

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState<CreatedAccount[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

    const trimmed = username.trim();
    if (!trimmed) {
      toast({ title: "Username required", variant: "destructive" });
      return;
    }

    if (trimmed.length < 3) {
      toast({ title: "Username too short", description: "Must be at least 3 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const generatedEmail = `${trimmed.toLowerCase().replace(/[^a-z0-9]/g, "")}+${Date.now()}@zivo.app`;
    const generatedPassword = generatePassword();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: generatedEmail,
        password: generatedPassword,
        options: {
          data: {
            full_name: trimmed,
            username: trimmed,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const newAccount: CreatedAccount = {
          username: trimmed,
          email: generatedEmail,
          password: generatedPassword,
          createdAt: new Date().toLocaleString(),
        };
        setCreatedAccounts((prev) => [newAccount, ...prev]);
        toast({
          title: "Account created!",
          description: `Account "${trimmed}" is ready. Share the credentials below.`,
        });
        setUsername("");
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
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
            Just enter a username. Email and password are generated automatically.
          </p>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g. john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                disabled={loading}
                autoFocus
              />
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

        {/* Recently Created — Profile Cards */}
        {createdAccounts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Created Accounts — Save these credentials!
            </h2>
            {createdAccounts.map((acc, i) => {
              const credText = `Username: ${acc.username}\nEmail: ${acc.email}\nPassword: ${acc.password}`;
              const isCopied = copiedId === `acc-${i}`;
              const initials = acc.username
                .split(/[\s_]+/)
                .map((w) => w[0]?.toUpperCase())
                .join("")
                .slice(0, 2);
              const hue = acc.username.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 360;

              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border/40 overflow-hidden bg-card shadow-sm"
                >
                  {/* Cover */}
                  <div
                    className="h-28 w-full"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 40) % 360}, 60%, 45%))`,
                    }}
                  />

                  {/* Profile section */}
                  <div className="px-5 pb-5 -mt-10">
                    {/* Avatar */}
                    <div
                      className="h-20 w-20 rounded-full border-4 border-card flex items-center justify-center text-white text-xl font-bold shadow-md"
                      style={{
                        background: `linear-gradient(145deg, hsl(${hue}, 65%, 50%), hsl(${(hue + 30) % 360}, 55%, 40%))`,
                      }}
                    >
                      {initials}
                    </div>

                    <div className="mt-3 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{acc.username}</h3>
                        <p className="text-xs text-muted-foreground">Created {acc.createdAt}</p>
                      </div>

                      {/* Credentials */}
                      <div className="bg-muted/40 rounded-xl p-3 space-y-1 font-mono text-xs text-muted-foreground">
                        <p>Email: {acc.email}</p>
                        <p>Password: {acc.password}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(credText, `acc-${i}`)}
                      >
                        {isCopied ? (
                          <><Check className="h-3.5 w-3.5 mr-1.5" /> Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Credentials</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
