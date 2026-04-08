/**
 * Admin User Accounts — Support staff can create new user accounts with just a username
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
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
  Eye,
  RotateCcw,
  Mail,
  Phone,
  Calendar,
  Shield,
  Globe,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface CreatedAccount {
  userId?: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  socialLinks: Record<string, string>;
}

/* Inline SVG icons for platforms not in Lucide */
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.27 3.238-.928 1.135-2.256 1.738-3.95 1.795h-.113c-1.234-.04-2.27-.465-2.995-1.232-.645-.683-1.004-1.578-1.037-2.587-.066-2.08 1.462-3.564 3.87-3.756.894-.07 1.727-.03 2.482.118-.094-.528-.266-.98-.516-1.353-.443-.662-1.132-1.006-2.05-1.024h-.063c-.72.013-1.32.237-1.837.684l-1.352-1.56c.79-.684 1.81-1.074 2.95-1.128l.127-.003c1.524.022 2.71.592 3.527 1.696.72.97 1.122 2.252 1.205 3.834l.01.267c.917.456 1.68 1.1 2.25 1.912.87 1.239 1.176 2.757.886 4.392-.398 2.243-1.725 3.986-3.834 5.037C17.16 23.436 14.862 23.98 12.186 24zm-.09-9.792c-1.458.112-2.248.783-2.218 1.755.014.48.15.853.407 1.107.36.355.883.539 1.55.56h.076c1.07-.038 1.878-.396 2.474-1.095.326-.382.58-.874.774-1.484-.67-.186-1.387-.296-2.122-.328l-.138-.005-.003-.51z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.19 8.19 0 004.77 1.53V6.79a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

type SocialPlatform = {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
};

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    key: "facebook",
    label: "Facebook",
    icon: <Facebook className="h-3.5 w-3.5" />,
    color: "hsl(221 83% 53%)",
    placeholder: "https://facebook.com/username",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: <Instagram className="h-3.5 w-3.5" />,
    color: "hsl(339 78% 55%)",
    placeholder: "https://instagram.com/username",
  },
  {
    key: "threads",
    label: "Threads",
    icon: <ThreadsIcon className="h-3.5 w-3.5" />,
    color: "hsl(0 0% 10%)",
    placeholder: "https://threads.net/@username",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: <TikTokIcon className="h-3.5 w-3.5" />,
    color: "hsl(0 0% 10%)",
    placeholder: "https://tiktok.com/@username",
  },
  {
    key: "x",
    label: "X",
    icon: <XIcon className="h-3.5 w-3.5" />,
    color: "hsl(0 0% 10%)",
    placeholder: "https://x.com/username",
  },
];

