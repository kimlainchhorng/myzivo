/**
 * Admin User Accounts — Support staff can create new user accounts with just a username
 */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccess } from "@/hooks/useUserAccess";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus, AlertTriangle, CheckCircle2, Loader2, Copy, Check,
  Camera, Link2, Plus, X,
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

const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: "f", color: "#1877F2", placeholder: "https://facebook.com/username" },
  { key: "instagram", label: "Instagram", icon: "📷", color: "#E4405F", placeholder: "https://instagram.com/username" },
  { key: "threads", label: "Threads", icon: "@", color: "#000000", placeholder: "https://threads.net/@username" },
  { key: "tiktok", label: "TikTok", icon: "♪", color: "#000000", placeholder: "https://tiktok.com/@username" },
  { key: "x", label: "X", icon: "𝕏", color: "#000000", placeholder: "https://x.com/username" },
] as const;

interface CreatedAccount {
  username: string;
  email: string;
  password: string;
  createdAt: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  socialLinks: Record<string, string>;
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
          avatarUrl: null,
          coverUrl: null,
          socialLinks: {},
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

  const handleImageUpload = (index: number, type: "avatar" | "cover", file: File) => {
    const url = URL.createObjectURL(file);
    setCreatedAccounts((prev) =>
      prev.map((acc, i) =>
        i === index
          ? { ...acc, [type === "avatar" ? "avatarUrl" : "coverUrl"]: url }
          : acc
      )
    );
    toast({ title: `${type === "avatar" ? "Profile photo" : "Cover photo"} updated` });
  };

  const handleSocialLinkChange = (index: number, platform: string, value: string) => {
    setCreatedAccounts((prev) =>
      prev.map((acc, i) =>
        i === index
          ? { ...acc, socialLinks: { ...acc.socialLinks, [platform]: value } }
          : acc
      )
    );
  };

  const removeSocialLink = (index: number, platform: string) => {
    setCreatedAccounts((prev) =>
      prev.map((acc, i) => {
        if (i !== index) return acc;
        const updated = { ...acc.socialLinks };
        delete updated[platform];
        return { ...acc, socialLinks: updated };
      })
    );
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
                <ProfileCard
                  key={i}
                  index={i}
                  acc={acc}
                  initials={initials}
                  hue={hue}
                  isCopied={isCopied}
                  credText={credText}
                  onCopy={copyToClipboard}
                  onImageUpload={handleImageUpload}
                  onSocialLinkChange={handleSocialLinkChange}
                  onRemoveSocialLink={removeSocialLink}
                />
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

/* ─── Profile Card Component ─── */
interface ProfileCardProps {
  index: number;
  acc: CreatedAccount;
  initials: string;
  hue: number;
  isCopied: boolean;
  credText: string;
  onCopy: (text: string, id: string) => void;
  onImageUpload: (index: number, type: "avatar" | "cover", file: File) => void;
  onSocialLinkChange: (index: number, platform: string, value: string) => void;
  onRemoveSocialLink: (index: number, platform: string) => void;
}

function ProfileCard({
  index, acc, initials, hue, isCopied, credText,
  onCopy, onImageUpload, onSocialLinkChange, onRemoveSocialLink,
}: ProfileCardProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  const addedPlatforms = Object.keys(acc.socialLinks);
  const availablePlatforms = SOCIAL_PLATFORMS.filter((p) => !addedPlatforms.includes(p.key));

  return (
    <div className="rounded-2xl border border-border/40 overflow-hidden bg-card shadow-sm">
      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImageUpload(index, "cover", f);
        }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImageUpload(index, "avatar", f);
        }}
      />

      {/* Cover */}
      <div
        className="h-32 w-full relative group cursor-pointer"
        onClick={() => coverInputRef.current?.click()}
        style={{
          background: acc.coverUrl
            ? `url(${acc.coverUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 40) % 360}, 60%, 45%))`,
        }}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Profile section */}
      <div className="px-5 pb-5 -mt-10">
        {/* Avatar */}
        <div
          className="h-20 w-20 rounded-full border-4 border-card flex items-center justify-center text-white text-xl font-bold shadow-md relative group cursor-pointer overflow-hidden"
          onClick={() => avatarInputRef.current?.click()}
          style={{
            background: acc.avatarUrl
              ? `url(${acc.avatarUrl}) center/cover no-repeat`
              : `linear-gradient(145deg, hsl(${hue}, 65%, 50%), hsl(${(hue + 30) % 360}, 55%, 40%))`,
          }}
        >
          {!acc.avatarUrl && initials}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-full">
            <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="mt-3 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{acc.username}</h3>
            <p className="text-xs text-muted-foreground">Created {acc.createdAt}</p>
          </div>

          {/* Social Links */}
          <div className="space-y-2">
            {addedPlatforms.map((key) => {
              const platform = SOCIAL_PLATFORMS.find((p) => p.key === key);
              if (!platform) return null;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.icon}
                  </span>
                  <Input
                    value={acc.socialLinks[key] || ""}
                    onChange={(e) => onSocialLinkChange(index, key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="h-8 text-xs"
                  />
                  <button
                    onClick={() => onRemoveSocialLink(index, key)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Add link button */}
            {availablePlatforms.length > 0 && (
              <div className="relative">
                {!showLinkForm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => setShowLinkForm(true)}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Add Social Link
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/40 rounded-xl">
                    {availablePlatforms.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => {
                          onSocialLinkChange(index, p.key, "");
                          setShowLinkForm(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <span
                          className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.icon}
                        </span>
                        {p.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowLinkForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground px-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Credentials */}
          <div className="bg-muted/40 rounded-xl p-3 space-y-1 font-mono text-xs text-muted-foreground">
            <p>Email: {acc.email}</p>
            <p>Password: {acc.password}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(credText, `acc-${index}`)}
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
}