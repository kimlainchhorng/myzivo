import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Camera, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Loader2,
  Save,
  Sparkles,
  Shield,
  Star,
  Clock,
  ChevronRight,
  Settings,
  CreditCard,
  Bell,
  Lock,
  Gift,
  Wallet,
  Store,
  ExternalLink,
  Users,
  TrendingUp,
  Trophy,
  Globe,
  Crown,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateUserProfile, useUploadAvatar } from "@/hooks/useUserProfile";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import { useAffiliateAttribution } from "@/hooks/useAffiliateAttribution";
import { useZivoPlus } from "@/contexts/ZivoPlusContext";
import { MERCHANT_APP_URL } from "@/lib/eatsTables";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Phone number too long").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: merchantData } = useMerchantRole();
  const affiliateAttribution = useAffiliateAttribution();
  const { isPlus, plan } = useZivoPlus();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
    },
    values: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await uploadAvatar.mutateAsync(file);
    setAvatarPreview(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync({
      full_name: data.full_name || null,
      phone: data.phone || null,
    });
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const quickLinks = [
    { icon: ShoppingBag, label: "My Orders", href: "/grocery/orders", description: "Order history & tracking" },
    { icon: TrendingUp, label: "Spending", href: "/account/spending", description: "View spending history" },
    { icon: Sparkles, label: "Loyalty", href: "/account/loyalty", description: "Points & tier perks" },
    { icon: Trophy, label: "Achievements", href: "/account/achievements", description: "Badges & rewards" },
    { icon: Globe, label: "Language & Currency", href: "/account/preferences", description: "Display preferences" },
    { icon: Gift, label: "Gift Cards", href: "/account/gift-cards", description: "Buy, send, or redeem" },
    { icon: CreditCard, label: "Payment Methods", href: "/wallet", description: "Manage cards & wallets" },
    { icon: MapPin, label: "Saved Addresses", href: "/account/addresses", description: "Delivery addresses" },
    { icon: Bell, label: "Notifications", href: "/notifications", description: "Preferences & alerts" },
    { icon: Lock, label: "Security", href: "/account/security", description: "Password & 2FA" },
    { icon: Settings, label: "Settings", href: "/account/preferences", description: "App preferences" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24 safe-area-top safe-area-bottom">
      <SEOHead title="Profile Settings – ZIVO" description="Manage your ZIVO account, profile, and travel preferences." noIndex={true} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 container max-w-lg mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-muted/50 -ml-2 touch-manipulation active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground text-xs">Manage your account information</p>
          </div>
        </div>

        {profileLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Card */}
            <Card className="relative border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="text-center pb-2 relative">
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary to-primary/60 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                    <Avatar className="relative h-24 w-24 ring-4 ring-background shadow-2xl">
                      <AvatarImage 
                        src={avatarPreview || profile?.avatar_url || undefined} 
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadAvatar.isPending}
                      className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 touch-manipulation active:scale-95"
                    >
                      {uploadAvatar.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {profile?.full_name || "Set your name"}
                </CardTitle>
                <CardDescription className="text-sm">{user?.email}</CardDescription>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
                    <Star className="w-3 h-3 mr-1 fill-primary" />
                    {profile?.status || "Active"} Member
                  </Badge>
                  {isPlus && (
                    <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 font-semibold">
                      <Crown className="w-3 h-3 mr-1" />
                      ZIVO+ {plan === "annual" ? "Annual" : "Monthly"}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6 relative">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <User className="h-4 w-4 text-primary" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <Mail className="h-4 w-4 text-primary" />
                        Email
                      </label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="h-12 rounded-xl bg-muted/50 border-border/50 text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed here
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <Phone className="h-4 w-4 text-primary" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your phone number"
                              type="tel"
                              className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 touch-manipulation active:scale-[0.98]"
                      disabled={updateProfile.isPending || !form.formState.isDirty}
                    >
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>

                    {user ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base font-semibold rounded-xl touch-manipulation active:scale-[0.98]"
                        onClick={async () => {
                          await signOut();
                          navigate("/");
                        }}
                      >
                        Sign out
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-12 text-base font-semibold rounded-xl touch-manipulation active:scale-[0.98]"
                          onClick={() => navigate("/login")}
                        >
                          Log in
                        </Button>
                        <Button
                          type="button"
                          variant="hero"
                          className="flex-1 h-12 text-base font-semibold rounded-xl touch-manipulation active:scale-[0.98]"
                          onClick={() => navigate("/signup")}
                        >
                          Sign up
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Quick Access Links */}
            <div>
              <h3 className="font-display font-bold text-base mb-3">Quick Access</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {quickLinks.map((link) => (
                  <Link key={link.label} to={link.href}>
                    <Card className="border-0 bg-card/80 shadow-md hover:shadow-lg transition-all cursor-pointer group overflow-hidden touch-manipulation active:scale-[0.98]">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <link.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13px] truncate">{link.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{link.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* ZIVO+ Membership */}
            {!isPlus && (
              <Link to="/zivo-plus">
                <Card className="relative border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group touch-manipulation active:scale-[0.98]">
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <Crown className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Upgrade to ZIVO+</p>
                          <p className="text-xs text-muted-foreground">No service fees, priority delivery</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Merchant Dashboard Link */}
            {merchantData?.isMerchant && (
              <a 
                href={MERCHANT_APP_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="relative border-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group touch-manipulation active:scale-[0.98]">
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                          <Store className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Merchant Dashboard</p>
                          <p className="text-xs text-muted-foreground">Manage your restaurant & orders</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/20 font-semibold text-xs">
                          Partner
                        </Badge>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )}

            {/* Account Status */}
            <Card className="relative border-0 bg-card/80 shadow-xl overflow-hidden">
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Account Status</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "recently"}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold text-xs">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Partner Attribution */}
            {affiliateAttribution.hasAffiliateAttribution && (
              <Card className="relative border-0 bg-card/80 shadow-xl overflow-hidden">
                <CardContent className="p-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Referred by Partner</p>
                      <p className="text-xs text-muted-foreground">
                        You joined through {affiliateAttribution.partnerName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delete Account */}
            <div className="pt-2">
              <Button
                variant="ghost"
                className="w-full text-destructive/60 hover:text-destructive hover:bg-destructive/5 text-xs font-medium rounded-xl"
                onClick={() => navigate("/profile/delete-account")}
              >
                Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>

      <ZivoMobileNav />
    </div>
  );
};

export default Profile;