const CREATED_ACCOUNTS_STORAGE_KEY = "admin-user-accounts-session";


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
          userId: data.user.id,
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
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const socialLinks = acc.socialLinks ?? {};
  const addedPlatforms = Object.keys(socialLinks);
  const availablePlatforms = SOCIAL_PLATFORMS.filter((platform) => !addedPlatforms.includes(platform.key));

  // Fetch user posts when card is flipped
  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["admin-user-posts", acc.userId],
    queryFn: async () => {
      if (!acc.userId) return [];
      const { data } = await (supabase as any)
        .from("user_posts")
        .select("id, media_url, media_type, caption, likes_count, comments_count, created_at")
        .eq("user_id", acc.userId)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      return (data || []) as Array<{
        id: string;
        media_url: string | null;
        media_type: string | null;
        caption: string | null;
        likes_count: number;
        comments_count: number;
        created_at: string;
      }>;
    },
    enabled: isFlipped && !!acc.userId,
  });

  return (
    <div className="[perspective:1200px]">
      <div
        className="relative transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* ===== FRONT SIDE ===== */}
        <div className="[backface-visibility:hidden] rounded-2xl border border-border/40 overflow-hidden bg-card shadow-sm">
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
              const linkValue = socialLinks[key] || "";
              const isEditing = editingLink === key;

              return (
                <div key={key} className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <span
                        className="h-7 w-7 rounded-full flex items-center justify-center text-background text-xs font-bold shrink-0"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.icon}
                      </span>
                      <Input
                        value={linkValue}
                        onChange={(e) => onSocialLinkChange(index, key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="h-8 text-xs"
                        autoFocus
                        onBlur={() => setEditingLink(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingLink(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveSocialLink(index, key)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : linkValue ? (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={linkValue.startsWith("http") ? linkValue : `https://${linkValue}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <span
                          className="h-5 w-5 rounded-full flex items-center justify-center text-background text-[10px] font-bold"
                          style={{ backgroundColor: platform.color }}
                        >
                          {platform.icon}
                        </span>
                        {platform.label}
                      </a>
                      <button
                        type="button"
                        onClick={() => setEditingLink(key)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit link"
                      >
                        <Link2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveSocialLink(index, key)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingLink(key)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <span
                        className="h-5 w-5 rounded-full flex items-center justify-center text-background text-[10px] font-bold"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.icon}
                      </span>
                      Add {platform.label}
                    </button>
                  )}
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

          <div className="flex flex-wrap gap-2">
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

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFlipped(true)}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Preview
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* ===== BACK SIDE (Profile Preview) ===== */}
    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border border-border/40 overflow-hidden bg-card shadow-sm">
      {/* Cover */}
      <div
        className="h-32 w-full"
        style={{
          background: acc.coverUrl
            ? `url(${acc.coverUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 60% 45%))`,
        }}
      />

      {/* Profile content */}
      <div className="px-5 pb-5 -mt-10">
        <div
          className="h-20 w-20 rounded-full border-4 border-card flex items-center justify-center text-background text-xl font-bold shadow-md overflow-hidden"
          style={{
            background: acc.avatarUrl
              ? `url(${acc.avatarUrl}) center/cover no-repeat`
              : `linear-gradient(145deg, hsl(${hue} 65% 50%), hsl(${(hue + 30) % 360} 55% 40%))`,
          }}
        >
          {!acc.avatarUrl && initials}
        </div>

        <div className="mt-3 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{acc.username}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {acc.createdAt}
            </p>
          </div>

          {/* Profile details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">{acc.email.split("+")[0]}...</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Active</span>
            </div>
          </div>

          {/* Social links preview */}
          {addedPlatforms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {addedPlatforms.map((key) => {
                const platform = SOCIAL_PLATFORMS.find((item) => item.key === key);
                if (!platform) return null;
                const linkValue = socialLinks[key] || "";
                return (
                  <a
                    key={key}
                    href={linkValue.startsWith("http") ? linkValue : `https://${linkValue}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/40 border border-border/40 hover:border-primary/40 transition-colors"
                  >
                    <span
                      className="h-4 w-4 rounded-full flex items-center justify-center text-background text-[9px] font-bold"
                      style={{ backgroundColor: platform.color }}
                    >
                      {platform.icon}
                    </span>
                    {platform.label}
                  </a>
                );
              })}
            </div>
          )}

          {/* Open full profile + back button */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFlipped(false)}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={async () => {
                if (acc.userId) {
                  window.open(`/user/${acc.userId}`, "_blank");
                } else {
                  try {
                    const { data: uid, error } = await supabase.rpc("admin_lookup_profile_by_email" as any, {
                      _email: acc.email,
                    });
                    if (error || !uid) {
                      toast({ title: "User not found", description: "Could not find a profile for this account.", variant: "destructive" });
                      return;
                    }
                    window.open(`/user/${uid}`, "_blank");
                  } catch {
                    toast({ title: "Lookup failed", description: "Could not look up user profile.", variant: "destructive" });
                  }
                }
              }}
              className="gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              Open Full Profile
            </Button>
          </div>
        </div>
      </div>
    </div>

      </div>
    </div>
  );
}
