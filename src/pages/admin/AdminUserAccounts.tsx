/**
 * Admin User Accounts — Support staff can create new user accounts with just a username
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccess } from "@/hooks/useUserAccess";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Camera,
  Link2,
  X,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface CreatedAccount {
  username: string;
  email: string;
  password: string;
  createdAt: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  socialLinks: Record<string, string>;
}

const CREATED_ACCOUNTS_STORAGE_KEY = "admin-user-accounts-session";

const SOCIAL_PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    icon: "f",
    color: "hsl(221 83% 53%)",
    placeholder: "https://facebook.com/username",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "📷",
    color: "hsl(339 78% 55%)",
    placeholder: "https://instagram.com/username",
  },
  {
    key: "threads",
    label: "Threads",
    icon: "@",
    color: "hsl(0 0% 10%)",
    placeholder: "https://threads.net/@username",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: "♪",
    color: "hsl(0 0% 10%)",
    placeholder: "https://tiktok.com/@username",
  },
  {
    key: "x",
    label: "X",
    icon: "𝕏",
    color: "hsl(0 0% 10%)",
    placeholder: "https://x.com/username",
  },
] as const;

function generatePassword() {
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const special = "!@#$";
  const all = lower + upper + digits + special;

  // Guarantee at least one from each required set
  let pw = "";
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  pw += special[Math.floor(Math.random() * special.length)];

  for (let i = pw.length; i < 14; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return pw.split("").sort(() => Math.random() - 0.5).join("");
}

function normalizeCreatedAccount(account: Partial<CreatedAccount>): CreatedAccount {
  return {
    username: account.username ?? "",
    email: account.email ?? "",
    password: account.password ?? "",
    createdAt: account.createdAt ?? new Date().toLocaleString(),
    avatarUrl: account.avatarUrl ?? null,
    coverUrl: account.coverUrl ?? null,
    socialLinks: account.socialLinks ?? {},
  };
}

function loadStoredCreatedAccounts(): CreatedAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const stored =
      window.localStorage.getItem(CREATED_ACCOUNTS_STORAGE_KEY) ??
      window.sessionStorage.getItem(CREATED_ACCOUNTS_STORAGE_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeCreatedAccount(item as Partial<CreatedAccount>))
      .filter((item) => item.username && item.email);
  } catch {
    return [];
  }
}

function persistCreatedAccounts(accounts: CreatedAccount[]) {
  if (typeof window === "undefined") return;

  try {
    if (accounts.length === 0) {
      window.localStorage.removeItem(CREATED_ACCOUNTS_STORAGE_KEY);
      window.sessionStorage.removeItem(CREATED_ACCOUNTS_STORAGE_KEY);
      return;
    }

    const serialized = JSON.stringify(accounts);
    window.localStorage.setItem(CREATED_ACCOUNTS_STORAGE_KEY, serialized);
    window.sessionStorage.removeItem(CREATED_ACCOUNTS_STORAGE_KEY);
  } catch {
    // Ignore storage quota errors silently to avoid breaking account creation UI.
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Invalid image data"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function AdminUserAccounts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: access } = useUserAccess(user?.id);

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState<CreatedAccount[]>(() => loadStoredCreatedAccounts());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isAuthorized =
    access?.isSupport || access?.isAdmin || user?.email === "chhorngkimlain1@gmail.com";

  useEffect(() => {
    persistCreatedAccounts(createdAccounts);
  }, [createdAccounts]);

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
      toast({
        title: "Username too short",
        description: "Must be at least 3 characters.",
        variant: "destructive",
      });
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

  const handleImageUpload = async (index: number, type: "avatar" | "cover", file: File) => {
    try {
      const imageDataUrl = await readFileAsDataUrl(file);

      setCreatedAccounts((prev) =>
        prev.map((acc, i) =>
          i === index
            ? { ...acc, [type === "avatar" ? "avatarUrl" : "coverUrl"]: imageDataUrl }
            : acc,
        ),
      );

      toast({ title: `${type === "avatar" ? "Profile photo" : "Cover photo"} updated` });
    } catch {
      toast({
        title: "Image upload failed",
        description: "Please try another image.",
        variant: "destructive",
      });
    }
  };

  const handleSocialLinkChange = (index: number, platform: string, value: string) => {
    setCreatedAccounts((prev) =>
      prev.map((acc, i) =>
        i === index
          ? { ...acc, socialLinks: { ...(acc.socialLinks ?? {}), [platform]: value } }
          : acc,
      ),
    );
  };

  const removeSocialLink = (index: number, platform: string) => {
    setCreatedAccounts((prev) =>
      prev.map((acc, i) => {
        if (i !== index) return acc;
        const updated = { ...(acc.socialLinks ?? {}) };
        delete updated[platform];
        return { ...acc, socialLinks: updated };
      }),
    );
  };

  return (
    <AdminLayout title="User Accounts" brandLabel="ZIVO Support">
      <div className="max-w-2xl space-y-8">
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

        {createdAccounts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Created Accounts — Save these credentials!
            </h2>
            {createdAccounts.map((account, i) => {
              const acc = normalizeCreatedAccount(account);
              const credText = `Username: ${acc.username}\nEmail: ${acc.email}\nPassword: ${acc.password}`;
              const isCopied = copiedId === `acc-${i}`;
              const initials = acc.username
                .split(/[\s_]+/)
                .map((w) => w[0]?.toUpperCase())
                .join("")
                .slice(0, 2);
              const hue = acc.username.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;

              return (
                <ProfileCard
                  key={`${acc.email}-${i}`}
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
  index,
  acc,
  initials,
  hue,
  isCopied,
  credText,
  onCopy,
  onImageUpload,
  onSocialLinkChange,
  onRemoveSocialLink,
}: ProfileCardProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);

  const socialLinks = acc.socialLinks ?? {};
  const addedPlatforms = Object.keys(socialLinks);
  const availablePlatforms = SOCIAL_PLATFORMS.filter((platform) => !addedPlatforms.includes(platform.key));

  return (
    <div className="rounded-2xl border border-border/40 overflow-hidden bg-card shadow-sm">
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(index, "cover", file);
        }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(index, "avatar", file);
        }}
      />

      <div
        className="h-32 w-full relative group cursor-pointer"
        onClick={() => coverInputRef.current?.click()}
        style={{
          background: acc.coverUrl
            ? `url(${acc.coverUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 60% 45%))`,
        }}
      >
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
          <Camera className="h-6 w-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="px-5 pb-5 -mt-10">
        <div
          className="h-20 w-20 rounded-full border-4 border-card flex items-center justify-center text-background text-xl font-bold shadow-md relative group cursor-pointer overflow-hidden"
          onClick={() => avatarInputRef.current?.click()}
          style={{
            background: acc.avatarUrl
              ? `url(${acc.avatarUrl}) center/cover no-repeat`
              : `linear-gradient(145deg, hsl(${hue} 65% 50%), hsl(${(hue + 30) % 360} 55% 40%))`,
          }}
        >
          {!acc.avatarUrl && initials}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center rounded-full">
            <Camera className="h-4 w-4 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="mt-3 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{acc.username}</h3>
            <p className="text-xs text-muted-foreground">Created {acc.createdAt}</p>
          </div>

          <div className="space-y-2">
            {addedPlatforms.map((key) => {
              const platform = SOCIAL_PLATFORMS.find((item) => item.key === key);
              if (!platform) return null;

              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="h-7 w-7 rounded-full flex items-center justify-center text-background text-xs font-bold shrink-0"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.icon}
                  </span>
                  <Input
                    value={socialLinks[key] || ""}
                    onChange={(e) => onSocialLinkChange(index, key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="h-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveSocialLink(index, key)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {availablePlatforms.length > 0 && (
              <div className="relative">
                {!showLinkForm ? (
                  <Button
                    type="button"
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
                    {availablePlatforms.map((platform) => (
                      <button
                        key={platform.key}
                        type="button"
                        onClick={() => {
                          onSocialLinkChange(index, platform.key, "");
                          setShowLinkForm(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <span
                          className="h-5 w-5 rounded-full flex items-center justify-center text-background text-[10px] font-bold"
                          style={{ backgroundColor: platform.color }}
                        >
                          {platform.icon}
                        </span>
                        {platform.label}
                      </button>
                    ))}
                    <button
                      type="button"
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

          <div className="bg-muted/40 rounded-xl p-3 space-y-1 font-mono text-xs text-muted-foreground">
            <p>Email: {acc.email}</p>
            <p>Password: {acc.password}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCopy(credText, `acc-${index}`)}
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Credentials
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
